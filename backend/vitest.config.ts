import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      // Force a standard URL to avoid Prisma Client thinking it's in Accelerate mode
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/pedidos_control_test',
    },
    globals: true,
  },
});
