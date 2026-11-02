/**
 * Configurazione Galleria Google Drive per Tappezzeria Serra S.n.c.
 *
 * I valori qui sotto vengono iniettati automaticamente in fase di build da GitHub Actions
 * leggendo la variabile/secret di repository `DRIVE_FOLDER_LINK` (e opzionalmente `GOOGLE_API_KEY`)
 * configurata su GitHub in: Settings -> Secrets and variables -> Actions.
 */
export const DRIVE_GALLERY_CONFIG = {
  PUBLIC_DRIVE_FOLDER_LINK: '__DRIVE_FOLDER_LINK__',
  GOOGLE_API_KEY: '__GOOGLE_API_KEY__',
  INCLUDE_DEFAULT_WORKSHOP_PHOTOS: true
};
