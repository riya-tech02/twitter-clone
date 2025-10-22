export const cacheService = {
  get: async (key: string) => null,
  set: async (key: string, value: any, ttl?: number) => {},
  del: async (key: string) => {},
  delPattern: async (pattern: string) => {},
};
