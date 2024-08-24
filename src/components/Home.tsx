
import './About.css';
import sesameStreetImage from '../assets/images/ssic.png';
import RRCarousel from './RRCarousel.tsx';

function Home() {
  return (
    <div className="main-content">
      <main>
        <h1 className='intro'><b>Welcome to the Sesame Street Image Corpus</b></h1>
        <br></br>
        <div className='carousel-container'><RRCarousel ></RRCarousel></div>
        <div className='separator'></div>
        <p className='intro small'>The Sesame Street Image Corpus (SSIC) an open-source repository of more than 35,000 annotated Sesame Street film frames. It captures various features across the educational television series that has had a profound impact on child development since its first broadcast in 1969.</p>
        <p className='intro small'>SSIC aims to support new forms of machine learning research within and across disciplines, from neuroscience to puppetry.</p>
        <p className='intro small'>Public deployment is planned for 2025. If you would like to test or contribute to SSIC before then, please click the Feedback button in the toolbar.</p>
        <img src={sesameStreetImage} alt="Sesame Street" className="sesame-image" />
        
        <footer />
      </main>
    </div>
  );
}

export default Home;
