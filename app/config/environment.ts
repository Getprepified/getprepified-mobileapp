import Constants from 'expo-constants';

interface Environment {
  API_URL: string;
}

// Environment configurations
const ENV = {
  dev: {
    // Ensure no trailing slash for proper URL joining
    API_URL: 'http://localhost:4000/api',
  },
  staging: {
    API_URL: 'https://your-staging-api.com',
  },
  prod: {
    API_URL: 'https://getprep.onrender.com/api',
  },
} as const;

const getEnvVars = (): Environment => {
  // In development, always use dev environment
  if (__DEV__) {
    return ENV.dev;
  }

  // In production, use prod environment
  // Note: For staging/production differentiation in modern Expo apps,
  // consider using environment variables or build-time configuration
  return ENV.prod;
};

export default getEnvVars;