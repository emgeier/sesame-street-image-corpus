import React, { useEffect, useState } from "react";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

import DownloadResults from "./DownloadResults";



const EpisodeSearch: React.FC = () => {
  const client = generateClient<Schema>();
  const [searchMessage, setSearchMessage] = useState<string | null>(null); // State to hold the user message

  
  // const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([]);
  // //Pagination
  // const itemsPerPage = 12; // Items to display per page 
  // const [currentPageIndex, setCurrentPageIndex] = useState(0); // Start at the first item


  // const [selectedImage, setSelectedImage] = useState<string>("");
  // const [selectedFullImageId, setSelectedFullImageId] = useState<string>("");

  const [images, setImages] = useState<Array<Schema["Image"]["type"] >>([]);
  const [allAnnotations, setSelectedAnnotations] = useState<Array<Schema["Annotation"]["type"]>>([]);

  const [episodeTitle, setTitle] = useState<string | undefined>(undefined);
  const [episodeNumber, setEpisodeNumber] = useState<string | undefined>(undefined);
  const [season, setSeason] = useState<number| undefined>(undefined);
  const [airYear, setAirYear] = useState<number| undefined>(undefined);


  // Function to fetch annotation data from DynamoDB based on images found
  const fetchAnnotations = async () => {
    
    try {

      if(!images){return;}
      const allAnnotationsTemp: Array<Schema["Annotation"]["type"]> = [];
      for (const image of images) {
        console.log(image.image_id);
        const fullImageId = concatenateImageIdForAnnotations(image);
        console.log(fullImageId);
        const result: any = await client.models.Annotation.list({
          filter: { image_id: { eq: "S48-E4833_00152.png" } }
        });

        if (result){console.log("results data: " + result.data + "length: "+ result.data.length);}
        if (result && result.data && result.data.length > 0) {
          console.log(`Fetched ${result.data.length} annotations for image_id ${fullImageId}`);
          allAnnotationsTemp.push(...result.data);
        } else {
          console.log(`No annotations found for image_id ${fullImageId}`);
        }
        // Use array to accumulate annotations

        
        // result.data.forEach((annotation: any) => {
        //       console.log(annotation);
        //       allAnnotations.push(annotation);
        //     }
        // );
 
      
      setSelectedAnnotations(allAnnotationsTemp);
      }
      
    } catch (error) {
      console.error("Failed to fetch annotations:", error);
    }
    

  };

  const fetchImagesTitle = async (episode_title: string) => {
    
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
      // if(result){
      // const withUrls = await Promise.all(result.data.map(async (image: any) => {
        
      //   console.log("Image id is : "+ image.image_id);
      //   const fullImageId = "S" + String(image.season)+"-E" +String(image.episode_id) +"_" +String(image.image_id) + ".png";
      //   console.log("Full image id is : "+ fullImageId);
      //   const imageUrl = await fetchImageUrl(fullImageId);
        
      //   return { ...image, imageUrl };
      // }));

      setImages(result.data);
      
      
    
    } catch (error) {
      console.error("Failed to fetch images:", error);
    }
    
  };
    // Function to fetch URL for each image ID
  // const fetchImageUrl = async (imageId: string): Promise<string> => {
  //   try {
  //     const result = await getUrl({ path: `dev/${imageId}` });
  //     return result.url.href;
  //   } catch (error) {
  //     console.error(`Failed to fetch URL for image ID: ${imageId}`, error);
  //     return ""; // Return an empty string or a placeholder URL
  //   }
  // };
  const fetchImagesEpisode = async (episode_number: string) => {
    setImages([]); // Clear current selections before fetching new results
    
    
    //This is simplified for a single api call, no next token logic-- assumes 200 images or less per episode. 
    
    try {
        const result: any = await client.models.Image.list({
            filter: { episode_id: { eq: episode_number } },
            limit: 200,
          });
      
          if (!result || !result.data) {
            throw new Error('No data returned from the API');
          }
      

      setImages(result.data);
      setSearchMessage("Search results: " + result.data.length);
    
    } catch (error) {
      console.error("Failed to fetch images:", error);
    }
    
  };
  const fetchImagesSeason = async (season: number) => {
    setImages([]); // Clear current selections before fetching new results
            // Clear other input fields

            
    
    //This is simplified for a single api call, no next token logic-- assumes 200 images or less per episode. 
    
    try {
        const result: any = await client.models.Image.list({
            filter: { season: { eq: season } },
            limit: 200,
          });
      
          if (!result || !result.data) {
            throw new Error('No data returned from the API');
          }


      setImages(result.data);
    
    } catch (error) {
      console.error("Failed to fetch images:", error);
    }
   
  };
  const fetchImagesAirYear = async (airYear: number) => {
    setImages([]); // Clear current selections before fetching new results
            // Clear other input fields

            
    
    //This is simplified for a single api call, no next token logic-- assumes 200 images or less per episode. 
    
    try {
        const result: any = await client.models.Image.list({
            filter: { air_year: { eq: airYear } },
            limit: 200,
          });
      
          if (!result || !result.data) {
            throw new Error('No data returned from the API');
          }

      setImages(result.data);
    
    } catch (error) {
      console.error("Failed to fetch images:", error);
    }
   
  };
  const concatenateImageIdForAnnotations = (image: Schema["Image"]["type"]) => {
    return "S" + String(image.season)+"-E" +String(image.episode_id) +"_" +String(image.image_id) + ".png";
  }

  const handleEpisodeRequest = () => {

    setSelectedAnnotations([]); // Clear previous annotations
    setSearchMessage(null); // Clear previous search messages

    if (episodeTitle) {
      fetchImagesTitle(episodeTitle);
    } else if (episodeNumber) {
      fetchImagesEpisode(episodeNumber);
    } else if (season) {
      fetchImagesSeason(season);
    } else if (airYear) {
      fetchImagesAirYear(airYear)
    }
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
    setAirYear(e.target.valueAsNumber);
    setTitle("")
    setEpisodeNumber("")
    setSeason(undefined)
  };

  useEffect(() => {
    if (images.length > 0) {
      fetchAnnotations();
    }
  }, [images]);
  


  return (
  <div className="main-content">
      <h2>Episode Search </h2>
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
        <div>
        {searchMessage && <p>{searchMessage}</p>} {/* Display the user message */}

        <div><DownloadResults annotations={allAnnotations} /></div>

</div>
</div>
  );
}; 

export default EpisodeSearch;
