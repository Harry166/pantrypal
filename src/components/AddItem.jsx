import React, { useState, useRef, useEffect } from 'react'
import { getCommonItems } from '../utils/commonItems'
import '../styles/AddItem.css'

function AddItem({ onAdd, items, userIngredients = [] }) {
  const [input, setInput] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [expirationDate, setExpirationDate] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef(null)
  const commonItems = getCommonItems()

  useEffect(() => {
    if (input.length > 0) {
      // Get suggestions from common items, user's custom ingredients, and user's history
      const userItems = [...new Set(items.map(item => item.name))]
      const allItems = [...commonItems, ...userIngredients, ...userItems]
      
      const filtered = allItems
        .filter(item => item.toLowerCase().includes(input.toLowerCase()))
        .filter((item, index, self) => self.indexOf(item) === index) // Remove duplicates
        .slice(0, 5)
      
      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [input, items, userIngredients])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim()) {
      const expDate = expirationDate ? new Date(expirationDate).toISOString() : null
      onAdd(input.trim(), null, expDate, quantity, notes)
      setInput('')
      setQuantity(1)
      setNotes('')
      setExpirationDate('')
      setShowSuggestions(false)
      inputRef.current.focus()
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion)
    setShowSuggestions(false)
  }

  const handleKeyDown = (e) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault()
        handleSuggestionClick(suggestions[selectedIndex])
      }
    }
  }

  // Format date for display in date input
  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  return (
    <div className="add-item-container">
      <form onSubmit={handleSubmit} className="add-item-form">
        <div className="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add an item..."
            className="add-input"
            autoFocus
          />
          {input && (
            <button
              type="submit"
              className="add-button"
              title="Add item"
            >
              +
            </button>
          )}
        </div>
        
        {showSuggestions && (
          <ul className="suggestions">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className={index === selectedIndex ? 'selected' : ''}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}

        {input && (
          <div className="advanced-options" style={{ marginTop: '0.5rem' }}>
            <div className="quantity-input">
              <label>Quantity:</label>
              <button 
                type="button" 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="quantity-btn"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                className="quantity-field"
              />
              <button 
                type="button" 
                onClick={() => setQuantity(quantity + 1)}
                className="quantity-btn"
              >
                +
              </button>
            </div>
            <div className="notes-input">
              <label>Notes:</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Use by Friday, For pot pie"
                className="notes-field"
              />
            </div>
            <div className="expiration-input" style={{ marginTop: '0.5rem' }}>
              <label>Expires on:</label>
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                min={getMinDate()}
                className="expiration-field"
                style={{
                  padding: '0.25rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

export default AddItem
