import React from 'react';
import './ManagePopup.css';

function ManagePopup({ onClose }) {
  return (
    <div className="popup">
      <div className="popup-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Manage Seller Account</h2>
        {/* Add your manage seller account content here */}
      </div>
    </div>
  );
}

export default ManagePopup;