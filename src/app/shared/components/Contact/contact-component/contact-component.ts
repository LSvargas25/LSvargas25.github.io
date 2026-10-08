import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import emailjs from '@emailjs/browser';

type SendState = 'idle' | 'sending';

/** Minimum pause between two successful sends from the same browser */
const SEND_COOLDOWN_MS = 30_000;
const LAST_SENT_KEY = 'contact:lastSentAt';
type ToastType = 'success' | 'error';

@Component({
  selector: 'app-contact-component',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './contact-component.html',
  styleUrl: './contact-component.scss',
})
export class ContactComponent {

  private serviceId = 'service_xrxrlsw';
  private templateId = 'template_fykcot5';
  private publicKey = 'sYFd2Kn-iQjvr5bKo';

  state: SendState = 'idle';

  toastVisible = false;
  toastType: ToastType = 'success';
  toastMessage = '';

  constructor(private translate: TranslateService) {}

  sendEmail(event: Event) {
    event.preventDefault();

    if (this.state === 'sending') return;

    const form = event.target as HTMLFormElement;

    // Honeypot filled: almost certainly a bot. Pretend it worked, send nothing.
    const trap = form.elements.namedItem('company') as HTMLInputElement | null;
    if (trap?.value) {
      form.reset();
      this.showToast(this.translate.instant('contact.toast.success'), 'success');
      return;
    }

    if (this.secondsUntilNextSend() > 0) {
      this.showToast(this.translate.instant('contact.toast.wait', { seconds: this.secondsUntilNextSend() }), 'error');
      return;
    }

    this.state = 'sending';

    emailjs.sendForm(
      this.serviceId,
      this.templateId,
      form,
      this.publicKey
    )
    .then(() => {
      this.rememberSend();
      form.reset();
      this.showToast(this.translate.instant('contact.toast.success'), 'success');
    })
    .catch(() => {
      this.showToast(this.translate.instant('contact.toast.error'), 'error');
    })
    .finally(() => {
      this.state = 'idle';
    });
  }

  private secondsUntilNextSend(): number {
    try {
      const last = Number(localStorage.getItem(LAST_SENT_KEY) || 0);
      return Math.max(0, Math.ceil((last + SEND_COOLDOWN_MS - Date.now()) / 1000));
    } catch {
      return 0; // storage blocked: don't stop a real person from writing
    }
  }

  private rememberSend(): void {
    try {
      localStorage.setItem(LAST_SENT_KEY, String(Date.now()));
    } catch {
      /* storage blocked: cooldown simply doesn't apply */
    }
  }

  private showToast(message: string, type: ToastType) {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;

    setTimeout(() => {
      this.toastVisible = false;
    }, 4000);
  }
}
