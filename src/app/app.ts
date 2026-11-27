import { Component, computed, signal, OnInit, HostListener, inject } from '@angular/core';
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
import {
  DriveGalleryService,
  GalleryPhoto,
  GalleryCategory,
  DEFAULT_GALLERY_PHOTOS
} from './drive-gallery.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly driveGalleryService = inject(DriveGalleryService);

  readonly info = WORKSHOP_INFO;
  readonly services = SERVICES_LIST;
  readonly swatches = MATERIAL_SWATCHES;
  readonly projects = RESTORATION_PROJECTS;
  readonly reviews = CUSTOMER_REVIEWS;

  // Page router state: 'home' | 'galleria'
  readonly activePage = signal<'home' | 'galleria'>('home');

  // Mobile menu state
  readonly mobileMenuOpen = signal(false);

  // Back to top button visibility when scrolling down
  readonly showBackToTop = signal(false);

  // Numero di emergenza temporaneo (attivo solo per 2 giorni / 48 ore)
  readonly isEmergencyPhoneActive = signal<boolean>(Date.now() < WORKSHOP_INFO.emergencyPhoneExpiresAt);

  // Google Drive Dedicated Gallery State
  readonly galleryPhotos = signal<GalleryPhoto[]>(this.driveGalleryService.getInitialPhotos());
  readonly galleryLoading = signal<boolean>(false);
  readonly selectedGalleryCategory = signal<GalleryCategory>('tutti');
  readonly gallerySearchQuery = signal<string>('');
  readonly lightboxPhotoIndex = signal<number | null>(null);

  readonly filteredGalleryPhotos = computed(() => {
    const cat = this.selectedGalleryCategory();
    const query = this.gallerySearchQuery().trim().toLowerCase();
    return this.galleryPhotos().filter((photo) => {
      const matchesCat = cat === 'tutti' || photo.category === cat;
      const matchesQuery =
        !query ||
        photo.title.toLowerCase().includes(query) ||
        photo.caption.toLowerCase().includes(query) ||
        photo.categoryLabel.toLowerCase().includes(query);
      return matchesCat && matchesQuery;
    });
  });

  readonly activeLightboxPhoto = computed<GalleryPhoto | null>(() => {
    const idx = this.lightboxPhotoIndex();
    const list = this.filteredGalleryPhotos();
    if (idx === null || idx < 0 || idx >= list.length) {
      return null;
    }
    return list[idx];
  });

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const scrollPos = window.scrollY || document.documentElement.scrollTop || 0;
    this.showBackToTop.set(scrollPos > 360);
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.lightboxPhotoIndex() !== null) {
      if (event.key === 'Escape') {
        this.closeLightbox();
      } else if (event.key === 'ArrowRight') {
        this.nextLightboxPhoto();
      } else if (event.key === 'ArrowLeft') {
        this.prevLightboxPhoto();
      }
    }
  }

  @HostListener('window:popstate')
  onPopState(): void {
    this.syncPageFromUrl();
  }

  @HostListener('window:focus')
  onWindowFocus(): void {
    if (this.activePage() === 'galleria') {
      this.loadDriveGallery();
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

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
    notes: ''
  };

  readonly quoteSubmitted = signal(false);
  readonly copiedConfirmation = signal(false);
  readonly imageCopiedHint = signal(false);

  // Allegati foto/file per il preventivo su WhatsApp
  readonly quoteAttachments = signal<
    Array<{
      id: string;
      file: File;
      name: string;
      sizeLabel: string;
      previewUrl: string;
      isImage: boolean;
      uploadedUrl?: string;
      uploading: boolean;
    }>
  >([]);

  readonly hasUploadingAttachments = computed(() =>
    this.quoteAttachments().some((a) => a.uploading)
  );

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
    this.checkEmergencyPhoneExpiration();
    setInterval(() => this.checkEmergencyPhoneExpiration(), 60_000);
    this.syncPageFromUrl();
    this.loadDriveGallery();
  }

  private checkEmergencyPhoneExpiration(): void {
    this.isEmergencyPhoneActive.set(Date.now() < WORKSHOP_INFO.emergencyPhoneExpiresAt);
  }

  private syncPageFromUrl(): void {
    const path = window.location.pathname.toLowerCase();
    const search = window.location.search.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    if (path.endsWith('/galleria') || search.includes('page=galleria') || hash === '#galleria') {
      this.activePage.set('galleria');
    } else {
      this.activePage.set('home');
    }
  }

  openGalleryPage(category: GalleryCategory = 'tutti'): void {
    this.selectedGalleryCategory.set(category);
    this.activePage.set('galleria');
    this.closeMobileMenu();
    this.loadDriveGallery();
    try {
      window.history.pushState({}, '', '/galleria');
    } catch {
      // ignore history errors
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openHomePage(sectionId?: string): void {
    this.activePage.set('home');
    this.closeMobileMenu();
    try {
      window.history.pushState({}, '', sectionId ? `/#${sectionId}` : '/');
    } catch {
      // ignore history errors
    }
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async loadDriveGallery(): Promise<void> {
    const initial = this.driveGalleryService.getInitialPhotos();
    if (initial.length === 0) {
      this.galleryLoading.set(true);
    }
    const photos = await this.driveGalleryService.fetchDrivePhotos();
    this.galleryPhotos.set(photos);
    this.galleryLoading.set(false);
  }

  selectGalleryCategory(cat: GalleryCategory): void {
    this.selectedGalleryCategory.set(cat);
    this.lightboxPhotoIndex.set(null);
  }

  onPhotoImgError(event: Event, photo: GalleryPhoto): void {
    const imgEl = event.target as HTMLImageElement;
    if (photo.fallbackUrl && imgEl.src !== photo.fallbackUrl) {
      imgEl.src = photo.fallbackUrl;
    } else {
      imgEl.src = 'images/hero-workshop.jpg';
    }
  }

  openLightbox(index: number): void {
    this.lightboxPhotoIndex.set(index);
  }

  closeLightbox(): void {
    this.lightboxPhotoIndex.set(null);
  }

  nextLightboxPhoto(): void {
    const list = this.filteredGalleryPhotos();
    const curr = this.lightboxPhotoIndex();
    if (curr !== null && list.length > 0) {
      this.lightboxPhotoIndex.set((curr + 1) % list.length);
    }
  }

  prevLightboxPhoto(): void {
    const list = this.filteredGalleryPhotos();
    const curr = this.lightboxPhotoIndex();
    if (curr !== null && list.length > 0) {
      this.lightboxPhotoIndex.set((curr - 1 + list.length) % list.length);
    }
  }

  requestQuoteFromGalleryPhoto(photo: GalleryPhoto): void {
    this.closeLightbox();
    this.quoteForm.notes = `Riferimento foto galleria: "${photo.title}" (${photo.categoryLabel})`;
    this.openHomePage('preventivo');
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
    this.openHomePage('preventivo');
  }

  prefillQuoteForMaterial(swatch: MaterialSwatch): void {
    this.quoteForm.materialPreference = swatch.name;
    this.quoteSubmitted.set(false);
    this.openHomePage('preventivo');
  }

  submitQuoteRequest(): void {
    this.quoteSubmitted.set(true);
  }

  onQuoteFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const selectedFiles = Array.from(input.files);
    for (const file of selectedFiles) {
      const id = `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const isImage = file.type.startsWith('image/');
      const previewUrl = isImage ? URL.createObjectURL(file) : '';
      const sizeKb = Math.max(1, Math.round(file.size / 1024));
      const sizeLabel = sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

      this.quoteAttachments.update((list) => [
        ...list,
        {
          id,
          file,
          name: file.name,
          sizeLabel,
          previewUrl,
          isImage,
          uploading: true
        }
      ]);

      this.uploadAttachmentForWhatsApp(id, file);
    }

    input.value = '';
  }

  removeQuoteAttachment(id: string): void {
    this.quoteAttachments.update((list) => {
      const target = list.find((a) => a.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return list.filter((a) => a.id !== id);
    });
  }

  private async uploadAttachmentForWhatsApp(id: string, file: File): Promise<void> {
    try {
      const fd = new FormData();
      fd.append('file', file, file.name);
      const res = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: fd
      });
      if (res.ok) {
        const json = await res.json();
        const rawUrl: string | undefined = json?.data?.url;
        if (rawUrl) {
          this.quoteAttachments.update((list) =>
            list.map((a) => (a.id === id ? { ...a, uploadedUrl: rawUrl, uploading: false } : a))
          );
          return;
        }
      }
    } catch {
      // fallback se l'upload cloud non è raggiungibile
    }
    this.quoteAttachments.update((list) =>
      list.map((a) => (a.id === id ? { ...a, uploading: false } : a))
    );
  }

  canShareNativeFiles(): boolean {
    const attachments = this.quoteAttachments();
    if (attachments.length === 0) return false;
    const nav = navigator as Navigator & { canShare?: (data?: ShareData) => boolean };
    if (typeof nav.share !== 'function' || typeof nav.canShare !== 'function') return false;
    try {
      return nav.canShare({ files: attachments.map((a) => a.file) });
    } catch {
      return false;
    }
  }

  async shareNativeWithFiles(): Promise<void> {
    const attachments = this.quoteAttachments();
    const nav = navigator as Navigator & { share?: (data?: ShareData) => Promise<void> };
    if (!nav.share || attachments.length === 0) return;
    try {
      await nav.share({
        title: `Richiesta Preventivo Tappezzeria Serra (${this.info.phoneDisplay})`,
        text: this.buildWhatsAppMessageText(),
        files: attachments.map((a) => a.file)
      });
    } catch {
      // utente ha chiuso il pannello di condivisione
    }
  }

  async onWhatsAppClick(): Promise<void> {
    // Copia automaticamente la prima foto negli appunti così l'utente può anche fare Incolla (Ctrl+V) nella chat WhatsApp
    const firstImg = this.quoteAttachments().find((a) => a.isImage);
    if (firstImg && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      try {
        const pngBlob = await this.convertFileToPngBlob(firstImg.file);
        if (pngBlob) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
          this.imageCopiedHint.set(true);
          setTimeout(() => this.imageCopiedHint.set(false), 6000);
        }
      } catch {
        // clipboard image non supportata dal browser
      }
    }
  }

  private convertFileToPngBlob(file: File): Promise<Blob | null> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          resolve(blob);
        }, 'image/png');
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    });
  }

  private buildWhatsAppMessageText(): string {
    const attachments = this.quoteAttachments();
    const bodyLines = [
      `Buongiorno *Tappezzeria Serra* (Famiglia Sindoni),`,
      ``,
      `Vorrei richiedere un preventivo / informazioni per il seguente lavoro:`,
      `• *Tipologia intervento:* ${this.quoteForm.serviceType}`,
      `• *Materiale preferito:* ${this.quoteForm.materialPreference}`,
      `• *Veicolo / Modello:* ${this.quoteForm.vehicleModel || 'Da specificare'} ${this.quoteForm.vehicleYear ? '(' + this.quoteForm.vehicleYear + ')' : ''}`,
      ``,
      `*Dettagli sul lavoro richiesto:*`,
      `${this.quoteForm.notes || 'Nessun dettaglio aggiuntivo indicato.'}`
    ];

    if (attachments.length > 0) {
      bodyLines.push(``, `*📎 Foto / Allegati del lavoro (${attachments.length}):*`);
      attachments.forEach((att, idx) => {
        if (att.uploadedUrl) {
          bodyLines.push(`• Foto ${idx + 1} (${att.name}): ${att.uploadedUrl}`);
        } else {
          bodyLines.push(`• Allegato ${idx + 1}: ${att.name} (inviato in chat)`);
        }
      });
    }

    bodyLines.push(
      ``,
      `*I miei recapiti:*`,
      `• *Nome:* ${this.quoteForm.customerName || 'Cliente'}`,
      `• *Telefono:* ${this.quoteForm.customerPhone || 'Non indicato'}`,
      ``,
      `Grazie e cordiali saluti.`
    );

    return bodyLines.join('\n');
  }

  getWhatsAppLink(): string {
    return `https://wa.me/${this.info.whatsappNumber}?text=${encodeURIComponent(this.buildWhatsAppMessageText())}`;
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
