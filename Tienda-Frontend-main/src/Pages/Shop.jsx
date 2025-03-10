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
      <div style={{ textAlign: 'center', marginTop: '20px', padding: '20px', backgroundColor: '#f8f8f8' }}>
        <h3>Download the Tienda Mobile App</h3>
        <p>Click the link below to download the Tienda mobile app and start shopping on the go!</p>
        <a href="https://drive.google.com/file/d/1OpjRMTLpfOSz9P4mqbPEhTVj4TgBcvOc/view?usp=sharing" target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'underline', fontWeight: 'bold' }}>Download Now</a>
      </div>
    </div>
  )
}

export default Shop
