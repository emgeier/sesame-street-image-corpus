
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
        <main>
        <br/>
        <p className='small indented'>The Sesame Street Image Corpus (SSIC) is an open-access, searchable database of more than 35,000 unique images taken from over 4,000 original Sesame Street episodes. Using spatial bounding boxes to map different categories of visual data, each image is precisely annotated to identify target categories, such as faces, words, digits, and even castles and skylines. SSIC aims to innovate new forms of machine learning and AI research within and between disciplines, from neuroscience to theater and puppetry.</p>
        <div className='separator'></div>
        <p className='small indented'>Sesame Street was first broadcast in 1969 to bring educational content into children’s homes in the mornings before school. In the more than 50 years since, Sesame Street has demonstrated a lasting impact on early childhood education, improving literacy, numeracy, and social-emotional skills for generations of children worldwide.</p>
        <div className='separator'></div>
        <p className='small indented'>Public deployment of SSIC is planned for 2025. If you would like to test or contribute to SSIC before deployment, please follow the external Feedback link in the toolbar.</p>
        
        <div className='separator'></div>
        </main>
        
        <img src={sesameStreetImage} alt="Sesame Street" className="sesame-image" />
        
        <footer />
      </main>
    </div>
  );
}

export default Home;
