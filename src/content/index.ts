import { TOAST_CONTAINER_ID } from '@/constants';
import type { ToastMessage } from '@/types';

function CreateToastContainer(): HTMLDivElement {
  let container = document.getElementById(
    TOAST_CONTAINER_ID
  ) as HTMLDivElement | null;
  if (!container) {
    container = document.createElement('div');
    container.id = TOAST_CONTAINER_ID;
    container.style.cssText = `
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      z-index: 2147483647 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }
  return container;
}

function ShowToast(toast_message: ToastMessage): void {
  const container = CreateToastContainer();
  const existing_toast = container.querySelector('.siat-toast');
  if (existing_toast) {
    existing_toast.remove();
  }
  const toast = document.createElement('div');
  toast.className = 'siat-toast';
  let icon_svg = '';
  let bg_color = '';
  let border_color = '';
  switch (toast_message.type) {
    case 'loading':
      bg_color = '#22c55e';
      border_color = '#16a34a';
      icon_svg = `
        <svg class="siat-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      `;
      break;
    case 'success':
      bg_color = '#22c55e';
      border_color = '#16a34a';
      icon_svg = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      `;
      break;
    case 'error':
      bg_color = '#ef4444';
      border_color = '#dc2626';
      icon_svg = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      `;
      break;
  }
  toast.style.cssText = `
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
    padding: 12px 16px !important;
    background: ${bg_color} !important;
    border: 1px solid ${border_color} !important;
    border-radius: 8px !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    color: white !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    animation: siat-slide-in 0.3s ease-out !important;
    pointer-events: auto !important;
    z-index: 2147483647 !important;
  `;
  toast.innerHTML = `
    <style>
      @keyframes siat-slide-in {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes siat-slide-out {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
      @keyframes siat-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .siat-spinner {
        animation: siat-spin 1s linear infinite;
      }
    </style>
    ${icon_svg}
    <span>${toast_message.message}</span>
  `;
  container.appendChild(toast);
  if (toast_message.type !== 'loading') {
    setTimeout(() => {
      toast.style.animation = 'siat-slide-out 0.3s ease-in forwards';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 2500);
  }
}

function HideToast(): void {
  const container = document.getElementById(TOAST_CONTAINER_ID);
  if (container) {
    const toast = container.querySelector('.siat-toast');
    if (toast) {
      (toast as HTMLElement).style.animation =
        'siat-slide-out 0.3s ease-in forwards';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }
  }
}

chrome.runtime.onMessage.addListener((message: ToastMessage) => {
  if (message.type === 'loading') {
    ShowToast(message);
  } else if (message.type === 'success' || message.type === 'error') {
    HideToast();
    setTimeout(() => {
      ShowToast(message);
    }, 100);
  }
});

export {};
