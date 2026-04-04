// Toast Notification System for CTRC Dashboard

function showToast(message, type = 'info') {
  // Create toast container if it doesn't exist
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  // Set background color based on type
  const colors = {
    success: '#15803D',
    error: '#DC2626',
    warning: '#D97706',
    info: '#171717'
  };

  toast.style.cssText = `
    background: ${colors[type] || colors.info};
    color: #FFFFFF;
    padding: 12px 18px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,.18);
    font-size: 13px;
    font-weight: 500;
    opacity: 0;
    transform: translateX(400px);
    transition: all .3s;
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 8px;
    max-width: 360px;
  `;

  // Add icon based on type
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  const icon = document.createElement('span');
  icon.textContent = icons[type] || icons.info;
  icon.style.cssText = 'font-weight: 700; font-size: 14px;';

  const text = document.createElement('span');
  text.textContent = message;

  toast.appendChild(icon);
  toast.appendChild(text);
  container.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  }, 10);

  // Animate out and remove
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(400px)';
    setTimeout(() => {
      toast.remove();
      // Remove container if empty
      if (container.children.length === 0) {
        container.remove();
      }
    }, 300);
  }, 3000);
}

// Convenience functions
function showSuccess(message) {
  showToast(message, 'success');
}

function showError(message) {
  showToast(message, 'error');
}

function showWarning(message) {
  showToast(message, 'warning');
}

function showInfo(message) {
  showToast(message, 'info');
}
