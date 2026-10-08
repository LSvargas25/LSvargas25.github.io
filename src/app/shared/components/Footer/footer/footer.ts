import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule, Instagram } from 'lucide-angular';

@Component({
  selector: 'app-footer',
  imports: [TranslateModule, LucideAngularModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {

  currentYear: number = new Date().getFullYear();
}
