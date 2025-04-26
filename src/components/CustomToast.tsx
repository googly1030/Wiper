
interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
}

// Simple toast implementation
let toastTimeout: NodeJS.Timeout | null = null;

export function toast(message: string, options: ToastOptions = {}) {
  // Clear any existing toast
  if (toastTimeout) {
    clearTimeout(toastTimeout);
    const existingToast = document.getElementById('custom-toast');
    if (existingToast) {
      document.body.removeChild(existingToast);
    }
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.id = 'custom-toast';
  toast.innerText = message;
  
  // Set position
  toast.style.position = 'fixed';
  toast.style.zIndex = '9999';
  toast.style.padding = '12px 16px';
  toast.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  toast.style.color = 'white';
  toast.style.borderRadius = '4px';
  toast.style.fontSize = '14px';
  toast.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  
  // Position the toast
  const position = options.position || 'bottom-center';
  
  switch (position) {
    case 'top-right':
      toast.style.top = '20px';
      toast.style.right = '20px';
      break;
    case 'top-center':
      toast.style.top = '20px';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%)';
      break;
    case 'top-left':
      toast.style.top = '20px';
      toast.style.left = '20px';
      break;
    case 'bottom-right':
      toast.style.bottom = '20px';
      toast.style.right = '20px';
      break;
    case 'bottom-left':
      toast.style.bottom = '20px';
      toast.style.left = '20px';
      break;
    case 'bottom-center':
    default:
      toast.style.bottom = '20px';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%)';
      break;
  }
  
  // Add to document
  document.body.appendChild(toast);
  
  // Remove after duration
  const duration = options.duration || 3000;
  toastTimeout = setTimeout(() => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast);
    }
    toastTimeout = null;
  }, duration);
}