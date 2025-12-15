export async function SendToastToTab(
  tab_id: number,
  type: 'loading' | 'success' | 'error',
  message: string
): Promise<void> {
  try {
    await chrome.tabs.sendMessage(tab_id, { type, message });
  } catch {
    console.log('Content script not ready');
  }
}
