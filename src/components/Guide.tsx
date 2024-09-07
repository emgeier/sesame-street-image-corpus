import './About.css';
import '@aws-amplify/ui-react/styles.css';
import example from "../assets/images/AnnotatedImageExample.png";

function Guide() {
  return (
    <div>
      <div className='separator'></div>
      <header className="banner"></header>
      <div className='separator'></div>
    <main>
      
      <p className='indented'>
    HOW TO FIND ANNOTATED IMAGES 
      </p>
    <br></br>
    <p className='indented'>
      The search for images from various episodes of Sesame Street over the course of its history is found through the "Episode Search".  One can search by episode number, title, season, or year the episode first aired. The images are displayed with their annotations details and bounding boxes.</p>
      <br></br>
      <p className='indented'>
      The search for annotations with specific characteristics can be done by keyword or by checklist on the "Search" and "Downloads" pages. One can see the images annotated with their bounding boxes and annotation details on the "Search" page.  On the "Downloads" page one can search via checklist and download the search results as a csv file with or without the corresponding image files.</p>
      <br></br>
    <p className='indented'>
    Annotation Schema of the Sesame Street Image Archive
    </p>
    <br></br>
    <p className='indented'>
    The SSIA uses a controlled vocabulary to encode the images with information about various visual aspects of the images. Here is a comprehensive list of the terms used in the development of the metadata for the Sesame Street Image Archive:</p>
      <p className='indented'>
        <div>
  <strong>“Face” Category Attributes</strong><br/>
  Name: 1. Species<br/>
  Value: human; puppet; animal; other<br/>
  Name: 2. Representation<br/>
  Value: real; caricature; other<br/>
  Name: 3. Race/Ethnicity<br/>
  Value: white; Black/African American; American Indian/Alaska Native; Asian; Native Hawaiian/Other Pacific Islander; other<br/>
  Name: 4. Age<br/>
  Value: infant; child; teen; adult; elderly; other<br/>
  Name: 5. Orientation<br/>
  Value: front-face; side-profile; other<br/>
  Name: 6. Camera Angle<br/>
  Value: forward; downward; upward; other<br/>
  Name: 7. Visibility<br/>
  Value: full-view; occluded; truncated; occluded-and-truncated; other<br/>
  Name: 8. Clarity<br/>
  Value: clear; blurry; other<br/>
  <br/>
  <strong>“Place” Category Attributes</strong><br/>
  Name: 1. Representation<br/>
  Value: real; caricature; other<br/>
  Name: 2. Orientation<br/>
  Value: cardinal; oblique; other<br/>
  Name: 3. Visibility<br/>
  Value: full-view; occluded; truncated; occluded-and-truncated; other<br/>
  Name: 4. Clarity<br/>
  Value: clear; blurry; other<br/>
  Name: 5. Scope<br/>
  Value: close-up; single; multiple; skyline; other<br/>
  Name: 6. User<br/>
  Value: human; animal; other<br/>
  Name: 7. Function<br/>
  Value: domicile; business; attraction; institution; other<br/>
  Name: 8. Construction<br/>
  Value: house; row-house; apartment; castle; other<br/>
  Name: 9. Content<br/>
  Value: handwrite (optional)<br/>
  <br/>
  <strong>“Word” Category Attributes</strong><br/>
  Name: 1. Single-Letter<br/>
  Value: a; b; c; d; e; f; g; h; i; j; k; l; m; n; o; p; q; r; s; t; u; v; w; x; y; z; other<br/>
  Name: 2. Multi-Letter<br/>
  Value: word; nonword-pronounceable; nonword-unpronounceable; other<br/>
  Name: 3. Case<br/>
  Value: lowercase; uppercase; mixed; other<br/>
  Name: 4. Proper Noun<br/>
  Value: True/False<br/>
  Name: 5. Content<br/>
  Value: handwrite (optional)<br/>
  Name: 6. Visibility<br/>
  Value: full-view; occluded; truncated; occluded-and-truncated; other<br/>
  Name: 7. Clarity<br/>
  Value: clear; blurry; other<br/>
  Name: 8. Language<br/>
  Value: English; Spanish; other<br/>
  <br/>
  <strong>“Number” Category Attributes</strong><br/>
  Name: 1. Single-Digit<br/>
  Value: 0; 1; 2; 3; 4; 5; 6; 7; 8; 9; other<br/>
  Name: 2. Multi-Digit<br/>
  Value: True/False<br/>
  Name: 3. With Non-Symbolic Representation<br/>
  Value: True/False<br/>
  Name: 4. Content<br/>
  Value: handwrite (optional)<br/>
  Name: 5. Visibility<br/>
  Value: full-view; occluded; truncated; occluded-and-truncated; other<br/>
  Name: 6. Clarity<br/>
  Value: clear; blurry; other<br/>
        </div>
      </p>
      
      <br></br>
      <p className='indented'>  
      ANNOTATED IMAGE SEARCH RESULT EXAMPLE
      </p>
      <br></br> 
      <div className='indented image-container' >
        <img src={example} className='eximage centered-image' ></img></div>
      <div className="separator"></div>

    </main>
    </div>
  );
}

export default Guide;

