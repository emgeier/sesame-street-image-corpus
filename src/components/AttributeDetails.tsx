import React from 'react';
import type { Schema } from "../../amplify/data/resource";
import './attributedetails.css'; // Import the CSS file

const AttributeDetails: React.FC<{ annotations: Array<Schema["Annotation"]["type"]> }> = ({ annotations }) => {
  const renderDetails = (annotation: Schema["Annotation"]["type"]) => {
    const entries = Object.entries(annotation);
    return entries.map(([key, value]) => {
      if (key === 'imageUrl' || key === 'createdAt' || key === 'updatedAt' || key === 'keywords' || key === 'attributes') return null;

      if (value === true || value === 0 || value === 'TRUE' || (value && typeof value !== 'object' && value.toString().trim() !== '')) {
        if (key === 'noun') value = 'proper noun';
        return (
          <tr key={key}>
            <td><strong>{key}</strong></td>
            <td>{value.toString()}</td>
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
