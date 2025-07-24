import React from 'react'
import '../styles/Welcome.css'

function Welcome({ onClose }) {
  return (
    <div className="welcome-overlay">
      <div className="welcome-modal">
        <h2>Welcome to PantryPal!</h2>
        <p>Type to add items to your pantry. Tap an item when you've used it up.</p>
        <button className="welcome-button" onClick={onClose}>
          Get Started
        </button>
      </div>
    </div>
  )
}

export default Welcome
