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


  // Function to fetch annotation data from DynamoDB based on image selected
  const fetchAnnotations = async () => {
    
    setBoundingBoxes([]); // Clear current boxes before fetching new results
    try {

      if(!selectedImage){return;}

      const result: any = await client.models.Annotation.list({
        filter: { image_id: { eq: selectedFullImageId.trim() } }
      });
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
                label: annotation.category,
                colorIndex: annotation.annotation_id, // Set the color for bounding boxes
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

  const fetchImages = async (episode_title: string) => {
    
    setImages([]); // Clear current selections before fetching new result
    

    //This is simplified for a single api call, no next token logic-- assumes 200 images or less per episode. 
    
    try {
        const result: any = await client.models.Image.list({
            filter: { episode_title: { contains: episode_title } },
            limit: 200,
          });
      
          if (!result || !result.data) {
            throw new Error('No data returned from the API');
          }
      // Fetch image URLs for each image
      if(result){
      const withUrls = await Promise.all(result.data.map(async (image: any) => {
        
        console.log("Image id is : "+image.image_id);

        const imageUrl = await fetchImageUrl(image.image_id);
        
        return { ...image, imageUrl };
      }));

      setImages(withUrls);
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

  const handleEpisodeRequest = () => {
    if (episodeTitle) {
      fetchImages(episodeTitle);
    }
  };


  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleImageClick = (image :Schema["Image"]["type"]  & { imageUrl?: string }) => {
    if (!image.imageUrl) return;
 
    const fullImageId = `${image.image_id}`;
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
      <h2>Advanced Search </h2>
      <div className="search-controls">


      
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
                <strong>Image:</strong> {image.image_id}<br />
                </ul>
          ))}
        </ul>
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
    </main>
  );
};

export default XSearch;
