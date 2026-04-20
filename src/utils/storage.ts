import type { SwapResult } from '../types'

const STORAGE_KEY = 'mealswap_app_state'

interface PersistedState {
  history: SwapResult[]
  selectedGoals: string[]
  activeTab: string
  screen: string
  lastVisit: string
}

/**
 * Saves the application state to LocalStorage
 */
export const saveState = (state: Partial<PersistedState>) => {
  try {
    const existing = loadState() || {}
    const updated = {
      ...existing,
      ...state,
      lastVisit: new Date().toISOString()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (err) {
    console.error('Failed to save state to LocalStorage:', err)
  }
}

/**
 * Loads the application state from LocalStorage
 */
export const loadState = (): PersistedState | null => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY)
    if (serializedState === null) {
      return null
    }
    return JSON.parse(serializedState) as PersistedState
  } catch (err) {
    console.error('Failed to load state from LocalStorage:', err)
    return null
  }
}

/**
 * Clears the application state from LocalStorage
 */
export const clearState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.error('Failed to clear LocalStorage state:', err)
  }
}
