import React from 'react';

interface EditBuildingFormProps {
  editError: string;
  editTitle: string;
  editInfrastructureType: string;
  editSchedule: string;
  editMetros: string;
  editDescription: string;
  editSignLanguage: boolean;
  editSubtitles: boolean;
  editRamps: boolean;
  editBraille: boolean;
  isSavingEdit: boolean;
  isDeleting: boolean;
  onTitleChange: (value: string) => void;
  onInfrastructureTypeChange: (value: string) => void;
  onScheduleChange: (value: string) => void;
  onMetrosChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onImageChange: (file: File | null) => void;
  onSignLanguageChange: (value: boolean) => void;
  onSubtitlesChange: (value: boolean) => void;
  onRampsChange: (value: boolean) => void;
  onBrailleChange: (value: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete: () => void;
}

export const EditBuildingForm: React.FC<EditBuildingFormProps> = ({
  editError,
  editTitle,
  editInfrastructureType,
  editSchedule,
  editMetros,
  editDescription,
  editSignLanguage,
  editSubtitles,
  editRamps,
  editBraille,
  isSavingEdit,
  isDeleting,
  onTitleChange,
  onInfrastructureTypeChange,
  onScheduleChange,
  onMetrosChange,
  onDescriptionChange,
  onImageChange,
  onSignLanguageChange,
  onSubtitlesChange,
  onRampsChange,
  onBrailleChange,
  onSubmit,
  onDelete,
}) => (
  <form className="details-edit-form" onSubmit={onSubmit}>
    {editError && <div className="details-edit-error">{editError}</div>}
    <input placeholder="Название*" value={editTitle} onChange={(e) => onTitleChange(e.target.value)} required />
    <input
      placeholder="Тип (театр, кинотеатр...)"
      value={editInfrastructureType}
      onChange={(e) => onInfrastructureTypeChange(e.target.value)}
    />
    <input placeholder="Расписание" value={editSchedule} onChange={(e) => onScheduleChange(e.target.value)} />
    <input placeholder="Метро через запятую" value={editMetros} onChange={(e) => onMetrosChange(e.target.value)} />
    <textarea
      placeholder="Описание"
      value={editDescription}
      onChange={(e) => onDescriptionChange(e.target.value)}
      rows={4}
    />
    <input
      type="file"
      accept="image/*"
      onClick={(e) => {
        e.currentTarget.value = '';
      }}
      onChange={(e) => onImageChange(e.target.files?.[0] || null)}
    />
    <div className="details-edit-checklist">
      <label><input type="checkbox" checked={editSignLanguage} onChange={(e) => onSignLanguageChange(e.target.checked)} />Жестовый язык</label>
      <label><input type="checkbox" checked={editSubtitles} onChange={(e) => onSubtitlesChange(e.target.checked)} />Субтитры</label>
      <label><input type="checkbox" checked={editRamps} onChange={(e) => onRampsChange(e.target.checked)} />Пандусы</label>
      <label><input type="checkbox" checked={editBraille} onChange={(e) => onBrailleChange(e.target.checked)} />Брайль</label>
    </div>
    <div className="details-edit-actions">
      <button type="submit" disabled={isSavingEdit || isDeleting}>
        {isSavingEdit ? 'Сохранение...' : 'Сохранить изменения'}
      </button>
      <button
        type="button"
        className="details-delete-button"
        onClick={onDelete}
        disabled={isSavingEdit || isDeleting}
      >
        {isDeleting ? 'Удаление...' : 'Удалить объект'}
      </button>
    </div>
  </form>
);
