import React, { useState } from 'react'
import '../styles/PantryItem.css'

function PantryItem({ item, onRemove, onUpdateQuantity, onUseOne, onUpdateItem }) {
  const [showMenu, setShowMenu] = useState(false)
  
  const handleRemove = () => {
    onRemove(item.id)
  }

  const handleUseOne = () => {
    onUseOne(item.id)
    setShowMenu(false)
  }

  const handleUseAll = () => {
    onRemove(item.id)
    setShowMenu(false)
  }

  return (
    <div className="pantry-item">
      <div className="item-content">
        <div className="item-main">
          <span className="item-name" onClick={() => setShowMenu(!showMenu)}>
            {item.name}
            {item.quantity > 1 && (
              <span className="item-quantity"> ({item.quantity})</span>
            )}
          </span>
          {item.expirationDate && (
            <span className="expiration-date">
              exp: {new Date(item.expirationDate).toLocaleDateString()}
            </span>
          )}
        </div>
        
        {item.notes && (
          <div className="item-notes">
            {item.notes}
          </div>
        )}
        
        {showMenu && item.quantity > 1 && (
          <div className="item-menu">
            <button onClick={handleUseOne}>Use One</button>
            <button onClick={handleUseAll}>Use All</button>
          </div>
        )}
      </div>
      
      <div className="item-controls">
        {item.quantity > 1 && (
          <div className="quantity-controls">
            <button 
              className="quantity-btn"
              onClick={() => onUpdateQuantity(item.id, -1)}
            >
              -
            </button>
            <span className="quantity-display">{item.quantity || 1}</span>
            <button 
              className="quantity-btn"
              onClick={() => onUpdateQuantity(item.id, 1)}
            >
              +
            </button>
          </div>
        )}
        <button className="remove-button" onClick={handleRemove}>
          ✖
        </button>
      </div>
    </div>
  )
}

export default PantryItem
