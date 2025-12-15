import {
  ADD_TO_QUEUE_MENU_ID,
  DEFAULT_TYPE_MENU_ID,
  MENU_ID_PREFIX
} from '@/constants';
import type { ImageTypeId } from '@/types';
import {
  AddToQueue,
  CreateContextMenus,
  DownloadImage,
  HandleMessage,
  UpdateBadgeCount
} from './services';

chrome.runtime.onInstalled.addListener(() => {
  CreateContextMenus();
  chrome.storage.sync.get('defaultImageType', result => {
    if (!result.defaultImageType) {
      chrome.storage.sync.set({ defaultImageType: 'png' });
    }
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!info.srcUrl || !tab?.id) return;
  if (info.menuItemId === DEFAULT_TYPE_MENU_ID) {
    chrome.action.openPopup();
    return;
  }
  if (info.menuItemId === ADD_TO_QUEUE_MENU_ID) {
    await AddToQueue(info.srcUrl, tab.id);
    return;
  }
  const menu_id = info.menuItemId.toString();
  if (menu_id.startsWith(MENU_ID_PREFIX)) {
    const type_id = menu_id.replace(MENU_ID_PREFIX, '') as ImageTypeId;
    await DownloadImage(info.srcUrl, type_id, tab.id);
  }
});

chrome.storage.onChanged.addListener(changes => {
  if (changes.defaultImageType) {
    console.log(
      'Default image type changed to:',
      changes.defaultImageType.newValue
    );
  }
  if (changes.imageQueue) {
    UpdateBadgeCount();
  }
});

chrome.runtime.onMessage.addListener(HandleMessage);

chrome.runtime.onStartup.addListener(() => {
  UpdateBadgeCount();
});

export {};
