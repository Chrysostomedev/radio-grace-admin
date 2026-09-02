// types/hero-slide.types.ts
export interface HeroSlide {
  id: number;
  titre: string | null;
  sous_titre: string | null;
  type: 'IMAGE' | 'VIDEO';
  image_path: string | null;
  image_url?: string | null;
  video_path: string | null;
  video_url?: string | null;
  lien: string | null;
  ordre: number;
  actif: boolean;
  date_debut: string | null;
  date_fin: string | null;
  created_at: string;
  updated_at: string;
}
