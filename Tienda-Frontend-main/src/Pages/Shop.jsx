import React from 'react'
import Hero from '../Components/Hero/Hero'
import Popular from '../Components/Popular/Popular'
import Offers from '../Components/Offers/Offers'
import NewCollections from '../Components/NewCollections/NewCollections'
import NewsLetter from '../Components/NewsLetter/NewsLetter'
import About from '../Components/About/About'
import { useUser } from '../Context/UserContext';

const Shop = () => {
  return (
    <div>
      <Hero/>
      <Popular />
      <Offers />
      <NewCollections />
      <NewsLetter />
      
      {/* Mobile App Download Section */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '20px', 
        padding: '30px', 
        backgroundColor: '#f1f1f1', 
        borderRadius: '10px', 
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px',
        margin: '20px auto'
      }}>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>📱 Download the Tienda Mobile App</h3>
        <p style={{ color: '#555', fontSize: '14px', marginBottom: '10px' }}>Click the button below to download the Tienda mobile app and start shopping on the go!</p>
        <a 
          href="https://drive.google.com/file/d/1vpWGR-GLggfYLpjsBzbRjKwS2ZvlP0c4/view?usp=sharing" 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ 
            display: 'inline-block', 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: '#fff', 
            textDecoration: 'none', 
            fontWeight: 'bold', 
            borderRadius: '5px', 
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          📥 Download Now
        </a>
      </div>
    </div>
  )
}

export default Shop