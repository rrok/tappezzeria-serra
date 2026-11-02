/**
 * Configurazione Galleria Google Drive per Tappezzeria Serra S.n.c.
 *
 * ISTRUZIONI RAPIDE:
 * 1. Crea una cartella su Google Drive (es. "Galleria Tappezzeria Serra").
 * 2. Clicca col tasto destro sulla cartella -> "Condividi" -> "Condividi".
 * 3. Sotto "Accesso generale", imposta "Chiunque abbia il link" (Visualizzatore).
 * 4. Copia il link della cartella e incollalo qui sotto in `PUBLIC_DRIVE_FOLDER_LINK`
 *    (oppure incollalo direttamente dal pannello "Collega Cartella Drive" nella pagina Galleria).
 *
 * SUGGERIMENTO PER LE CATEGORIE AUTOMATICHE:
 * Puoi nominare i file foto su Google Drive iniziando con la categoria, ad esempio:
 * - "epoca - Alfa Romeo Duetto sedili pelle bordeaux.jpg"  -> va in "Auto d'Epoca"
 * - "cappotta - Spider storica tela Sonnenland.jpg"        -> va in "Cappotte & Spider"
 * - "moto - Sella Moto Guzzi V7 trapuntata gel.jpg"        -> va in "Selle Moto & Scooter"
 * - "cielo - Ripristino cielo Audi A4.jpg"                 -> va in "Cieli & Auto Moderne"
 * - "arredo - Poltrona pelle cognac.jpg"                   -> va in "Nautica & Arredo"
 */
export const DRIVE_GALLERY_CONFIG = {
  /**
   * Inserisci qui il link pubblico della cartella Google Drive o il suo ID.
   * Esempio: 'https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWxYz?usp=sharing'
   */
  PUBLIC_DRIVE_FOLDER_LINK: '',

  /**
   * Opzionale: se possiedi una Google Drive API Key o un URL Google Apps Script,
   * puoi inserirlo qui. Se lasciato vuoto, il sito legge comunque in automatico
   * la cartella pubblica Google Drive senza bisogno di alcuna chiave API!
   */
  GOOGLE_API_KEY: '',

  /**
   * Mostra anche le foto storiche di base della bottega insieme a quelle caricate da Google Drive
   */
  INCLUDE_DEFAULT_WORKSHOP_PHOTOS: true
};
