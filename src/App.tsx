
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';


import Home from './components/Home';
import About from './components/About';
import Admin from './components/Admin';

import Navbar from './components/Navbar';
import Search from "./components/Search";


function App() {
  return (
    <Authenticator>
      {({ signOut }) => (
    <main>
      
        <div>
            <Router>
              <div>
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/admin" element={<Admin />} />
                  </Routes>
              </div>
            </Router>
        </div>
    </main>
  )}
  
  </Authenticator>
  );
}

export default App;
