import React, { useState , useEffect} from "react";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { getUrl } from 'aws-amplify/storage';
import AnnotatedImage from "./AnnotatedImage";

interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    colorIndex: number; 
  }

const XSearch: React.FC = () => {
  const client = generateClient<Schema>();
  
  const [annotations, setAnnotations] = useState<Array<Schema["Annotation"]["type"] >>([]);
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([]);
  const itemsPerPage = 5; // Items to display per page 
  const [currentPageIndex, setCurrentPageIndex] = useState(0); // Start at the first item
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedFullImageId, setSelectedFullImageId] = useState<string>("");

  const [images, setImages] = useState<Array<Schema["Image"]["type"] & { imageUrl?: string }>>([]);
  const [season, setSeason] = useState<number | undefined>(undefined);
  const [episodeNumber, setEpisodeNumber] = useState<number | undefined>(undefined);

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

  // Function to fetch annotation data from DynamoDB based on image chosen
  const fetchAnnotations = async () => {
    setAnnotations([]); // Clear current annotations before fetching new results
    try {
        console.log("full image id for finding annotations: "+selectedFullImageId);
        console.log("selected image url: "+selectedImage);

        if(!selectedImage){return;}

      const result: any = await client.models.Annotation.list({
        filter: { image_id: { eq: selectedFullImageId } },
        limit: 20, // Fetch 20 items
      });
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
                label: annotation.category,
                colorIndex: annotation.annotation_id // Set the color for bounding boxes
              };
              allBoundingBoxes.push(box);
              console.log("box: "+ JSON.stringify(box));
            }
          });
      setAnnotations(result.data);
      setBoundingBoxes(allBoundingBoxes);
      console.log("boundingBoxes: " + JSON.stringify(allBoundingBoxes));
    } catch (error) {
      console.error("Failed to fetch annotations:", error);
    }
    setLoading(false); // Reset loading state
  };

  const fetchImages = async (season: number, episode_number: number) => {
    setImages([]); // Clear current selections before fetching new results
    const episode_id: string = "S" + String(season) + "-E" + String(season) + String(episode_number);
    console.log(episode_id);
    try {
        const result: any = await client.models.Image.list({
            filter: { episode_id: { eq: episode_id } }
          });
      
          if (!result || !result.data) {
            throw new Error('No data returned from the API');
          }
      // Fetch image URLs for each annotation
      if(result){
      const withUrls = await Promise.all(result.data.map(async (image: any) => {
        const fullImageId = String(episode_id) +"_" +String(image.image_id) + ".png"
        console.log(fullImageId);
        const imageUrl = await fetchImageUrl(fullImageId);
        
        return { ...image, imageUrl };
      }));

      setImages(withUrls);
    }
    } catch (error) {
      console.error("Failed to fetch images:", error);
    }
    setLoading(false); // Reset loading state
  };

  const handleEpisodeRequest = () => {
    if (season && episodeNumber) {
      fetchImages(season, episodeNumber);
    }
  };

  const handleSeasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSeason(parseInt(e.target.value));
  };

  const handleEpisodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEpisodeNumber(parseInt(e.target.value));
  };
  const handleImageClick = (imageUrl: string | undefined, image_id: string | undefined) => {
    if (!imageUrl) return;
    console.log('image image_id: '+image_id);
    const fullImageId = `S${String(season)}-E${String(season)}${String(episodeNumber)}_${image_id}.png`;
    setSelectedFullImageId(fullImageId);
    console.log("full image id handle click: " + fullImageId);
    setSelectedImage(imageUrl);
    console.log("select image url handle click: " + selectedImage);

    
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
      <h2>Advanced Search </h2>
      <div>
        <label htmlFor="season">Season:</label>
        <input
          type="number"
          id="season"
          name="season"
          value={season || ''}
          onChange={handleSeasonChange}
        />
      </div>
      <div>
        <label htmlFor="episode">Episode:</label>
        <input
          type="number"
          id="episode"
          name="episode"
          value={episodeNumber || ''}
          onChange={handleEpisodeChange}
        />
      </div>
      <button onClick={handleEpisodeRequest}>Search</button>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {images.slice(currentPageIndex, currentPageIndex + itemsPerPage).map((image) => (
              <ul key={`${image.episode_id}-${image.image_id}`} onClick={() => handleImageClick(image.imageUrl, image.image_id)}>
                {image.imageUrl && <img src={image.imageUrl} style={{ maxWidth: '200px', height: 'auto', cursor: 'pointer' }} />}
                </ul>
          ))}
        </ul>
      )}
      <div className="page-buttons">
        <button onClick={handlePreviousPage} disabled={currentPageIndex === 0 || loading}>Previous</button>
        <button onClick={handleNextPage} disabled={currentPageIndex >= images.length - 1 || loading}>Next</button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
            <h4>Annotations</h4>
          {annotations.slice(currentPageIndex, currentPageIndex + itemsPerPage).map((note) => (
              <ul key={`${note.annotation_id}-${note.image_id}`}>
                <strong>Category: {note.category}</strong>
                <AnnotatedImage imageUrl={selectedImage} boundingBoxes={boundingBoxes}></AnnotatedImage>
                </ul>
          ))}
        </ul>
      )}
    </main>
  );
};

export default XSearch;
