import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.jarla',
  appName: 'Jarla',
  webDir: 'dist',
  server: {
    url: 'https://6cf7b67c-0942-4df2-85dc-f9bb2fed8e6b.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
