import axios from 'axios';
import authService from '../../../services/authService';
import type { BuildingDetails, Review } from '../model/types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const YANDEX_GEOCODER_API_KEY = import.meta.env.VITE_YANDEX_GEOCODER_API_KEY || '';
const buildApiUrl = (path: string): string => `${API_BASE_URL}${path}`;

export interface UpdateBuildingPayload {
  title: string;
  description: string;
  upcomingEvent: string;
  discountInfo: string;
  infrastructureType: string;
  address: string;
  schedule: string;
  metros: string;
  sign_language: boolean;
  subtitles: boolean;
  ramps: boolean;
  braille: boolean;
  image: File | null;
  coordinates: [number, number] | null;
}

export const getBuildingDetails = async (buildingId: number): Promise<BuildingDetails> => {
  const { data } = await axios.get<BuildingDetails>(buildApiUrl(`/api/objects/${buildingId}`));
  return data;
};

export const updateBuilding = async (
  buildingId: number,
  payload: UpdateBuildingPayload,
): Promise<BuildingDetails> => {
  const formData = new FormData();
  formData.append('title', payload.title.trim());
  formData.append('description', payload.description.trim());
  formData.append('upcoming_event', payload.upcomingEvent.trim());
  formData.append('discount_info', payload.discountInfo.trim());
  formData.append('infrastructureType', payload.infrastructureType.trim());
  formData.append('address', payload.address.trim());
  formData.append('schedule', payload.schedule.trim());
  formData.append('metros', payload.metros);
  formData.append('sign_language', String(payload.sign_language));
  formData.append('subtitles', String(payload.subtitles));
  formData.append('ramps', String(payload.ramps));
  formData.append('braille', String(payload.braille));

  if (payload.image) {
    formData.append('image', payload.image);
  }

  if (payload.coordinates) {
    formData.append('latitude', String(payload.coordinates[0]));
    formData.append('longitude', String(payload.coordinates[1]));
  }

  const response = await authService.authFetch(`/api/objects/${buildingId}`, {
    method: 'PUT',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error || 'Не удалось обновить объект');
  }

  return response.json();
};

export const deleteBuilding = async (buildingId: number): Promise<void> => {
  const response = await authService.authFetch(`/api/objects/${buildingId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error || 'Не удалось удалить объект');
  }
};

export const createBuildingReview = async (
  buildingId: number,
  payload: { text: string; rating: number },
): Promise<Review> => {
  const response = await authService.authFetch(`/api/objects/${buildingId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to create review');
  }

  return response.json();
};

export const reverseGeocodeCoordinates = async (
  coords: [number, number],
): Promise<string | null> => {
  const [lat, lon] = coords;
  const response = await fetch(
    `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_GEOCODER_API_KEY}&geocode=${lon},${lat}&format=json&lang=ru_RU`,
  );

  if (!response.ok) {
    throw new Error('Ошибка получения адреса');
  }

  const data = (await response.json()) as {
    response?: {
      GeoObjectCollection?: {
        featureMember?: Array<{
          GeoObject?: {
            name?: string;
            description?: string;
            Point?: {
              pos?: string;
            };
          };
        }>;
      };
    };
  };

  const feature = data.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;
  const addressName = feature?.name;
  const addressDescription = feature?.description;

  if (!addressName && !addressDescription) {
    return null;
  }

  return [addressName, addressDescription].filter(Boolean).join(', ');
};

export const geocodeAddressToCoordinates = async (
  address: string,
): Promise<[number, number] | null> => {
  const trimmedAddress = address.trim();
  if (!trimmedAddress) {
    return null;
  }

  const response = await fetch(
    `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_GEOCODER_API_KEY}&geocode=${encodeURIComponent(trimmedAddress)}&format=json&lang=ru_RU`,
  );

  if (!response.ok) {
    throw new Error('Ошибка геокодирования адреса');
  }

  const data = (await response.json()) as {
    response?: {
      GeoObjectCollection?: {
        featureMember?: Array<{
          GeoObject?: {
            Point?: {
              pos?: string;
            };
          };
        }>;
      };
    };
  };

  const pos = data.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject?.Point?.pos;
  if (!pos) {
    return null;
  }

  const [lonRaw, latRaw] = pos.split(' ');
  const lon = Number(lonRaw);
  const lat = Number(latRaw);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }

  return [lat, lon];
};
