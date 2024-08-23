import React from 'react';
import { useEffect } from 'react';

const Metrics: React.FC = () => {
  useEffect(() => {
    window.location.href = "/ssic_analysis.html";
  }, []);

  return <div>Loading metrics...</div>;
};

export default Metrics;
