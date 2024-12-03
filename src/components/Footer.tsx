import React from 'react';
import { Link } from 'react-router-dom';
import './footer.css';
import landlabicon from '../assets/images/LandLab.png';

const Footer: React.FC = () => {
  return (
    <footer className="footer">      
      <div className="footer-links">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/guide">Guide</Link>
        <Link to="/search">Search</Link>
        <Link to="/team">Team</Link>
        <Link to="/contact">Contact</Link>
      </div>
      <div className="footer-text">
        © 2024 LaNDLAB    
      </div>
      <div className="footer-social">
        <a className="footer-icon" href="https://www.vanderbiltlandlab.io" target="_blank" rel="noopener noreferrer">
        <img src={landlabicon} alt="LaNDLab icon" width={50} />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
