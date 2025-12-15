import type { QueueItem } from '@/types';
import { ExtractFilenameFromUrl } from './image.service';
import { SendToastToTab } from './toast.service';

export async function UpdateBadgeCount(): Promise<void> {
  const result = await chrome.storage.local.get('image-queue');
  const queue: QueueItem[] = (result['image-queue'] as QueueItem[]) || [];
  const count = queue.length;
  if (count > 0) {
    chrome.action.setBadgeText({ text: count.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#22c55e' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

export async function AddToQueue(
  image_url: string,
  tab_id: number
): Promise<void> {
  try {
    const result = await chrome.storage.local.get('image-queue');
    const queue: QueueItem[] = (result['image-queue'] as QueueItem[]) || [];
    const existing = queue.find(item => item.url === image_url);
    if (existing) {
      await SendToastToTab(tab_id, 'error', 'Image already in queue');
      return;
    }
    const new_item: QueueItem = {
      id: crypto.randomUUID(),
      url: image_url,
      filename: ExtractFilenameFromUrl(image_url),
      thumbnail: image_url,
      added_at: Date.now()
    };
    queue.push(new_item);
    await chrome.storage.local.set({ 'image-queue': queue });
    await SendToastToTab(
      tab_id,
      'success',
      `Added to queue (${queue.length} items)`
    );
    await UpdateBadgeCount();
  } catch (error) {
    console.error('Failed to add to queue:', error);
    await SendToastToTab(tab_id, 'error', 'Failed to add to queue');
  }
}
