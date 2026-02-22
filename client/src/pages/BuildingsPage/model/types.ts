export interface BuildingListItem {
  id: number;
  title: string;
  name?: string;
  address: string;
  schedule: string;
  metros: string[];
  image_url: string;
  infrastructure_type?: string;
  infrastructureType?: string;
  sign_language?: boolean;
  subtitles?: boolean;
  ramps?: boolean;
  braille?: boolean;
}

