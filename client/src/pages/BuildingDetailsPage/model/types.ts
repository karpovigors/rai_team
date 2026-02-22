export interface Review {
  id: number;
  author: string;
  text: string;
  rating?: number;
}

export interface BuildingDetails {
  id: number;
  title: string;
  schedule: string;
  address: string;
  metros: string[];
  description: string;
  upcoming_event?: string;
  discount_info?: string;
  image_url: string;
  sign_language: boolean;
  subtitles: boolean;
  ramps: boolean;
  braille: boolean;
  rating_avg?: number;
  rating_count?: number;
  infrastructure_type?: string;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  reviews: Review[];
}
