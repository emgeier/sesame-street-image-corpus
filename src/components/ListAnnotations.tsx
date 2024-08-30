  
  import React from "react";
  interface ListAnnotationsProps {
    images: Array<{ [key: string]: any }>;
    annotations: Array<{[key:string]:any}>;
  }
  
  const ListAnnotations: React.FC<ListAnnotationsProps> = ({ images }) => {
  
    for(image:images) {
        fetchAnnotations();
    }
  // Function to fetch annotation data from DynamoDB based on image selected
    const fetchAnnotations = async () => {
    
    
        try {

      

        const result: any = await client.models.Annotation.list({
            filter: { image_id: { eq: selectedFullImageId.trim() } }
        });
            if (result){console.log("results data: " + result.data + "length: "+ result.data.length);}

        // Initialize an array to accumulate bounding boxes
        const allBoundingBoxes: BoundingBox[] = [];
        const allAnnotations: Array<Schema["Annotation"]["type"]> = [];
        result.data.forEach((annotation: any) => {
            
            const polygon = JSON.parse(annotation.polygon); // Parse the polygon string into an array of numbers


              allAnnotations.push(annotation);
            }
          });
 
 
      setSelectedAnnotations(allAnnotations);

    } catch (error) {
      console.error("Failed to fetch annotations:", error);
    }
    setLoading(false); // Reset loading state
  };
};

export default ListAnnotations;