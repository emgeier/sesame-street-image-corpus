import React, { useEffect, useState } from "react";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { getUrl } from 'aws-amplify/storage';

const Search: React.FC = () => {
  const client = generateClient<Schema>();
  const [annotations, setAnnotations] = useState<Array<Schema["Annotation"]["type"] & { imageUrl?: string }>>([]);
  const [category, setCategory] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const itemsPerPage = 5; // Items to display per page 
  const [currentPageIndex, setCurrentPageIndex] = useState(0); // Start at the first item
  const [loading, setLoading] = useState<boolean>(false);

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
  const fetchAnnotations = async () => {
    setLoading(true); // Set loading state
    
    const filter: any = {
      and: []
    };

    if (category) {
      filter.and.push({ category: { eq: category } });
    }
    if (keyword) {
      filter.and.push({ keywords: { contains: keyword } });
    }

    // Remove the 'and' key if it's empty to avoid unnecessary empty filter
    if (filter.and.length === 0) {
      delete filter.and;
    }

    try {
      const result: any = await client.models.Annotation.list({
        filter: Object.keys(filter).length ? filter : undefined,
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

  useEffect(() => {
    fetchAnnotations();
  }, [category, keyword]);

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(event.target.value);
    setCurrentPageIndex(0); // Reset to the first page
  };
  const handleKeywordChange = (event: string) => {
    setKeyword(event);
    setCurrentPageIndex(0); // Reset to the first page
    
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
    <div >
    <main>
      <div className='top-separator'></div>
      <h2>Search</h2>
      
      <div>
        <label htmlFor="category">Category: </label>
        <select id="category" value={category} onChange={handleCategoryChange}>
          <option value="">All</option>
          <option value="FACE">Face</option>
          <option value="PLACE">Place</option>
          <option value="NUMBER">Number</option>
          <option value="WORD">Word</option>
        </select>
      </div>
      <label htmlFor="attribute">Keyword: </label>
        <div className='input-container'>
            <input
              type="text"
              placeholder="puppet"
              onChange={(e) => handleKeywordChange(e.target.value)}
            />
          </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {annotations.slice(currentPageIndex, currentPageIndex + itemsPerPage).map((annotation) => (
            <ul key={`${annotation.image_id}-${annotation.annotation_id}`}>
              <strong>Category:</strong> {annotation.category}<br />
              <strong>Image Id:</strong> {annotation.image_id}<br />
              {annotation.imageUrl && <img src={annotation.imageUrl} alt="Image" style={{ maxWidth: '200px', height: 'auto' }} />}
            </ul>
          ))}
        </ul>
      )}
      <div className="page-buttons">
        <button onClick={handlePreviousPage} disabled={currentPageIndex === 0 || loading}>Previous</button>
        <button onClick={handleNextPage} disabled={currentPageIndex >= annotations.length - 1 || loading}>Next</button>
      </div>
    </main>
    <a href="/advsearch"><h2>Advanced Search</h2></a>
    </div>
  );
};

export default Search;