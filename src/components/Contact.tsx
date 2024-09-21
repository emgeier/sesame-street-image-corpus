import './About.css';
import '@aws-amplify/ui-react/styles.css';

function Contact() {
  return (
    <div>
      <div className='separator'></div>
      <div className='separator'></div>
      <div className='separator'></div>
      <div className='separator'></div>
      <header className="banner1"></header>
      <div className='separator'></div>
    <main>
    <div className="separator"></div>
    <p className='block-format'>
      For SSIA and LANDLAB inquiries, contact Sophia Vinci-Booher at sophia.vinci-booher@vanderbilt.edu
    </p>
    <p className='block-format'>
        If you would like to test or contribute to the<i>Sesame Street</i>Image Archive, please take this <a href="https://peabody.az1.qualtrics.com/jfe/form/SV_eRQUVmfS4d7q4yq" target="_blank" rel="noopener noreferrer">
        survey</a>.
    </p>
    <div className="separator"></div>
    </main>
    </div>
  );
}
export default Contact;
