import React, { useState } from "react";
import { Schema } from "../../amplify/data/resource";

interface AnnotationDataViewerProps {
  annotations: Array<Schema["Annotation"]["type"]>;
}
// Helper function to capitalize the first letter of a string, maybe?
const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const AnnotationDataViewerToggle: React.FC<AnnotationDataViewerProps> = ({ annotations }) => {
  const [isTableVisible, setIsTableVisible] = useState<boolean>(false);

  if (annotations.length === 0) {
    return <p>No data to display.</p>;
  }

  const uniqueAttributes = new Set<string>();
  annotations.forEach((annotation) => {
    if (annotation.attributes && typeof annotation.attributes === "string") {
      try {
        const attributes = JSON.parse(annotation.attributes);
        Object.entries(attributes).forEach(([key, value]) => {
          if (value !== "other" && !key.startsWith("single") && value) {
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
        if (value === "other") return null;
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
    <div style={{ width: "100%", textAlign: "center", marginTop: "20px" }}>
      {/* Toggle Switch */}
      <div
        style={{
          display: "inline-block",
          marginBottom: "20px",
          textAlign: "left",
        }}
      >
        <span style={{ marginRight: "10px", fontWeight: "bold" }}>
          {isTableVisible ? "Hide Table" : "Show Table"}
        </span>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={isTableVisible}
            onChange={() => setIsTableVisible(!isTableVisible)}
          />
          <span className="slider"></span>
        </label>
      </div>

      {/* Conditionally Render Table */}
      {isTableVisible && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "1000px",
              maxHeight: "400px",
              overflowY: "auto",
              border: "1px solid #ddd",
              borderRadius: "2px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
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
                  <th
                    style={{
                      padding: "10px",
                      textAlign: "center",
                      borderBottom: "1px solid #ddd",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Category
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
                      {capitalizeFirstLetter(header)}
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
                        borderRight: "1px solid #ddd", // Add vertical line

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
                        borderRight: "1px solid #ddd", // Add vertical line

                        whiteSpace: "nowrap",
                      }}
                    >
                      {annotation.annotation_id}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        textAlign: "center",
                        borderBottom: "1px solid #ddd",
                        borderRight: "1px solid #ddd", // Add vertical line

                        whiteSpace: "nowrap",
                      }}
                    >
                      {annotation.category || ""}
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
                            borderRight: "1px solid #ddd", // Add vertical line

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
      )}
    </div>
  );
};

export default AnnotationDataViewerToggle;
