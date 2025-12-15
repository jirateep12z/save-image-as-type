import { IMAGE_TYPES } from '@/constants';
import type { ImageTypeId, QueueItem } from '@/types';
import { ConvertImageToType, FetchImageAsBlob } from './image.service';
import { UpdateBadgeCount } from './queue.service';

export function HandleMessage(
  message: { action: string; id?: string; targetType?: string },
  _: chrome.runtime.MessageSender,
  SendResponse: (response: unknown) => void
): boolean {
  if (message.action === 'get-queue') {
    chrome.storage.local.get('image-queue', result => {
      SendResponse({ queue: result['image-queue'] || [] });
    });
    return true;
  }
  if (message.action === 'remove-from-queue') {
    chrome.storage.local.get('image-queue', result => {
      const queue: QueueItem[] = (result['image-queue'] as QueueItem[]) || [];
      const updated_queue = queue.filter(item => item.id !== message.id);
      chrome.storage.local.set({ 'image-queue': updated_queue }, () => {
        UpdateBadgeCount();
        SendResponse({ success: true });
      });
    });
    return true;
  }
  if (message.action === 'clear-queue') {
    chrome.storage.local.set({ 'image-queue': [] }, () => {
      UpdateBadgeCount();
      SendResponse({ success: true });
    });
    return true;
  }
  if (message.action === 'download-all') {
    (async () => {
      const result = await chrome.storage.local.get('image-queue');
      const queue: QueueItem[] = (result['image-queue'] as QueueItem[]) || [];
      const target_type = message.targetType as ImageTypeId;
      const target_config = IMAGE_TYPES.find(t => t.id === target_type);
      if (!target_config || queue.length === 0) {
        SendResponse({ success: false });
        return;
      }
      let success_count = 0;
      for (const item of queue) {
        try {
          const image_blob = await FetchImageAsBlob(item.url);
          const converted_blob = await ConvertImageToType(
            image_blob,
            target_type
          );
          const reader = new FileReader();
          const data_url = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Failed to read blob'));
            reader.readAsDataURL(converted_blob);
          });
          await chrome.downloads.download({
            url: data_url,
            filename: `${item.filename}${target_config.extension}`,
            saveAs: false
          });
          success_count++;
        } catch (error) {
          console.error(`Failed to download ${item.filename}:`, error);
        }
      }
      await chrome.storage.local.set({ 'image-queue': [] });
      await UpdateBadgeCount();
      SendResponse({ success: true, count: success_count });
    })();
    return true;
  }
  return false;
}
