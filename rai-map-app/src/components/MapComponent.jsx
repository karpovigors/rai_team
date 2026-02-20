import './MapComponent.css'
import { YMaps, Map } from '@pbe/react-yandex-maps'

function MapComponent() {
  const defaultState = {
    center: [55.751244, 37.618423], // Москва
    zoom: 14,
  }

  return (
    <YMaps query={{ apikey: '47c62267-b242-42c9-9937-1505fa4e1b24', lang: 'ru_RU' }}>
      <Map
        defaultState={defaultState}
        width="100%"
        height="500px"
      />
    </YMaps>
  )
}

export default MapComponent
