const KEY = 'didflix-token';

export const tokenStore = {
  get(): string | null {
    return localStorage.getItem(KEY);
  },
  set(token: string) {
    localStorage.setItem(KEY, token);
  },
  clear() {
    localStorage.removeItem(KEY);
  },
};