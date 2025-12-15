import type { ImageTypeId } from '@/types/image.types';

export interface ImageTypeConfig {
  id: ImageTypeId;
  label: string;
  mimeType: string;
  extension: string;
}
