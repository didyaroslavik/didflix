const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export function startKeepAlive() {
  // Ping the backend every 10 minutes to prevent Railway from sleeping
  const ping = () => {
    fetch(`${BACKEND_URL}/health`).catch(() => {
    });
  };

  // Ping immediately when app loads
  ping();

  // Then every 10 minutes
  setInterval(ping, 10 * 60 * 1000);
}