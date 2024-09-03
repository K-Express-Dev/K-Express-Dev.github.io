import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SellerBox from './SellerBox';
import './Home.css';
import spicyOctopusImage from './images/spicy_octopus.jpeg';
import koreanbbq from './images/koreanbbq.jpg'
import italian from './images/italianfood.jpg'
import mexican from './images/mexican.jpg'
import japan from './images/japan.jpg'

const Home = () => {
  const sellers = [
    {
      id: 1,
      image: koreanbbq,
      title: 'Korean Meals',
      seller: 'First Last',
      locations: ['Irvine, CA'],
      days: ['Wednesday', 'Saturday'],
    },
    {
      id: 2,
      image: italian,
      title: 'Italian Pasta',
      seller: 'First Last',
      locations: ['San Diego, CA' , 'Anaheim, CA'],
      days: ['Wednesday', 'Friday'],
    },
    {
      id: 3,
      image: mexican,
      title: 'Mexican Food',
      seller: 'First Last',
      locations: ['San Diego, CA'],
      days: ['Wednesday', 'Friday'],
    },
    {
      id: 4,
      image: japan,
      title: 'Japanese Bento',
      seller: 'First Last',
      locations: ['San Diego, CA'],
      days: ['Wednesday', 'Friday'],
    },
  ];

  const [selectedLocation, setSelectedLocation] = useState('');

  const handleLocationChange = (event) => {
    setSelectedLocation(event.target.value);
  };

  const filteredSellers = selectedLocation
    ? sellers.filter((seller) => seller.locations.includes(selectedLocation))
    : sellers;

  return (
    <div className="home">
      <div className="hero">
        <div className="hero-content">
          <h1>Freshly Made, Local Cuisines</h1>
          <div className="location-selector">
            <i className="fas fa-map-marker-alt"></i>
            <select value={selectedLocation} onChange={handleLocationChange}>
              <option value="">Select Location</option>
              <option value="Irvine, CA">Irvine, CA</option>
              <option value="San Diego, CA">San Diego, CA</option>
              <option value="Anaheim, CA">Anaheim, CA</option>
            </select>
          </div>
        </div>
      </div>
      <div className="seller-boxes">
        {filteredSellers.map((seller) => (
          <Link key={seller.id} to={`/seller/${seller.id}`} className="seller-link">
            <SellerBox {...seller} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;