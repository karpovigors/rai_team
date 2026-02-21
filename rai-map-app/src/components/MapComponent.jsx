import { useState, useEffect } from 'react'
import './MapComponent.css'
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps'

function MapComponent({ onMapClick, objects = [], selectedFeature }) {
  const defaultState = {
    center: [55.751244, 37.618423], // Москва
    zoom: 14,
  }

  const [placemark, setPlacemark] = useState(null)

  // Обработка selectedFeature - установка метки из внешних данных
  useEffect(() => {
    if (selectedFeature) {
      const coords = selectedFeature.geometry?.coordinates
      if (coords && Array.isArray(coords) && coords.length === 2) {
        setPlacemark(coords)
        if (onMapClick) {
          onMapClick(coords, {
            properties: selectedFeature.properties,
            geometry: selectedFeature.geometry
          })
        }
      }
    }
  }, [selectedFeature])

  const handleMapClick = (e) => {
    const coords = e.get('coords')
    setPlacemark(coords)
    if (onMapClick) {
      onMapClick(coords, null)
    }
  }

  const handleObjectClick = (obj) => (e) => {
    e.stopPropagation() // Останавливаем всплытие, чтобы не сработал клик карты
    const coords = obj.geometry?.coordinates
    if (onMapClick && coords) {
      onMapClick(coords, obj)
    }
  }

  return (
    <YMaps query={{ apikey: '47c62267-b242-42c9-9937-1505fa4e1b24', lang: 'ru_RU' }}>
      <Map
        defaultState={defaultState}
        width="100%"
        height="100%"
        onClick={handleMapClick}
        defaultOptions={{
          suppressMapOpenBlock: true,
          trafficControl: 'off',
          geolocationControl: 'off',
          searchControl: 'off',
          zoomControl: 'off',
          fullscreenControl: 'off',
        }}
      >
        {/* Готовые объекты */}
        {objects.map((obj, index) => {
          const coords = obj.geometry?.coordinates
          if (!coords) return null
          return (
            <Placemark
              key={index}
              geometry={coords}
              properties={{
                name: obj.properties?.name || 'Объект',
              }}
              options={{
                preset: 'islands#redCircleIcon',
              }}
              onClick={handleObjectClick(obj)}
            />
          )
        })}

        {/* Метка по клику или из selectedFeature */}
        {placemark && (
          <Placemark
            geometry={placemark}
            options={{
              preset: 'islands#blueCircleIcon',
            }}
          />
        )}
      </Map>
    </YMaps>
  )
}

export default MapComponent
