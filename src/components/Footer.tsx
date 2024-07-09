import React from 'react';
import { Link } from 'react-router-dom';
import './footer.css';
import landlabicon from '../assets/images/LandLab.png';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-links">
        <Link to="/">Home</Link>
        <Link to="/search">Search</Link>
        <Link to="/advsearch">Advanced Search</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </div>
      
      <div className="footer-social">
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
      </div>
      <div className="footer-text">
        © 2024 LAND Lab. All rights reserved.
      </div>
      <img src={landlabicon} alt="LAND Lab icon" className="footer-icon" />
    </footer>
  );
};

export default Footer;
