import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ContactMessageDto } from '../models';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/contact`;

  sendMessage(dto: ContactMessageDto) {
    return this.http.post(this.base, dto);
  }

  getChatbotResponse(message: string): Observable<string> {
    return new Observable<string>(observer => {
      this.http.post<{ message: string }>(`${this.base}/chatbot`, { message })
        .pipe(timeout(115000))
        .subscribe({
          next: (res) => { observer.next(res.message || ''); observer.complete(); },
          error: (err) => observer.error(err),
        });
    });
  }

  getChatHistory(): Observable<{ role: string; content: string; createdAt: string }[]> {
    return this.http.get<{ role: string; content: string; createdAt: string }[]>(`${this.base}/chatbot/history`);
  }
}
