import authService from '../../../services/authService';
import type { BuildingListItem } from '../model/types';

export interface CreateBuildingPayload {
  title: string;
  infrastructureType: string;
  schedule: string;
  address: string;
  metros: string;
  description: string;
  signLanguage: boolean;
  subtitles: boolean;
  ramps: boolean;
  braille: boolean;
  latitude: string;
  longitude: string;
  imageFile: File | null;
}

export const createBuilding = async (payload: CreateBuildingPayload): Promise<BuildingListItem> => {
  const formData = new FormData();
  formData.append('title', payload.title.trim());
  formData.append('infrastructureType', payload.infrastructureType.trim());
  formData.append('schedule', payload.schedule.trim());
  formData.append('address', payload.address.trim());
  formData.append('metros', payload.metros);
  formData.append('description', payload.description.trim());
  formData.append('sign_language', String(payload.signLanguage));
  formData.append('subtitles', String(payload.subtitles));
  formData.append('ramps', String(payload.ramps));
  formData.append('braille', String(payload.braille));

  const lat = Number(payload.latitude);
  const lon = Number(payload.longitude);
  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    formData.append('latitude', String(lat));
    formData.append('longitude', String(lon));
  }

  if (payload.imageFile) {
    formData.append('image', payload.imageFile);
  }

  const response = await authService.authFetch('/api/objects', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error || 'Не удалось добавить объект');
  }

  return response.json();
};
