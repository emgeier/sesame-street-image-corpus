import React from 'react';
import { Link } from 'react-router-dom';
import './navbar.css';
import { signOut } from 'aws-amplify/auth';
import { useState, useEffect } from 'react';
import {getCurrentUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

const Navbar: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  //Always listen for a change in signin status
  Hub.listen('auth', ({ payload }) => {
    switch (payload.event) {
      case 'signedIn':
        console.log('user have been signedIn successfully.');
        setIsAuthenticated(true);
        break;
      case 'signedOut':
        console.log('user have been signedOut successfully.');
        setIsAuthenticated(false);
        break;

    }
  });

  //Set signin status upon first load of navbar
  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getCurrentUser();
        
        setIsAuthenticated(true);
        console.log(isAuthenticated);
        console.log("user: " + user)
        
;      } catch {
        setIsAuthenticated(false);
        console.log(isAuthenticated);
      }
    };

    checkUser();
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
