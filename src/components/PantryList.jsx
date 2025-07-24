import React from 'react'
import PantryItem from './PantryItem'
import '../styles/PantryList.css'

function PantryList({ items, onRemove, onUpdateQuantity, onUseOne, onUpdateItem }) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <p>Your pantry is empty!</p>
        <p>Start adding items above 👆</p>
      </div>
    )
  }

  return (
    <div className="pantry-list">
      {items.map(item => (
        <PantryItem 
          key={item.id} 
          item={item} 
          onRemove={onRemove}
          onUpdateQuantity={onUpdateQuantity}
          onUseOne={onUseOne}
          onUpdateItem={onUpdateItem}
        />
      ))}
    </div>
  )
}

export default PantryList
