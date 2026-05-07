import React from 'react';

export const Detective = ({ thought }) => {
  return (
    <div className="detective-float">
      <div className="speech-bubble">"{thought}"</div>
      <div className="detective-full-body" style={{backgroundImage: 'url(/detective_normal.png)'}}></div>
    </div>
  );
};
