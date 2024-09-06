import React, { useState } from "react";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { getUrl } from "aws-amplify/storage";
import DownloadResults from "./DownloadResults";
import "./search.css";
import { Authenticator, Divider } from "@aws-amplify/ui-react";
import CustomHeader from "./CustomMessaging";

const SearchImageAttributes: React.FC = () => {
  const client = generateClient<Schema>();

  const [searchMessage, setSearchMessage] = useState<string | null>(null); // State to hold the user message
  const [annotations, setAnnotations] = useState<Array<Schema["Annotation"]["type"] & { imageUrl?: string }>>([]);
  const [boxQueryX, setBoxQueryX]= useState<number | null>(null); // 
  const [boxQueryY, setBoxQueryY]= useState<number | null>(null); // 
  const [boxQueryHeight, setBoxQueryHeight]= useState<number | null>(null); // 
  const [boxQueryWidth, setBoxQueryWidth]= useState<number | null>(null); // 
  const [keywords] = useState<string[]>([]);  

  const [selectedCategories, setSelectedCategories] = useState<{ [key: string]: string[] }>({
  }); 

  const components = {
    Header: CustomHeader,
  };

  const fetchSearchResultAnnotations = async (token: string | null = null) => {
    const allAnnotations: any[] = [];
    let nextToken: string | null = token;
    try {
      const filter: any = {
        and: []
      };
      if (boxQueryX) {
        filter.and.push({ x: { ge: boxQueryX } });
      }
      if (boxQueryY) {
        filter.and.push({ y: { ge: boxQueryY } });
      }
      if (boxQueryHeight) {
        filter.and.push({ height: { le: boxQueryHeight } });
      }
      if (boxQueryWidth) {
        filter.and.push({ width: { le: boxQueryWidth } });
      }
      //Set up for multiple category searches, but currently works for only one 
      for (const category of Object.keys(selectedCategories)) {
        if (selectedCategories[category].length > 0 || keywords.length > 0) {
         
          filter.and.push({ category: { eq: category } });
          
          selectedCategories[category].forEach((attribute) => {
            filter.and.push({ keywords: { contains: attribute } });
          });
          
        }
        
          const result: any = await client.models.Annotation.list({
            filter: filter.and.length ? filter : undefined,
            limit: 40000,
            nextToken: token,
          });

          //Currently urls will expire due to security requirements, eliminate ?

          const annotationsWithUrls = await Promise.all(
            result.data.map(async (annotation: any) => {
              const imageUrl = await fetchImageUrl(annotation.image_id);
              return { ...annotation, imageUrl };
            })
          );

          allAnnotations.push(...annotationsWithUrls);
      }
        setAnnotations(allAnnotations);
        const numberSearchResults = allAnnotations.length.toString();
        setSearchMessage(nextToken ? `Search results returned: ${numberSearchResults}. More results available.` : `Search results returned: ${numberSearchResults}`);
    
      } catch (error) {
        console.error("Failed to fetch annotations:", error);
        setSearchMessage("Failed to return search results.");
      }
    };
  // Code retained for if we want to restore the visualization of the search in this component  
  const fetchImageUrl = async (imageId: string): Promise<string> => {
    try {
      const result = await getUrl({ path: `dev/${imageId}` });
      return result.url.href;
    } catch (error) {
      console.error(`Failed to fetch URL for image ID: ${imageId}`, error);
      return ""; // Return an empty string or a placeholder URL
    }
  };

  const handleKeywordChange = (keyword: string, checked: boolean, category: string) => {
    setSelectedCategories((prevCategories) => {
      // If the checkbox is checked, add the keyword to the category array
      if (checked) {
        const updatedCategory = [...(prevCategories[category] || []), keyword];
        return { ...prevCategories, [category]: updatedCategory }; // Return the updated categories
      } else {
        // If unchecked, remove the keyword from the category array
        const updatedCategory = prevCategories[category].filter((kw) => kw !== keyword);
        
        // If the category is empty after removing the keyword, remove the category entirely
        if (updatedCategory.length === 0) {
          const { [category]: _, ...remainingCategories } = prevCategories; // Destructure to remove the category
          return remainingCategories; // Return the categories without the empty category
        }
  
        // Otherwise, return the updated categories with the modified category
        return { ...prevCategories, [category]: updatedCategory };
      }
    });
  };

  // These may need to be rendered dynamically eventually to make the search results dynamically include new attributes
  const faceOptions = {
    species: ["human", "puppet", "animal", "other"],
    representation: ["real", "caricature", "other"],
    age: ["infant","child", "teen","adult", "elderly", "other"],
    orientation: ["front-face", "side-profile", "other"],
    "camera angle": ["forward", "upward", "downward", "other"],
    clarity: ["clear", "blurry", "other"],
    visibility: ["occluded", "truncated", "full-view", "other"],
    race: ["Asian", "American Indian/Alaska Native", "Black/African American", "Native Hawaiian/Other Pacific Islander","white","other"],
    
  };

  const placeOptions = {
    representation: ["real", "caricature", "other"],
    orientation: ["cardinal", "oblique", "other"],

  
    scope: ["close-up", "single", "multiple", "skyline", "other"],
    user: ["human", "animal", "other"],
    function: ["domicile", "business", "attraction","institution","other"],
    construction: ["house","row-house","apartment", "castle", "other"],
    clarity: ["clear", "blurry", "other"],
    visibility: ["occluded", "truncated", "full-view", "other"]
  };

  const numberOptions = {
    number: ["multi-digit", "0","1","2","3","4","5","6","7","8","9"],
    representation: ["non-symbolic", "symbolic"],
    clarity: ["clear", "blurry", "other"],
    visibility: ["occluded", "truncated", "full-view", "other"]
    
  };

  const wordOptions = {
    case: ["uppercase", "lowercase"],
    "single-letter": ["a", "b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"],
    "multi-letter": ["word", "nonword-pronounceable", "nonword-unpronounceable", "proper noun", "other"],
    language: ["English", "Spanish", "other"],
    clarity: ["clear", "blurry", "other"],
    visibility: ["occluded", "truncated", "full-view", "other"]
    
  };

  const renderCheckboxes = (options: { [key: string]: string[] }, category: string) => {
    return Object.keys(options).map((key) => (
      <div key={key} className="checkbox-category">
        <strong>{key.toUpperCase()}:</strong>
        {options[key].map((option) => (
          <label key={option} className="checkbox-label">
            <input
              type="checkbox"
              value={option}
              onChange={(e) => handleKeywordChange(option, e.target.checked, category)}
            />
            {option}
          </label>
        ))}
      </div>
    ));
  };
  
  const handleBoxXLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBoxQueryX(parseInt(event.target.value));
    
  };
  const handleBoxYLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBoxQueryY(parseInt(event.target.value));
    
  };
  const handleBoxHeightLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBoxQueryHeight(parseInt(event.target.value));
    
  };
  const handleBoxWidthLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBoxQueryWidth(parseInt(event.target.value));
    
  };

  const clearSearch = () => {

    // Clear previous search criteria
    setSelectedCategories({});

    // Reset bounding box queries
    setBoxQueryX(null);
    setBoxQueryY(null);
    setBoxQueryHeight(null);
    setBoxQueryWidth(null);
    
    // Clear the search results and message
    setAnnotations([]);
    setSearchMessage(null);
  };

  return (
    <Authenticator hideSignUp className="authenticator-popup" components={components}>
    {({  }) => (
    <main className="main-content">
      <div className="separator"></div>
      <h3>Annotation Search</h3>
      <Divider></Divider>

      <div className="search-controls">
        <div className="checkbox-row">
        
          <h3>Faces</h3>
          {renderCheckboxes(faceOptions, 'FACE')}
        </div>
        <Divider></Divider>
        <div className="checkbox-row">
        
          <h3>Places</h3>
          {renderCheckboxes(placeOptions, 'PLACE')}
        </div>
        <Divider></Divider>

        <div className="checkbox-row">
          <h3>Numbers</h3>
          {renderCheckboxes(numberOptions, 'NUMBER')}
        </div>
        <Divider></Divider>

        <div className="checkbox-row">
          <h3>Words</h3>
          {renderCheckboxes(wordOptions, 'WORD')}
        </div>
        <Divider></Divider>
        <h3>Coordinates of Bounding Box</h3>
        <div >
        <div >
        <label htmlFor="x-coordinate">x-coordinate of top left corner: </label>
        <input
          type="number"
          id="x-coordinate"
          placeholder="x"
          onChange={handleBoxXLocationChange}
        /></div>
                <div >
        <label htmlFor="y-coordinate">y-coordinate of top left corner: </label>
        <input
          type="number"
          id="y-coordinate"
          placeholder="y"
          onChange={handleBoxYLocationChange}
        /></div>
        <div>
        <label htmlFor="height">height: </label>
        <input
          type="number"
          id="height"
          placeholder="50"
          onChange={handleBoxHeightLocationChange}
        /></div>
        <div >
          <label htmlFor="width">width: </label>
          <input
          type="number"
          id="width"
          placeholder="100"
          onChange={handleBoxWidthLocationChange}
          />
        </div>
        <h5>Search for annotations within these parameters</h5>
        <div className="separator"></div>
        <Divider></Divider>
      </div>
      </div>
      <button onClick={() => fetchSearchResultAnnotations()}>Search</button>
      <button onClick={() => clearSearch()}>Clear Search</button>
      {searchMessage && <p>{searchMessage}</p>} {/* Display the user message for search result numbers */}
      <div><DownloadResults annotations={annotations} /></div>
      </main>
    )}
    </Authenticator>
  );
};

export default SearchImageAttributes;
