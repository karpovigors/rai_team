import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { Map, Placemark, YMaps } from '@pbe/react-yandex-maps'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../../../widgets/AppHeader/ui/AppHeader'
import './MapSearchPage.css'

interface MapObject {
  id: number
  title?: string
  description?: string
  name?: string
  address?: string
  image_url?: string
  imageUrl?: string
  lat?: number
  lng?: number
  latitude?: number
  longitude?: number
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const YANDEX_MAPS_API_KEY =
  import.meta.env.VITE_YANDEX_MAPS_API_KEY ||
  import.meta.env.VITE_YANDEX_GEOCODER_API_KEY ||
  ''

const DEFAULT_CENTER: [number, number] = [55.751244, 37.618423]
const DEFAULT_ZOOM = 13

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

const getObjectCoords = (object: MapObject): [number, number] | null => {
  const lat = object.latitude ?? object.lat
  const lng = object.longitude ?? object.lng
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return null
  }
  return [lat, lng]
}

function MapSearchPage() {
  const navigate = useNavigate()
  const [objects, setObjects] = useState<MapObject[]>([])
  const objectPlacemarkRefs = useRef<Array<any | null>>([])

  useEffect(() => {
    const loadObjects = async () => {
      try {
        const { data } = await axios.get<MapObject[]>(`${apiBaseUrl}/api/objects`)
        setObjects(Array.isArray(data) ? data : [])
      } catch {
        setObjects([])
      }
    }

    void loadObjects()
  }, [])

  const mapObjects = useMemo(() => {
    return objects.reduce<Array<{
      id: number
      coords: [number, number]
      title: string
      balloonContentBody: string
    }>>((acc, object) => {
      const coords = getObjectCoords(object)
      if (!coords) {
        return acc
      }

      const title = object.title || object.name || 'Без названия'
      const description = object.description || object.address || 'Описание отсутствует'
      const imageUrl = object.image_url || object.imageUrl || ''

      const photo = imageUrl
        ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:8px;" />`
        : ''

      const yandexRouteUrl = `https://yandex.ru/maps/?rtext=~${coords[0]},${coords[1]}&rtt=auto`

      const balloonCard = `
        <a href="/building/${object.id}" style="display:block;color:inherit;text-decoration:none;max-width:260px;">
          <div class="building-card" style="overflow:hidden;border:1px solid #e5e7eb;border-radius:10px;background:#fff;padding:8px;">
            ${photo}
            <h3 style="margin:0 0 6px;font-size:16px;">${escapeHtml(title)}</h3>
            <p style="margin:0;color:#4b5563;font-size:13px;line-height:1.35;">${escapeHtml(description)}</p>
          </div>
        </a>
        <div style="margin-top:8px;padding-top:8px;border-top:1px solid #e5e7eb;">
          <a href="${yandexRouteUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;color:#007bff;text-decoration:none;font-size:13px;">
            🧭 Добраться на Яндекс Картах
          </a>
        </div>
      `

      acc.push({
        id: object.id,
        coords,
        title,
        balloonContentBody: balloonCard,
      })

      return acc
    }, [])
  }, [objects])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      objectPlacemarkRefs.current.forEach((instance) => {
        if (instance?.balloon?.open) {
          instance.balloon.open()
        }
      })
    }, 350)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [mapObjects])

  const mapCenter = mapObjects[0]?.coords || DEFAULT_CENTER

  return (
    <div className="map-search-page">
      <AppHeader
        onOpenMap={() => navigate('/map_search')}
        onOpenProfile={() => navigate('/profile')}
        profileAvatarUrl={null}
      />

      <main className="map-search-page__main">
        <YMaps query={{ apikey: YANDEX_MAPS_API_KEY, lang: 'ru_RU' }}>
          <Map
            state={{ center: mapCenter, zoom: DEFAULT_ZOOM }}
            width="100%"
            height="100%"
            modules={['control.ZoomControl']}
            controls={['zoomControl']}
            defaultOptions={{ suppressMapOpenBlock: true }}
          >
            {mapObjects.map((object, index) => (
              <Placemark
                key={`map-object-${object.id}`}
                geometry={object.coords}
                properties={{
                  name: object.title,
                  iconCaption: object.title,
                  balloonContentBody: object.balloonContentBody,
                }}
                options={{ preset: 'islands#redIcon' }}
                modules={['geoObject.addon.balloon', 'geoObject.addon.hint']}
                instanceRef={(instance: any) => {
                  objectPlacemarkRefs.current[index] = instance
                }}
              />
            ))}
          </Map>
        </YMaps>
      </main>

      <footer className="map-search-page__footer"></footer>
    </div>
  )
}

export default MapSearchPage
