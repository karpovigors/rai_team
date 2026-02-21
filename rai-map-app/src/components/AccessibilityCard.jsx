import { useState } from 'react'
import './AccessibilityCard.css'

const infrastructureTypes = [
  '', // Пустой вариант по умолчанию
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

function AccessibilityCard({ title, description, checklist, onTitleChange, onDescriptionChange, onChecklistChange, infrastructureType, onInfrastructureTypeChange, onPhotoUpload }) {
  const defaultChecklist = {
    signLanguage: false,      // Русский жестовый язык
    subtitles: false,         // Субтитры
    ramps: false,             // Наличие пандусов
    braille: false,           // Шрифт Брайля
  }

  const items = checklist || defaultChecklist
  const [selectedFile, setSelectedFile] = useState(null)

  const handleCheckboxChange = (field) => (e) => {
    if (onChecklistChange) {
      onChecklistChange(field, e.target.checked)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      if (onPhotoUpload) {
        onPhotoUpload(file)
      }
    }
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
            checked={items.signLanguage}
            onChange={handleCheckboxChange('signLanguage')}
          />
          <span>Русский жестовый язык</span>
        </label>

        <label className="accessibility-card__item">
          <input
            type="checkbox"
            checked={items.subtitles}
            onChange={handleCheckboxChange('subtitles')}
          />
          <span>Субтитры</span>
        </label>

        <label className="accessibility-card__item">
          <input
            type="checkbox"
            checked={items.ramps}
            onChange={handleCheckboxChange('ramps')}
          />
          <span>Наличие пандусов</span>
        </label>

        <label className="accessibility-card__item">
          <input
            type="checkbox"
            checked={items.braille}
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
        {infrastructureTypes.map((type, index) => (
          <option key={index} value={type}>
            {type || '— Выберите тип инфраструктуры —'}
          </option>
        ))}
      </select>

      <div className="accessibility-card__photo-section">
        <input
          id="photo-input"
          type="file"
          className="accessibility-card__file-input"
          accept="image/*"
          onChange={handleFileChange}
        />
        <label htmlFor="photo-input" className="accessibility-card__file-label">
          {selectedFile ? selectedFile.name : 'Выберите фото'}
        </label>
        {selectedFile && (
          <div className="accessibility-card__photo-preview">
            ✓ Фото готово к отправке
          </div>
        )}
      </div>
    </div>
  )
}

export default AccessibilityCard
