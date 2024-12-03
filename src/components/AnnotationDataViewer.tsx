import React from "react";
import { Schema } from "../../amplify/data/resource";

interface AnnotationDataViewerProps {
  annotations: Array<Schema["Annotation"]["type"]>;
}

const AnnotationDataViewer: React.FC<AnnotationDataViewerProps> = ({ annotations }) => {
  if (annotations.length === 0) {
    return <p>No data to display.</p>;
  }

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
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginTop: "20px",
      }}
    >
      <div
        style={{
          width: "95%", // Slightly narrower table
          maxWidth: "900px", // Cap width to avoid being too wide
          maxHeight: "600px", // Restrict the height
          overflowY: "auto", // Allow vertical scrolling
          border: "1px solid #ddd", // Add a border for visibility
          borderRadius: "8px", // Rounded corners for a polished look
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Subtle shadow for depth
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "auto",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  padding: "10px",
                  textAlign: "center",
                  borderBottom: "1px solid #ddd",
                  whiteSpace: "nowrap",
                }}
              >
                Image
              </th>
              <th
                style={{
                  padding: "10px",
                  textAlign: "center",
                  borderBottom: "1px solid #ddd",
                  whiteSpace: "nowrap",
                }}
              >
                Annotation
              </th>
              {attributeHeaders.map((header) => (
                <th
                  key={header}
                  style={{
                    padding: "10px",
                    textAlign: "center",
                    borderBottom: "1px solid #ddd",
                    whiteSpace: "nowrap",
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {annotations.map((annotation) => (
              <tr key={`${annotation.image_id}-${annotation.annotation_id}`}>
                <td
                  style={{
                    padding: "10px",
                    textAlign: "center",
                    borderBottom: "1px solid #ddd",
                    whiteSpace: "nowrap",
                  }}
                >
                  {annotation.image_id}
                </td>
                <td
                  style={{
                    padding: "10px",
                    textAlign: "center",
                    borderBottom: "1px solid #ddd",
                    whiteSpace: "nowrap",
                  }}
                >
                  {annotation.annotation_id}
                </td>
                {attributeHeaders.map((key) => {
                  const value = renderAttributeValue(annotation, key);
                  return (
                    <td
                      key={`${annotation.image_id}-${annotation.annotation_id}-${key}`}
                      style={{
                        padding: "10px",
                        textAlign: "center",
                        borderBottom: "1px solid #ddd",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {value !== null ? value : ""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export default AnnotationDataViewer;
