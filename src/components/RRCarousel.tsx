import React from "react";
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // requires a loader

import image1 from "../assets/images/00130.png";
import image2 from "../assets/images/00293.png";
import image3 from "../assets/images/00633.png";
import image4 from "../assets/images/S48-E4821_00085.png";

const RRCarousel: React.FC = () => (
  <div className="carousel-wrapper">
    <Carousel autoPlay infiniteLoop>
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
    </Carousel>
  </div>
);

export default RRCarousel;
