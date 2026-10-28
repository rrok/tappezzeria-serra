import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  WORKSHOP_INFO,
  SERVICES_LIST,
  MATERIAL_SWATCHES,
  RESTORATION_PROJECTS,
  CUSTOMER_REVIEWS,
  ServiceItem,
  MaterialSwatch,
  RestorationProject
} from './workshop.data';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  readonly info = WORKSHOP_INFO;
  readonly services = SERVICES_LIST;
  readonly swatches = MATERIAL_SWATCHES;
  readonly projects = RESTORATION_PROJECTS;
  readonly reviews = CUSTOMER_REVIEWS;

  // Mobile menu state
  readonly mobileMenuOpen = signal(false);

  // Real-time workshop open status (Bologna time)
  readonly workshopStatus = signal<{ isOpen: boolean; statusText: string; detailText: string }>({
    isOpen: true,
    statusText: 'Bottega Aperta Ora',
    detailText: 'Orario continuato mattina 08:00–12:30 • pomeriggio 14:30–18:30'
  });

  // Active service category filter
  readonly selectedServiceCategory = signal<string>('tutti');

  readonly filteredServices = computed(() => {
    const cat = this.selectedServiceCategory();
    if (cat === 'tutti') {
      return this.services;
    }
    return this.services.filter((s) => s.category === cat);
  });

  // Active Material Swatch in "Campionario del Sellaio"
  readonly selectedSwatch = signal<MaterialSwatch>(MATERIAL_SWATCHES[0]);

  // Active Portfolio filter & Before/After inspector
  readonly selectedProjectCategory = signal<string>('tutti');
  readonly activeModalProject = signal<RestorationProject | null>(null);
  readonly projectComparisonState = signal<Record<string, 'after' | 'before'>>({
    'proj-spider-cappotta': 'after',
    'proj-epoca-sedili': 'after',
    'proj-sella-guzzi': 'after',
    'proj-cielo-audi': 'after'
  });

  readonly filteredProjects = computed(() => {
    const cat = this.selectedProjectCategory();
    if (cat === 'tutti') {
      return this.projects;
    }
    return this.projects.filter((p) => p.category === cat);
  });

  // Interactive Quote Configurator state
  readonly quoteForm = {
    serviceType: 'Restauro Interni Auto d’Epoca',
    materialPreference: 'Vera Pelle Pieno Fiore / Connolly',
    vehicleModel: '',
    vehicleYear: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    notes: '',
    needsGelInsert: false,
    needsInspection: true
  };

  readonly quoteSubmitted = signal(false);
  readonly copiedConfirmation = signal(false);

  // Crafting steps in the Sindoni workshop
  readonly craftSteps = [
    {
      step: '01',
      title: 'Diagnosi & Risanamento Telai',
      description:
        'In Via Emilia Ponente smontiamo sedili, cappotte o selle verificando lo stato di molle, telai metallici, cavi di tensione e fondi in lamiera prima di ogni rivestimento.'
    },
    {
      step: '02',
      title: 'Sagomatura Anatomica Imbottiture',
      description:
        'Ricostruiamo le spugne a densità differenziata, il crine per le auto storiche o inseriamo lastre in Gel medicale e Memory Foam per le selle motociclistiche.'
    },
    {
      step: '03',
      title: 'Taglio su Dima & Cucitura Sartoriale',
      description:
        'Tagliamo a mano pelli pieno fiore, panno Lancia e tele Sonnenland®, cucendo con macchine a triplice trasporto, doppio ago ribattuto e profili (piping) su misura.'
    },
    {
      step: '04',
      title: 'Tensionamento & Collaudo in Bottega',
      description:
        'Calziamo i rivestimenti a caldo, registriamo la chiusura ermetica delle cappotte cabrio e utilizziamo collanti termici 110°C per cieli auto garantiti nel tempo.'
    }
  ];

  ngOnInit(): void {
    this.updateWorkshopStatus();
  }

  updateWorkshopStatus(): void {
    const now = new Date();
    const day = now.getDay(); // 0 = Sun, 6 = Sat
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeDecimal = hours + minutes / 60;

    const isWeekday = day >= 1 && day <= 5;
    const isMorningOpen = timeDecimal >= 8.0 && timeDecimal < 12.5;
    const isAfternoonOpen = timeDecimal >= 14.5 && timeDecimal < 18.5;

    if (isWeekday && (isMorningOpen || isAfternoonOpen)) {
      this.workshopStatus.set({
        isOpen: true,
        statusText: 'Laboratorio Aperto Ora',
        detailText: isMorningOpen
          ? 'Aperto fino alle 12:30 (Pomeriggio 14:30–18:30)'
          : 'Aperto fino alle 18:30 in Via Emilia Ponente 107/A'
      });
    } else if (isWeekday && timeDecimal >= 12.5 && timeDecimal < 14.5) {
      this.workshopStatus.set({
        isOpen: false,
        statusText: 'Pausa Pranzo • Riapre alle 14:30',
        detailText: 'Lun–Ven 08:00–12:30 / 14:30–18:30 • Tel. 051 382482'
      });
    } else {
      this.workshopStatus.set({
        isOpen: false,
        statusText: 'Bottega Chiusa Ora',
        detailText: 'Aperto Lun–Ven 08:00–12:30 e 14:30–18:30 • Chiama 051 382482'
      });
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  selectServiceFilter(category: string): void {
    this.selectedServiceCategory.set(category);
  }

  selectSwatch(swatch: MaterialSwatch): void {
    this.selectedSwatch.set(swatch);
  }

  selectProjectFilter(category: string): void {
    this.selectedProjectCategory.set(category);
  }

  toggleComparison(projectId: string, mode: 'after' | 'before'): void {
    this.projectComparisonState.update((state) => ({
      ...state,
      [projectId]: mode
    }));
  }

  getComparisonMode(projectId: string): 'after' | 'before' {
    return this.projectComparisonState()[projectId] || 'after';
  }

  openProjectModal(project: RestorationProject): void {
    this.activeModalProject.set(project);
  }

  closeProjectModal(): void {
    this.activeModalProject.set(null);
  }

  prefillQuoteForService(service: ServiceItem): void {
    this.quoteForm.serviceType = service.title;
    if (service.materials.length > 0) {
      this.quoteForm.materialPreference = service.materials[0];
    }
    this.quoteSubmitted.set(false);
    const el = document.getElementById('preventivo');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  prefillQuoteForMaterial(swatch: MaterialSwatch): void {
    this.quoteForm.materialPreference = swatch.name;
    this.quoteSubmitted.set(false);
    const el = document.getElementById('preventivo');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  submitQuoteRequest(): void {
    this.quoteSubmitted.set(true);
  }

  getMailtoLink(): string {
    const subject = encodeURIComponent(
      `Richiesta Preventivo Tappezzeria - ${this.quoteForm.serviceType} (${this.quoteForm.vehicleModel || 'Veicolo'})`
    );
    const bodyLines = [
      `Buongiorno Tappezzeria Serra (Famiglia Sindoni),`,
      ``,
      `Vorrei richiedere informazioni / un preventivo orientativo per il seguente lavoro:`,
      `- Tipologia intervento: ${this.quoteForm.serviceType}`,
      `- Materiale preferito: ${this.quoteForm.materialPreference}`,
      `- Veicolo / Modello: ${this.quoteForm.vehicleModel || 'Da specificare'} ${this.quoteForm.vehicleYear ? '(' + this.quoteForm.vehicleYear + ')' : ''}`,
      `- Inserto Comfort Gel / Memory (se sella moto): ${this.quoteForm.needsGelInsert ? 'Sì' : 'No'}`,
      `- Disponibile per visione in Via Emilia Ponente 107/A: ${this.quoteForm.needsInspection ? 'Sì' : 'Preventivo preliminare'}`,
      ``,
      `Note sul lavoro:`,
      `${this.quoteForm.notes || 'Nessuna nota aggiuntiva.'}`,
      ``,
      `I miei recapiti:`,
      `- Nome: ${this.quoteForm.customerName || 'Cliente'}`,
      `- Telefono: ${this.quoteForm.customerPhone || 'Non indicato'}`,
      ``,
      `Grazie e cordiali saluti.`
    ];
    return `mailto:${this.info.email}?subject=${subject}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
  }

  copySummaryToClipboard(): void {
    const summary = `Richiesta per Tappezzeria Serra Snc (${this.info.phoneDisplay}): ${this.quoteForm.serviceType} | Materiale: ${this.quoteForm.materialPreference} | Veicolo: ${this.quoteForm.vehicleModel} ${this.quoteForm.vehicleYear} | Note: ${this.quoteForm.notes}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
      this.copiedConfirmation.set(true);
      setTimeout(() => this.copiedConfirmation.set(false), 3500);
    }
  }
}
