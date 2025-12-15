import {
  ADD_TO_QUEUE_MENU_ID,
  DEFAULT_TYPE_MENU_ID,
  IMAGE_TYPES,
  MENU_ID_PREFIX,
  PARENT_MENU_ID
} from '@/constants';

export function CreateContextMenus(): void {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: PARENT_MENU_ID,
      title: 'Save image as Type',
      contexts: ['image']
    });
    chrome.contextMenus.create({
      id: ADD_TO_QUEUE_MENU_ID,
      parentId: PARENT_MENU_ID,
      title: 'Add to Queue',
      contexts: ['image']
    });
    chrome.contextMenus.create({
      id: 'separator-1',
      parentId: PARENT_MENU_ID,
      type: 'separator',
      contexts: ['image']
    });
    IMAGE_TYPES.forEach(type => {
      chrome.contextMenus.create({
        id: `${MENU_ID_PREFIX}${type.id}`,
        parentId: PARENT_MENU_ID,
        title: `Save as ${type.label}`,
        contexts: ['image']
      });
    });
    chrome.contextMenus.create({
      id: 'separator-2',
      parentId: PARENT_MENU_ID,
      type: 'separator',
      contexts: ['image']
    });
    chrome.contextMenus.create({
      id: DEFAULT_TYPE_MENU_ID,
      parentId: PARENT_MENU_ID,
      title: 'Set default type',
      contexts: ['image']
    });
  });
}
