import React, { useState, useEffect, useRef } from 'react'
import PantryList from './components/PantryList'
import AddItem from './components/AddItem'
import RecipeFinder from './components/RecipeFinder'
import ShoppingList from './components/ShoppingList'
import Auth from './components/Auth'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { loadFromStorage, saveToStorage } from './utils/storage'
import { getCommonItems } from './utils/commonItems'
import './styles/App.css'

function AppContent() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [items, setItems] = useState([])
  const [shoppingList, setShoppingList] = useState([])
  const [view, setView] = useState('pantry') // 'pantry', 'shopping', or 'recipes'
  const [filter, setFilter] = useState('all') // 'all', 'fridge', 'pantry', 'freezer', custom lists
  const [undoItem, setUndoItem] = useState(null)
  const [customLists, setCustomLists] = useState([]) // For custom lists feature
  const [showSettings, setShowSettings] = useState(false)
  const [showAddToShoppingPrompt, setShowAddToShoppingPrompt] = useState(null)
  const [staples, setStaples] = useState([]) // For staples/regulars feature
  const [itemFrequency, setItemFrequency] = useState({}) // Track how often items are added
  const [userIngredients, setUserIngredients] = useState([]) // User's custom ingredients
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef(null)

  // Load data on mount or when user changes
  useEffect(() => {
    const loadData = async () => {
      const savedData = await loadFromStorage(user)
      setItems(savedData.items || [])
      setShoppingList(savedData.shoppingList || [])
      setCustomLists(savedData.customLists || [])
      setStaples(savedData.staples || [])
      setItemFrequency(savedData.itemFrequency || {})
      setUserIngredients(savedData.userIngredients || [])
    }
    
    if (!authLoading) {
      loadData()
    }
  }, [user, authLoading])

  // Save data whenever state changes
  useEffect(() => {
    if (!authLoading) {
      saveToStorage({ 
        items, 
        shoppingList, 
        customLists, 
        staples,
        itemFrequency,
        userIngredients,
        firstTime: false 
      }, user)
    }
  }, [items, shoppingList, customLists, staples, itemFrequency, userIngredients, user, authLoading])

  // Auto-clear undo after 5 seconds
  useEffect(() => {
    if (undoItem) {
      const timer = setTimeout(() => setUndoItem(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [undoItem])

  // Handle clicks outside user menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])


  const handleAddItem = (itemName, category, expirationDate, quantity = 1, notes = '') => {
    const newItem = {
      id: Date.now(),
      name: itemName,
      // Use current filter as category if it's not 'all'
      category: filter !== 'all' ? filter : category || guessCategory(itemName),
      dateAdded: new Date().toISOString(),
      expirationDate: expirationDate,
      quantity: quantity,
      notes: notes
    }
    setItems([newItem, ...items])
    
    // Track frequency of items
    const newFrequency = { ...itemFrequency }
    newFrequency[itemName] = (newFrequency[itemName] || 0) + 1
    setItemFrequency(newFrequency)
    
    // Silently track staples without notification
    if (newFrequency[itemName] === 3 && !staples.some(s => s.name === itemName)) {
      // Automatically add as staple without asking
      setStaples([...staples, { 
        name: itemName, 
        category: newItem.category,
        quantity: quantity
      }])
    }
    
    // Save new ingredient to user's custom list if not in common items
    const commonItems = getCommonItems()
    if (!commonItems.includes(itemName) && !userIngredients.includes(itemName)) {
      setUserIngredients([...userIngredients, itemName])
    }
  }

  const handleRemoveItem = (id, shouldPromptForShopping = true) => {
    const itemToRemove = items.find(item => item.id === id)
    setItems(items.filter(item => item.id !== id))
    
    if (shouldPromptForShopping && itemToRemove) {
      setShowAddToShoppingPrompt(itemToRemove)
    } else {
      setUndoItem(itemToRemove)
    }
  }

  const handleAddToShoppingList = (item) => {
    const shoppingItem = {
      id: Date.now(),
      name: item.name,
      quantity: item.quantity || 1,
      notes: item.notes || '',
      originalCategory: item.category,
      checked: false
    }
    setShoppingList([...shoppingList, shoppingItem])
    setShowAddToShoppingPrompt(null)
  }

  const handleCheckShoppingItem = (id) => {
    const item = shoppingList.find(item => item.id === id)
    if (item && !item.checked) {
      // Mark as checked
      setShoppingList(shoppingList.map(i => 
        i.id === id ? { ...i, checked: true } : i
      ))
      // Auto-move to pantry after checking without notification
      setTimeout(() => {
        handleMoveToPantry(id)
      }, 500)
    }
  }

  const handleMoveToPantry = (id) => {
    const item = shoppingList.find(item => item.id === id)
    if (item) {
      // Add back to pantry silently without any notifications
      const newItem = {
        id: Date.now(),
        name: item.name,
        category: item.originalCategory || 'pantry',
        dateAdded: new Date().toISOString(),
        expirationDate: null,
        quantity: item.quantity || 1,
        notes: item.notes || ''
      }
      setItems([newItem, ...items])
      // Remove from shopping list
      setShoppingList(shoppingList.filter(i => i.id !== id))
    }
  }

  const handleRemoveFromShoppingList = (id) => {
    setShoppingList(shoppingList.filter(item => item.id !== id))
  }

  const handleUndo = () => {
    if (undoItem) {
      setItems([undoItem, ...items])
      setUndoItem(null)
    }
  }

  const guessCategory = (itemName) => {
    const lower = itemName.toLowerCase()
    if (['milk', 'cheese', 'yogurt', 'butter', 'eggs'].some(dairy => lower.includes(dairy))) {
      return 'fridge'
    }
    if (['frozen', 'ice cream'].some(frozen => lower.includes(frozen))) {
      return 'freezer'
    }
    return 'pantry'
  }

  const handleUpdateQuantity = (id, change) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, (item.quantity || 1) + change)
        return { ...item, quantity: newQuantity }
      }
      return item
    }).filter(item => item.quantity > 0)) // Remove items with 0 quantity
  }

  const handleUseOne = (id) => {
    handleUpdateQuantity(id, -1)
  }

  const handleUpdateItem = (id, updates) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ))
  }

  const handleAddCustomList = (listName) => {
    const newList = {
      id: Date.now().toString(),
      name: listName,
      createdAt: new Date().toISOString()
    }
    setCustomLists([...customLists, newList])
    setShowSettings(false)
  }

  const handleRemoveCustomList = (listId) => {
    setCustomLists(customLists.filter(list => list.id !== listId))
    // Also update items in that category to 'pantry'
    setItems(items.map(item => 
      item.category === listId ? { ...item, category: 'pantry' } : item
    ))
    if (filter === listId) {
      setFilter('all')
    }
  }

  const getAllCategories = () => {
    const defaultCategories = [
      { id: 'fridge', name: 'Fridge' },
      { id: 'pantry', name: 'Pantry' },
      { id: 'freezer', name: 'Freezer' }
    ]
    return [...defaultCategories, ...customLists]
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setItems([])
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const filteredItems = filter === 'all' 
    ? items 
    : items.filter(item => item.category === filter)

  // Show auth screen if not logged in
  if (!user && !authLoading) {
    return <Auth />
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="app">
        <div className="loading-container">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      
      <header className="app-header" style={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
        <div className="header-top" style={{ 
          backgroundColor: 'transparent', 
          padding: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative'
        }}>
          <div style={{ width: '200px' }}></div>
          <h1 style={{ 
            color: '#3B82F6',
            fontSize: '2rem',
            fontWeight: 'bold',
            margin: 0,
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)'
          }}>PantryPal</h1>
          <div className="user-menu-container" ref={userMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="user-avatar-btn"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </button>
            
            {showUserMenu && (
              <div
                className="user-dropdown"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  minWidth: '200px',
                  zIndex: 1000
                }}
              >
                <div style={{
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Signed in as</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', marginTop: '0.25rem' }}>
                    {user.email}
                  </div>
                </div>
                <div style={{ padding: '0.5rem' }}>
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      handleSignOut()
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      color: '#374151',
                      transition: 'background-color 0.2s',
                      ':hover': {
                        backgroundColor: '#f3f4f6'
                      }
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <nav className="view-toggle">
          <button 
            className={view === 'pantry' ? 'active' : ''} 
            onClick={() => setView('pantry')}
          >
            My Pantry
          </button>
          <button 
            className={view === 'shopping' ? 'active' : ''} 
            onClick={() => setView('shopping')}
          >
            🛒 Shopping List {shoppingList.length > 0 && `(${shoppingList.length})`}
          </button>
          <button 
            className={view === 'recipes' ? 'active' : ''} 
            onClick={() => setView('recipes')}
          >
            🍳 What can I make?
          </button>
        </nav>
      </header>

      <main className="app-main">
        {view === 'pantry' ? (
          <>
            <AddItem 
              onAdd={handleAddItem} 
              items={items} 
              categories={getAllCategories()}
              userIngredients={userIngredients}
            />
            
            <div className="filter-buttons">
              <button 
                className={filter === 'all' ? 'active' : ''} 
                onClick={() => setFilter('all')}
              >
                All ({items.length})
              </button>
              <button 
                className={filter === 'fridge' ? 'active' : ''} 
                onClick={() => setFilter('fridge')}
              >
                Fridge ({items.filter(i => i.category === 'fridge').length})
              </button>
              <button 
                className={filter === 'pantry' ? 'active' : ''} 
                onClick={() => setFilter('pantry')}
              >
                Pantry ({items.filter(i => i.category === 'pantry').length})
              </button>
              <button 
                className={filter === 'freezer' ? 'active' : ''} 
                onClick={() => setFilter('freezer')}
              >
                Freezer ({items.filter(i => i.category === 'freezer').length})
              </button>
              {customLists.map(list => (
                <button
                  key={list.id}
                  className={filter === list.id ? 'active' : ''}
                  onClick={() => setFilter(list.id)}
                >
                  {list.name} ({items.filter(i => i.category === list.id).length})
                </button>
              ))}
              <button
                onClick={() => setShowSettings(!showSettings)}
                style={{
                  backgroundColor: 'transparent',
                  border: '2px dashed #9CA3AF',
                  color: '#6B7280'
                }}
                title="Manage custom lists"
              >
                + Add List
              </button>
            </div>
            
            {showSettings && (
              <div style={{
                backgroundColor: 'white',
                padding: '1rem',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                marginBottom: '1rem'
              }}>
                <h3 style={{ marginBottom: '1rem' }}>Custom Lists</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <input
                    type="text"
                    placeholder="Enter list name (e.g., Spice Rack)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        handleAddCustomList(e.target.value.trim())
                        e.target.value = ''
                      }
                    }}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      marginRight: '0.5rem',
                      width: '250px'
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.target.previousElementSibling
                      if (input.value.trim()) {
                        handleAddCustomList(input.value.trim())
                        input.value = ''
                      }
                    }}
                    style={{
                      backgroundColor: '#3B82F6',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      cursor: 'pointer'
                    }}
                  >
                    Add
                  </button>
                </div>
                {customLists.length > 0 && (
                  <div>
                    <h4 style={{ marginBottom: '0.5rem', color: '#6B7280' }}>Your Custom Lists:</h4>
                    {customLists.map(list => (
                      <div key={list.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.5rem',
                        backgroundColor: '#F3F4F6',
                        borderRadius: '0.25rem',
                        marginBottom: '0.25rem'
                      }}>
                        <span>{list.name}</span>
                        <button
                          onClick={() => handleRemoveCustomList(list.id)}
                          style={{
                            backgroundColor: '#EF4444',
                            color: 'white',
                            border: 'none',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <PantryList 
              items={filteredItems} 
              onRemove={handleRemoveItem}
              onUpdateQuantity={handleUpdateQuantity}
              onUseOne={handleUseOne}
              onUpdateItem={handleUpdateItem}
            />

            {undoItem && (
              <div className="undo-bar">
                <span>Removed {undoItem.name}</span>
                <button onClick={handleUndo}>Undo</button>
              </div>
            )}
            
            {showAddToShoppingPrompt && (
              <div className="shopping-prompt" style={{
                position: 'fixed',
                bottom: '2rem',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'white',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <span>Add '{showAddToShoppingPrompt.name}' to your Shopping List?</span>
                <button 
                  onClick={() => {
                    handleAddToShoppingList(showAddToShoppingPrompt)
                    setUndoItem(null) // Clear undo when adding to shopping list
                  }}
                  style={{
                    backgroundColor: '#10B981',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    cursor: 'pointer'
                  }}
                >
                  Yes
                </button>
                <button 
                  onClick={() => {
                    setShowAddToShoppingPrompt(null)
                    setUndoItem(showAddToShoppingPrompt) // Show undo when not adding to shopping list
                  }}
                  style={{
                    backgroundColor: '#6B7280',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    cursor: 'pointer'
                  }}
                >
                  No
                </button>
              </div>
            )}
          </>
        ) : view === 'shopping' ? (
          <ShoppingList 
            items={shoppingList}
            pantryItems={items}
            staples={staples}
            onCheck={handleCheckShoppingItem}
            onRemove={handleRemoveFromShoppingList}
            onMoveToPantry={handleMoveToPantry}
            onAddItem={(item) => {
              const shoppingItem = {
                id: Date.now(),
                name: item.name,
                quantity: item.quantity || 1,
                notes: item.notes || '',
                originalCategory: item.category || 'pantry',
                checked: false
              }
              setShoppingList([...shoppingList, shoppingItem])
            }}
            onAddAllStaples={() => {
              const newShoppingItems = staples
                .filter(staple => !shoppingList.some(item => item.name === staple.name))
                .map(staple => ({
                  id: Date.now() + Math.random(),
                  name: staple.name,
                  quantity: staple.quantity || 1,
                  notes: '',
                  originalCategory: staple.category,
                  checked: false
                }))
              setShoppingList([...shoppingList, ...newShoppingItems])
            }}
          />
        ) : (
          <RecipeFinder items={items} />
        )}
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
