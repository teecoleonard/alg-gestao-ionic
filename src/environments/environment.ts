// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  
  // URLs das APIs CORRIGIDAS baseadas no projeto Android
  apiUrl: 'http://45.10.160.10:3050', // API principal - IGUAL AO ANDROID
  pdfApiUrl: 'http://45.10.160.10:8080', // API PDF - IGUAL AO ANDROID
  
  // Configurações da aplicação
  appName: 'ALG Gestão',
  version: '1.0.0',
  
  // Configurações de paginação
  defaultPageSize: 20,
  maxPageSize: 100,
  
  // Configurações de cache
  cacheTimeout: 5 * 60 * 1000, // 5 minutos
  
  // Configurações de upload
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  
  // Configurações de assinatura
  signaturePadOptions: {
    backgroundColor: 'rgb(255, 255, 255)',
    penColor: 'rgb(0, 0, 0)',
    velocityFilterWeight: 0.7,
    minWidth: 0.5,
    maxWidth: 2.5,
    throttle: 16
  },
  
  // Features flags
  features: {
    offlineMode: true,
    pushNotifications: true,
    biometricAuth: false,
    darkMode: true,
    multiLanguage: false
  },
  
  // Configurações de debug
  enableLogging: true,
  logLevel: 'debug', // 'error', 'warn', 'info', 'debug'
  
  // Configurações de rede
  networkTimeout: 30000, // 30 segundos
  retryAttempts: 3,
  
  // Chaves de storage
  storageKeys: {
    user: 'current_user',
    token: 'auth_token',
    refreshToken: 'refresh_token',
    settings: 'app_settings',
    cache: 'app_cache',
    offlineData: 'offline_data'
  },
  
  // Configurações de tema
  theme: {
    primaryColor: '#3843FF', // Azul primário do projeto Android
    secondaryColor: '#4CD080', // Verde secundário do projeto Android
    successColor: '#10DC60',
    warningColor: '#FFCE00',
    dangerColor: '#F04141',
    darkColor: '#222428',
    mediumColor: '#92949C',
    lightColor: '#F4F5F8'
  },
  
  // Configurações de formatação
  locale: 'pt-BR',
  currency: 'BRL',
  dateFormat: 'dd/MM/yyyy',
  timeFormat: 'HH:mm',
  dateTimeFormat: 'dd/MM/yyyy HH:mm',
  
  // Configurações de validação
  validation: {
    cpfPattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    cnpjPattern: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
    emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phonePattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
    cepPattern: /^\d{5}-\d{3}$/
  },
  
  // URLs externas
  externalUrls: {
    viaCep: 'https://viacep.com.br/ws',
    receitaWs: 'https://www.receitaws.com.br/v1/cnpj'
  },
  
  enableDebug: true
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
