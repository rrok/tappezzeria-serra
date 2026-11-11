/**
 * CONFIGURAZIONE AUTOMATICA GALLERIA GOOGLE DRIVE – TAPPEZZERIA SERRA BOLOGNA
 * Generato automaticamente durante la build da scripts/sync-drive-gallery.mjs
 */
export interface RawDriveFileItem {
  id: string;
  name: string;
  folderPath?: string[];
  description?: string;
  localUrl?: string;
}

export const DRIVE_GALLERY_CONFIG: {
  PUBLIC_DRIVE_FOLDER_LINK: string;
  GOOGLE_API_KEY: string;
  INCLUDE_DEFAULT_WORKSHOP_PHOTOS: boolean;
  PRELOADED_DRIVE_ITEMS: RawDriveFileItem[];
} = {
  PUBLIC_DRIVE_FOLDER_LINK: "",
  GOOGLE_API_KEY: "",
  INCLUDE_DEFAULT_WORKSHOP_PHOTOS: false,
  PRELOADED_DRIVE_ITEMS: []
};
