import './AccessibilityCard.css'
import type { ChangeEvent } from 'react'

const infrastructureTypes: string[] = [
  '',
  'Больница',
  'Театр',
  'МФЦ',
  'Салон красоты',
  'Школа',
  'Детский сад',
  'ВУЗ',
  'Торговый центр',
  'Супермаркет',
  'Ресторан',
  'Кафе',
  'Спортзал',
  'Бассейн',
  'Поликлиника',
  'Аптека',
  'Парк',
  'Стадион',
  'Кинотеатр',
  'Музей',
  'Библиотека',
  'Почта',
  'Банк',
  'Офис',
  'Гостиница',
  'Вокзал',
  'Аэропорт',
  'Станция метро',
  'Автобусная остановка',
]

export interface AccessibilityChecklist {
  signLanguage: boolean
  subtitles: boolean
  ramps: boolean
  braille: boolean
}

interface AccessibilityCardProps {
  title: string
  description: string
  checklist: AccessibilityChecklist
  infrastructureType: string
  onTitleChange: (event: ChangeEvent<HTMLInputElement>) => void
  onDescriptionChange: (event: ChangeEvent<HTMLTextAreaElement>) => void
  onChecklistChange: (field: keyof AccessibilityChecklist, value: boolean) => void
  onInfrastructureTypeChange: (event: ChangeEvent<HTMLSelectElement>) => void
}

function AccessibilityCard({
  title,
  description,
  checklist,
  infrastructureType,
  onTitleChange,
  onDescriptionChange,
  onChecklistChange,
  onInfrastructureTypeChange,
}: AccessibilityCardProps) {
  const handleCheckboxChange =
    (field: keyof AccessibilityChecklist) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      onChecklistChange(field, event.target.checked)
    }

  return (
    <div className="accessibility-card">
      <input
        type="text"
        className="accessibility-card__input"
        placeholder="Название объекта"
        value={title}
        onChange={onTitleChange}
      />
      <textarea
        className="accessibility-card__textarea"
        placeholder="Описание"
        value={description}
        onChange={onDescriptionChange}
        rows={3}
      />

      <div className="accessibility-card__checklist">
        <label className="accessibility-card__item">
          <input
            type="checkbox"
            checked={checklist.signLanguage}
            onChange={handleCheckboxChange('signLanguage')}
          />
          <span>Русский жестовый язык</span>
        </label>

        <label className="accessibility-card__item">
          <input
            type="checkbox"
            checked={checklist.subtitles}
            onChange={handleCheckboxChange('subtitles')}
          />
          <span>Субтитры</span>
        </label>

        <label className="accessibility-card__item">
          <input
            type="checkbox"
            checked={checklist.ramps}
            onChange={handleCheckboxChange('ramps')}
          />
          <span>Наличие пандусов</span>
        </label>

        <label className="accessibility-card__item">
          <input
            type="checkbox"
            checked={checklist.braille}
            onChange={handleCheckboxChange('braille')}
          />
          <span>Шрифт Брайля</span>
        </label>
      </div>

      <select
        className="accessibility-card__select"
        value={infrastructureType}
        onChange={onInfrastructureTypeChange}
      >
        {infrastructureTypes.map((type) => (
          <option key={type || 'empty'} value={type}>
            {type || '— Выберите тип инфраструктуры —'}
          </option>
        ))}
      </select>
    </div>
  )
}

export default AccessibilityCard
