export interface ToastMessage {
  type: 'loading' | 'success' | 'error';
  message: string;
}
