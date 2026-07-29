import { afterAll, beforeAll } from 'vitest';

beforeAll(() => {
  process.env.NODE_ENV = 'test';

  if (typeof window !== 'undefined' && !window.matchMedia) {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;
  }

  if (typeof window !== 'undefined') {
    window.scrollTo = () => undefined;
  }
});

afterAll(() => {
  delete process.env.NODE_ENV;
});
