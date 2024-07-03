import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './navbar.css';
import { signOut } from 'aws-amplify/auth';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  const handleSignOut = async () => {
    try {
      await signOut();
      console.log("User signed out successfully");
    } catch (error) {
      console.error("Error signing out", error);
    }
  }

  return (
    <nav className="navbar">
      <div className="menu-toggle" onClick={toggleMenu}>
        <div className={`hamburger ${isOpen ? 'active' : ''}`}></div>
      </div>
      <ul className={`nav-links ${isOpen ? 'active' : ''}`}>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/search">Search</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/admin">Administration</Link></li>
      </ul>
      <button onClick={handleSignOut}>Sign out</button>
    </nav>
  );
};

export default Navbar;

