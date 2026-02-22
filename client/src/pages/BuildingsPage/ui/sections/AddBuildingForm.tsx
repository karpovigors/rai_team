import React, { useEffect, useRef } from 'react';
import { MapComponent } from '../../../../components/MapComponent';
import {
  geocodeAddressToCoordinates,
  reverseGeocodeCoordinates,
} from '../../../BuildingDetailsPage/api/buildingDetailsApi';

interface AddBuildingFormProps {
  title: string;
  infrastructureType: string;
  schedule: string;
  address: string;
  metros: string;
  description: string;
  upcomingEvent: string;
  discountInfo: string;
  latitude: string;
  longitude: string;
  signLanguage: boolean;
  subtitles: boolean;
  ramps: boolean;
  braille: boolean;
  addError: string;
  isSubmitting: boolean;
  onTitleChange: (value: string) => void;
  onInfrastructureTypeChange: (value: string) => void;
  onScheduleChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onMetrosChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onUpcomingEventChange: (value: string) => void;
  onDiscountInfoChange: (value: string) => void;
  onLatitudeChange: (value: string) => void;
  onLongitudeChange: (value: string) => void;
  onSignLanguageChange: (value: boolean) => void;
  onSubtitlesChange: (value: boolean) => void;
  onRampsChange: (value: boolean) => void;
  onBrailleChange: (value: boolean) => void;
  onImageChange: (file: File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AddBuildingForm: React.FC<AddBuildingFormProps> = ({
  title,
  infrastructureType,
  schedule,
  address,
  metros,
  description,
  upcomingEvent,
  discountInfo,
  latitude,
  longitude,
  signLanguage,
  subtitles,
  ramps,
  braille,
  addError,
  isSubmitting,
  onTitleChange,
  onInfrastructureTypeChange,
  onScheduleChange,
  onAddressChange,
  onMetrosChange,
  onDescriptionChange,
  onUpcomingEventChange,
  onDiscountInfoChange,
  onLatitudeChange,
  onLongitudeChange,
  onSignLanguageChange,
  onSubtitlesChange,
  onRampsChange,
  onBrailleChange,
  onImageChange,
  onSubmit,
}) => {
  const parsedLatitude = Number(latitude);
  const parsedLongitude = Number(longitude);
  const hasCoordinates = Number.isFinite(parsedLatitude) && Number.isFinite(parsedLongitude);
  const isProgrammaticAddressUpdateRef = useRef(false);

  useEffect(() => {
    if (!address.trim() || isProgrammaticAddressUpdateRef.current) {
      isProgrammaticAddressUpdateRef.current = false;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void (async () => {
        try {
          const coords = await geocodeAddressToCoordinates(address);
          if (!coords) {
            return;
          }
          onLatitudeChange(coords[0].toFixed(6));
          onLongitudeChange(coords[1].toFixed(6));
        } catch {
          // адрес остался как есть, координаты не меняем
        }
      })();
    }, 700);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [address, onLatitudeChange, onLongitudeChange]);

  return (
    <form className="moderator-inline-form" onSubmit={onSubmit}>
      {addError && <div className="moderator-inline-error">{addError}</div>}
      <input
        placeholder="Название*"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        required
      />
      <input
        placeholder="Тип (театр, кинотеатр...)"
        value={infrastructureType}
        onChange={(e) => onInfrastructureTypeChange(e.target.value)}
      />
      <input
        placeholder="Адрес*"
        value={address}
        onChange={(e) => onAddressChange(e.target.value)}
        required
      />
      <input
        placeholder="Расписание"
        value={schedule}
        onChange={(e) => onScheduleChange(e.target.value)}
      />
      <input
        placeholder="Метро через запятую"
        value={metros}
        onChange={(e) => onMetrosChange(e.target.value)}
      />
      <textarea
        placeholder="Описание"
        rows={4}
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
      />
      <input
        placeholder="Предстоящее событие (опционально)"
        value={upcomingEvent}
        onChange={(e) => onUpcomingEventChange(e.target.value)}
      />
      <input
        placeholder="Скидка (опционально)"
        value={discountInfo}
        onChange={(e) => onDiscountInfoChange(e.target.value)}
      />

      <div className="moderator-inline-map">
        <MapComponent
          selectedFeature={hasCoordinates ? { geometry: { coordinates: [parsedLatitude, parsedLongitude] } } : null}
          onMapClick={(coords) => {
            void (async () => {
              onLatitudeChange(coords[0].toFixed(6));
              onLongitudeChange(coords[1].toFixed(6));

              try {
                const fullAddress = await reverseGeocodeCoordinates(coords);
                if (!fullAddress) {
                  return;
                }
                isProgrammaticAddressUpdateRef.current = true;
                onAddressChange(fullAddress);
              } catch {
                // если геокодер недоступен, координаты уже выбраны
              }
            })();
          }}
        />
      </div>

      {hasCoordinates && (
        <div className="moderator-inline-coordinates">
          <strong>Выбранные координаты:</strong> {parsedLatitude.toFixed(6)}, {parsedLongitude.toFixed(6)}
        </div>
      )}

      <input
        placeholder="Широта (опционально)"
        value={latitude}
        onChange={(e) => onLatitudeChange(e.target.value)}
      />
      <input
        placeholder="Долгота (опционально)"
        value={longitude}
        onChange={(e) => onLongitudeChange(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        onClick={(e) => {
          e.currentTarget.value = '';
        }}
        onChange={(e) => onImageChange(e.target.files?.[0] || null)}
      />
      <div className="moderator-inline-checklist">
        <label><input type="checkbox" checked={signLanguage} onChange={(e) => onSignLanguageChange(e.target.checked)} />Жестовый язык</label>
        <label><input type="checkbox" checked={subtitles} onChange={(e) => onSubtitlesChange(e.target.checked)} />Субтитры</label>
        <label><input type="checkbox" checked={ramps} onChange={(e) => onRampsChange(e.target.checked)} />Пандусы</label>
        <label><input type="checkbox" checked={braille} onChange={(e) => onBrailleChange(e.target.checked)} />Брайль</label>
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Добавление...' : 'Сохранить объект'}
      </button>
    </form>
  );
};
