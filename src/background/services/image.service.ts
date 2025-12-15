import { IMAGE_TYPES } from '@/constants';
import type { ImageTypeId } from '@/types';
import { SendToastToTab } from './toast.service';

export async function FetchImageAsBlob(image_url: string): Promise<Blob> {
  const response = await fetch(image_url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  return response.blob();
}

export async function ConvertImageToType(
  image_blob: Blob,
  target_type: ImageTypeId
): Promise<Blob> {
  const target_config = IMAGE_TYPES.find(t => t.id === target_type);
  if (!target_config) {
    throw new Error(`Unknown image type: ${target_type}`);
  }
  const bitmap = await createImageBitmap(image_blob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  if (target_type === 'jpg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const quality = target_type === 'jpg' ? 0.92 : undefined;
  return canvas.convertToBlob({
    type: target_config.mimeType,
    quality
  });
}

export function ExtractFilenameFromUrl(url: string): string {
  try {
    const url_obj = new URL(url);
    const pathname = url_obj.pathname;
    const filename = pathname.split('/').pop() || 'image';
    const name_without_ext = filename.replace(/\.[^/.]+$/, '');
    return name_without_ext || 'image';
  } catch {
    return 'image';
  }
}

export async function DownloadImage(
  image_url: string,
  target_type: ImageTypeId,
  tab_id: number
): Promise<void> {
  const target_config = IMAGE_TYPES.find(t => t.id === target_type);
  if (!target_config) {
    throw new Error(`Unknown image type: ${target_type}`);
  }
  await SendToastToTab(
    tab_id,
    'loading',
    `Converting to ${target_config.label}...`
  );
  try {
    const image_blob = await FetchImageAsBlob(image_url);
    const converted_blob = await ConvertImageToType(image_blob, target_type);
    const reader = new FileReader();
    const data_url = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read blob'));
      reader.readAsDataURL(converted_blob);
    });
    const filename = ExtractFilenameFromUrl(image_url);
    await chrome.downloads.download({
      url: data_url,
      filename: `${filename}${target_config.extension}`,
      saveAs: true
    });
    await SendToastToTab(tab_id, 'success', `Saved as ${target_config.label}!`);
  } catch (error) {
    console.error('Failed to download image:', error);
    await SendToastToTab(tab_id, 'error', 'Failed to convert image');
  }
}
