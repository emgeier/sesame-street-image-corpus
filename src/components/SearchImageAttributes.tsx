import React, { useState, useEffect } from "react";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { getUrl } from "aws-amplify/storage";
import AnnotatedImage from "./AnnotatedImage";
import DownloadResults from "./DownloadResults";
import "./search.css";


interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  colorIndex: number;
  annotation: Schema["Annotation"]["type"];
}

const SearchImageAttributes: React.FC = () => {
  const client = generateClient<Schema>();

  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([]);
  const itemsPerPage = 12; // Items to display per page
  const [currentPageIndex, setCurrentPageIndex] = useState(0); // Start at the first item
  const [loading, setLoading] = useState<boolean>(false);
  const [searchMessage, setSearchMessage] = useState<string | null>(null); // State to hold the user message

  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedFullImageId, setSelectedFullImageId] = useState<string>("");

  const [images, setImages] = useState<Array<Schema["Image"]["type"] & { imageUrl?: string }>>([]);
  const [annotations, setAnnotations] = useState<Array<Schema["Annotation"]["type"] & { imageUrl?: string }>>([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");

  const [keywords, setKeywords] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<{ [key: string]: string[] }>({
    FACE: [],
    PLACE: [],
    NUMBER: [],
    WORD: []
  });

  const fetchSearchResultAnnotations = async (token: string | null = null) => {
    setLoading(true); // Set loading state
    const allAnnotations: any[] = [];

    try {
      for (const category of Object.keys(selectedCategories)) {
        if (selectedCategories[category].length > 0 || keywords.length > 0) {
          const filter: any = {
            and: [
              { category: { eq: category } },
              ...selectedCategories[category].map((attribute) => ({
                keywords: { contains: attribute }
              })),
              ...keywords.map((keyword) => ({ keywords: { contains: keyword } }))
            ],
          };

          const result: any = await client.models.Annotation.list({
            filter: filter.and.length ? filter : undefined,
            limit: 200,
            nextToken: token,
          });

          const annotationsWithUrls = await Promise.all(
            result.data.map(async (annotation: any) => {
              const imageUrl = await fetchImageUrl(annotation.image_id);
              return { ...annotation, imageUrl };
            })
          );

          allAnnotations.push(...annotationsWithUrls);
        }
      }

      setAnnotations(allAnnotations);
      const numberSearchResults = allAnnotations.length.toString();
      console.log(numberSearchResults);
      
      setSearchMessage(`Search results returned: ${numberSearchResults}`);
    } catch (error) {
      console.error("Failed to fetch annotations:", error);
      setSearchMessage("Failed to return search results for ${category}.");

    }
    setLoading(false); // Reset loading state
  };

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
      const updatedCategory = checked
        ? [...(prevCategories[category] || []), keyword]
        : prevCategories[category].filter((kw) => kw !== keyword);
      return { ...prevCategories, [category]: updatedCategory };
    });
  };

  const handleImageClick = (image: Schema["Image"]["type"] & { imageUrl?: string }) => {
    if (!image.imageUrl) return;
    const fullImageId = `S${image.season}-E${image.episode_id}_${image.image_id}.png`;
    setSelectedFullImageId(fullImageId);
    setSelectedImage(image.imageUrl);
  };

  const faceOptions = {
    species: ["human", "puppet", "animal", "other"],
    representation: ["real", "caricature", "other"],
    race: ["Asian", "American Indian/Alaska Native", "Black/African American", "Native Hawaiian/Other Pacific Islander","white","other"],
    age: ["infant","child", "teen","adult", "elderly", "other"],
    orientation: ["front-face", "side-profile", "other"],
    "camera angle": ["forward", "upward", "downward", "other"],
    clarity: ["clear", "blurry", "other"],
    visibility: ["full-view", "truncated", "occluded"]
    
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
    visibility: ["full-view", "truncated", "occluded"]
    
  };

  const wordOptions = {
    case: ["uppercase", "lowercase"],
    "single-letter": ["a", "b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"],
    "multi-letter": ["word", "nonword-pronounceable", "nonword-unpronounceable", "proper noun", "other"],
    language: ["English", "Spanish", "other"],
    clarity: ["clear", "blurry", "other"],
    visibility: ["full-view", "truncated", "occluded"]
    
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

  return (
    <main className="main-content">
      <div className="separator"></div>
      <h3>Annotation Search</h3>
      <div className="search-controls">
        <div className="checkbox-row">
          <h3>Faces</h3>
          {renderCheckboxes(faceOptions, 'FACE')}
        </div>
        <div className="checkbox-row">
          <h3>Places</h3>
          {renderCheckboxes(placeOptions, 'PLACE')}
        </div>
        <div className="checkbox-row">
          <h3>Numbers</h3>
          {renderCheckboxes(numberOptions, 'NUMBER')}
        </div>
        <div className="checkbox-row">
          <h3>Words</h3>
          {renderCheckboxes(wordOptions, 'WORD')}
        </div>
      </div>
      <button onClick={() => fetchSearchResultAnnotations()}>Search</button>
      {searchMessage && <p>{searchMessage}</p>} {/* Display the user message */}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <ul className="annotation-grid">
            {images
              .slice(currentPageIndex * itemsPerPage, currentPageIndex * itemsPerPage + itemsPerPage)
              .map((image) => (
                <li className="annotation-item" key={`${image.image_id}`} onClick={() => handleImageClick(image)}>
                  {image.imageUrl && (
                    <img src={image.imageUrl} style={{ maxWidth: "200px", height: "auto", cursor: "pointer" }} />
                  )}
                  <strong>Image:</strong> {image.image_id}
                </li>
              ))}
          </ul>
        </div>
      )}
      {selectedFullImageId && (
        <ul>
          <h4>Annotated Image</h4>
          <AnnotatedImage imageUrl={selectedImage} boundingBoxes={boundingBoxes} />
        </ul>
      )}
      <div><DownloadResults annotations={annotations} /></div>
    </main>
  );
};

export default SearchImageAttributes;
