import { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'com.nomade.checklist',
  appName: 'Nomade Raiz',
  webDir: 'dist',
  server: { androidScheme: 'https' },
  android: { backgroundColor: '#0f2744' },
  ios: { backgroundColor: '#0f2744' },
};
export default config;
