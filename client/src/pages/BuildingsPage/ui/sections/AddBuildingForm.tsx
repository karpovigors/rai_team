import React from 'react';

interface AddBuildingFormProps {
  title: string;
  infrastructureType: string;
  schedule: string;
  address: string;
  metros: string;
  description: string;
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
  onLatitudeChange,
  onLongitudeChange,
  onSignLanguageChange,
  onSubtitlesChange,
  onRampsChange,
  onBrailleChange,
  onImageChange,
  onSubmit,
}) => (
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
