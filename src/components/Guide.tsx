import './About.css';
import '@aws-amplify/ui-react/styles.css';

function Guide() {
  return (
    <div>
      <header className="banner"></header>
      <div className='separator'></div>
    <main>
      <h1 className='intro'>The Annotation Schema of the Sesame Street Image Corpus</h1>
      <p className='indented'>
    HOW TO FIND ANNOTATED IMAGES: The corpus uses a controlled vocabulary to encode the images with information about various visual aspects of the images. Here is a comprehensive list of the terms used in the development of the metadata for the Image Corpus:</p>

<p className='indented'>
<p>
  <strong>“Face” Category-Attributes</strong><br/>
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
  <strong>“Place” Category-Attributes</strong><br/>
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
  <strong>“Word” Category-Attributes</strong><br/>
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
  <strong>“Number” Category-Attributes</strong><br/>
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
</p>



      </p>
      <div className="separator"></div>
    </main>
    </div>
  );
}

export default Guide;
