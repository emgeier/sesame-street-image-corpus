
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Home from './components/Home';
import About from './components/About';
import Admin from './components/Admin.tsx';
import XSearch from './components/XSearch.tsx';
import SearchImageAttributes from './components/SearchImageAttributes';
import Guide from './components/Guide';
import Navbar from './components/Navbar';
import Search from "./components/Search";
import Footer from "./components/Footer";
import Metrics from './components/Metrics';
import Contact from './components/Contact.tsx';

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
                    <Route path="/download" element={<SearchImageAttributes />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/episodes" element={<XSearch />} />
                    <Route path="/guide" element={<Guide />} />
                    <Route path="/metrics" element={<Metrics/>} />
                    <Route path="/contact" element={<Contact/>} />  
                  </Routes>
                  <div className='separator'></div>
                  <Footer></Footer>
              </div>
            </Router>
        </div>
    </main>
  );
}

export default App;
