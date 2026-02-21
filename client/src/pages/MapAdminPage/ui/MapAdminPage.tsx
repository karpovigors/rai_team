import { useState } from 'react'
import {
  AccessibilityCard,
  type AccessibilityChecklist,
} from '../../../components/AccessibilityCard'
import { MapComponent } from '../../../components/MapComponent'
import './MapAdminPage.css'

interface Feature {
  geometry?: {
    coordinates?: [number, number]
  }
  properties?: {
    name?: string
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const buildApiUrl = (path: string): string => `${API_BASE_URL}${path}`

function MapAdminPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null)
  const [selectedObject, setSelectedObject] = useState<Feature | null>(null)
  const [selectedFeature] = useState<Feature | null>(null)
  const [checklist, setChecklist] = useState<AccessibilityChecklist>({
    signLanguage: false,
    subtitles: false,
    ramps: false,
    braille: false,
  })
  const [infrastructureType, setInfrastructureType] = useState('')
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState('')

  const fetchAddress = async (coords: [number, number]) => {
    try {
      const [lat, lon] = coords
      const response = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?apikey=47c62267-b242-42c9-9937-1505fa4e1b24&geocode=${lon},${lat}&format=json&lang=ru_RU`,
      )

      if (!response.ok) {
        throw new Error('Ошибка получения адреса')
      }

      const data = (await response.json()) as {
        response?: {
          GeoObjectCollection?: {
            featureMember?: Array<{
              GeoObject?: {
                name?: string
                description?: string
              }
            }>
          }
        }
      }

      const feature = data.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject
      const addressName = feature?.name
      const addressDescription = feature?.description

      if (addressName || addressDescription) {
        setAddress([addressName, addressDescription].filter(Boolean).join(', '))
      } else {
        setAddress('Адрес не найден')
      }
    } catch {
      setAddress('')
    }
  }

  const handleMapClick = (coords: [number, number], clickedObject: Feature | null) => {
    setCoordinates(coords)
    setSelectedObject(clickedObject)
    setAddress('')

    if (clickedObject?.properties?.name) {
      setTitle(clickedObject.properties.name)
    }

    void fetchAddress(coords)
  }

  const updateChecklist = (field: keyof AccessibilityChecklist, value: boolean) => {
    setChecklist((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!coordinates) {
      window.alert('Пожалуйста, выберите координаты')
      return
    }

    setLoading(true)

    const payload = {
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
      const response = await fetch(buildApiUrl('/api/objects'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.status === 409) {
        window.alert('Такое место уже есть')
        return
      }

      if (!response.ok) {
        throw new Error('Ошибка отправки данных')
      }

      window.alert('Объект успешно добавлен!')
    } catch {
      window.alert('Ошибка при отправке данных')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="map-admin-page">
      <div className="map-admin-page__layout">
        <div className="map-admin-page__map">
          <MapComponent
            onMapClick={handleMapClick}
            selectedFeature={selectedFeature}
          />
        </div>
        <div className="map-admin-page__side">
          <AccessibilityCard
            title={title}
            description={description}
            onTitleChange={(event) => setTitle(event.target.value)}
            onDescriptionChange={(event) => setDescription(event.target.value)}
            checklist={checklist}
            onChecklistChange={updateChecklist}
            infrastructureType={infrastructureType}
            onInfrastructureTypeChange={(event) =>
              setInfrastructureType(event.target.value)
            }
          />

          {coordinates && (
            <div className="map-admin-page__coordinates">
              <strong>Координаты:</strong> {coordinates[0].toFixed(6)},{' '}
              {coordinates[1].toFixed(6)}

              {address && (
                <div className="map-admin-page__address">
                  <strong>Адрес:</strong> {address}
                </div>
              )}

              {selectedObject?.properties?.name && (
                <div className="map-admin-page__object">
                  <strong>Объект:</strong> {selectedObject.properties.name}
                </div>
              )}

              <button
                className="map-admin-page__submit"
                onClick={() => {
                  void handleSubmit()
                }}
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

export default MapAdminPage
