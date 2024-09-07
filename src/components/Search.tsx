import React, { useEffect, useState } from "react";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { getUrl } from 'aws-amplify/storage';
import AnnotatedImage from "./AnnotatedImage";
import AttributeDetails from "./AttributeDetails";
import { Authenticator } from "@aws-amplify/ui-react";
import CustomHeader from './CustomMessaging';

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  id: number;
  annotation: Schema["Annotation"]["type"];
}

const Search: React.FC = () => {
  const client = generateClient<Schema>();
  const [annotations, setAnnotations] = useState<Array<Schema["Annotation"]["type"] & { imageUrl?: string }>>([]);
  const [groupedAnnotations, setGroupedAnnotations] = useState<{ [key: string]: Array<Schema["Annotation"]["type"] & { imageUrl?: string }> }>({});
  const [selectedAnnotations, setSelectedAnnotations] = useState<Array<Schema["Annotation"]["type"] & { imageUrl?: string }>>([]);
  // const [searchMessage, setSearchMessage] = useState<string | null>(null); // State to hold the user message

  const [category, setCategory] = useState<string>("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const itemsPerPage = 12; // Items to display per page 
  const [currentPageIndex, setCurrentPageIndex] = useState(0); // Start at the first item
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([]);

  const components = {
    Header: CustomHeader,
  };

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

  // Function to fetch annotation data from DynamoDB based on search criteria
  const fetchAnnotations = async (token: string | null = null) => {
    setLoading(true); // Set loading state

    const filter: any = {
      and: []
    };

    if (category) {
      filter.and.push({ category: { eq: category } });
    }
    if (keywords.length > 0) {
      keywords.forEach((keyword) => {
        filter.and.push({ keywords: { contains: keyword } });
      });
    }
    

    // Remove the 'and' key if it's empty to avoid unnecessary empty filter
    if (filter.and.length === 0) {
      delete filter.and;
    }

    try {
      const result: any = await client.models.Annotation.list({
        filter: Object.keys(filter).length ? filter : undefined,
        limit: 40000,
        nextToken: token,
      });

      // Fetch image URLs for each annotation
      const annotationsWithUrls = await Promise.all(result.data.map(async (annotation: any) => {
        const imageUrl = await fetchImageUrl(annotation.image_id);
        return { ...annotation, imageUrl };
      }));

      setAnnotations(annotationsWithUrls);
      // Group annotations by image ID
      const grouped = annotationsWithUrls.reduce((acc, annotation) => {
        if (!acc[annotation.image_id]) {
          acc[annotation.image_id] = [];
        }
        acc[annotation.image_id].push(annotation);
        return acc;
      }, {} as { [key: string]: Array<Schema["Annotation"]["type"] & { imageUrl?: string }> });

      setGroupedAnnotations(grouped);
      // const numberSearchResults = Object.keys(grouped).length;
      // setSearchMessage(`Images found: ${numberSearchResults}`);
    } catch (error) {
      console.error("Failed to fetch annotations:", error);
    }
    setLoading(false); // Reset loading state
  };

  useEffect(() => {
    setAnnotations([]); // Clear previous annotations
    fetchAnnotations();
  }, [category, keywords]);

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(event.target.value);
    setCurrentPageIndex(0); // Reset to the first page
  };

  const handleKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeywords(event.target.value.split(' ').filter((word) => word.length > 0));
    setCurrentPageIndex(0); // Reset to the first page
  };
  const handleImageClick = (imageId: string) => {
    const selectedAnnotations = groupedAnnotations[imageId];
    setSelectedAnnotations(selectedAnnotations);
    if (!selectedAnnotations || selectedAnnotations.length === 0) return;

    setSelectedImageUrl(selectedAnnotations[0].imageUrl || "");
  
    const allBoundingBoxes: BoundingBox[] = selectedAnnotations.map((annotation) => {
      const polygon = typeof annotation.polygon === 'string' ? JSON.parse(annotation.polygon) : annotation.polygon;
      if (!Array.isArray(polygon) || polygon.length < 4) return null;

      const [x, y, width, height] = polygon;
      return {
        x: x,
        y: y,
        width: width - x, // Convert coordinates to width
        height: height - y, // Convert coordinates to height
        id: annotation.annotation_id,
        annotation: annotation,
      } as BoundingBox;
    }).filter(Boolean) as BoundingBox[];

    setBoundingBoxes(allBoundingBoxes);
  };

  const handleNextPage = () => {
    if (currentPageIndex < Math.ceil(annotations.length / itemsPerPage) - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  return (
    <Authenticator hideSignUp className="authenticator-popup" components={components}>
                    {({  }) => (
    <div>
      <main className='main-content'>
        <h2>Search</h2>
        <div className="search-controls">
      <div className="search-control">
        <label htmlFor="category">Category: </label>
        <select id="category" value={category} onChange={handleCategoryChange}>
          <option value="">All</option>
          <option value="FACE">Face</option>
          <option value="PLACE">Place</option>
          <option value="NUMBER">Number</option>
          <option value="WORD">Word</option>
        </select>
      </div>
      <div className="search-control">
        <label htmlFor="keywords">Keywords: </label>
        <input
          type="text"
          id="keywords"
          placeholder="puppet"
          onChange={handleKeywordChange}
        /></div>
        <div><p>For a list of keywords, see the tooltip. For a full explanation of the terms used in the SSIA see the Guide.</p></div>
          <div className="tooltip">
            <span>ℹ️</span>
            <div className="tooltiptext">
              Keywords: human, puppet, animal, infant, child, teen, adult, elderly, Asian, American Indian/Alaska Native, Black/African American, Native Hawaiian/Other Pacific Islander, white, occluded, truncated, oblique, cardinal, close-up, single, multiple, skyline, domicile, business, attraction, institution, single-letter, word, nonword, pronounceable, full-view, single-digit, multi-digit, uppercase, lowercase, house, row-house, apartment, castle,  clear, blurry, full-view, front-face, side-profile, forward, downward, upward, proper noun, real or caricature.
            </div>
          </div>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="annotation-grid-container">
          <ul className="annotation-grid">
            {Object.keys(groupedAnnotations).slice(currentPageIndex * itemsPerPage, currentPageIndex * itemsPerPage + itemsPerPage).map((imageId) => (
                <ul className="annotation-item" key={imageId} onClick={() => handleImageClick(imageId)}>
                {groupedAnnotations[imageId][0].imageUrl && (
                  <img src={groupedAnnotations[imageId][0].imageUrl} alt="Image" style={{ maxWidth: '180px', height: 'auto' }} />
                )}
              </ul>
            ))}
          </ul>
          </div>
        )}
        <div className="page-buttons">
          <button onClick={handlePreviousPage} disabled={currentPageIndex === 0 || loading}>Previous</button>
          <button onClick={handleNextPage} disabled={currentPageIndex * itemsPerPage + itemsPerPage >= annotations.length || loading}>Next</button>
        </div>
        {selectedImageUrl && (
          <div>
            <h4>Image: {selectedAnnotations[0].image_id}</h4>
            <AnnotatedImage imageUrl={selectedImageUrl} boundingBoxes={boundingBoxes} />
            <AttributeDetails annotations={selectedAnnotations}/>
          </div>
        )}
      </main>
    </div>
)}
</Authenticator>
  );
};

export default Search;
