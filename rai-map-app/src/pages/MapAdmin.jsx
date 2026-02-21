import { useState } from 'react'
import Header from '/src/components/Header'
import MapComponent from '/src/components/MapComponent'
import AccessibilityCard from '/src/components/AccessibilityCard'
import './MapAdmin.css'

function MapAdmin() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [coordinates, setCoordinates] = useState(null)
  const [selectedObject, setSelectedObject] = useState(null)
  const [selectedFeature, setSelectedFeature] = useState(null)
  const [checklist, setChecklist] = useState({
    signLanguage: false,
    subtitles: false,
    ramps: false,
    braille: false,
  })
  const [infrastructureType, setInfrastructureType] = useState('')
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState('')

  const handleMapClick = (coords, clickedObject) => {
    setCoordinates(coords)
    setSelectedObject(clickedObject)
    setAddress('') // Сбрасываем адрес при новом клике

    if (clickedObject) {
      setTitle(clickedObject.properties?.name || '')
    }
    
    // Получаем адрес по координатам
    fetchAddress(coords)
  }

  // Функция для установки метки из Feature объекта (body из ymapsbm1://)
  const setFeatureFromData = (featureData) => {
    // featureData - это массив с одним объектом или сам объект
    const feature = Array.isArray(featureData) ? featureData[0] : featureData
    setSelectedFeature(feature)
    
    if (feature?.properties?.name) {
      setTitle(feature.properties.name)
    }
  }

  // Получение адреса по координатам (reverse geocoding)
  const fetchAddress = async (coords) => {
    try {
      // coords приходит в порядке [широта, долгота], а для геокодинга нужно [долгота, широта]
      const [lat, lon] = coords
      const response = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?apikey=47c62267-b242-42c9-9937-1505fa4e1b24&geocode=${lon},${lat}&format=json&lang=ru_RU`
      )
      
      if (!response.ok) {
        throw new Error('Ошибка получения адреса')
      }
      
      const data = await response.json()
      const feature = data.response.GeoObjectCollection?.featureMember?.[0]?.GeoObject
      const addressName = feature?.name
      const description = feature?.description
      
      if (addressName || description) {
        setAddress([addressName, description].filter(Boolean).join(', '))
      } else {
        setAddress('Адрес не найден')
      }
    } catch (error) {
      console.error('Ошибка при получении адреса:', error)
      setAddress('')
    }
  }

  // Обновление чеклиста
  const updateChecklist = (field, value) => {
    setChecklist(prev => ({ ...prev, [field]: value }))
  }

  // Отправка данных на сервер
  const handleSubmit = async () => {
    if (!coordinates) {
      alert('Пожалуйста, выберите координаты')
      return
    }

    setLoading(true)

    const data = {
      title,
      description,
      infrastructureType,
      address,
      coordinates: {
        longitude: coordinates[1],
        latitude: coordinates[0],
      },
      checklist,
    }

    try {
      const response = await fetch('http://172.20.10.2:8000/api/objects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.status === 409) {
        alert('Такое место уже есть')
        setLoading(false)
        return
      }

      if (!response.ok) {
        throw new Error('Ошибка отправки данных')
      }

      const result = await response.json()
      console.log('Данные успешно отправлены:', result)
      alert('Объект успешно добавлен!')
    } catch (error) {
      console.error('Ошибка при отправке:', error)
      alert('Ошибка при отправке данных')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="map-admin-page">
      <Header />
      <div className='box-map'>
        <div className="map-side">
          <MapComponent 
            onMapClick={handleMapClick} 
            selectedFeature={selectedFeature}
          />
        </div>
        <div className="checklist-side">
          <AccessibilityCard
            title={title}
            description={description}
            onTitleChange={(e) => setTitle(e.target.value)}
            onDescriptionChange={(e) => setDescription(e.target.value)}
            checklist={checklist}
            onChecklistChange={updateChecklist}
            infrastructureType={infrastructureType}
            onInfrastructureTypeChange={(e) => setInfrastructureType(e.target.value)}
          />
          {coordinates && (
            <div className="coordinates-display">
              <strong>Координаты:</strong> {coordinates[0].toFixed(6)}, {coordinates[1].toFixed(6)}
              {address && (
                <div className="address-display">
                  <strong>Адрес:</strong> {address}
                </div>
              )}
              {selectedObject && (
                <div className="object-name">
                  <strong>Объект:</strong> {selectedObject.properties?.name}
                </div>
              )}
              <button
                className="submit-button"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Отправка...' : 'Отправить на сервер'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MapAdmin
