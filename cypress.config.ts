import { defineConfig } from 'cypress';

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:3000',
        supportFile: 'cypress/support/e2e.ts',
        defaultCommandTimeout: 4000,
        viewportWidth: 1280,
        viewportHeight: 720,
        // Ignorar errores de hidratación para pruebas (útil si hay mismatches)
        experimentalRunAllSpecs: true,
    },
});
