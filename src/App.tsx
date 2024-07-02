
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Home from './components/Home';
import About from './components/About';
// import Admin from './Admin';

import Navbar from './components/Navbar';
import Search from "./components/Search";


function App() {
  return (
    <main>
      <div>
        <Router>
              <div>
                <Navbar />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/search" element={<Search />} />
                  </Routes>
              </div>
            </Router>
      </div>
    </main>
  );
}

export default App;
