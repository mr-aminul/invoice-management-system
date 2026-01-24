import { useState, useEffect, useCallback, useRef } from 'react'
import { useBusiness } from '../contexts/BusinessContext'

/**
 * Hook for managing business-scoped data in localStorage
 * All data operations are automatically scoped to the current business
 */
export function useBusinessData<T extends { id: string }>(
  storageKey: string,
  initialData: T[] = []
) {
  const { currentBusiness } = useBusiness()
  const [data, setData] = useState<T[]>([])
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const skipNextSaveRef = useRef(false)

  // Get storage key for current business
  const getStorageKey = useCallback(() => {
    if (!currentBusiness) return null
    return `${storageKey}_business_${currentBusiness.id}`
  }, [storageKey, currentBusiness?.id])

  // Load data for current business
  useEffect(() => {
    const key = getStorageKey()
    if (!key) {
      console.log(`No storage key for ${storageKey} - currentBusiness is null`)
      setData([])
      setIsInitialLoad(false)
      return
    }

    try {
      const saved = localStorage.getItem(key)
      console.log(`Loading ${storageKey} from localStorage with key: ${key}`, saved ? 'Found data' : 'No data found')
      if (saved) {
        const parsed = JSON.parse(saved)
        console.log(`Parsed ${storageKey} data:`, parsed, `(${parsed.length} items)`)
        setData(parsed)
        setIsInitialLoad(false)
      } else {
        setData([])
        setIsInitialLoad(false)
      }
    } catch (error) {
      console.error(`Error loading ${storageKey}:`, error)
      setData([])
      setIsInitialLoad(false)
    }
  }, [getStorageKey, storageKey])

  // Save data whenever it changes (but skip initial load and manual saves)
  useEffect(() => {
    const key = getStorageKey()
    if (!key) return

    // Skip saving on initial load to avoid overwriting with empty array
    if (isInitialLoad) {
      return
    }

    // Skip if we just manually saved (addItem/updateItem/deleteItem already saved it)
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false
      return
    }

    // Only auto-save if data actually changed and is not empty (to avoid overwriting)
    if (data.length > 0) {
      try {
        localStorage.setItem(key, JSON.stringify(data))
        console.log(`Auto-saved ${storageKey} to localStorage with key: ${key}`, data.length, 'items')
      } catch (error) {
        console.error(`Error saving ${storageKey}:`, error)
      }
    }
  }, [data, getStorageKey, storageKey, isInitialLoad])

  const addItem = useCallback((item: Omit<T, 'id' | 'businessId'>) => {
    if (!currentBusiness) {
      console.warn('No business selected')
      return
    }

    const key = getStorageKey()
    if (!key) {
      console.warn('No storage key available')
      return
    }

    const newItem = {
      ...item,
      id: Date.now().toString(),
      businessId: currentBusiness.id,
    } as T

    setData(prev => {
      const updated = [...prev, newItem]
      // Save immediately to localStorage synchronously
      try {
        localStorage.setItem(key, JSON.stringify(updated))
        console.log(`Saved ${storageKey} to localStorage with key: ${key}`, updated.length, 'items:', updated)
        // Verify it was saved correctly
        const verify = localStorage.getItem(key)
        if (verify) {
          const parsed = JSON.parse(verify)
          console.log(`Verified save: ${parsed.length} items in storage`)
          if (parsed.length !== updated.length) {
            console.error(`MISMATCH: Saved ${updated.length} but storage has ${parsed.length}`)
          }
        }
        // Skip the next auto-save since we just saved manually
        skipNextSaveRef.current = true
      } catch (error) {
        console.error(`Error saving ${storageKey}:`, error)
      }
      return updated
    })
    setIsInitialLoad(false)
    return newItem
  }, [currentBusiness, getStorageKey, storageKey])

  const updateItem = useCallback((id: string, updates: Partial<T>) => {
    if (!currentBusiness) {
      console.warn('No business selected')
      return
    }

    const key = getStorageKey()
    if (!key) {
      console.warn('No storage key available')
      return
    }

    setData(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
      // Save immediately
      try {
        localStorage.setItem(key, JSON.stringify(updated))
        skipNextSaveRef.current = true
      } catch (error) {
        console.error(`Error saving ${storageKey}:`, error)
      }
      return updated
    })
  }, [currentBusiness, getStorageKey, storageKey])

  const deleteItem = useCallback((id: string) => {
    if (!currentBusiness) {
      console.warn('No business selected')
      return
    }

    const key = getStorageKey()
    if (!key) {
      console.warn('No storage key available')
      return
    }

    setData(prev => {
      const updated = prev.filter(item => item.id !== id)
      // Save immediately
      try {
        localStorage.setItem(key, JSON.stringify(updated))
        skipNextSaveRef.current = true
      } catch (error) {
        console.error(`Error saving ${storageKey}:`, error)
      }
      return updated
    })
  }, [currentBusiness, getStorageKey, storageKey])

  const deleteItems = useCallback((ids: string[]) => {
    if (!currentBusiness) {
      console.warn('No business selected')
      return
    }

    const key = getStorageKey()
    if (!key) {
      console.warn('No storage key available')
      return
    }

    setData(prev => {
      const updated = prev.filter(item => !ids.includes(item.id))
      // Save immediately
      try {
        localStorage.setItem(key, JSON.stringify(updated))
        skipNextSaveRef.current = true
      } catch (error) {
        console.error(`Error saving ${storageKey}:`, error)
      }
      return updated
    })
  }, [currentBusiness, getStorageKey, storageKey])

  const setItems = useCallback((items: Omit<T, 'businessId'>[]) => {
    if (!currentBusiness) {
      console.warn('No business selected')
      return
    }

    // Ensure all items have businessId
    const scopedItems = items.map(item => ({
      ...item,
      businessId: currentBusiness.id,
    })) as T[]

    setData(scopedItems)
  }, [currentBusiness])

  return {
    data: data || [],
    setData: setItems,
    addItem,
    updateItem,
    deleteItem,
    deleteItems,
    isLoading: !currentBusiness,
  }
}
