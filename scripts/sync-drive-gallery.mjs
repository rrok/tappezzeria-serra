import fs from 'node:fs';
import path from 'node:path';

const configPath = path.resolve('src/app/drive-gallery.config.ts');
const outDir = path.resolve('public/drive-photos');

const rawLink = (process.env.DRIVE_FOLDER_LINK || '').trim();
const apiKey = (process.env.GOOGLE_API_KEY || '').trim();

function extractFolderId(input) {
  if (!input || input.startsWith('__')) return '';
  const folderMatch = input.match(/\/folders\/([a-zA-Z0-9_-]{10,})/);
  if (folderMatch && folderMatch[1]) return folderMatch[1];
  const idMatch = input.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (idMatch && idMatch[1]) return idMatch[1];
  if (/^[a-zA-Z0-9_-]{15,}$/.test(input)) return input;
  return '';
}

async function fetchDriveItems(folderId) {
  if (!folderId) return [];
  const url = `https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(folderId)}#list`;
  console.log(`[DriveSync] Fetching public Drive folder: ${folderId}`);
  const resp = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status} fetching embeddedfolderview`);
  }
  const html = await resp.text();

  const items = [];
  const entryRegex = /<div class="flip-entry" id="entry-([a-zA-Z0-9_-]+)"[\s\S]*?<div class="flip-entry-title">([^<]+)<\/div>/g;
  let match;
  while ((match = entryRegex.exec(html)) !== null) {
    const id = match[1].trim();
    const name = match[2].trim();
    if (id && name) {
      items.push({ id, name });
    }
  }
  return items;
}

async function downloadPhoto(fileId, destFile) {
  const urls = [
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`,
    `https://lh3.googleusercontent.com/d/${fileId}=w1600`
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, { redirect: 'follow' });
      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        const buf = Buffer.from(arrayBuf);
        if (buf.length > 500) {
          fs.writeFileSync(destFile, buf);
          return true;
        }
      }
    } catch {
      // try next URL
    }
  }
  return false;
}

async function main() {
  const folderId = extractFolderId(rawLink);
  const preloadedItems = [];

  if (folderId) {
    try {
      const items = await fetchDriveItems(folderId);
      console.log(`[DriveSync] Found ${items.length} file(s) in Drive folder.`);
      fs.mkdirSync(outDir, { recursive: true });

      for (const item of items) {
        const localFileName = `${item.id}.jpg`;
        const localFilePath = path.join(outDir, localFileName);
        const downloaded = await downloadPhoto(item.id, localFilePath);
        console.log(`[DriveSync] - ${item.name} (${item.id}) -> downloaded: ${downloaded}`);
        preloadedItems.push({
          id: item.id,
          name: item.name,
          localUrl: downloaded ? `drive-photos/${localFileName}` : undefined
        });
      }
    } catch (err) {
      console.warn(`[DriveSync] Warning during Drive sync:`, err.message);
    }
  } else {
    console.log('[DriveSync] No DRIVE_FOLDER_LINK provided; skipping build-time Drive download.');
  }

  const tsContent = `/**
 * CONFIGURAZIONE AUTOMATICA GALLERIA GOOGLE DRIVE – TAPPEZZERIA SERRA BOLOGNA
 * Generato automaticamente durante la build da scripts/sync-drive-gallery.mjs
 */
export interface RawDriveFileItem {
  id: string;
  name: string;
  description?: string;
  localUrl?: string;
}

export const DRIVE_GALLERY_CONFIG: {
  PUBLIC_DRIVE_FOLDER_LINK: string;
  GOOGLE_API_KEY: string;
  INCLUDE_DEFAULT_WORKSHOP_PHOTOS: boolean;
  PRELOADED_DRIVE_ITEMS: RawDriveFileItem[];
} = {
  PUBLIC_DRIVE_FOLDER_LINK: ${JSON.stringify(rawLink)},
  GOOGLE_API_KEY: ${JSON.stringify(apiKey)},
  INCLUDE_DEFAULT_WORKSHOP_PHOTOS: true,
  PRELOADED_DRIVE_ITEMS: ${JSON.stringify(preloadedItems, null, 2)}
};
`;

  fs.writeFileSync(configPath, tsContent, 'utf8');
  console.log(`[DriveSync] Updated src/app/drive-gallery.config.ts with ${preloadedItems.length} preloaded photo(s).`);
}

main();
