import Config from 'react-native-config';
export const environment = {
  apiBaseUrl: Config.API_BASE_URL || 'http://10.0.2.2:8080/api/v1',
  appEnv: Config.APP_ENV || 'local',
  driverAppScheme: Config.DRIVER_APP_SCHEME || 'labar-driver://activation',
  localCapabilities: {
    ocr: Config.ENABLE_OCR === 'true', liveness: Config.ENABLE_LIVENESS === 'true', payout: Config.ENABLE_PAYOUT === 'true',
  },
} as const;
