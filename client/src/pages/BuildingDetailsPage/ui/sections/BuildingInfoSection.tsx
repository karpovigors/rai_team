import React from 'react';
import { MapComponent } from '../../../../components/MapComponent';
import type { BuildingDetails } from '../../model/types';

interface BuildingInfoSectionProps {
  building: BuildingDetails;
  accessibility: string[];
  isEditMode: boolean;
  editCoordinates: [number, number] | null;
  editMapAddress: string;
  coordinates: [number, number] | null;
  address: string;
  onMapClick: (coords: [number, number]) => void;
}

export const BuildingInfoSection: React.FC<BuildingInfoSectionProps> = ({
  building,
  accessibility,
  isEditMode,
  editCoordinates,
  editMapAddress,
  coordinates,
  address,
  onMapClick,
}) => {
  const selectedCoordinates = isEditMode ? editCoordinates : coordinates;
  const yandexRouteUrl = selectedCoordinates
    ? `https://yandex.ru/maps/?rtext=~${selectedCoordinates[0]},${selectedCoordinates[1]}&rtt=auto`
    : null;

  return (
    <div className="info-grid">
    <div className="info-left">
      <ul>
        <li>{building.schedule}</li>
        <li>{building.address}</li>
        <li>{building.metros.join(', ')}</li>
        {building.upcoming_event && <li><strong>Событие:</strong> {building.upcoming_event}</li>}
        {building.discount_info && <li><strong>Скидка:</strong> {building.discount_info}</li>}
      </ul>
      <p className="description">{building.description}</p>
    </div>
    <div className="info-right">
      <img src={building.image_url} alt={building.title} className="building-image" />
      <ul className="accessibility-list">
        {accessibility.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
    <div className="info-right-map">
      <div className="building-map-container">
        <MapComponent
          onMapClick={onMapClick}
          selectedFeature={selectedCoordinates ? { geometry: { coordinates: selectedCoordinates } } : null}
          placemarkPreset={isEditMode ? 'islands#blueCircleIcon' : 'islands#blueStretchyIcon'}
          placemarkDraggable={isEditMode}
          selectedPlacemarkProperties={
            !isEditMode && yandexRouteUrl
              ? {
                  hintContent: 'Добраться',
                  iconCaption: 'Добраться',
                  balloonContent: `<a href="${yandexRouteUrl}" target="_blank" rel="noopener noreferrer">Добраться в Яндекс Картах</a>`,
                }
              : undefined
          }
          autoOpenSelectedBalloon={!isEditMode}
        />
        {isEditMode ? (
          editCoordinates && (
            <div className="building-map-coordinates">
              <strong>Координаты:</strong> {editCoordinates[0].toFixed(6)}, {editCoordinates[1].toFixed(6)}
              {editMapAddress && (
                <div className="building-map-address">
                  <strong>Адрес:</strong> {editMapAddress}
                </div>
              )}
            </div>
          )
        ) : coordinates && (
          <div className="building-map-coordinates">
            <strong>Координаты:</strong> {coordinates[0].toFixed(6)}, {coordinates[1].toFixed(6)}
            {address && (
              <div className="building-map-address">
                <strong>Адрес:</strong> {address}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
  );
};
