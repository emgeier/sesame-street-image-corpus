import React from "react";
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; 
import './episodecarousel.css';
import type { Schema } from "../../amplify/data/resource";

interface EpisodeCarouselProps {
  images: Array<Schema["Image"]["type"] & { imageUrl?: string }>;
}

const EpisodeCarousel: React.FC<EpisodeCarouselProps> = ({ images }) => {
  const [autoPlayActive, setAutoPlayActive] = React.useState(true);
    console.log(autoPlayActive);
    const handleMouseEnter = () => {
        setAutoPlayActive(false); // Pause autoplay on hover
      };
      
      const handleMouseLeave = () => {
        setAutoPlayActive(true); // Resume autoplay when hover ends
      };
      
      return (
        <div className="carousel-wrapper" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <Carousel
            autoPlay={autoPlayActive}
            infiniteLoop
            animationHandler="fade"
            swipeable={false}
            showArrows={true}
            showIndicators={false}
            showThumbs={true}
            stopOnHover={true} // Still keep the stopOnHover prop
            interval={3000}
            transitionTime={1000}
            emulateTouch={true}
            showStatus={true}
            // onClickItem={handleImageClick}
            // onClickThumb={handleImageClick}
          >
            {images.map((image, index) => (
              <div key={index} style={{ cursor: "pointer" }}>
                <img src={image.imageUrl} alt={`Image ${image.image_id}`} />
              </div>
            ))}
          </Carousel>
        </div>
      );
      
};

export default EpisodeCarousel;