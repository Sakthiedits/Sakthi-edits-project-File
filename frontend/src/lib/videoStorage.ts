/**
 * Local video blob storage using IndexedDB for seamless client-side uploads.
 * Ensures video files work seamlessly even when backend R2 is offline or running on static hosting (e.g. Vercel).
 */

const DB_NAME = 'sakthiedits_media_db';
const STORE_NAME = 'videos';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function storeVideoFile(id: string, file: Blob): Promise<string> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(file, id);
      req.onsuccess = () => resolve(`indexeddb://${id}`);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to store video in IndexedDB, using object URL fallback:', err);
    return URL.createObjectURL(file);
  }
}

export async function getVideoFile(id: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve((req.result as Blob) || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function deleteVideoFile(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // ignore
  }
}

const blobUrlCache = new Map<string, string>();

export async function resolvePlayableVideoUrl(url: string | null): Promise<string> {
  if (!url) return '';
  if (url.startsWith('indexeddb://')) {
    const key = url.replace('indexeddb://', '');
    if (blobUrlCache.has(key)) {
      return blobUrlCache.get(key)!;
    }
    const blob = await getVideoFile(key);
    if (blob) {
      const objectUrl = URL.createObjectURL(blob);
      blobUrlCache.set(key, objectUrl);
      return objectUrl;
    }
  }
  return url;
}

export function extractThumbnailFromVideoFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    try {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      video.src = url;

      video.onloadeddata = () => {
        video.currentTime = Math.min(1, Math.max(0.2, (video.duration || 1) * 0.1));
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 480;
          canvas.height = video.videoHeight || 854;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            URL.revokeObjectURL(url);
            resolve(dataUrl);
            return;
          }
        } catch {
          // ignore
        }
        URL.revokeObjectURL(url);
        resolve('/sakthi-hero.jpg');
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve('/sakthi-hero.jpg');
      };
    } catch {
      resolve('/sakthi-hero.jpg');
    }
  });
}
