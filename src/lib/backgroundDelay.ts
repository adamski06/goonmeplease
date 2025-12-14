// Generate a random delay once per session for consistent background color across pages
const getStoredDelay = (): number => {
  const stored = sessionStorage.getItem('dashboard-bg-delay');
  if (stored) {
    return parseFloat(stored);
  }
  const randomDelay = Math.random() * 300;
  sessionStorage.setItem('dashboard-bg-delay', randomDelay.toString());
  return randomDelay;
};

export const backgroundDelay = typeof window !== 'undefined' ? getStoredDelay() : 0;
