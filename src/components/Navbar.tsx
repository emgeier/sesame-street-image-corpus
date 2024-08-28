import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './navbar.css';
import { signOut } from 'aws-amplify/auth';
import { useState, useEffect } from 'react';
import {getCurrentUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import icon from "../../public/favicon.ico";

const Navbar: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // New state for menu toggle

  const location = useLocation();

  // Determine the current path
  const currentPath = location.pathname;
   // Set sign-in status upon the first load of the navbar
   useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getCurrentUser();
        setIsAuthenticated(true);
        console.log("User:", user);
      } catch {
        setIsAuthenticated(false);
        console.log("Not authenticated");
      }
    };

    checkUser();

    // Set up the Hub listener
    const listener = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          console.log('User has been signed in successfully.');
          setIsAuthenticated(true);
          break;
        case 'signedOut':
          console.log('User has been signed out successfully.');
          setIsAuthenticated(false);
          break;
        default:
          break;
      }
    });
    // Cleanup the listener on component unmount
    return () => {
      listener(); 
    };
  }, []);
  const handleSignOut = async () => {
    try {
      await signOut();
      console.log("User signed out successfully");
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error signing out", error);
    }
  }
  //switch from open to close collapsable menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  }

  return (
    <div>
    <nav className="navbar">
    <div className="menu-toggle" onClick={toggleMenu}>
          <div className={`hamburger ${menuOpen ? 'active' : ''}`}></div>
          <div className={`hamburger ${menuOpen ? 'active' : ''}`}></div>
          <div className={`hamburger ${menuOpen ? 'active' : ''}`}></div>
        </div>
        <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
        <li><Link to="/">
              <img src={icon} alt="ssic logo" className="navbar-icon" />
            </Link> </li>
        <li><Link to="/"  className={currentPath === '/' ? 'current-page' : ''} >Home</Link></li>
        <li><Link to="/guide"  className={currentPath === '/guide' ? 'current-page' : ''}>Guide</Link></li>
        <li><Link to="/about"  className={currentPath === '/about' ? 'current-page' : ''}>About</Link></li>
        <li><Link to="/metrics"  className={currentPath === '/metrics' ? 'current-page' : ''}>Metrics</Link></li>
        <li><Link to="/search"  className={currentPath === '/search' ? 'current-page' : ''}>Search</Link></li>
        <li><Link to="/download"  className={currentPath === '/download' ? 'current-page' : ''}>Download</Link></li>
        <li><Link to="/admin"  className={currentPath === '/admin' ? 'current-page' : ''}>Upload</Link></li>
        <li><a href="https://peabody.az1.qualtrics.com/jfe/preview/previewId/0419baa6-934b-4d65-a11c-e8e6f79c85b9/SV_eRQUVmfS4d7q4yq?Q_CHL=preview&Q_SurveyVersionID=current" target="_blank" rel="noopener noreferrer">
              Feedback
            </a></li>

      </ul>
      { isAuthenticated && 
      (<button onClick={handleSignOut}>Sign out</button>)
      }
    </nav>
    </div>
  );
};

export default Navbar;

