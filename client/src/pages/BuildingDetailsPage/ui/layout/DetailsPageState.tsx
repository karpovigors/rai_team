import React from 'react';

interface DetailsPageStateProps {
  message: string;
}

export const DetailsPageState: React.FC<DetailsPageStateProps> = ({ message }) => (
  <div className="details-page">
    <main className="details-main">{message}</main>
  </div>
);
