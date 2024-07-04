
import './About.css';
import sesameStreetImage from '../assets/images/ssic.png';

function Home() {
  return (
    <div className="main-content">
      <main>
        <h1 className='intro'>Sesame Street Image Corpus</h1>
        <div className='separator'></div>
        <p className='indented'>
          This repository of images from Sesame Street enables machine learning on images that have had a profound impact on child development for over 50 years.
        </p>
        <img src={sesameStreetImage} alt="Sesame Street" className="sesame-image" />
        {/* Home page content */}
        <footer />
      </main>
    </div>
  );
}

export default Home;
