/** Keep original files out of the small localStorage shopping-bag record. */
export function savePrintOriginals(photos) {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('Photo storage is unavailable in this browser. Please try another browser.'));
      return;
    }
    const request = indexedDB.open('alnoor-print-photos', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('originals', { keyPath: 'id' });
    request.onerror = () => reject(new Error('Your photos could not be saved on this device. Check the available browser storage and try again.'));
    request.onblocked = () => reject(new Error('Please close other studio tabs and try adding your prints again.'));
    request.onsuccess = () => {
      const db = request.result;
      try {
        const transaction = db.transaction('originals', 'readwrite');
        const store = transaction.objectStore('originals');
        for (const photo of photos) store.put({ id: photo.id, file: photo.file, name: photo.name, width: photo.width, height: photo.height });
        transaction.oncomplete = () => { db.close(); resolve(); };
        transaction.onabort = () => { db.close(); reject(new Error('Not enough browser storage to save these photos. Free some space or choose smaller files.')); };
        transaction.onerror = () => { /* The abort event reports a single, useful error. */ };
      } catch {
        db.close();
        reject(new Error('These photos could not be saved. Please try again.'));
      }
    };
  });
}

export function readPrintOriginals(ids) {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { resolve([]); return; }
    const request = indexedDB.open('alnoor-print-photos', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('originals', { keyPath: 'id' });
    request.onerror = () => reject(new Error('Device photo storage is unavailable. Choose the original files again.'));
    request.onsuccess = () => {
      const db = request.result, found = [];
      const transaction = db.transaction('originals', 'readonly');
      for (const id of ids) { const item = transaction.objectStore('originals').get(id); item.onsuccess = () => { if (item.result?.file) found.push(item.result); }; }
      transaction.oncomplete = () => { db.close(); resolve(found); };
      transaction.onerror = () => { db.close(); reject(new Error('Original photos could not be opened. Choose the files again.')); };
    };
  });
}
