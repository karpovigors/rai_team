import { useEffect, useRef, useState } from 'react'
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
  placemarkPreset?: string
  placemarkDraggable?: boolean
  selectedPlacemarkProperties?: {
    hintContent?: string
    balloonContent?: string
    iconCaption?: string
  }
  autoOpenSelectedBalloon?: boolean
}

const DEFAULT_CENTER: [number, number] = [55.751244, 37.618423]
const DEFAULT_ZOOM = 14
const YANDEX_MAPS_API_KEY =
  import.meta.env.VITE_YANDEX_MAPS_API_KEY ||
  import.meta.env.VITE_YANDEX_GEOCODER_API_KEY ||
  ''

function MapComponent({
  onMapClick,
  objects = [],
  selectedFeature,
  placemarkPreset = 'islands#blueCircleIcon',
  placemarkDraggable = true,
  selectedPlacemarkProperties,
  autoOpenSelectedBalloon = false,
}: MapComponentProps) {
  const [placemark, setPlacemark] = useState<[number, number] | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER)
  const [mapZoom, setMapZoom] = useState<number>(DEFAULT_ZOOM)
  const selectedPlacemarkRef = useRef<any>(null)

  useEffect(() => {
    const coords = selectedFeature?.geometry?.coordinates
    if (coords && coords.length === 2) {
      setPlacemark(coords)
      setMapCenter(coords)
      setMapZoom(17)
    }
  }, [selectedFeature])

  useEffect(() => {
    if (!autoOpenSelectedBalloon || !selectedPlacemarkProperties?.balloonContent) {
      return
    }

    const instance = selectedPlacemarkRef.current
    if (!instance?.balloon?.open) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      instance.balloon.open()
    }, 250)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [
    autoOpenSelectedBalloon,
    selectedPlacemarkProperties?.balloonContent,
    selectedFeature,
  ])

  const handleMapClick = (event: { get: (name: string) => [number, number] }) => {
    const coords = event.get('coords')
    setPlacemark(coords)
    setMapCenter(coords)
    setMapZoom((prev) => Math.max(prev, 17))
    onMapClick?.(coords, null)
  }

  const handlePlacemarkDragEnd = (event: any) => {
    if (!placemarkDraggable) {
      return
    }

    const coords = event?.get?.('target')?.geometry?.getCoordinates?.() as [number, number]
    if (!coords || coords.length !== 2) {
      return
    }
    setPlacemark(coords)
    setMapCenter(coords)
    onMapClick?.(coords, null)
  }

  const handleBoundsChange = (event: any) => {
    const nextCenter = event?.get?.('newCenter') as [number, number] | undefined
    const nextZoom = event?.get?.('newZoom') as number | undefined
    if (nextCenter && nextCenter.length === 2) {
      setMapCenter(nextCenter)
    }
    if (typeof nextZoom === 'number') {
      setMapZoom(nextZoom)
    }
  }

  const handleObjectClick = (object: Feature) => () => {
    const coords = object.geometry?.coordinates
    if (coords) {
      onMapClick?.(coords, object)
    }
  }

  return (
    <div className="map-component">
      <YMaps query={{ apikey: YANDEX_MAPS_API_KEY, lang: 'ru_RU' }}>
        <Map
          state={{ center: mapCenter, zoom: mapZoom }}
          width="100%"
          height="100%"
          onClick={handleMapClick}
          onBoundsChange={handleBoundsChange}
          modules={['control.ZoomControl']}
          controls={['zoomControl']}
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
              instanceRef={selectedPlacemarkRef}
              geometry={placemark}
              properties={selectedPlacemarkProperties}
              options={{ preset: placemarkPreset, draggable: placemarkDraggable }}
              onDragEnd={handlePlacemarkDragEnd}
              modules={['geoObject.addon.balloon', 'geoObject.addon.hint']}
            />
          )}
        </Map>
      </YMaps>
    </div>
  )
}

export default MapComponent
