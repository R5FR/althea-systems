import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

const STORAGE_KEY = 'dyn_translate_cache_v1';
const FLUSH_DEBOUNCE_MS = 40;

@Injectable({ providedIn: 'root' })
export class TranslationApiService {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/translate`;

  private cache: Record<string, string> = this.loadCache();

  private queues = new Map<string, Map<string, BehaviorSubject<string>>>();
  private flushTimer: any = null;

  async translate(text: string, source: string, target: string): Promise<string> {
    if (!text?.trim() || source === target) return text;
    const key = `${source}:${target}:${text}`;
    if (this.cache[key]) return this.cache[key];
    try {
      const res = await firstValueFrom(
        this.http.post<{ translatedText: string }>(this.base, { text, source, target })
      );
      const translated = res.translatedText ?? text;
      this.cache[key] = translated;
      this.saveCache();
      return translated;
    } catch {
      return text;
    }
  }

  async translateBatch(texts: string[], source: string, target: string): Promise<string[]> {
    if (source === target) return texts;

    const uncached: { idx: number; text: string }[] = [];
    const results = texts.map((t, i) => {
      const key = `${source}:${target}:${t}`;
      if (this.cache[key]) return this.cache[key];
      uncached.push({ idx: i, text: t });
      return null as unknown as string;
    });

    if (uncached.length === 0) return results;

    try {
      const res = await firstValueFrom(
        this.http.post<{ translatedTexts: string[] }>(`${this.base}/batch`, {
          texts: uncached.map(u => u.text),
          source,
          target,
        })
      );
      res.translatedTexts.forEach((translated, i) => {
        const { idx, text } = uncached[i];
        const key = `${source}:${target}:${text}`;
        this.cache[key] = translated;
        results[idx] = translated;
      });
      this.saveCache();
    } catch {
      uncached.forEach(({ idx, text }) => (results[idx] = text));
    }

    return results;
  }

  translate$(text: string | null | undefined, source: string, target: string): Observable<string> {
    if (!text) return of('');
    if (source === target) return of(text);
    const key = `${source}:${target}:${text}`;
    if (this.cache[key]) return of(this.cache[key]);

    const langKey = `${source}:${target}`;
    let queue = this.queues.get(langKey);
    if (!queue) {
      queue = new Map();
      this.queues.set(langKey, queue);
    }
    let subj = queue.get(text);
    if (!subj) {
      subj = new BehaviorSubject<string>(text);
      queue.set(text, subj);
    }
    this.scheduleFlush();
    return subj.asObservable();
  }

  private scheduleFlush() {
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      this.flushQueues();
    }, FLUSH_DEBOUNCE_MS);
  }

  private flushQueues() {
    for (const [langKey, queue] of this.queues) {
      if (queue.size === 0) continue;
      const [source, target] = langKey.split(':');
      const entries = Array.from(queue.entries());
      queue.clear();
      const texts = entries.map(e => e[0]);
      this.http.post<{ translatedTexts: string[] }>(`${this.base}/batch`, { texts, source, target }).subscribe({
        next: res => {
          const list = res.translatedTexts || [];
          entries.forEach(([text, subj], i) => {
            const translated = list[i] ?? text;
            this.cache[`${source}:${target}:${text}`] = translated;
            subj.next(translated);
          });
          this.saveCache();
        },
        error: () => entries.forEach(([text, subj]) => subj.next(text)),
      });
    }
  }

  private loadCache(): Record<string, string> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private saveCache() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cache));
    } catch {}
  }
}
