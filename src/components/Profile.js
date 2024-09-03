import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { doc, getDoc, updateDoc, collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import './Profile.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    favoriteCuisine: '',
    phoneNumber: ''
  });
  const [sellerRequest, setSellerRequest] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [showManagePopup, setShowManagePopup] = useState(false);
  const [sellerInfoSubmitted, setSellerInfoSubmitted] = useState(false);
  const [sellerItems, setSellerItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', price: '', description: '' });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({ id: currentUser.uid, ...userData });
          setFormData({
            displayName: userData.displayName || '',
            bio: userData.bio || '',
            favoriteCuisine: userData.favoriteCuisine || '',
            phoneNumber: userData.phoneNumber || ''
          });
          setSellerRequest(userData.sellerRequest || false);
          setIsSeller(userData.seller || false);
          setSellerInfoSubmitted(!!userData.sellerInfo);
          if (userData.seller) {
            fetchSellerItems(currentUser.uid);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchSellerItems = async (userId) => {
    const itemsCollection = collection(db, 'users', userId, 'items');
    const itemsSnapshot = await getDocs(itemsCollection);
    const itemsList = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setSellerItems(itemsList);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.id), formData);
      setUser({ ...user, ...formData });
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
    setLoading(false);
  };

  const handleSellerRequest = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.id), { sellerRequest: true });
      setSellerRequest(true);
    } catch (error) {
      console.error('Error requesting seller status:', error);
    }
    setLoading(false);
  };

  const handleManageClick = () => {
    setShowManagePopup(true);
  };

  const handleClosePopup = () => {
    setShowManagePopup(false);
  };

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const itemsCollection = collection(db, 'users', user.id, 'items');
      await addDoc(itemsCollection, newItem);
      setNewItem({ name: '', price: '', description: '' });
      fetchSellerItems(user.id);
    } catch (error) {
      console.error('Error adding new item:', error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteDoc(doc(db, 'users', user.id, 'items', itemId));
      fetchSellerItems(user.id);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const SellerRegistration = () => {
    const [sellerData, setSellerData] = useState({
      businessName: '',
      description: '',
      cuisineTypes: '',
    });

    const handleSellerDataChange = (e) => {
      const { name, value } = e.target;
      setSellerData({ ...sellerData, [name]: value });
    };

    const handleSellerSubmit = async (e) => {
      e.preventDefault();
      try {
        await updateDoc(doc(db, 'users', user.id), {
          sellerInfo: {
            ...sellerData,
            cuisineTypes: sellerData.cuisineTypes.split(',').map(type => type.trim()),
          }
        });
        setSellerInfoSubmitted(true);
        alert('Seller information submitted successfully!');
      } catch (error) {
        console.error('Error submitting seller information:', error);
      }
    };

    return (
      <form onSubmit={handleSellerSubmit} className="seller-registration-form">
        <input
          type="text"
          name="businessName"
          value={sellerData.businessName}
          onChange={handleSellerDataChange}
          placeholder="Business Name"
          required
        />
        <textarea
          name="description"
          value={sellerData.description}
          onChange={handleSellerDataChange}
          placeholder="Business Description"
          required
        ></textarea>
        <input
          type="text"
          name="cuisineTypes"
          value={sellerData.cuisineTypes}
          onChange={handleSellerDataChange}
          placeholder="Cuisine Types (comma-separated)"
          required
        />
        <button type="submit">Submit Seller Information</button>
      </form>
    );
  };

  const ManageItems = () => (
    <div className="manage-items">
      <h3>Manage Items</h3>
      <form onSubmit={handleAddItem}>
        <input
          type="text"
          name="name"
          value={newItem.name}
          onChange={handleNewItemChange}
          placeholder="Item Name"
          required
        />
        <input
          type="number"
          name="price"
          value={newItem.price}
          onChange={handleNewItemChange}
          placeholder="Price"
          required
        />
        <textarea
          name="description"
          value={newItem.description}
          onChange={handleNewItemChange}
          placeholder="Description"
          required
        ></textarea>
        <button type="submit">Add Item</button>
      </form>
      <div className="items-list">
        {sellerItems.map((item) => (
          <div key={item.id} className="item">
            <h4>{item.name}</h4>
            <p>Price: ${item.price}</p>
            <p>{item.description}</p>
            <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return <div className="profile-container"><div className="loader"></div></div>;
  }

  if (!user) {
    return <div className="profile-container">Please log in to view your profile.</div>;
  }

  return (
    <div className="profile-container">
      <h1 className="profile-title">My Profile</h1>
      {editing ? (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="displayName">Name:</label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="bio">Bio:</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="favoriteCuisine">Favorite Cuisine:</label>
            <input
              type="text"
              id="favoriteCuisine"
              name="favoriteCuisine"
              value={formData.favoriteCuisine}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number:</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
            />
          </div>
          <div className="button-group">
            <button type="submit" className="save-button">Save</button>
            <button type="button" onClick={() => setEditing(false)} className="cancel-button">Cancel</button>
          </div>
        </form>
      ) : (
        <div className="profile-info">
          <p><strong>Name:</strong> {user.displayName || 'Not set'}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Bio:</strong> {user.bio || 'No bio available'}</p>
          <p><strong>Favorite Cuisine:</strong> {user.favoriteCuisine || 'Not specified'}</p>
          <p><strong>Phone Number:</strong> {user.phoneNumber || 'Not provided'}</p>
          {!sellerRequest && !isSeller && (
            <button onClick={handleSellerRequest} className="seller-request-button">Request to be a Seller</button>
          )}
          {sellerRequest && !isSeller && <p>Your request to be a seller has been submitted and awaits approval.</p>}
          {isSeller && sellerInfoSubmitted && <button onClick={handleManageClick} className="manage-button">Manage Items</button>}
          <button onClick={() => setEditing(true)} className="edit-button">Edit Profile</button>
        </div>
      )}
      
      {isSeller && !sellerInfoSubmitted && (
        <div className="seller-registration-section">
          <h2>Complete Your Seller Profile</h2>
          <SellerRegistration />
        </div>
      )}
      
      {showManagePopup && (
        <div className="popup">
          <div className="popup-content">
            <span className="close" onClick={handleClosePopup}>&times;</span>
            <ManageItems />
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;