import React, { useState } from 'react'
import '../styles/ShoppingList.css'

function ShoppingList({ items, pantryItems, staples, onCheck, onRemove, onMoveToPantry, onAddItem, onAddAllStaples }) {
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, notes: '' })
  const [showAddForm, setShowAddForm] = useState(false)
  
  const handleAddItem = () => {
    if (newItem.name.trim()) {
      // Check if item already exists in pantry
      const existsInPantry = pantryItems.some(item => 
        item.name.toLowerCase() === newItem.name.toLowerCase()
      )
      
      if (existsInPantry) {
        if (confirm(`'${newItem.name}' is already in your pantry. Add to shopping list anyway?`)) {
          onAddItem(newItem)
          setNewItem({ name: '', quantity: 1, notes: '' })
          setShowAddForm(false)
        }
      } else {
        onAddItem(newItem)
        setNewItem({ name: '', quantity: 1, notes: '' })
        setShowAddForm(false)
      }
    }
  }
  
  if (items.length === 0 && staples.length === 0 && !showAddForm) {
    return (
      <div className="shopping-list">
        <div className="empty-state">
          <p>Your shopping list is empty!</p>
          <p>Items will appear here when you use them up from your pantry 🛒</p>
          <button 
            onClick={() => setShowAddForm(true)}
            style={{
              marginTop: '1rem',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            Add Item Manually
          </button>
        </div>
        
        {showAddForm && (
          <div style={{
            backgroundColor: '#F3F4F6',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginTop: '1rem'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Item name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddItem()
                  }
                }}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.375rem',
                  flex: '1',
                  minWidth: '200px'
                }}
                autoFocus
              />
              <input
                type="number"
                placeholder="Qty"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.375rem',
                  width: '80px'
                }}
              />
              <input
                type="text"
                placeholder="Notes (optional)"
                value={newItem.notes}
                onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.375rem',
                  flex: '1',
                  minWidth: '150px'
                }}
              />
              <button
                onClick={handleAddItem}
                style={{
                  backgroundColor: '#10B981',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setNewItem({ name: '', quantity: 1, notes: '' })
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
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="shopping-list">
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            backgroundColor: '#3B82F6',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            cursor: 'pointer'
          }}
        >
          + Add Item
        </button>
        
        {staples.length > 0 && (
          <button 
            onClick={onAddAllStaples}
            style={{
              backgroundColor: '#10B981',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            ⭐ Add All My Staples ({staples.length})
          </button>
        )}
      </div>
      
      {showAddForm && (
        <div style={{
          backgroundColor: '#F3F4F6',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Item name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              style={{
                padding: '0.5rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.375rem',
                flex: '1',
                minWidth: '200px'
              }}
            />
            <input
              type="number"
              placeholder="Qty"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
              style={{
                padding: '0.5rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.375rem',
                width: '80px'
              }}
            />
            <input
              type="text"
              placeholder="Notes (optional)"
              value={newItem.notes}
              onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
              style={{
                padding: '0.5rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.375rem',
                flex: '1',
                minWidth: '150px'
              }}
            />
            <button
              onClick={handleAddItem}
              style={{
                backgroundColor: '#10B981',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddForm(false)
                setNewItem({ name: '', quantity: 1, notes: '' })
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
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {items.map(item => (
        <div key={item.id} className={`shopping-item ${item.checked ? 'checked' : ''}`}>
          <div className="item-content">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => onCheck(item.id)}
              className="item-checkbox"
            />
            <div className="item-details">
              <span className="item-name">
                {item.name}
                {item.quantity > 1 && (
                  <span className="item-quantity"> ({item.quantity})</span>
                )}
              </span>
              {item.notes && (
                <div className="item-notes">{item.notes}</div>
              )}
            </div>
          </div>
          
          <div className="item-actions">
            {item.checked && (
              <span className="checked-label">Added to cart!</span>
            )}
            <button 
              className="remove-button" 
              onClick={() => onRemove(item.id)}
              title="Remove from list"
            >
              ✖
            </button>
          </div>
        </div>
      ))}
      
      {staples.length > 0 && (
        <div className="shopping-tips">
          <p>⭐ You have {staples.length} staple items. Use the button above to add them all at once!</p>
        </div>
      )}
    </div>
  )
}

export default ShoppingList
