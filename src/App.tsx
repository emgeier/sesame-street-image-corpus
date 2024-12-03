
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Home from './components/Home';
import About from './components/About';
import EpisodeSearch from './components/EpisodeSearch.tsx';
import Guide from './components/Guide';
import Navbar from './components/Navbar';
import Search from "./components/Search";
import Footer from "./components/Footer";
import Metrics from './components/Metrics';
import Contact from './components/Contact.tsx';
import Upload from './components/Upload.tsx';
import Team from './components/Team.tsx';

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
                    <Route path="/team" element={<Team />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/upload" element={<Upload />} />
                    <Route path="/episodes" element={<EpisodeSearch />} />
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
