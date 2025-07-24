import { supabase } from '../config/supabase'

const STORAGE_KEY = 'pantrypal_data'

// Load from local storage (for offline/non-authenticated use)
export const loadFromLocalStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
    return { firstTime: true, items: [] }
  } catch (error) {
    console.error('Error loading data:', error)
    return { firstTime: true, items: [] }
  }
}

// Save to local storage
export const saveToLocalStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving data:', error)
  }
}

// Load from cloud storage (Supabase)
export const loadFromCloud = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('pantry_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    return {
      firstTime: !data || data.length === 0,
      items: data || []
    }
  } catch (error) {
    console.error('Error loading from cloud:', error)
    return { firstTime: true, items: [] }
  }
}

// Save to cloud storage
export const saveToCloud = async (userId, items) => {
  try {
    // Delete existing items for the user
    const { error: deleteError } = await supabase
      .from('pantry_items')
      .delete()
      .eq('user_id', userId)

    if (deleteError) throw deleteError

    // Insert new items
    if (items.length > 0) {
      const itemsWithUserId = items.map(item => ({
        ...item,
        user_id: userId
      }))

      const { error: insertError } = await supabase
        .from('pantry_items')
        .insert(itemsWithUserId)

      if (insertError) throw insertError
    }

    return { success: true }
  } catch (error) {
    console.error('Error saving to cloud:', error)
    return { success: false, error }
  }
}

// Main functions that choose between local and cloud storage
export const loadFromStorage = async (user) => {
  if (user) {
    return await loadFromCloud(user.id)
  }
  return loadFromLocalStorage()
}

export const saveToStorage = async (data, user) => {
  if (user) {
    await saveToCloud(user.id, data.items)
  } else {
    saveToLocalStorage(data)
  }
}
