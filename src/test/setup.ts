import { beforeEach, vi } from 'vitest';

const data = vi.hoisted(() => new Map<string, unknown>());

// localForage needs IndexedDB, which Node lacks; an in-memory map exercises the same lib code paths.
vi.mock('../lib/db', async (importActual) => ({
  ...(await importActual<typeof import('../lib/db')>()),
  store: {
    getItem: async (key: string) => (data.has(key) ? structuredClone(data.get(key)) : null),
    setItem: async (key: string, value: unknown) => {
      data.set(key, structuredClone(value));
      return value;
    },
  },
}));

beforeEach(() => data.clear());
