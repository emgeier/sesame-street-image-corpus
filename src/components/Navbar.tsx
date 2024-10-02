import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './navbar.css';
import { signOut } from 'aws-amplify/auth';
import { useState, useEffect } from 'react';
import {getCurrentUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import icon from "../../favicon.ico";

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
  const closeMenu = () => {
    setMenuOpen(false);
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
              <img src={icon} alt="ssia logo" className="navbar-icon" />
            </Link> </li>
        <li><Link to="/"  onClick={closeMenu} className={currentPath === '/' ? 'current-page' : ''} >Home</Link></li>
        <li><Link to="/guide"  onClick={closeMenu} className={currentPath === '/guide' ? 'current-page' : ''}>Guide</Link></li>
        <li><Link to="/about"  onClick={closeMenu} className={currentPath === '/about' ? 'current-page' : ''}>About</Link></li>
        <li><Link to="/search"  onClick={closeMenu} className={currentPath === '/search' ? 'current-page' : ''}>Search</Link></li>
        <li><Link to="/episodes"  onClick={closeMenu} className={currentPath === '/episodes' ? 'current-page' : ''}>Episodes</Link></li>
        <li><Link to="/download"  onClick={closeMenu} className={currentPath === '/download' ? 'current-page' : ''}>Download</Link></li>
        <li><Link to="/upload"  onClick={closeMenu} className={currentPath === '/upload' ? 'current-page' : ''}>Upload</Link></li>
        <li><Link to="/contact"  onClick={closeMenu} className={currentPath === '/contact' ? 'current-page' : ''}>Contact</Link></li>
 
      </ul>
      { isAuthenticated && 
      (<button onClick={handleSignOut}>Sign out</button>)
      }
    </nav>
    </div>
  );
};

export default Navbar;

