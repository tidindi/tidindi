import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: { projectId: '1ld4ddgo', dataset: 'production' },
  // Studio bygges sammen med nettstedet og legges på /studio.
  project: { basePath: '/studio' },
  // Alt pakkes inn i bygget, så Studio endrer seg bare når vi selv oppdaterer det.
  deployment: { autoUpdates: false },
  // Nettstedets public-mappe (produktsidene) skal ikke kopieres inn i Studio.
  vite: (config) => ({ ...config, publicDir: false }),
});
