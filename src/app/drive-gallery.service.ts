import { Injectable } from '@angular/core';
import { DRIVE_GALLERY_CONFIG, RawDriveFileItem } from './drive-gallery.config';

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

  getInitialPhotos(): GalleryPhoto[] {
    const preloaded = (DRIVE_GALLERY_CONFIG.PRELOADED_DRIVE_ITEMS || []).map((item) =>
      this.mapDriveFileToPhoto(item)
    );
    return DRIVE_GALLERY_CONFIG.INCLUDE_DEFAULT_WORKSHOP_PHOTOS
      ? [...preloaded, ...DEFAULT_GALLERY_PHOTOS]
      : preloaded;
  }

  async fetchDrivePhotos(): Promise<GalleryPhoto[]> {
    const rawLink = DRIVE_GALLERY_CONFIG.PUBLIC_DRIVE_FOLDER_LINK || '';
    const apiKey =
      DRIVE_GALLERY_CONFIG.GOOGLE_API_KEY && !DRIVE_GALLERY_CONFIG.GOOGLE_API_KEY.startsWith('__')
        ? DRIVE_GALLERY_CONFIG.GOOGLE_API_KEY.trim()
        : '';
    const folderId = this.extractFolderId(rawLink);
    const preloadedItems: RawDriveFileItem[] = DRIVE_GALLERY_CONFIG.PRELOADED_DRIVE_ITEMS || [];

    if (!folderId) {
      return this.getInitialPhotos();
    }

    try {
      let liveItems: RawDriveFileItem[] = [];

      if (apiKey) {
        liveItems = await this.fetchViaGoogleApi(folderId, apiKey);
      } else {
        liveItems = await this.fetchViaJinaReader(folderId);
      }

      const preloadedById = new Map<string, RawDriveFileItem>();
      for (const p of preloadedItems) {
        if (p && p.id) preloadedById.set(p.id, p);
      }

      const mergedMap = new Map<string, RawDriveFileItem>();
      for (const item of [...liveItems, ...preloadedItems]) {
        if (item && item.id && !mergedMap.has(item.id)) {
          const existingPreload = preloadedById.get(item.id);
          mergedMap.set(item.id, {
            ...item,
            localUrl: existingPreload?.localUrl || item.localUrl
          });
        }
      }

      const drivePhotos: GalleryPhoto[] = Array.from(mergedMap.values()).map((item) =>
        this.mapDriveFileToPhoto(item)
      );

      return DRIVE_GALLERY_CONFIG.INCLUDE_DEFAULT_WORKSHOP_PHOTOS
        ? [...drivePhotos, ...DEFAULT_GALLERY_PHOTOS]
        : drivePhotos;
    } catch {
      return this.getInitialPhotos();
    }
  }

  private async fetchViaGoogleApi(
    folderId: string,
    apiKey: string
  ): Promise<RawDriveFileItem[]> {
    const q = encodeURIComponent(`'${folderId}' in parents and mimeType contains 'image/' and trashed = false`);
    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,description,createdTime)&orderBy=createdTime desc&pageSize=100&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Google Drive API error: ${res.status}`);
    }
    const data = await res.json();
    return data.files || [];
  }

  private async fetchViaJinaReader(folderId: string): Promise<RawDriveFileItem[]> {
    const url = `https://r.jina.ai/https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(folderId)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) {
        return [];
      }
      const text = await res.text();
      const items: RawDriveFileItem[] = [];
      const lineRegex = /\[!\[Image[^\]]*\]\((https:\/\/lh3\.googleusercontent\.com\/[^)]+)\)[^\]]*?([a-zA-Z0-9_.\-\s]+\.(?:jpe?g|png|webp|gif|avif|bmp|heic))\]\(https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]{15,})\/view/gi;
      let match: RegExpExecArray | null;
      while ((match = lineRegex.exec(text)) !== null) {
        const signedThumb = match[1].trim().replace(/=s\d+$/, '=s1200');
        const name = match[2].trim();
        const id = match[3].trim();
        if (id && name) {
          items.push({ id, name, localUrl: signedThumb });
        }
      }
      return items;
    } catch {
      clearTimeout(timeout);
      return [];
    }
  }

  private mapDriveFileToPhoto(file: RawDriveFileItem): GalleryPhoto {
    const cleanName = file.name.replace(/\.(jpe?g|png|webp|gif|avif|bmp|heic)$/i, '').trim();
    const lower = cleanName.toLowerCase();

    let category: Exclude<GalleryCategory, 'tutti'> = 'epoca';
    let categoryLabel = 'Auto d’Epoca';

    if (/(cappott|capot|spider|cabrio|sonnenland|lunotto|telo)/i.test(lower)) {
      category = 'cappotte';
      categoryLabel = 'Cappotte & Spider';
    } else if (/(moto|sell[ae]|scooter|t[\s_-]*max|tmax|guzzi|ducati|vespa|lambretta|bmw|harley|honda|yamaha|kawasaki|suzuki|gel)/i.test(lower)) {
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

    const withoutExplicitPrefix = cleanName
      .replace(/^(epoca|cappotta|cappotte|moto|cielo|moderne|arredo|nautica)\s*[-:–]\s+/i, '')
      .replace(/[_-]+/g, ' ')
      .trim();

    const finalTitle =
      withoutExplicitPrefix.length > 0
        ? withoutExplicitPrefix
            .split(/\s+/)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        : 'Lavorazione Artigianale Tappezzeria Serra';

    const primaryImage = file.localUrl || `https://lh3.googleusercontent.com/d/${file.id}=w1000`;
    const fullImage = file.localUrl || `https://lh3.googleusercontent.com/d/${file.id}=w1800`;

    return {
      id: `drive-${file.id}`,
      title: finalTitle,
      caption:
        file.description ||
        `Lavorazione artigianale eseguita presso il laboratorio Tappezzeria Serra S.n.c. – Reparto ${categoryLabel}.`,
      category,
      categoryLabel,
      imageUrl: primaryImage,
      fallbackUrl: `https://lh3.googleusercontent.com/d/${file.id}=w1000`,
      fullResUrl: fullImage,
      source: 'drive',
      createdAt: 'Laboratorio Tappezzeria Serra'
    };
  }
}
