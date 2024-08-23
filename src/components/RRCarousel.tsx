import React from "react";
import { Carousel } from 'react-responsive-carousel';

import 'react-responsive-carousel/lib/styles/carousel.min.css'; 
import './rrcarousel.css';
import imagea from "../assets/images/00130.png";
import imageb from "../assets/images/S48-E4821_01079.png";
import imagec from "../assets/images/S48-E4821_00085.png";
import image1 from "../assets/images/1.png";
import image2 from "../assets/images/2.png";
import image3 from "../assets/images/3.png";
import image4 from "../assets/images/4.png";
import image5 from "../assets/images/5.png";

import image6 from "../assets/images/6.png";
import image7 from "../assets/images/7.png";
import image8 from "../assets/images/8.png";
import image9 from "../assets/images/9.png";
import image10 from "../assets/images/10.png";

import image11 from "../assets/images/11.png";
import image12 from "../assets/images/12.png";
import image13 from "../assets/images/13.png";
import image14 from "../assets/images/14.png";
import image15 from "../assets/images/15.png";


const RRCarousel: React.FC = () => (
  <div className="carousel-wrapper">
    <Carousel 
    autoPlay 
    infiniteLoop 
    autoFocus={false} 
    animationHandler="fade" 
    swipeable={false} 
    showArrows={false} 
    showIndicators={false}
    showThumbs={false}
    stopOnHover={true}
    interval={3000}
    transitionTime={1000}
    swipeScrollTolerance={5}
    emulateTouch={true}
    showStatus={false}
    >
      
      <div>
        <img src={image1} alt="Slide 1" />
      </div>
      <div>
        <img src={image2} alt="Slide 2" />
      </div>    
      <div>
        <img src={image3} alt="Slide 3" />
      </div>  
      <div>
        <img src={image4} alt="Slide 4" />
      </div>
      <div>
        <img src={image5} alt="Slide 5" />
      </div>    
      <div>
        <img src={image6} alt="Slide 6" />
      </div>     
      <div>
        <img src={image7} alt="Slide 7" />
      </div>
      <div>
        <img src={image8} alt="Slide 8" />
      </div>    
      <div>
        <img src={image9} alt="Slide 9" />
      </div>     
      <div>
        <img src={image10} alt="Slide 10" />
      </div>
      <div>
        <img src={image11} alt="Slide 11" />
      </div>    
      <div>
        <img src={image12} alt="Slide 12" />
      </div>     
      <div>
        <img src={image13} alt="Slide 13" />
      </div>
      <div>
        <img src={image14} alt="Slide 14" />
      </div>    
      <div>
        <img src={image15} alt="Slide 15" />
      </div>         
    </Carousel>
  </div>
);

export default RRCarousel;
