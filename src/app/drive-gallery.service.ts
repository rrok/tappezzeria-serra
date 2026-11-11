import { Injectable } from '@angular/core';
import { DRIVE_GALLERY_CONFIG, RawDriveFileItem } from './drive-gallery.config';

export type GalleryCategory = 'tutti' | 'selle' | 'sedili' | 'sottotetto' | 'cappotte' | 'epoca';

export interface GalleryPhoto {
  id: string;
  title: string;
  caption: string;
  category: Exclude<GalleryCategory, 'tutti'>;
  categoryLabel: string;
  subCategoryBadge?: string;
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
    categoryLabel: 'Cappotte & Cabrio',
    imageUrl: 'images/cappotte-cabrio.jpg',
    fullResUrl: 'images/cappotte-cabrio.jpg',
    source: 'bottega',
    createdAt: 'Restauro Spider d’Epoca'
  },
  {
    id: 'bottega-3',
    title: 'Sella Moto Artigianale Trapuntata a Diamante con Gel',
    caption: 'Rifacimento sella custom/storica in pelle bicolore idrorepellente con inserto Comfort Gel e Memory Foam.',
    category: 'selle',
    categoryLabel: 'Selle Moto & Scooter',
    imageUrl: 'images/selle-moto.jpg',
    fullResUrl: 'images/selle-moto.jpg',
    source: 'bottega',
    createdAt: 'Reparto Selleria Moto'
  },
  {
    id: 'bottega-4',
    title: 'Abitacolo Completo Gran Turismo in Pelle Bordeaux',
    caption: 'Sedili anatomici in vera pelle Bordeaux stile Connolly con cadenino (piping) crema.',
    category: 'sedili',
    categoryLabel: 'Sedili & Interni',
    imageUrl: 'images/interni-epoca.jpg',
    fullResUrl: 'images/interni-epoca.jpg',
    source: 'bottega',
    createdAt: 'Restauro Targa Oro ASI'
  },
  {
    id: 'bottega-5',
    title: 'Cucitura a Mano a Doppio Ago con Filo Incerato',
    caption: 'Dettaglio dell’esecuzione a mano punto sellaio eseguita dalla famiglia Sindoni.',
    category: 'sottotetto',
    categoryLabel: 'Sottotetto & Cieli',
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
    const rawItems = DRIVE_GALLERY_CONFIG.PRELOADED_DRIVE_ITEMS || [];
    if (rawItems.length === 0) {
      return [...DEFAULT_GALLERY_PHOTOS];
    }
    return this.mapItemsListToPhotos(rawItems);
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
        liveItems = await this.fetchViaGoogleApiRecursive(folderId, apiKey);
      } else {
        liveItems = await this.fetchViaJinaReaderRecursive(folderId);
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
            folderPath: item.folderPath?.length ? item.folderPath : existingPreload?.folderPath,
            localUrl: existingPreload?.localUrl
          });
        }
      }

      const finalRawItems = Array.from(mergedMap.values());
      if (finalRawItems.length === 0) {
        return [...DEFAULT_GALLERY_PHOTOS];
      }

      return this.mapItemsListToPhotos(finalRawItems);
    } catch {
      return this.getInitialPhotos();
    }
  }

  private mapItemsListToPhotos(items: RawDriveFileItem[]): GalleryPhoto[] {
    // Raggruppa per cartella per numerare eventuali foto multiple (IMG_...) dentro la stessa sottocartella lavoro
    const folderCounts = new Map<string, number>();
    const folderIndices = new Map<string, number>();

    for (const item of items) {
      const key = (item.folderPath || []).join('/');
      if (key) {
        folderCounts.set(key, (folderCounts.get(key) || 0) + 1);
      }
    }

    return items.map((item) => {
      const key = (item.folderPath || []).join('/');
      let indexInFolder = 1;
      let totalInFolder = 1;
      if (key) {
        totalInFolder = folderCounts.get(key) || 1;
        indexInFolder = (folderIndices.get(key) || 0) + 1;
        folderIndices.set(key, indexInFolder);
      }
      return this.mapDriveFileToPhoto(item, indexInFolder, totalInFolder);
    });
  }

  private async fetchViaGoogleApiRecursive(
    folderId: string,
    apiKey: string,
    folderPath: string[] = [],
    depth = 0
  ): Promise<RawDriveFileItem[]> {
    if (depth > 4) return [];
    const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType,description,createdTime)&orderBy=createdTime desc&pageSize=100&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Google Drive API error: ${res.status}`);
    }
    const data = await res.json();
    const entries = data.files || [];

    const files: RawDriveFileItem[] = [];
    const subfolders: Array<{ id: string; name: string }> = [];

    for (const entry of entries) {
      if (entry.mimeType === 'application/vnd.google-apps.folder') {
        subfolders.push({ id: entry.id, name: entry.name });
      } else if (entry.mimeType && entry.mimeType.startsWith('image/')) {
        files.push({
          id: entry.id,
          name: entry.name,
          description: entry.description,
          folderPath
        });
      }
    }

    const subResults = await Promise.all(
      subfolders.map((sub) =>
        this.fetchViaGoogleApiRecursive(sub.id, apiKey, [...folderPath, sub.name], depth + 1)
      )
    );
    for (const subFiles of subResults) {
      files.push(...subFiles);
    }

    return files;
  }

  private async fetchViaJinaReaderRecursive(
    folderId: string,
    folderPath: string[] = [],
    depth = 0,
    visited = new Set<string>()
  ): Promise<RawDriveFileItem[]> {
    if (!folderId || depth > 4 || visited.has(folderId)) {
      return [];
    }
    visited.add(folderId);

    const cacheBuster = Date.now();
    const url = `https://r.jina.ai/https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(folderId)}&_cb=${cacheBuster}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7500);

    try {
      const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
      clearTimeout(timeout);
      if (!res.ok) {
        return [];
      }
      const text = await res.text();

      const files: RawDriveFileItem[] = [];
      const subfolders: Array<{ id: string; name: string }> = [];

      // 1. Individua sottocartelle: [NomeCartella](https://drive.google.com/drive/folders/ID)
      const folderRegex = /\[([^\[\]\n\r]+)\]\(https:\/\/drive\.google\.com\/drive\/folders\/([a-zA-Z0-9_-]{15,})\)/g;
      let fMatch: RegExpExecArray | null;
      while ((fMatch = folderRegex.exec(text)) !== null) {
        const subName = fMatch[1].trim();
        const subId = fMatch[2].trim();
        if (subId && subName && !subName.startsWith('![')) {
          subfolders.push({ id: subId, name: subName });
        }
      }

      // 2. Individua file immagine (anche senza estensione .jpg nel titolo!)
      const fileRegex = /!\[Image\s+\d+\]\(https:\/\/drive-thirdparty\.googleusercontent\.com\/\d+\/type\/image\/[^)]+\)\s*([^\[\]\n\r]+?)\]\(https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]{15,})\/view/gi;
      let match: RegExpExecArray | null;
      while ((match = fileRegex.exec(text)) !== null) {
        const name = match[1].trim();
        const id = match[2].trim();
        if (id && name) {
          files.push({ id, name, folderPath });
        }
      }

      // 3. Esplora sottocartelle in parallelo
      if (subfolders.length > 0) {
        const subResults = await Promise.all(
          subfolders.map((sub) =>
            this.fetchViaJinaReaderRecursive(sub.id, [...folderPath, sub.name], depth + 1, visited)
          )
        );
        for (const subFiles of subResults) {
          files.push(...subFiles);
        }
      }

      return files;
    } catch {
      clearTimeout(timeout);
      return [];
    }
  }

  /**
   * Interpreta la struttura cartelle + nome file secondo lo schema della bottega:
   * - SELLE -> MOTO o SCOOTER -> TMAX -> DESCRIZIONE
   * - SEDILI / INTERNI -> JEEP -> DESCRIZIONE
   * - SOTTOTETTO -> ALFAROMEO -> DESCRIZIONE
   * - CAPPOTTE -> MAGGIOLONE -> DESCRIZIONE
   * - EPOCA -> PORSCHE -> DESCRIZIONE
   */
  private mapDriveFileToPhoto(
    file: RawDriveFileItem,
    indexInFolder = 1,
    totalInFolder = 1
  ): GalleryPhoto {
    const rawFolders = (file.folderPath || []).map((f) => f.trim()).filter(Boolean);

    // Pulisce il nome del file da punti iniziali ed estensioni immagine
    const cleanFileName = file.name
      .replace(/^\.+/, '')
      .replace(/\.(jpe?g|png|webp|gif|avif|bmp|heic)$/i, '')
      .trim();

    // Verifica se il file ha un nome generico da fotocamera/WhatsApp (es. IMG-20220914-WA0085)
    const isCameraFileName = /^(IMG|DSC|PXL|PHOTO|Screenshot|WhatsApp|20\d{2}[-_]\d{2})/i.test(cleanFileName);

    // Normalizza nomi composti comuni prima di dividere sui trattini (es. "t-max" -> "T-Max", "alfa-romeo" -> "Alfa Romeo")
    const normalizeCompoundModels = (input: string): string =>
      input
        .replace(/\bt[\s_-]*max\b/gi, 'T Max')
        .replace(/\balfa[\s_-]*romeo\b/gi, 'Alfa Romeo')
        .replace(/\btryumph\b/gi, 'Triumph')
        .replace(/\bacannelloni\b/gi, 'a cannelloni')
        .replace(/\besaonali\b/gi, 'esagonali')
        .replace(/\bpannelo\b/gi, 'pannello')
        .replace(/\ba\s+romi\b/gi, 'a rombi')
        .replace(/\bseie\b/gi, 'serie')
        .replace(/\bporche\b/gi, 'Porsche');

    // Costruisce la catena di segmenti (dalle cartelle + dal nome file se non è IMG_...)
    const rawSources: string[] = [...rawFolders];
    if (!isCameraFileName && cleanFileName) {
      rawSources.push(cleanFileName);
    }

    const segments: string[] = [];
    for (const src of rawSources) {
      const normalized = normalizeCompoundModels(src);
      const parts = normalized
        .split(/\s*[-–_:]+\s*/)
        .map((p) => p.replace(/^[,.\s]+|[,.\s]+$/g, '').trim())
        .filter(Boolean);
      segments.push(...parts);
    }

    const fullCombinedLower = [...rawFolders, cleanFileName].join(' ').toLowerCase();

    // 1. Determina la Categoria principale (5 categorie ufficiali della bottega)
    let category: Exclude<GalleryCategory, 'tutti'> = 'epoca';
    let categoryLabel = 'Auto d’Epoca';
    let subCategoryBadge: string | undefined;

    const firstTokenLower = (segments[0] || '').toLowerCase();

    if (/^(sell[ae]|moto|scooter)$/i.test(firstTokenLower)) {
      category = 'selle';
      categoryLabel = 'Selle Moto & Scooter';
    } else if (/^(sedil[ei]|intern[oi])$/i.test(firstTokenLower)) {
      category = 'sedili';
      categoryLabel = 'Sedili & Interni';
    } else if (/^(sottotett[oi]|ciel[oi]|imperial[ei])$/i.test(firstTokenLower)) {
      category = 'sottotetto';
      categoryLabel = 'Sottotetto & Cieli';
    } else if (/^(cappott[ae]|capot[ae]|lunott[oi]|cabrio|spider)$/i.test(firstTokenLower)) {
      category = 'cappotte';
      categoryLabel = 'Cappotte & Cabrio';
    } else if (/^(epoca|storic[ao]|restaur[oi])$/i.test(firstTokenLower)) {
      category = 'epoca';
      categoryLabel = 'Auto d’Epoca';
    } else {
      // Rilevamento automatico dalle parole chiave se il file è nella root senza cartella
      if (/(cappott|capot|lunotto|maggiolone|smart\s*cabrio|spider|cabrio|sonnenland)/i.test(fullCombinedLower)) {
        category = 'cappotte';
        categoryLabel = 'Cappotte & Cabrio';
      } else if (/(sottotett|ciel[oi]|imperial)/i.test(fullCombinedLower)) {
        category = 'sottotetto';
        categoryLabel = 'Sottotetto & Cieli';
      } else if (/(sell[ae]|moto\b|scooter|t[\s_-]*max|vespa|gilera|runner|honda|cn\b|triumph|tryumph|guzzi|ducati|yamaha|harley|kawasaki)/i.test(fullCombinedLower)) {
        category = 'selle';
        categoryLabel = 'Selle Moto & Scooter';
      } else if (/(sedil[ei]|intern[oi]|pannell[oi]|jeep|panda|fiat|volante)/i.test(fullCombinedLower)) {
        category = 'sedili';
        categoryLabel = 'Sedili & Interni';
      } else {
        category = 'epoca';
        categoryLabel = 'Auto d’Epoca';
      }
    }

    // Rileva eventuale sotto-badge Moto / Scooter per la categoria Selle
    if (category === 'selle') {
      if (segments.some((s) => /^scooter$/i.test(s)) || /(scooter|t\s*max|vespa|gilera|runner|honda\s*cn|\bcn\b)/i.test(fullCombinedLower)) {
        subCategoryBadge = 'Scooter';
      } else if (segments.some((s) => /^moto$/i.test(s)) || /(moto|triumph|tryumph|ducati|guzzi|bmw|harley)/i.test(fullCombinedLower)) {
        subCategoryBadge = 'Moto';
      }
    }

    // 2. Rimuove i token iniziali che indicano solo la categoria (es. "Selle", "Moto", "Scooter", "Sedili", "Interni", "Sottotetto", "Cappotte", "Epoca")
    const contentSegments = [...segments];
    while (
      contentSegments.length > 0 &&
      /^(sell[ae]|moto|scooter|sedil[ei]|intern[oi]|sottotett[oi]|ciel[oi]|cappott[ae]|capot[ae]|lunott[oi]|epoca)$/i.test(
        contentSegments[0]
      )
    ) {
      contentSegments.shift();
    }

    // 3. Costruisce Titolo (Modello) e Descrizione seguendo lo schema:
    //    CATEGORIA - [MOTO/SCOOTER] - MODELLO - DESCRIZIONE
    let rawTitle = '';
    let rawDescription = '';

    if (contentSegments.length >= 2) {
      rawTitle = contentSegments[0];
      rawDescription = contentSegments.slice(1).join(' – ');
    } else if (contentSegments.length === 1) {
      const single = contentSegments[0];
      // Se è una frase unica tipo "T Max 530 con cuciture su specifiche del cliente", separa modello e descrizione
      const splitMatch = single.match(/^(.+?)\s+(con\s+.+|su\s+specifiche.*|in\s+pelle.*|a\s+esagoni.*|a\s+cannelloni.*|a\s+rombi.*|cuciture\s+.*)$/i);
      if (splitMatch) {
        rawTitle = splitMatch[1].trim();
        rawDescription = splitMatch[2].trim();
      } else {
        rawTitle = single;
      }
    } else {
      rawTitle = `${categoryLabel} – Lavorazione Artigianale`;
    }

    const formatTitleCase = (str: string): string =>
      str
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => {
          if (/^(cn|gts|gt|asi|suv|bmw)$/i.test(w)) return w.toUpperCase();
          if (/^(di|del|della|dei|in|su|con|per|a|e|o)$/i.test(w)) return w.toLowerCase();
          return w.charAt(0).toUpperCase() + w.slice(1);
        })
        .join(' ')
        .replace(/^./, (c) => c.toUpperCase());

    let finalTitle = formatTitleCase(rawTitle);

    // Se ci sono più foto IMG_... nella stessa sottocartella progetto, aggiunge il numero foto
    if (isCameraFileName && totalInFolder > 1) {
      finalTitle = `${finalTitle} (Foto ${indexInFolder}/${totalInFolder})`;
    }

    let finalCaption = '';
    if (file.description) {
      finalCaption = file.description;
    } else if (rawDescription) {
      const cleanDesc = rawDescription.charAt(0).toUpperCase() + rawDescription.slice(1);
      finalCaption = `${cleanDesc}. Lavorazione eseguita presso Tappezzeria Serra S.n.c. (${categoryLabel}${subCategoryBadge ? ' • ' + subCategoryBadge : ''}).`;
    } else {
      finalCaption = `Lavorazione sartoriale su misura eseguita nel laboratorio di Via Emilia Ponente 107/A – Reparto ${categoryLabel}${subCategoryBadge ? ' (' + subCategoryBadge + ')' : ''}.`;
    }

    const primaryImage = file.localUrl || `https://lh3.googleusercontent.com/d/${file.id}=w1000`;
    const fullImage = file.localUrl || `https://lh3.googleusercontent.com/d/${file.id}=w1800`;

    return {
      id: `drive-${file.id}`,
      title: finalTitle,
      caption: finalCaption,
      category,
      categoryLabel,
      subCategoryBadge,
      imageUrl: primaryImage,
      fallbackUrl: `https://drive.google.com/thumbnail?id=${file.id}&sz=w1000`,
      fullResUrl: fullImage,
      source: 'drive',
      createdAt: subCategoryBadge ? `${categoryLabel} • ${subCategoryBadge}` : categoryLabel
    };
  }
}
