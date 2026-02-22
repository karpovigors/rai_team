import React from 'react';
import { MapComponent } from '../../../../components/MapComponent';
import type { BuildingDetails } from '../../model/types';

interface BuildingInfoSectionProps {
  building: BuildingDetails;
  accessibility: string[];
  isEditMode: boolean;
  isModerator: boolean;
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
  isModerator,
  editCoordinates,
  editMapAddress,
  coordinates,
  address,
  onMapClick,
}) => {
  const [isImageBroken, setIsImageBroken] = React.useState(false);
  const avoidStairs = true;

  React.useEffect(() => {
    setIsImageBroken(false);
  }, [building.image_url]);

  const selectedCoordinates = isEditMode ? editCoordinates : coordinates;
  const yandexRouteUrl = selectedCoordinates
    ? `https://yandex.ru/maps/?rtext=~${selectedCoordinates[0]},${selectedCoordinates[1]}&rtt=${avoidStairs ? 'pd' : 'auto'}`
    : null;
  const mapBalloonContent = !isEditMode && yandexRouteUrl
    ? `
      <div style="min-width:220px;max-width:280px;color:#111827;">
        <div style="font-weight:700;font-size:15px;line-height:1.25;margin-bottom:6px;">${building.title}</div>
        ${building.address ? `<div style="font-size:13px;color:#374151;margin-bottom:4px;">${building.address}</div>` : ''}
        ${building.schedule ? `<div style="font-size:12px;color:#6b7280;margin-bottom:8px;">${building.schedule}</div>` : ''}
        <a href="${yandexRouteUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;color:#2563eb;text-decoration:none;">Добраться в Яндекс Картах</a>
      </div>
    `
    : undefined;

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
      {!isEditMode && yandexRouteUrl && (
        <div className="details-route-panel">
          <a
            href={yandexRouteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="details-route-link"
          >
            Проложить маршрут
          </a>
          <small className="details-route-hint">
            Маршрут откроется в пешем режиме. В Яндекс Картах включите параметр «Избегать лестниц».
          </small>
        </div>
      )}
    </div>
    <div className="info-right">
      {building.image_url && !isImageBroken ? (
        <img
          src={building.image_url}
          alt={building.title}
          className="building-image"
          onError={() => setIsImageBroken(true)}
        />
      ) : (
        <div className="building-image-placeholder">Фото отсутствует</div>
      )}
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
          placemarkDraggable={isEditMode && isModerator}
          selectedPlacemarkProperties={
            !isEditMode && yandexRouteUrl
              ? {
                  hintContent: 'Добраться',
                  iconCaption: 'Добраться',
                  balloonContent: mapBalloonContent,
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
