
import './About.css';
import useScrollToTop from '../ScrollToTop.tsx';

import RRCarousel from './RRCarousel.tsx';

function Home() {
  useScrollToTop();
  return (
    <div>      
      <div className='separator'></div>
      <div className='separator'></div>
      <div className='separator'></div>
      <div className='separator'></div>
      <header className="banner3"></header>
      <div className='separator'></div>
      <main>
        <h1 className='intro'>Welcome to the<i>Sesame Street</i>Image Archive</h1>
        <br></br>
        <div className='carousel-container'><RRCarousel ></RRCarousel></div>
        <div className='separator'></div>
       <main>
        <br/>
        <p className='block-format'>The<i>Sesame Street</i>Image Archive (SSIA) is an open-access, searchable database of more than 35,000 unique images taken from over 4,000 original<i>Sesame Street</i>episodes. Using spatial bounding boxes to map different categories of visual data, each image is precisely annotated to identify target categories, such as faces, words, digits, and even castles and skylines. SSIA aims to innovate new forms of machine learning and AI research within and between disciplines, from neuroscience to theater and puppetry.</p> 
        <div className='separator'></div>
        <p className='block-format'><i>Sesame Street</i>was first broadcast in 1969 to bring educational content into children’s homes in the mornings before school. In the more than 50 years since,<i>Sesame Street</i>has demonstrated a lasting impact on early childhood education, improving literacy, numeracy, and social-emotional skills for generations of children worldwide.</p>
        <div className='separator'></div>
        <p className='block-format'>Public deployment of SSIA is planned for 2025. If you would like to test or contribute to SSIA before deployment, please take this <a href="https://peabody.az1.qualtrics.com/jfe/form/SV_eRQUVmfS4d7q4yq" target="_blank" rel="noopener noreferrer">
        survey</a>.     
        </p>.
        <div className='separator'></div>
       </main>
       <footer />
      </main>
    </div>
  );
}

export default Home;
