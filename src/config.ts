import * as SecureStore from 'expo-secure-store';

// URL base del API. En builds (APK/EAS) se hornea EXPO_PUBLIC_API_URL; si no está
// definida, cae al API de producción (Seenode). El valor guardado en la pantalla
// "Ajustes" (SecureStore) tiene prioridad sobre esto en tiempo de ejecución.
// Para desarrollo local contra tu PC, define EXPO_PUBLIC_API_URL (p. ej. en .env)
// o cámbiala desde "Ajustes" (ej. http://192.168.1.36:3000/api).
const DEFAULT = process.env.EXPO_PUBLIC_API_URL ?? 'https://uncp-conecta-api.seenode.app/api';
let current = DEFAULT;
export function getApiBaseUrl() { return current; }
export async function loadApiBaseUrl() { const v = await SecureStore.getItemAsync('api_base'); if (v) current = v; }
export async function setApiBaseUrl(url: string) { current = url.replace(/\/+$/, ''); await SecureStore.setItemAsync('api_base', current); }
