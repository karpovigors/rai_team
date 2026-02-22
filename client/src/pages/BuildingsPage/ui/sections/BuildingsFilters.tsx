import React from 'react';

interface BuildingsFiltersProps {
  searchQuery: string;
  selectedInfrastructureType: string;
  infrastructureTypes: string[];
  isModerator: boolean;
  isAddFormOpen: boolean;
  onOpenLearning: () => void;
  onSearchQueryChange: (value: string) => void;
  onInfrastructureTypeChange: (value: string) => void;
  onToggleAddForm: () => void;
}

export const BuildingsFilters: React.FC<BuildingsFiltersProps> = ({
  searchQuery,
  selectedInfrastructureType,
  infrastructureTypes,
  isModerator,
  isAddFormOpen,
  onOpenLearning,
  onSearchQueryChange,
  onInfrastructureTypeChange,
  onToggleAddForm,
}) => (
  <>
    <div className="search-container">
      <input
        type="text"
        placeholder="Поиск по названию"
        className="search-input"
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
      />
    </div>
    <div className="filter-buttons">
      <button
        type="button"
        className={!selectedInfrastructureType ? 'active' : ''}
        onClick={() => onInfrastructureTypeChange('')}
      >
        Все
      </button>
      {infrastructureTypes.map((type) => (
        <button
          type="button"
          key={type}
          className={selectedInfrastructureType === type ? 'active' : ''}
          onClick={() => onInfrastructureTypeChange(type)}
        >
          {type}
        </button>
      ))}
      <button type="button" onClick={onOpenLearning}>
        Обучение и советы
      </button>
      {isModerator && (
        <button type="button" onClick={onToggleAddForm}>
          {isAddFormOpen ? 'Скрыть форму' : 'Добавить объект'}
        </button>
      )}
    </div>
  </>
);
