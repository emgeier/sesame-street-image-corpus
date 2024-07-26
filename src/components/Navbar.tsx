import React from 'react';
import { Link } from 'react-router-dom';
import './navbar.css';
import { signOut } from 'aws-amplify/auth';

const Navbar: React.FC = () => {
  const handleSignOut = async () => {
    try {
      await signOut();
      console.log("User signed out successfully");
    } catch (error) {
      console.error("Error signing out", error);
    }
  }

  return (
    <div>
    <nav className="navbar">
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/search">Search</Link></li>
        <li><Link to="/download">Download</Link></li>
        <li><Link to="/admin">Upload</Link></li>
        <li><Link to="/guide">Guide</Link></li>
        <li><Link to="/about">About</Link></li>
      </ul>
      <button onClick={handleSignOut}>Sign out</button>
    </nav>
    </div>
  );
};

export default Navbar;
