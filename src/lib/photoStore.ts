import type { ArchivePhoto } from '../data/site'

const DB_NAME = 'wang-archive'
const STORE = 'photos'
const DB_VERSION = 1

type StoredPhoto = {
  id: string
  code: string
  photo: ArchivePhoto
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB unavailable'))
      return
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function loadStoredPhotos(): Promise<Record<string, ArchivePhoto[]>> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readonly')
    const request = transaction.objectStore(STORE).getAll()
    request.onsuccess = () => {
      const grouped: Record<string, ArchivePhoto[]> = {}
      for (const row of request.result as StoredPhoto[]) {
        if (!row?.code || !row?.photo) continue
        const photo = { ...row.photo, id: row.id }
        grouped[row.code] = [...(grouped[row.code] ?? []), photo]
      }
      db.close()
      resolve(grouped)
    }
    request.onerror = () => {
      db.close()
      reject(request.error)
    }
  })
}

export async function saveStoredPhoto(code: string, photo: ArchivePhoto): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite')
    const id = photo.id ?? `${code}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    transaction.objectStore(STORE).put({ id, code, photo: { ...photo, id } } satisfies StoredPhoto)
    transaction.oncomplete = () => {
      db.close()
      resolve()
    }
    transaction.onerror = () => {
      db.close()
      reject(transaction.error)
    }
  })
}

export async function deleteStoredPhoto(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite')
    transaction.objectStore(STORE).delete(id)
    transaction.oncomplete = () => {
      db.close()
      resolve()
    }
    transaction.onerror = () => {
      db.close()
      reject(transaction.error)
    }
  })
}
