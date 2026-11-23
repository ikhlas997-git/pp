/* IndexedDB storage layer. Every record has an `id`; files are stored as Blobs. */
const DB = (() => {
  const NAME = 'teacher-app';
  const VERSION = 1;
  const STORES = ['documents', 'students', 'classes', 'lessons', 'exams', 'exercises', 'drawings', 'grades'];
  const listeners = new Set();
  let dbPromise = null;

  function open() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(NAME, VERSION);
        req.onupgradeneeded = () => {
          const db = req.result;
          STORES.forEach(s => { if (!db.objectStoreNames.contains(s)) db.createObjectStore(s, { keyPath: 'id' }); });
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    return dbPromise;
  }

  async function run(store, mode, fn) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, mode);
      const os = tx.objectStore(store);
      let result;
      const req = fn(os);
      if (req) req.onsuccess = () => { result = req.result; };
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const emit = store => listeners.forEach(fn => { try { fn(store); } catch (e) { console.error(e); } });

  function stamp(obj) {
    const now = Date.now();
    if (!obj.id) obj.id = uid();
    if (!obj.createdAt) obj.createdAt = now;
    obj.updatedAt = now;
    return obj;
  }

  return {
    STORES,
    uid,
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    all: store => run(store, 'readonly', os => os.getAll()).then(r => r || []),
    get: (store, id) => run(store, 'readonly', os => os.get(id)),
    async put(store, obj) {
      stamp(obj);
      await run(store, 'readwrite', os => os.put(obj));
      emit(store);
      return obj;
    },
    async bulkPut(store, arr) {
      arr.forEach(stamp);
      await run(store, 'readwrite', os => { arr.forEach(o => os.put(o)); });
      emit(store);
      return arr;
    },
    async delete(store, id) {
      await run(store, 'readwrite', os => os.delete(id));
      emit(store);
    },
    async bulkDelete(store, ids) {
      await run(store, 'readwrite', os => { ids.forEach(id => os.delete(id)); });
      emit(store);
    },
    async clear(store) {
      await run(store, 'readwrite', os => os.clear());
      emit(store);
    },
    async count(store) { return run(store, 'readonly', os => os.count()); }
  };
})();
