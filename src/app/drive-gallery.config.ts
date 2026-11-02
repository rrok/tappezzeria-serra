/**
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
  PUBLIC_DRIVE_FOLDER_LINK: "https://drive.google.com/drive/folders/1edR2VAPvGmHjrV7EayQMBtl0LArqIi38",
  GOOGLE_API_KEY: "",
  INCLUDE_DEFAULT_WORKSHOP_PHOTOS: true,
  PRELOADED_DRIVE_ITEMS: [
  {
    "id": "1D2qLc-qrqQDpLOpqeeJv9EjLbi8WuZHF",
    "name": "sella-t-max.jpeg",
    "localUrl": "drive-photos/1D2qLc-qrqQDpLOpqeeJv9EjLbi8WuZHF.jpg"
  }
]
};
