const BACKEND_BASE_URL = 'https://sportsbetsim-back.onrender.com';

const originalFetch = window.fetch;

window.fetch = async (input, init) => {
  let url = input;

  if (typeof input === 'string' && input.startsWith('/api')) {
    url = `${BACKEND_BASE_URL}${input}`;
  }

  return originalFetch(url, init);
};
