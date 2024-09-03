import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaStar, FaCheck, FaHeart, FaComment, FaShare } from 'react-icons/fa';
import './SellerPage.css';

const SellerPage = ({ addToCart }) => {
  const [seller, setSeller] = useState(null);
  const [popularDishes, setPopularDishes] = useState([]);
  const [selectedDish, setSelectedDish] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    // Fetch seller data based on id
    fetchSellerData(id);
    // Fetch popular dishes for this seller
    fetchPopularDishes(id);
  }, [id]);

  const fetchSellerData = async (sellerId) => {
    // Replace this with actual API call to your backend
    const response = await fetch(`/api/sellers/${sellerId}`);
    const data = await response.json();
    setSeller(data);
  };

  const fetchPopularDishes = async (sellerId) => {
    // Replace this with actual API call to your backend
    const response = await fetch(`/api/sellers/${sellerId}/dishes`);
    const data = await response.json();
    setPopularDishes(data);
  };

  const handleDishClick = (dish) => {
    setSelectedDish(dish);
  };

  const handleClosePopup = () => {
    setSelectedDish(null);
  };

  const handleAddToCart = (dish) => {
    addToCart(dish);
    handleClosePopup();
  };

  if (!seller) {
    return <div>Loading...</div>;
  }

  return (
    <div className="seller-page">
      <div className="seller-header">
        <img src={seller.image} alt={seller.name} className="seller-image" />
        <div className="seller-info">
          <h1>{seller.name}</h1>
          <p className="cuisine-types">{seller.cuisineTypes.join(' · ')}</p>
          <div className="seller-stats">
            <span><FaStar /> {seller.rating} ({seller.reviewCount} reviews)</span>
            <span>{seller.mealsPrepared} Meals prepared</span>
            <span><FaCheck /> {seller.certifications[0]}</span>
          </div>
          <div className="seller-actions">
            <button className="action-button"><FaHeart /> Follow</button>
            <button className="action-button"><FaComment /> Message</button>
            <button className="action-button"><FaShare /> Share</button>
          </div>
        </div>
      </div>
      <p className="seller-description">{seller.description}</p>
    
      <div className="popular-dishes">
        <h2>Popular dishes</h2>
        <div className="meal-types">
          <button>Popular</button>
          <button>Packaged</button>
          <button>Mains</button>
          <button>Sides</button>
        </div>
        <div className="dishes-grid">
          {popularDishes.map((dish) => (
            <div key={dish.id} className="dish-card" onClick={() => handleDishClick(dish)}>
              <img src={dish.image} alt={dish.name} />
              <h3>{dish.name}</h3>
              <p className="dish-rating"><FaStar /> {dish.rating}% ({dish.reviewCount})</p>
              <p>{dish.servings}</p>
              <p className="dish-price">${dish.price.toFixed(2)}</p>
              <button className="add-to-cart" onClick={(e) => { e.stopPropagation(); handleAddToCart(dish); }}>Add to cart</button>
            </div>
          ))}
        </div>
      </div>
      {selectedDish && (
        <div className="popup">
          <div className="popup-overlay" onClick={handleClosePopup}></div>
          <div className="popup-content">
            <span className="close" onClick={handleClosePopup}>&times;</span>
            <img src={selectedDish.image} alt={selectedDish.name} className="popup-image" />
            <h2>{selectedDish.name}</h2>
            <p>{selectedDish.description}</p>
            <p>Servings: {selectedDish.servings}</p>
            <p>Price: ${selectedDish.price.toFixed(2)}</p>
            <button className="add-to-cart-popup" onClick={() => handleAddToCart(selectedDish)}>Add to cart</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerPage;