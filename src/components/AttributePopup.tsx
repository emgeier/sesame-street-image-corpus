import React from 'react';
import type { Schema } from "../../amplify/data/resource";
import "./attributedetails.css"

interface AttributePopupProps {
  annotation: Schema["Annotation"]["type"];
  onClose: () => void;
}

const AttributePopup: React.FC<AttributePopupProps> = ({ annotation, onClose }) => {
  const renderDetails = () => {
    const entries = Object.entries(annotation);
    return entries.map(([key, value]) => {
      console.log("key is: " + key);
      console.log("value is: " + value);
      if (key === 'imageUrl'|| key === 'createdAt' || key === 'updatedAt' || key === 'keywords' || key === 'attributes'){return}

      if (value === true || value === 0 || value === 'TRUE' || (value && typeof value !== 'object' && value.toString().trim() !== '') ) {
        if( key === 'noun'){value = 'proper noun';}
        return (
          <ul key={key}>
            <strong>{key}:</strong> {value.toString()}
          </ul>
        );
      }

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
          <button className= "attribute-button" onClick={onClose}>Close</button>
        </div>
        </div>
      </div>
    </div>
  );
};


export default AttributePopup;
