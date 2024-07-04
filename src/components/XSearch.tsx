import React, { useState } from "react";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { getUrl } from 'aws-amplify/storage';

const XSearch: React.FC = () => {
  const client = generateClient<Schema>();
  
  const [annotations, setAnnotations] = useState<Array<Schema["Annotation"]["type"] & { imageUrl?: string }>>([]);
 
  const itemsPerPage = 5; // Items to display per page 
  const [currentPageIndex, setCurrentPageIndex] = useState(0); // Start at the first item
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedImage, setSelectedImage] = useState<string>("");
  const [images, setImages] = useState<Array<Schema["Image"]["type"] & { imageUrl?: string }>>([]);
  const [season, setSeason] = useState<number | undefined>(undefined);
  const [episodeNumber, setEpisodeNumber] = useState<number | undefined>(undefined);

  // Function to fetch URL for each image ID
  const fetchImageUrl = async (imageId: string): Promise<string | undefined> => {
    try {
      const result = await getUrl({ path: `dev/${imageId}` });
      return result.url.href;
    } catch (error) {
      console.error(`Failed to fetch URL for image ID: ${imageId}`, error);
      return undefined;
    }
  };

  // Function to fetch annotation data from DynamoDB based on image chosen
  const fetchAnnotations = async () => {
    setAnnotations([]); // Clear current annotations before fetching new results
    try {
        if(!selectedImage){return;}

      const result: any = await client.models.Annotation.list({
        filter: { image_id: { eq: selectedImage } },
        limit: 20, // Fetch 20 items
      });

      // Fetch image URLs for each annotation
      const annotationsWithUrls = await Promise.all(result.data.map(async (annotation: any) => {
        const imageUrl = await fetchImageUrl(annotation.image_id);
        return { ...annotation, imageUrl };
      }));

      setAnnotations(annotationsWithUrls);
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
      console.log(result);
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
  const handleImageClick = (e: string) => {
    const fullImageId = "S"+String(season)+"-E"+String(season) +String(episodeNumber)+"_" + e + ".png"
    console.log("photo_id: " + fullImageId)
    setSelectedImage((fullImageId));
    fetchAnnotations();
  };

  const handleNextPage = () => {
    if (currentPageIndex < annotations.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  return (
    <main>
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
              <ul key={`${image.episode_id}-${image.image_id}`} onClick={() => handleImageClick(image.image_id)}>
                {image.imageUrl && <img src={image.imageUrl} style={{ maxWidth: '200px', height: 'auto', cursor: 'pointer' }} />}
                </ul>
          ))}
        </ul>
      )}
      <div className="page-buttons">
        <button onClick={handlePreviousPage} disabled={currentPageIndex === 0 || loading}>Previous</button>
        <button onClick={handleNextPage} disabled={currentPageIndex >= annotations.length - 1 || loading}>Next</button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
            <h4>Annotations</h4>
          {annotations.slice(currentPageIndex, currentPageIndex + itemsPerPage).map((note) => (
              <li key={`${note.annotation_id}-${note.image_id}`}>
                <strong>Category: {note.category}</strong>
                </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default XSearch;
