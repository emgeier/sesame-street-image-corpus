import './About.css';
import '@aws-amplify/ui-react/styles.css';

function About() {
  return (
    <div>
      <div className='separator'></div>
      <header className="banner"></header>
      <div className='separator'></div>
    <main>
      <h1 className='intro'>About the Sesame Street Image Corpus</h1>
      <p className='indented'>
        Research interest is increasingly focused on “deep” MRI scans of individual human brains, moving away from “wide” scans of numerous people. This shift is enabling the application of computer vision models to study human brain development more closely. With image databases like Common Objects in Context (COCO) already in use for training these models, there is now potential to fine-tune them on brain activity data as well.
        No image repository yet exists that views the experiences of children from their point of view.
      </p>
      <div className="separator"></div>
      <p className='indented'>
        However, Sesame Street and other children’s shows offer rich material for this kind of resource. As educational television, Sesame Street naturally features more instances of numbers and words. Since it started creating episodes in 1969, it also has featured diverse groups and people of low socioeconomic status, with its high societal representation persisting today. Moreover, in the past 10 years, parents have played Sesame Street for their children much more than any other children’s show.
      </p>
      <div className="separator"></div>
      <p className='indented'>
        Initially funded by an NSF grant, this project was transferred to a NIH grant because of its novelty in the field. It involves five research labs across three universities: University of Texas, Austin; University of Minnesota; and Vanderbilt University. Based at Vanderbilt, the LANDLAB specializes in children’s reading and math development through MRI brain imaging. 
        For this project, the LANDLAB has created a Sesame Street image corpus to enhance further research into children’s brain development. With more than 4,500 episodes of at least 30 minutes each, Sesame Street provides LANDLAB extensive content to work with. Through machine-learning, a fine-tuned YOLO model trained on 4,000 labeled images is allowing us to label thousands more Sesame Street still images.</p>
      <div className="separator"></div>
      <p className='indented'>
      For SSIC and LANDLAB inquiries, contact Sophia Vinci-Booher at sophia.vinci-booher@vanderbilt.edu
      </p>
      <div className="separator"></div>
    </main>
    </div>
  );
}

export default About;
