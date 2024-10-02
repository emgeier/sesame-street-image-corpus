import React from 'react';
import type { Schema } from "../../amplify/data/resource";
import "./attributedetails.css"

interface AttributePopupProps {
  annotation: Schema["Annotation"]["type"];
  onClose: () => void;
}

const AttributePopup: React.FC<AttributePopupProps> = ({ annotation, onClose }) => {
  // Render annotation details as table rows
  const renderDetails = () => {
    const entries = Object.entries(annotation);

    return entries.map(([key, value]) => {
      // Filter out unwanted fields
      if (key === 'imageUrl' || key === 'createdAt' || key === 'updatedAt' || key === 'keywords' || key === 'attributes' || 
        key === 'x' || key === 'y' || key == 'height' || key === 'width' || !value) {
        return null;
      }

      // Handle value types (e.g., boolean, numbers, etc.)
      let displayValue: string;
      if (typeof value === 'object') {
        displayValue = JSON.stringify(value);
      } else if (value === true || value === 'false' || value === 'TRUE' || value === 'FALSE') {
        displayValue = value ? 'true' : 'false';
      } else {
        displayValue = value !== null && value !== undefined ? value.toString() : '';
      }

      // Format specific fields if needed
      if (key === 'noun' && value === true) {
        displayValue = 'proper noun';
      }

      // Only render rows with valid data
      if (displayValue.trim() !== '') {
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
    <div className="popup">
      <div className="popup-content">
        <div className='attribute-details-container'>
          <div className="annotation-block">
            <table>
              <tbody>{renderDetails()}</tbody>
            </table>
            <button className="attribute-button" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttributePopup;
