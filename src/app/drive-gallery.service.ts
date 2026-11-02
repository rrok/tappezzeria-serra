import { Injectable } from '@angular/core';
import { DRIVE_GALLERY_CONFIG } from './drive-gallery.config';

export type GalleryCategory = 'tutti' | 'epoca' | 'cappotte' | 'moto' | 'moderne' | 'nautica-arredo';

export interface GalleryPhoto {
  id: string;
  title: string;
  caption: string;
  category: Exclude<GalleryCategory, 'tutti'>;
  categoryLabel: string;
  imageUrl: string;
  fallbackUrl?: string;
  fullResUrl: string;
  source: 'drive' | 'bottega';
  createdAt?: string;
}

export const DEFAULT_GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: 'bottega-1',
    title: 'Cucitura Sartoriale Pelle Cognac su Sedile Storico',
    caption: 'Lavorazione al banco in Via Emilia Ponente 107/A: ribattitura a doppio ago su pelle pieno fiore.',
    category: 'epoca',
    categoryLabel: 'Auto d’Epoca',
    imageUrl: 'images/hero-workshop.jpg',
    fullResUrl: 'images/hero-workshop.jpg',
    source: 'bottega',
    createdAt: 'Bottega Storica Bologna'
  },
  {
    id: 'bottega-2',
    title: 'Cappotta Spider in Tela Sonnenland® Nera',
    caption: 'Confezionamento e tensionamento integrale cappotta cabriolet con lunotto posteriore ad alta trasparenza.',
    category: 'cappotte',
    categoryLabel: 'Cappotte & Spider',
    imageUrl: 'images/cappotte-cabrio.jpg',
    fullResUrl: 'images/cappotte-cabrio.jpg',
    source: 'bottega',
    createdAt: 'Restauro Spider d’Epoca'
  },
  {
    id: 'bottega-3',
    title: 'Sella Moto Artigianale Trapuntata a Diamante con Gel',
    caption: 'Rifacimento sella custom/storica in pelle bicolore idrorepellente con inserto Comfort Gel e Memory Foam.',
    category: 'moto',
    categoryLabel: 'Selle Moto & Scooter',
    imageUrl: 'images/selle-moto.jpg',
    fullResUrl: 'images/selle-moto.jpg',
    source: 'bottega',
    createdAt: 'Reparto Selleria Moto'
  },
  {
    id: 'bottega-4',
    title: 'Abitacolo Completo Gran Turismo in Pelle Bordeaux',
    caption: 'Sedili anatomici in vera pelle Bordeaux stile Connolly con cadenino (piping) crema e cielo auto restaurato.',
    category: 'epoca',
    categoryLabel: 'Auto d’Epoca',
    imageUrl: 'images/interni-epoca.jpg',
    fullResUrl: 'images/interni-epoca.jpg',
    source: 'bottega',
    createdAt: 'Restauro Targa Oro ASI'
  },
  {
    id: 'bottega-5',
    title: 'Cucitura a Mano a Doppio Ago con Filo Incerato',
    caption: 'Dettaglio dell’esecuzione a mano punto sellaio eseguita dalla famiglia Sindoni.',
    category: 'moderne',
    categoryLabel: 'Cieli & Interni',
    imageUrl: 'images/mani-cucitura.gif',
    fullResUrl: 'images/mani-cucitura.gif',
    source: 'bottega',
    createdAt: 'Lavorazione Artigianale'
  }
];

