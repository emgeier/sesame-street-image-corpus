import React, { useState , useEffect} from "react";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { getUrl } from 'aws-amplify/storage';
import AnnotatedImage from "./AnnotatedImage";
import EpisodeCarousel from "./EpisodeCarousel";

interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
    id: number;
    annotation: Schema["Annotation"]["type"]; 
  }

const XSearch: React.FC = () => {
  const client = generateClient<Schema>();
  
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([]);
  //Pagination
  const itemsPerPage = 12; // Items to display per page 
  const [currentPageIndex, setCurrentPageIndex] = useState(0); // Start at the first item
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedFullImageId, setSelectedFullImageId] = useState<string>("");

  const [images, setImages] = useState<Array<Schema["Image"]["type"] & { imageUrl?: string }>>([]);
 
  const [episodeTitle, setTitle] = useState<string | undefined>(undefined);
  const [episodeNumber, setEpisodeNumber] = useState<string | undefined>(undefined);
  const [season, setSeason] = useState<number| undefined>(undefined);
  const [airYear, setAirYear] = useState<number| undefined>(undefined);

  const [searchMessage, setSearchMessage] = useState<string | null>(null); // State to hold the user message

  // Function to fetch annotation data from DynamoDB based on image selected
  const fetchAnnotations = async () => {
    
    setBoundingBoxes([]); // Clear current boxes before fetching new results
    try {

      if(!selectedImage){return;}

      const result: any = await client.models.Annotation.list({image_id: selectedFullImageId});
      
        if (result){console.log("results data: " + result.data + "length: "+ result.data.length);}

        // Initialize an array to accumulate bounding boxes
        const allBoundingBoxes: BoundingBox[] = [];
        result.data.forEach((annotation: any) => {
            
            const polygon = JSON.parse(annotation.polygon); // Parse the polygon string into an array of numbers

            if (polygon.length === 4) {
              const [x, y, width, height] = polygon;
              const box: BoundingBox = {
                x: x,
                y: y,
                width: width - x, // Convert coordinates to width
                height: height - y, // Convert coordinates to height
                id: annotation.annotation_id, // Set the color for bounding boxes
                annotation: annotation
              };
              allBoundingBoxes.push(box);
            }
          });
 
      setBoundingBoxes(allBoundingBoxes);
      console.log("boundingBoxes: " + JSON.stringify(allBoundingBoxes));
      

    } catch (error) {
      console.error("Failed to fetch annotations:", error);
    }
    setLoading(false); // Reset loading state
  };

  const fetchImagesTitle = async (episode_title: string) => {
    
    setImages([]); // Clear current selections before fetching new result
        
    try {
        const result: any = await client.models.Image.list({
            filter: { episode_title: { contains: episode_title } },
            limit: 40000,
          });
      
          if (!result || !result.data) {
            throw new Error('No data returned from the API');
          }
      // Fetch image URLs for each image
      if(result){
      const withUrls = await Promise.all(result.data.map(async (image: any) => {
        
        console.log("Image id is : "+ image.image_id);
        const fullImageId = "S" + String(image.season)+"-E" +String(image.episode_id) +"_" +String(image.image_id) + ".png";
        console.log("Full image id is : "+ fullImageId);
        const imageUrl = await fetchImageUrl(fullImageId);
        
        return { ...image, imageUrl };
      }));
      setImages(withUrls);
      setSearchMessage(`Images found: ${result.data.length}`);
      
    }
    } catch (error) {
      console.error("Failed to fetch images:", error);
    }
    setLoading(false); // Reset loading state
  };
    // Function to fetch URL for each image ID
  const fetchImageUrl = async (imageId: string): Promise<string> => {
    try {
      const result = await getUrl({ path: `dev/${imageId}` });
      return result.url.href;
    } catch (error) {
      console.error(`Failed to fetch URL for image ID: ${imageId}`, error);
      return ""; // Return an empty string or a placeholder URL
    }
  };
  const fetchImagesEpisode = async (episode_number: string) => {
    setImages([]); // Clear current selections before fetching new results
    
    try {
        const result: any = await client.models.Image.list({
            filter: { episode_id: { eq: episode_number } },
            limit: 40000,
          });
      
          if (!result || !result.data) {
            throw new Error('No data returned from the API');
          }
      // Fetch image URLs for each image
      if(result){
      const withUrls = await Promise.all(result.data.map(async (image: any) => {
        
        const fullImageId = concatenateImageIdForAnnotations(image)
        const imageUrl = await fetchImageUrl(fullImageId);
        
        return { ...image, imageUrl };
      }));

      setImages(withUrls);
      setSearchMessage(`Images found: ${result.data.length}`);
    }
    } catch (error) {
      console.error("Failed to fetch images:", error);
    }
    setLoading(false); // Reset loading state
  };
  const fetchImagesSeason = async (season: number) => {
    setImages([]); // Clear current selections before fetching new results
  
    //This is inefficient, a scan through all the items up to 40000. Will need to implement GSIs or OpenSearch 
    try {
        const result: any = await client.models.Image.list({
            filter: { season: { eq: season } },
            limit: 40000,
          });
      
          if (!result || !result.data) {
            throw new Error('No data returned from the API');
          }
      // Fetch image URLs for each image
      if(result){
      const withUrls = await Promise.all(result.data.map(async (image: any) => {
        
        const fullImageId = concatenateImageIdForAnnotations(image)
        const imageUrl = await fetchImageUrl(fullImageId);
        
        return { ...image, imageUrl };
      }));

      setImages(withUrls);
      setSearchMessage(`Images found: ${result.data.length}`);

    }
    } catch (error) {
      console.error("Failed to fetch images:", error);
    }
    setLoading(false); // Reset loading state
  };
  const fetchImagesAirYear = async (airYear: number) => {
    setImages([]); // Clear current selections before fetching new results
  
    //This is inefficient, a scan through all the items up to 40000. Will need to implement GSIs or OpenSearch 
    try {
        const result: any = await client.models.Image.list({
            filter: { air_year: { eq: airYear } },
            limit: 40000,
          });
      
          if (!result || !result.data) {
            throw new Error('No data returned from the API');
          }
      // Fetch image URLs for each image
      if(result){
      const withUrls = await Promise.all(result.data.map(async (image: any) => {
        
        const fullImageId = concatenateImageIdForAnnotations(image)
        const imageUrl = await fetchImageUrl(fullImageId);
        
        return { ...image, imageUrl };
      }));

      setImages(withUrls);
      setSearchMessage(`Images found: ${result.data.length}`);

    }
    } catch (error) {
      console.error("Failed to fetch images:", error);
    }
    setLoading(false); // Reset loading state
  };

  const concatenateImageIdForAnnotations = (image: Schema["Image"]["type"]) => {
    return "S" + String(image.season)+"-E" +String(image.episode_id) +"_" +String(image.image_id) + ".png";
  }

  const handleEpisodeRequest = () => {
    setSearchMessage("");
    if (episodeTitle) {
      fetchImagesTitle(episodeTitle);
    } else if (episodeNumber) {
      fetchImagesEpisode(episodeNumber);
    } else if (season) {
      fetchImagesSeason(season);
    } else if (airYear) {fetchImagesAirYear(airYear);}
  }; 


  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setSeason(undefined);
    setEpisodeNumber("");
    setAirYear(undefined);

  };
  const handleEpisodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEpisodeNumber(e.target.value);
    setSeason(undefined);
    setTitle("");
    setAirYear(undefined);

  };
  const handleSeasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSeason(e.target.valueAsNumber);
    setTitle("")
    setEpisodeNumber("")
    setAirYear(undefined);
  };
  const handleAirYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSeason(undefined);
    setTitle("")
    setEpisodeNumber("")
    setAirYear(e.target.valueAsNumber);
  };

  const handleImageClick = (image :Schema["Image"]["type"]  & { imageUrl?: string }) => {
    if (!image.imageUrl) return;
    const fullImageId = concatenateImageIdForAnnotations(image);
    setSelectedFullImageId(fullImageId);
    setSelectedImage(image.imageUrl);
  };
  useEffect(() => {
    if (selectedFullImageId && selectedImage) {
      fetchAnnotations();
    }
  }, [selectedFullImageId, selectedImage]);

  const handleNextPage = () => {
    if (currentPageIndex < images.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  return (
    <main className="main-content">
      <div className='separator'></div>
      <h1 className="intro">Episode Search </h1>
      <div className="search-controls">
      <div className="search-control">
          <label htmlFor="episodeNumber">Episode:</label>
          <input
            type="text"
            id="episode"
            name="episode"
            value={episodeNumber || ''}
            onChange={handleEpisodeChange}
          />
        </div>
        <div className="search-control">
        <label htmlFor="season">Season:</label>
        <input
          type="number"
          id="season"
          name="season"
          value={season || ''}
          onChange={handleSeasonChange}
        />
      </div>
 
        <div className="search-control">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={episodeTitle || ''}
            onChange={handleTitleChange}
          />
        </div>
        <div className="search-control">
        <label htmlFor="airYear">Year Aired:</label>
        <input
          type="number"
          id="airYear"
          name="airYear"
          value={airYear || ''}
          onChange={handleAirYearChange}
        />
      </div>    
      </div>
      <button onClick={handleEpisodeRequest}>Search</button>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
        <ul className="annotation-grid">
          {images.slice(currentPageIndex * itemsPerPage, currentPageIndex*itemsPerPage + itemsPerPage).map((image) => (
              <ul className="annotation-item" key={`${image.image_id}`} onClick={() => handleImageClick(image)}>
                {image.imageUrl && <img src={image.imageUrl} style={{ maxWidth: '200px', height: 'auto', cursor: 'pointer' }} />}
                <br></br>
                Time: {Math.floor(parseInt(image.image_id) / 60)}:{String(parseInt(image.image_id)% 60).padStart(2, '0')}<br />
                <br />
                </ul>
          ))}
        </ul>
        <p>Click image to see annotations</p>
        <div>{searchMessage && <p>{searchMessage}</p>} </div>
        <div className="page-buttons">
        <button onClick={handlePreviousPage} disabled={currentPageIndex === 0 || loading}>Previous</button>
        <button onClick={handleNextPage} disabled={currentPageIndex*itemsPerPage+itemsPerPage >= images.length - 1 || loading}>Next</button>
      </div>
        </div>
        
      )}
      {selectedFullImageId && (
        <ul>
            <h4>Annotated Image</h4>
            <AnnotatedImage imageUrl={selectedImage} boundingBoxes={boundingBoxes}></AnnotatedImage>
        </ul>
      )}
      <br></br>
      <br></br>
      <EpisodeCarousel images={images}></EpisodeCarousel>
      <br></br>
      <br></br>
    </main>
  );
};

export default XSearch;
