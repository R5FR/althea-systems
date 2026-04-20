import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TranslationApiService {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/translate`;

  /** Simple in-memory cache: key = `${source}:${target}:${text}` */
  private cache = new Map<string, string>();

  async translate(text: string, source: string, target: string): Promise<string> {
    if (!text?.trim() || source === target) return text;

    const key = `${source}:${target}:${text}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    try {
      const res = await firstValueFrom(
        this.http.post<{ translatedText: string }>(this.base, { text, source, target })
      );
      const translated = res.translatedText ?? text;
      this.cache.set(key, translated);
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
      if (this.cache.has(key)) return this.cache.get(key)!;
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
        this.cache.set(key, translated);
        results[idx] = translated;
      });
    } catch {
      uncached.forEach(({ idx, text }) => (results[idx] = text));
    }

    return results;
  }
}
