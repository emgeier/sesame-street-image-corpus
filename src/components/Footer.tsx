import React from 'react';
import { Link } from 'react-router-dom';
import './footer.css';
import landlabicon from '../assets/images/LandLab.png';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-links">
        <Link to="/">Home</Link>
        <Link to="/guide">Guide</Link>
        <Link to="/about">About</Link>
        <Link to="/metrics">Metrics</Link>
        <a href="https://peabody.az1.qualtrics.com/jfe/form/SV_eRQUVmfS4d7q4yq" target="_blank" rel="noopener noreferrer">
              Survey
            </a>
      </div>
      <div className="footer-text">
        © 2024 LANDLAB    
      </div>
      <div className="footer-social">
        <a className="footer-icon" href="https://www.vanderbiltlandlab.io" target="_blank" rel="noopener noreferrer">
        <img src={landlabicon} alt="LANDLab icon" width={50} />
        </a>
      </div>

    </footer>
  );
};

export default Footer;
