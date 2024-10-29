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
  const [singleLetter, setSingleLetter] = useState<string>(""); // New state for single letter search
  const subcategoryFieldMap: { [key: string]: string } = {
    "Camera angle": "angle",
    "Single letter": "singleletter",
    "Multi-letter": "multiletter"
  };

 const [selectedCategories, setSelectedCategories] = useState<{ [category: string]: { [subcategory: string]: string[] } }>({});

  const components = {
    Header: CustomHeader,
  };

  const fetchSearchResultAnnotations = async () => {
    try {
      const categoryAnnotationsMap: { [category: string]: { annotations: any[]; imageIds: Set<string> } } = {}; // Map to hold annotations and image IDs for each category
  
      // 1. Collect Annotations and Image IDs for Each Selected Category or only Single Letter Search or only bounding box search
      const hasSelectedCategories = Object.keys(selectedCategories).length > 0;
      const hasSingleLetter = singleLetter.trim() !== "";
      const hasBoundingBoxFilters = boxQueryX || boxQueryY || boxQueryHeight || boxQueryWidth;

      if (hasSelectedCategories || hasSingleLetter || hasBoundingBoxFilters) {
        //If it has single letter, add word category if not already added, use single letter in filter
        // Handle selected categories
        for (const category of Object.keys(selectedCategories)) {
          const subcategories = selectedCategories[category];
  
          // Build the filter for the current category
          const filter: any = {
            and: [],
          };
          const keywords: any = {
            and: [],
          };
          //If it has single letter, use single letter in filter
          if (hasSingleLetter && category=='WORD') {
            filter.and.push({content: {eq: singleLetter}});
            keywords.and.push({keywords: { contains: singleLetter }});    
            };

          // Add category filter
          filter.and.push({ category: { eq: category } });
          // Iterate over subcategories and their attributes
          for (const subcategory of Object.keys(subcategories)) {
            const attributes = subcategories[subcategory];
            const dbField = subcategoryFieldMap[subcategory] || subcategory.toLowerCase(); // Use mapped field or default to subcategory name

            // Add attribute filters for the subcategory
            if (attributes.length > 0) {
              attributes.forEach((attribute) => {
                if(attribute === 'proper noun'){
                  console.log("proper noun");
                  filter.and.push({ noun: { eq: true } });
                  keywords.and.push({keywords: { contains: 'proper' }});    
                } else if(subcategory === 'Visibility'){
                  filter.and.push({ visibility: { contains: attribute }})
                  keywords.and.push({keywords: { contains: attribute }});    
                } else {
                    // Apply the filter directly to the subcategory key (assuming the subcategory key corresponds to a field in the database)
                    filter.and.push({ [dbField]: { eq: attribute } });  
                    keywords.and.push({keywords: { contains: attribute }});    
                }
              });
            }
          }
          // Add bounding box filters if applicable
          if (boxQueryX !== null) {
            filter.and.push({ x: { ge: boxQueryX } });
          }
          if (boxQueryY !== null) {
            filter.and.push({ y: { ge: boxQueryY } });
          }
          if (boxQueryHeight !== null) {
            filter.and.push({ height: { le: boxQueryHeight } });
          }
          if (boxQueryWidth !== null) {
            filter.and.push({ width: { le: boxQueryWidth } });
          }
  
          // Query annotations for the current category
          let result: any = await client.models.Annotation.list({
            filter: filter,
            limit: 40000, // Adjust limit as needed
          });

        // If no results from the subcategory filter, fall back to keyword search
        if ((!result.data || result.data.length === 0) && keywords.length != 0 ) {
          result = await keywordSearch(keywords);
          console.log("No data from subcategory search. Performing keyword search...");
        }
  
          // Collect annotations and image IDs from the results
          const annotations = result.data;
          const imageIds = new Set<string>();
          annotations.forEach((annotation: any) => {
            imageIds.add(annotation.image_id);
          });
  
          // Store the annotations and image IDs in the map
          categoryAnnotationsMap[category] = { annotations, imageIds };
        }
        
        // Handle single letter search separately if other 'WORD' category attribute isn't selected
        if (hasSingleLetter && !selectedCategories['WORD']) {
          const filter: any = {
            and: [
              { category: { eq: 'WORD' } },
              { content: { eq: singleLetter } },
            ],
          };
  
          // Add bounding box filters if exist
          if (boxQueryX !== null) {
            filter.and.push({ x: { ge: boxQueryX } });
          }
          if (boxQueryY !== null) {
            filter.and.push({ y: { ge: boxQueryY } });
          }
          if (boxQueryHeight !== null) {
            filter.and.push({ height: { le: boxQueryHeight } });
          }
          if (boxQueryWidth !== null) {
            filter.and.push({ width: { le: boxQueryWidth } });
          }
  
          const result: any = await client.models.Annotation.list({
            filter: filter,
            limit: 40000, // Adjust limit as needed
          });
  
          // Collect annotations and image IDs from the results
          const annotations = result.data;
          const imageIds = new Set<string>();
          annotations.forEach((annotation: any) => {
            imageIds.add(annotation.image_id);
          });
  
          // Store the annotations and image IDs in the map under 'WORD' category
          categoryAnnotationsMap['WORD'] = { annotations, imageIds };
        }
        // Handle case where only bounding box parameters are provided
        if (!hasSelectedCategories && !hasSingleLetter && hasBoundingBoxFilters) {
          // Build the filter
          const filter: any = {
            and: [],
          };
          // Add bounding box filters if applicable
          if (boxQueryX !== null) {
            filter.and.push({ x: { ge: boxQueryX } });
          }
          if (boxQueryY !== null) {
            filter.and.push({ y: { ge: boxQueryY } });
          }
          if (boxQueryHeight !== null) {
            filter.and.push({ height: { le: boxQueryHeight } });
          }
          if (boxQueryWidth !== null) {
            filter.and.push({ width: { le: boxQueryWidth } });
          }
        // Query annotations with only bounding box filters
        const result: any = await client.models.Annotation.list({
          filter: filter,
          limit: 40000, // Adjust limit as needed
        });

        // Collect annotations and image IDs from the results
        const annotations = result.data;
        const imageIds = new Set<string>();
        annotations.forEach((annotation: any) => {
          imageIds.add(annotation.image_id);
        });

        // Store the annotations and image IDs in the map under a placeholder category
        categoryAnnotationsMap["ALL"] = { annotations, imageIds };
      }
  
        // 2. Compute the Intersection of Image IDs
        let finalImageIds: Set<string>;
  
        const categories = Object.keys(categoryAnnotationsMap);
        if (categories.length > 0) {
          // If multiple categories are selected, compute the intersection
          if (categories.length > 1) {
            finalImageIds = categoryAnnotationsMap[categories[0]].imageIds;
  
            for (let i = 1; i < categories.length; i++) {
              finalImageIds = new Set(
                [...finalImageIds].filter((imageId) => categoryAnnotationsMap[categories[i]].imageIds.has(imageId))
              );
            }
          } else {
            // If only one category or single letter is selected, use its image IDs
            finalImageIds = categoryAnnotationsMap[categories[0]].imageIds;
          }
          
        } else {
          setSearchMessage('No search criteria provided.');
          return;
        }
  
        // 3. Filter Annotations to Only Include Those from Final Image IDs
        const allAnnotations: any[] = [];
  
        if (finalImageIds.size > 0) {
          // For each category, filter annotations to only include those with image IDs in finalImageIds
          for (const category of categories) {
            const { annotations } = categoryAnnotationsMap[category];
  
            const filteredAnnotations = annotations.filter((annotation) => finalImageIds.has(annotation.image_id));
  
            // Fetch image URLs for filtered annotations
            const annotationsWithUrls = await Promise.all(
              filteredAnnotations.map(async (annotation: any) => {
                const imageUrl = await fetchImageUrl(annotation.image_id);
                return { ...annotation, imageUrl };
              })
            );
  
            allAnnotations.push(...annotationsWithUrls);
          }
        } else {
          setSearchMessage('No results found matching the search criteria.');
          return;
        }
  
        // 4. Update the State with Final Annotations
        setAnnotations(allAnnotations);
        const numberSearchResults = allAnnotations.length.toString();
        setSearchMessage(`Search results returned: ${numberSearchResults}`);
      } else {
        setSearchMessage('Please provide search criteria.');
      }
    } catch (error) {
      console.error('Failed to fetch annotations:', error);
      setSearchMessage('Failed to return search results.');
    }
  };
  // Keyword search in case the schema doesn't cover the selected items, fail-safe, more resource intensive

  const keywordSearch = async (keywords: any): Promise<any> => {
    try {
      // Query annotations with only keyword filter
      const result: any = await client.models.Annotation.list({
        filter: keywords,
        limit: 40000, // Adjust limit as needed
      });
      return result;
    } catch (error) {
      console.error(`Failed to fetch annotations for keywords: ${keywords}`, error);
    }
  };
  
  // Code retained in the event that we want to restore the visualization of the search in this component  
  const fetchImageUrl = async (imageId: string): Promise<string> => {
    try {
      const result = await getUrl({ path: `images/${imageId}` });
      return result.url.href;
    } catch (error) {
      console.error(`Failed to fetch URL for image ID: ${imageId}`, error);
      return ""; // Return an empty string or a placeholder URL
    }
  };

  const handleKeywordChange = (keyword: string, checked: boolean, category: string, subcategory: string) => {
    setSelectedCategories((prevCategories) => {
      // Initialize the category and subcategory if they don't exist
      const updatedCategory = prevCategories[category] ? { ...prevCategories[category] } : {};
      const updatedSubcategory = updatedCategory[subcategory] ? [...updatedCategory[subcategory]] : [];
  
      if (checked) {
        // Add the keyword if checked and it's not already in the list
        if (!updatedSubcategory.includes(keyword)) {
          updatedSubcategory.push(keyword);
        }
      } else {
        // Remove the keyword if unchecked
        const index = updatedSubcategory.indexOf(keyword);
        if (index > -1) {
          updatedSubcategory.splice(index, 1);
        }
      }
      // Update the category with the modified subcategory
      updatedCategory[subcategory] = updatedSubcategory;
  
      // Return the updated state
      return {
        ...prevCategories,
        [category]: updatedCategory,
      };
    });
  };
  
  const handleSingleLetterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSingleLetter(e.target.value); 
  };

  // These may need to be rendered dynamically eventually to make the search results dynamically include new attributes
  const faceOptions = {
    Species: ["human", "puppet", "animal", "other"],
    Representation: ["real", "caricature", "other"],
    Age: ["infant","child", "teen","adult", "elderly", "other"],
    Orientation: ["front-face", "side-profile", "other"],
    "Camera angle": ["forward", "upward", "downward", "other"],
    Clarity: ["clear", "blurry", "other"],
    Visibility: ["occluded", "truncated", "full-view", "other"],
    Race: ["Asian", "American Indian/Alaska Native", "Black/African American", "Native Hawaiian/Other Pacific Islander","white","other"],
    
  };

  const placeOptions = {
    Representation: ["real", "caricature", "other"],
    Orientation: ["cardinal", "oblique", "other"],
    Scope: ["close-up", "single", "multiple", "skyline", "other"],
    User: ["human", "animal", "other"],
    Function: ["domicile", "business", "attraction","institution","other"],
    Construction: ["house","row-house","apartment", "castle", "other"],
    Clarity: ["clear", "blurry", "other"],
    Visibility: ["occluded", "truncated", "full-view", "other"]
  };

  const numberOptions = {
    Number: ["multi-digit", "0","1","2","3","4","5","6","7","8","9"],
    Representation: ["non-symbolic", "symbolic"],
    Clarity: ["clear", "blurry", "other"],
    Visibility: ["occluded", "truncated", "full-view", "other"]
    
  };

  const wordOptions = {
    "Multi-letter": ["word", "nonword-pronounceable", "nonword-unpronounceable", "proper noun", "other"],
    Case: ["uppercase", "lowercase"],
    // "single-letter": ["a", "b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"],
    Language: ["English", "Spanish", "other"],
    Clarity: ["clear", "blurry", "other"],
    Visibility: ["occluded", "truncated", "full-view", "other"]
    
  };

  const renderCheckboxes = (options: { [key: string]: string[] }, category: string) => {
    return Object.keys(options).map((subcategory) => (
      <div key={subcategory} className="checkbox-category">
        <strong>{subcategory}:</strong>
        {options[subcategory].map((option) => (
          <label key={option} className="checkbox-label">
            <input
              type="checkbox"
              value={option}
              checked={selectedCategories[category]?.[subcategory]?.includes(option) || false}
              onChange={(e) => handleKeywordChange(option, e.target.checked, category, subcategory)}
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
    setSingleLetter(""); // Clear the single letter search
    
    // Clear the search results and message
    setAnnotations([]);
    setSearchMessage(null);
  };

  return (
    <Authenticator hideSignUp className="authenticator-popup" components={components}>
    {({  }) => (
    <main className="main-content">
      <div className="separator"></div>
      <h1 className="intro">Annotation Search</h1>

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
              {/* Single letter search input */}
            <div className="single-letter-container">
              <label htmlFor="single-letter"><strong>Single letter:</strong></label>
              <input
                type="text"
                id="single-letter"
                value={singleLetter}
                onChange={handleSingleLetterChange}
                placeholder="a"
              />
            </div>
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
          value={boxQueryX !== null ? boxQueryX : ""}
          onChange={handleBoxXLocationChange}
        /></div>
        <div >
        <label htmlFor="y-coordinate">y-coordinate of top left corner: </label>
        <input
          type="number"
          id="y-coordinate"
          placeholder="y"
          value={boxQueryY !== null ? boxQueryY : ""}
          onChange={handleBoxYLocationChange}
        /></div>
        <div>
        <label htmlFor="height">height: </label>
        <input
          type="number"
          id="height"
          placeholder="50"
          value={boxQueryHeight !== null ? boxQueryHeight : ""}
          onChange={handleBoxHeightLocationChange}
        /></div>
        <div >
          <label htmlFor="width">width: </label>
          <input
          type="number"
          id="width"
          value={boxQueryWidth !== null ? boxQueryWidth : ""}
          placeholder="100"
          onChange={handleBoxWidthLocationChange}
          />
        </div>
        <h5>Search for annotations within these parameters</h5>
        <div className="separator"></div>
        <Divider></Divider>
        <br/>
        <br/>
      </div>
      </div>
      <button onClick={() => fetchSearchResultAnnotations()}>Search</button>
      <button onClick={() => clearSearch()}>Clear Search</button>
      {searchMessage && <p>{searchMessage}</p>} {/* Display the user message for search result numbers */}
     
      <div><DownloadResults annotations={annotations} /></div>
      <br/>
      </main>
    )}
    </Authenticator>
  );
};

export default SearchImageAttributes;
