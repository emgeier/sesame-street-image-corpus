import React from "react";
import { Schema } from "../../amplify/data/resource";

interface AnnotationDataViewerProps {
  annotations: Array<Schema["Annotation"]["type"]>;
}

const AnnotationDataViewer: React.FC<AnnotationDataViewerProps> = ({ annotations }) => {
  if (annotations.length === 0) {
    return <p>No data to display.</p>;
  }
  // Helper function to capitalize the first letter of a string, maybe?
// const capitalizeFirstLetter = (str: string) => {
//   return str.charAt(0).toUpperCase() + str.slice(1);
// };

  // Collect all unique attribute keys from all annotations, excluding "other" values
  const uniqueAttributes = new Set<string>();
  annotations.forEach((annotation) => {
    if (annotation.attributes && typeof annotation.attributes === "string") {
      try {
        const attributes = JSON.parse(annotation.attributes);
        Object.entries(attributes).forEach(([key, value]) => {
          if (value !== "other" && !key.startsWith("single") && value ) { // Exclude keys with value "other" and the single-letter and single-digit keys
            uniqueAttributes.add(key);
          }
        });
      } catch (e) {
        console.error("Error parsing attributes JSON", e);
      }
    }
  });

  const attributeHeaders = Array.from(uniqueAttributes);

  const renderAttributeValue = (annotation: Schema["Annotation"]["type"], key: string) => {
    if (annotation.attributes && typeof annotation.attributes === "string") {
      try {
        const attributes = JSON.parse(annotation.attributes);
        const value = attributes[key];

        // Skip rendering if the value is "other"
        if (value === "other") return null;

        // Format value based on type
        if (typeof value === "object") return JSON.stringify(value);
        if (typeof value === "boolean") return value ? "true" : "false";
        return value !== null && value !== undefined ? value.toString() : "";
      } catch (e) {
        console.error("Error parsing attributes JSON", e);
      }
    }
    return "";
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", overflowX: "auto"}}>
      <h3>Annotations Data </h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ padding: "10px", minWidth: "100px", textAlign: "center", borderBottom: "1px solid #ddd" }}>Image</th>
            <th style={{ padding: "10px", minWidth: "100px", textAlign: "center", borderBottom: "1px solid #ddd" }}>Annotation</th>
            {attributeHeaders.map((header) => (
              <th
                key={header}
                style={{
                  padding: "10px",
                  minWidth: "120px", // Adjust as needed for wider columns
                  textAlign: "center", // Center-align the header text
                  borderBottom: "1px solid #ddd",
                  whiteSpace: "nowrap" // Prevent header text from wrapping
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {annotations.map((annotation) => (
            <tr key={annotation.annotation_id}>
              <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #ddd" }}>{annotation.image_id}</td>
              <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #ddd" }}>{annotation.annotation_id}</td>
              {attributeHeaders.map((key) => {
                const value = renderAttributeValue(annotation, key);
                return (
                  <td key={`${annotation.annotation_id}-${key}`} style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #ddd" }}>
                    {value !== null ? value : ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AnnotationDataViewer;
