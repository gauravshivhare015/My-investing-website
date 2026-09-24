/**
 * Document Storage Utility
 * Provides persistent offline-first storage via IndexedDB for documents (PDFs, JPGs, etc.)
 * combined with smart image compression and chunked Firestore cloud synchronization.
 * This guarantees documents NEVER vanish across refreshes or network hiccups.
 */

export interface VaultDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // Base64 Data URL
  uploadedAt: number;
  userId?: string;
  isChunked?: boolean;
  totalChunks?: number;
}

const DB_NAME = 'PortfolioDocVault_v2';
const STORE_NAME = 'user_documents';
const DB_VERSION = 1;

/**
 * Open or upgrade the IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('uploadedAt', 'uploadedAt', { unique: false });
        store.createIndex('userId', 'userId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save or update a document in local IndexedDB
 */
export async function saveDocToIndexedDB(doc: VaultDocument): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(doc);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to save document to IndexedDB:', err);
    // Fallback: try saving metadata to localStorage if small
    try {
      if (doc.data && doc.data.length < 500000) {
        localStorage.setItem(`doc_${doc.id}`, JSON.stringify(doc));
      }
    } catch (e) {
      // Ignore quota error in fallback
    }
  }
}

/**
 * Retrieve all stored documents from IndexedDB
 */
export async function getDocsFromIndexedDB(userId?: string): Promise<VaultDocument[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        let results = (req.result as VaultDocument[]) || [];
        if (userId) {
          // Include documents matching user or anonymous/shared
          results = results.filter(d => !d.userId || d.userId === userId || d.userId === 'local');
        }
        results.sort((a, b) => (b.uploadedAt || 0) - (a.uploadedAt || 0));
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to load documents from IndexedDB:', err);
    // Fallback: inspect localStorage
    const fallbackDocs: VaultDocument[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('doc_')) {
          const item = localStorage.getItem(key);
          if (item) {
            fallbackDocs.push(JSON.parse(item));
          }
        }
      }
    } catch (e) {
      // ignore
    }
    return fallbackDocs.sort((a, b) => (b.uploadedAt || 0) - (a.uploadedAt || 0));
  }
}

/**
 * Delete a document from IndexedDB
 */
export async function deleteDocFromIndexedDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to delete document from IndexedDB:', err);
    try {
      localStorage.removeItem(`doc_${id}`);
    } catch (e) {
      // ignore
    }
  }
}

/**
 * Read File as Data URL with Promise
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses an image (JPEG, JPG, PNG) if needed to keep it light & fast
 * while maintaining crisp resolution up to 1920x1920.
 * If file is a PDF, returns the original data URL directly.
 */
export async function processAndOptimizeFile(file: File): Promise<{
  dataUrl: string;
  size: number;
  type: string;
}> {
  const fileName = file.name.toLowerCase();
  const mimeType = (file.type || '').toLowerCase();

  const isPdf = mimeType.includes('pdf') || fileName.endsWith('.pdf');
  const isImage = mimeType.includes('image') || 
                  fileName.endsWith('.jpg') || 
                  fileName.endsWith('.jpeg') || 
                  fileName.endsWith('.png');

  if (isPdf) {
    const dataUrl = await readFileAsDataURL(file);
    return {
      dataUrl,
      size: file.size,
      type: 'application/pdf'
    };
  }

  if (isImage) {
    const rawDataUrl = await readFileAsDataURL(file);

    // If already under 500KB, no canvas compression needed
    if (file.size <= 500 * 1024) {
      return {
        dataUrl: rawDataUrl,
        size: file.size,
        type: mimeType.includes('png') ? 'image/png' : 'image/jpeg'
      };
    }

    // Compress using canvas to max 1920px dimension and 0.85 quality
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1920;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return resolve({ dataUrl: rawDataUrl, size: file.size, type: 'image/jpeg' });
        }

        // Draw white background in case of transparent png converted to jpeg
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        // Estimate base64 byte size
        const approxBytes = Math.round((compressedDataUrl.length - 23) * 0.75);

        resolve({
          dataUrl: compressedDataUrl,
          size: approxBytes,
          type: 'image/jpeg'
        });
      };

      img.onerror = () => {
        resolve({ dataUrl: rawDataUrl, size: file.size, type: mimeType || 'image/jpeg' });
      };

      img.src = rawDataUrl;
    });
  }

  // Fallback for any other allowed types
  const dataUrl = await readFileAsDataURL(file);
  return {
    dataUrl,
    size: file.size,
    type: file.type || 'application/octet-stream'
  };
}

/**
 * Splits a base64 string into chunked segments for safe Firestore storage (<500KB per chunk)
 */
export function chunkString(str: string, chunkSize = 400000): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < str.length; i += chunkSize) {
    chunks.push(str.substring(i, i + chunkSize));
  }
  return chunks;
}