@Injectable({
  providedIn: 'root'
})
export class DriveGalleryService {
  extractFolderId(input: string): string {
    if (!input || input.startsWith('__')) return '';
    const trimmed = input.trim();

    const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]{10,})/);
    if (folderMatch && folderMatch[1]) {
      return folderMatch[1];
    }

    const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
    if (idParamMatch && idParamMatch[1]) {
      return idParamMatch[1];
    }

    if (/^[a-zA-Z0-9_-]{15,}$/.test(trimmed)) {
      return trimmed;
    }

    return '';
  }

  async fetchDrivePhotos(): Promise<GalleryPhoto[]> {
    const rawLink = DRIVE_GALLERY_CONFIG.PUBLIC_DRIVE_FOLDER_LINK || '';
    const apiKey =
      DRIVE_GALLERY_CONFIG.GOOGLE_API_KEY && !DRIVE_GALLERY_CONFIG.GOOGLE_API_KEY.startsWith('__')
        ? DRIVE_GALLERY_CONFIG.GOOGLE_API_KEY.trim()
        : '';
    const folderId = this.extractFolderId(rawLink);

    if (!folderId) {
      return DRIVE_GALLERY_CONFIG.INCLUDE_DEFAULT_WORKSHOP_PHOTOS ? [...DEFAULT_GALLERY_PHOTOS] : [];
    }

    try {
      let driveItems: Array<{ id: string; name: string; description?: string }> = [];

      if (apiKey) {
        driveItems = await this.fetchViaGoogleApi(folderId, apiKey);
      } else {
        driveItems = await this.fetchViaPublicEmbeddedView(folderId);
      }

      const drivePhotos: GalleryPhoto[] = driveItems.map((item) => this.mapDriveFileToPhoto(item));

      return DRIVE_GALLERY_CONFIG.INCLUDE_DEFAULT_WORKSHOP_PHOTOS
        ? [...drivePhotos, ...DEFAULT_GALLERY_PHOTOS]
        : drivePhotos;
    } catch {
      return DRIVE_GALLERY_CONFIG.INCLUDE_DEFAULT_WORKSHOP_PHOTOS ? [...DEFAULT_GALLERY_PHOTOS] : [];
    }
  }

  private async fetchViaGoogleApi(
    folderId: string,
    apiKey: string
  ): Promise<Array<{ id: string; name: string; description?: string }>> {
    const q = encodeURIComponent(`'${folderId}' in parents and mimeType contains 'image/' and trashed = false`);
    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,description,createdTime)&orderBy=createdTime desc&pageSize=100&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Google Drive API error: ${res.status}`);
    }
    const data = await res.json();
    return data.files || [];
  }

  private async fetchViaPublicEmbeddedView(
    folderId: string
  ): Promise<Array<{ id: string; name: string }>> {
    const targetUrl = `https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(folderId)}#list`;

    const proxyUrls = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
      `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`
    ];

    let html = '';
    for (const proxyUrl of proxyUrls) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const response = await fetch(proxyUrl, { signal: controller.signal });
        clearTimeout(timeout);
        if (response.ok) {
          const text = await response.text();
          if (text && (text.includes('flip-entry') || text.includes('flip-entries'))) {
            html = text;
            break;
          }
        }
      } catch {
        // try next proxy
      }
    }

    if (!html) {
      throw new Error('Unable to fetch public Drive folder view');
    }

    return this.parseEmbeddedFolderHtml(html);
  }

  private parseEmbeddedFolderHtml(html: string): Array<{ id: string; name: string }> {
    const results: Array<{ id: string; name: string }> = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const entries = doc.querySelectorAll('.flip-entry');

    entries.forEach((entry) => {
      const entryIdAttr = entry.getAttribute('id') || '';
      const fileId = entryIdAttr.replace(/^entry-/, '').trim();
      const titleEl = entry.querySelector('.flip-entry-title');
      const rawName = titleEl?.textContent?.trim() || 'Lavorazione Tappezzeria Serra';

      const isImageExt = /\.(jpe?g|png|webp|gif|avif|bmp|heic)$/i.test(rawName);
      const hasImageIcon =
        entry.innerHTML.includes('image') ||
        entry.innerHTML.includes('photo') ||
        entry.querySelector('img') !== null;

      if (fileId && (isImageExt || hasImageIcon)) {
        results.push({ id: fileId, name: rawName });
      }
    });

    return results;
  }

  private mapDriveFileToPhoto(file: { id: string; name: string; description?: string }): GalleryPhoto {
    const cleanName = file.name.replace(/\.(jpe?g|png|webp|gif|avif|bmp|heic)$/i, '').trim();
    const lower = cleanName.toLowerCase();

    let category: Exclude<GalleryCategory, 'tutti'> = 'epoca';
    let categoryLabel = 'Auto d’Epoca';

    if (/(cappott|capot|spider|cabrio|sonnenland|lunotto|telo)/i.test(lower)) {
      category = 'cappotte';
      categoryLabel = 'Cappotte & Spider';
    } else if (/(moto|sell[ae]|scooter|guzzi|ducati|vespa|lambretta|bmw|harley|gel)/i.test(lower)) {
      category = 'moto';
      categoryLabel = 'Selle Moto & Scooter';
    } else if (/(ciel[oi]|imperial|scollat|audi|volkswagen|golf|volante|fianchett|modern)/i.test(lower)) {
      category = 'moderne';
      categoryLabel = 'Cieli & Interni';
    } else if (/(nautic|barca|gommone|poltron|divan|sedi[ae]|arred|ufficio)/i.test(lower)) {
      category = 'nautica-arredo';
      categoryLabel = 'Nautica & Arredo';
    } else if (/(epoca|storic|alfa|lancia|fiat|ferrari|maserati|jaguar|porsche|connolly)/i.test(lower)) {
      category = 'epoca';
      categoryLabel = 'Auto d’Epoca';
    }

    const formattedTitle = cleanName
      .replace(/^(epoca|cappotta|cappotte|moto|sella|cielo|moderne|arredo|nautica)\s*[-_:–]\s*/i, '')
      .replace(/[_-]+/g, ' ')
      .trim();

    const finalTitle =
      formattedTitle.length > 0
        ? formattedTitle.charAt(0).toUpperCase() + formattedTitle.slice(1)
        : 'Lavorazione Artigianale Tappezzeria Serra';

    return {
      id: `drive-${file.id}`,
      title: finalTitle,
      caption:
        file.description ||
        `Lavorazione artigianale eseguita presso il laboratorio Tappezzeria Serra S.n.c. – Reparto ${categoryLabel}.`,
      category,
      categoryLabel,
      imageUrl: `https://drive.google.com/thumbnail?id=${file.id}&sz=w1000`,
      fallbackUrl: `https://lh3.googleusercontent.com/d/${file.id}=w1000`,
      fullResUrl: `https://drive.google.com/thumbnail?id=${file.id}&sz=w1800`,
      source: 'drive',
      createdAt: 'Laboratorio Tappezzeria Serra'
    };
  }
}
