import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { AuthProvider, useAuth } from './contexts/SupabaseAuthContext'
import Auth from './components/Auth'
import './styles/App.css'

function AppContent() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    unit: 'unit',
    category: '',
    expiry_date: '',
    notes: ''
  })

  useEffect(() => {
    if (user) {
      fetchCategories()
      fetchItems()
    }
  }, [user])

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      
      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  async function fetchItems() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('pantry_items')
        .select('*')
        .order('name')
      
      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error fetching items:', error)
      alert('Error loading pantry items')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    try {
      const itemData = {
        ...formData,
        user_id: user.id,
        expiry_date: formData.expiry_date || null
      }

      if (editingItem) {
        const { error } = await supabase
          .from('pantry_items')
          .update(itemData)
          .eq('id', editingItem.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('pantry_items')
          .insert([itemData])
        
        if (error) throw error
      }

      setFormData({
        name: '',
        quantity: 1,
        unit: 'unit',
        category: '',
        expiry_date: '',
        notes: ''
      })
      setShowAddForm(false)
      setEditingItem(null)
      fetchItems()
    } catch (error) {
      console.error('Error saving item:', error)
      alert('Error saving item')
    }
  }

  async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    try {
      const { error } = await supabase
        .from('pantry_items')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      fetchItems()
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Error deleting item')
    }
  }

  function startEdit(item) {
    setEditingItem(item)
    setFormData({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category || '',
      expiry_date: item.expiry_date || '',
      notes: item.notes || ''
    })
    setShowAddForm(true)
  }

  const getCategoryColor = (categoryName) => {
    const category = categories.find(c => c.name === categoryName)
    return category?.color || '#6B7280'
  }

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false
    const days = Math.floor((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
    return days <= 7 && days >= 0
  }

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  // Show auth screen if not logged in
  if (!user && !authLoading) {
    return <Auth />
  }

  // Show loading while checking auth
  if (authLoading || loading) {
    return (
      <div className="app">
        <div className="loading-container" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh' 
        }}>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '1rem 2rem',
          backgroundColor: '#1f2937',
          color: 'white'
        }}>
          <h1 style={{ margin: 0 }}>PantryPal</h1>
          <div className="user-info" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span className="user-email">{user.email}</span>
            <button 
              onClick={signOut} 
              className="sign-out-btn"
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="app-main" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm)
              setEditingItem(null)
              setFormData({
                name: '',
                quantity: 1,
                unit: 'unit',
                category: '',
                expiry_date: '',
                notes: ''
              })
            }}
            style={{
              backgroundColor: '#10B981',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
              border: 'none',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            {showAddForm ? 'Cancel' : '+ Add Item'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmit} style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            marginBottom: '2rem'
          }}>
            <h3>{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Item name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem'
                }}
              />
              
              <input
                type="number"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                min="1"
                style={{
                  width: '100px',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem'
                }}
              />
              
              <input
                type="text"
                placeholder="Unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                style={{
                  width: '100px',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem'
                }}
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              
              <input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem'
                }}
              />
            </div>
            
            <textarea
              placeholder="Notes (optional)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              style={{
                width: '100%',
                minHeight: '60px',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                marginBottom: '1rem'
              }}
            />
            
            <button type="submit" style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: 'none',
              fontSize: '1rem',
              cursor: 'pointer'
            }}>
              {editingItem ? 'Update Item' : 'Add Item'}
            </button>
          </form>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem'
        }}>
          {items.length === 0 ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#6b7280' }}>
              Your pantry is empty. Add some items to get started!
            </p>
          ) : (
            items.map(item => (
              <div key={item.id} style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.5rem'
                }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
                    {item.name}
                  </h3>
                  {item.category && (
                    <span style={{
                      backgroundColor: getCategoryColor(item.category),
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem'
                    }}>
                      {item.category}
                    </span>
                  )}
                </div>
                
                <div style={{ color: '#4b5563', marginBottom: '1rem' }}>
                  <p>Quantity: {item.quantity} {item.unit}</p>
                  {item.expiry_date && (
                    <p style={{
                      color: isExpired(item.expiry_date) ? '#EF4444' : 
                             isExpiringSoon(item.expiry_date) ? '#F59E0B' : 'inherit'
                    }}>
                      Expires: {new Date(item.expiry_date).toLocaleDateString()}
                      {isExpired(item.expiry_date) && ' (EXPIRED)'}
                      {isExpiringSoon(item.expiry_date) && ' (Soon)'}
                    </p>
                  )}
                  {item.notes && <p style={{ fontStyle: 'italic' }}>{item.notes}</p>}
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => startEdit(item)} 
                    style={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.25rem',
                      border: 'none',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => deleteItem(item.id)} 
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.25rem',
                      border: 'none',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
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
