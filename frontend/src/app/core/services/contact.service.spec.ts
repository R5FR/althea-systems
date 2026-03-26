import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ContactService } from './contact.service';
import { describe, it, expect, beforeEach } from 'vitest';

describe('ContactService', () => {
  let service: ContactService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ContactService],
    });
    service = TestBed.inject(ContactService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  // ── sendMessage ────────────────────────────────────────────────────────────

  it('sendMessage envoie un POST vers /api/contact', () => {
    const dto = { firstName: 'Jean', lastName: 'Dupont', email: 'j@t.fr', subject: 'Test', message: 'Bonjour' };
    service.sendMessage(dto as any).subscribe();
    const req = http.expectOne(r => r.url.includes('/contact'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush({});
  });

  // ── getChatbotResponse ─────────────────────────────────────────────────────

  it('répond à "commande"', (done) => {
    service.getChatbotResponse('Ma commande est en retard').subscribe(reply => {
      expect(reply.toLowerCase()).toContain('commande');
      done();
    });
  });

  it('répond à "livraison"', (done) => {
    service.getChatbotResponse('Délai de livraison ?').subscribe(reply => {
      expect(reply).toBeTruthy();
      done();
    });
  });

  it('répond à "paiement"', (done) => {
    service.getChatbotResponse('Comment payer par carte ?').subscribe(reply => {
      expect(reply).toBeTruthy();
      done();
    });
  });

  it('répond à "retour"', (done) => {
    service.getChatbotResponse('Je veux faire un retour').subscribe(reply => {
      expect(reply).toBeTruthy();
      done();
    });
  });

  it('répond avec message générique pour question inconnue', (done) => {
    service.getChatbotResponse('xyzabc quelque chose de bizarre').subscribe(reply => {
      expect(reply).toBeTruthy();
      expect(reply.length).toBeGreaterThan(5);
      done();
    });
  });

  it('répond à "bonjour"', (done) => {
    service.getChatbotResponse('Bonjour !').subscribe(reply => {
      expect(reply.toLowerCase()).toContain('bonjour');
      done();
    });
  });
});
