import { useEffect, useState } from 'react'
import { Map, Placemark, YMaps } from '@pbe/react-yandex-maps'
import './MapComponent.css'

interface Feature {
  geometry?: {
    coordinates?: [number, number]
  }
  properties?: {
    name?: string
  }
}

interface MapComponentProps {
  onMapClick?: (coords: [number, number], clickedObject: Feature | null) => void
  objects?: Feature[]
  selectedFeature?: Feature | null
}

function MapComponent({
  onMapClick,
  objects = [],
  selectedFeature,
}: MapComponentProps) {
  const [placemark, setPlacemark] = useState<[number, number] | null>(null)

  useEffect(() => {
    const coords = selectedFeature?.geometry?.coordinates
    if (coords && coords.length === 2) {
      setPlacemark(coords)
    }
  }, [selectedFeature])

  const handleMapClick = (event: { get: (name: string) => [number, number] }) => {
    const coords = event.get('coords')
    setPlacemark(coords)
    onMapClick?.(coords, null)
  }

  const handleObjectClick = (object: Feature) => () => {
    const coords = object.geometry?.coordinates
    if (coords) {
      onMapClick?.(coords, object)
    }
  }

  return (
    <div className="map-component">
      <YMaps query={{ apikey: '7bb401a3-59b4-4be6-bc2a-602c71197f26', lang: 'ru_RU' }}>
        <Map
          defaultState={{ center: [55.751244, 37.618423], zoom: 14 }}
          width="100%"
          height="100%"
          onClick={handleMapClick}
          defaultOptions={{
            suppressMapOpenBlock: true,
          }}
        >
          {objects.map((object, index) => {
            const coords = object.geometry?.coordinates
            if (!coords) {
              return null
            }
            return (
              <Placemark
                key={`object-${index}`}
                geometry={coords}
                properties={{ name: object.properties?.name || 'Объект' }}
                options={{ preset: 'islands#redCircleIcon' }}
                onClick={handleObjectClick(object)}
              />
            )
          })}

          {placemark && (
            <Placemark
              geometry={placemark}
              options={{ preset: 'islands#blueCircleIcon' }}
            />
          )}
        </Map>
      </YMaps>
    </div>
  )
}

export default MapComponent
