import React, { useState } from 'react'
import '../styles/RecipeFinder.css'

function RecipeFinder({ items }) {
  const [selectedItems, setSelectedItems] = useState([])

  const toggleItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const findRecipes = () => {
    const selectedItemNames = items
      .filter(item => selectedItems.includes(item.id))
      .map(item => item.name)
      .join(' ')
    
    const searchQuery = `${selectedItemNames} recipes`
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`
    window.open(searchUrl, '_blank')
  }

  return (
    <div className="recipe-finder">
      <div className="recipe-instructions">
        <p>Select ingredients you want to use:</p>
      </div>
      
      <div className="ingredient-list">
        {items.map(item => (
          <label key={item.id} className="ingredient-item">
            <input
              type="checkbox"
              checked={selectedItems.includes(item.id)}
              onChange={() => toggleItem(item.id)}
            />
            <span>{item.name}</span>
          </label>
        ))}
      </div>

      {items.length === 0 && (
        <div className="empty-state">
          <p>Add some items to your pantry first!</p>
        </div>
      )}

      {selectedItems.length > 0 && (
        <button className="find-recipes-button" onClick={findRecipes}>
          Find Recipes ({selectedItems.length} ingredients)
        </button>
      )}
    </div>
  )
}

export default RecipeFinder
