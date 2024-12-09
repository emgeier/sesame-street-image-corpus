import './About.css';
import '@aws-amplify/ui-react/styles.css';
import useScrollToTop from '../ScrollToTop';

function Team() {
  useScrollToTop();
  return (
    <div>
      <div className='separator'></div>
      <div className='separator'></div>
      <div className='separator'></div>
      <div className='separator'></div>

      <header className="banner1"></header>
      
      <div className='separator'></div>
    <main>
      <h1 className='intro'><i>Sesame Street</i>Archive </h1>
      <br></br>
      <p className='block-format'>
        <b>LAND Lab</b>

      </p>
      <div className="separator"></div>
      <p className='block-format'>
        <b>Digital Lab </b> <br/><br/>
        Dr. Cazembe Kennedy, Director of Projects and Partnerships <br/>
        Erin Geier, Cloud Engineer
      </p>

      <div className="separator"></div>
      <p className='block-format'>
      </p>
        <div className="separator"></div>
      <p className='block-format'>
    
      </p>
      <div className="separator"></div>
      <p className='block-format'>
      </p>
      <div className="separator"></div>
    </main>
    </div>
  );
}

export default Team;
