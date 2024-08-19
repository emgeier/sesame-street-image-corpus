import React from 'react';
import type { Schema } from "../../amplify/data/resource";
import './attributedetails.css'; 

const AttributeDetails: React.FC<{ annotations: Array<Schema["Annotation"]["type"]> }> = ({ annotations }) => {
  const renderDetails = (annotation: Schema["Annotation"]["type"]) => {
    let attributes: { [key: string]: any } = {};
    
   // Check if attributes is a valid JSON string before parsing
   if (annotation.attributes && typeof annotation.attributes === 'string') {
    try {
      attributes = JSON.parse(annotation.attributes);
    } catch (e) {
      console.error("Error parsing attributes JSON", e);
    }
  }

    const entries = Object.entries(attributes);

    return entries.map(([key, value]) => {
      // Handle different types of values and convert to string
      let displayValue: string;
      if (typeof value === 'object') {
        displayValue = JSON.stringify(value);
      } else if (value === true || value === false) {
        displayValue = value ? 'true' : 'false';
      } else {
        displayValue = value !== null && value !== undefined ? value.toString() : '';
      }

      if (displayValue.trim() !== '') {
        if (key === 'noun') displayValue = 'proper noun';
        return (
          <tr key={key}>
            <td><strong>{key}</strong></td>
            <td>{displayValue}</td>
          </tr>
        );
      }
      return null;
    });
  };

  return (
    <div className="attribute-details-container">
      <h3>Annotations</h3>
      {annotations.map((annotation) => (
        <div key={annotation.annotation_id} className="annotation-block">
          <h4>Annotation {annotation.annotation_id}</h4>
          <table>
            <tbody>{renderDetails(annotation)}</tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default AttributeDetails;
