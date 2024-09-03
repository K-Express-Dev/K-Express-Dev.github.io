import React, { useState } from 'react';
import { db } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';

const SellerRegistration = ({ userId }) => {
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    description: '',
    cuisineTypes: '',
    certifications: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        seller: true,
        sellerInfo: {
          ...formData,
          cuisineTypes: formData.cuisineTypes.split(',').map(type => type.trim()),
          certifications: formData.certifications.split(',').map(cert => cert.trim()),
        }
      });
      alert('Seller information updated successfully!');
    } catch (error) {
      console.error('Error updating seller information:', error);
      alert('Failed to update seller information. Please try again.');
    }
  };

  return (
    <div className="seller-registration">
      <h2>Complete Your Seller Profile</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Business Name"
          required
        />
        <input
          type="text"
          name="image"
          value={formData.image}
          onChange={handleChange}
          placeholder="Profile Image URL"
          required
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Business Description"
          required
        ></textarea>
        <input
          type="text"
          name="cuisineTypes"
          value={formData.cuisineTypes}
          onChange={handleChange}
          placeholder="Cuisine Types (comma-separated)"
          required
        />
        <input
          type="text"
          name="certifications"
          value={formData.certifications}
          onChange={handleChange}
          placeholder="Certifications (comma-separated)"
        />
        <button type="submit">Submit Seller Information</button>
      </form>
    </div>
  );
};

export default SellerRegistration;