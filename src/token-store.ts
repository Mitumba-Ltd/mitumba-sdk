export interface TokenStore {
  getAccessToken(): Promise<string | null>
  getRefreshToken(): Promise<string | null>
  setTokens(access: string, refresh: string): Promise<void>
  clear(): Promise<void>
}

export class MemoryTokenStore implements TokenStore {
  private accessToken: string | null = null
  private refreshToken: string | null = null

  async getAccessToken(): Promise<string | null> { return this.accessToken }
  async getRefreshToken(): Promise<string | null> { return this.refreshToken }
  async setTokens(access: string, refresh: string): Promise<void> {
    this.accessToken = access
    this.refreshToken = refresh
  }
  async clear(): Promise<void> {
    this.accessToken = null
    this.refreshToken = null
  }
}

const DB_NAME = 'mitumba_sdk'
const STORE_NAME = 'tokens'
const KEY = 'auth'

export class IDBTokenStore implements TokenStore {
  private dbPromise: Promise<IDBDatabase> | null = null

  private openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise
    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1)
      request.onupgradeneeded = () => {
        request.result.createObjectStore(STORE_NAME)
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    return this.dbPromise
  }

  private async get(): Promise<{ access: string; refresh: string } | null> {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).get(KEY)
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => reject(req.error)
    })
  }

  async getAccessToken(): Promise<string | null> {
    const data = await this.get()
    return data?.access ?? null
  }

  async getRefreshToken(): Promise<string | null> {
    const data = await this.get()
    return data?.refresh ?? null
  }

  async setTokens(access: string, refresh: string): Promise<void> {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const req = tx.objectStore(STORE_NAME).put({ access, refresh }, KEY)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  }

  async clear(): Promise<void> {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const req = tx.objectStore(STORE_NAME).delete(KEY)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  }
}

/** Creates IDBTokenStore if indexedDB is available, otherwise MemoryTokenStore. */
export function createTokenStore(): TokenStore {
  if (typeof indexedDB !== 'undefined') {
    return new IDBTokenStore()
  }
  return new MemoryTokenStore()
}
