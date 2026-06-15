import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { api, ApiError } from '@/lib/api';
import type { ConvocatoriaStatus } from '@/lib/types';

interface ConvocatoriaContextValue {
  data: ConvocatoriaStatus | null;
  loading: boolean;
  /** true solo cuando hay una convocatoria abierta confirmada por el backend. */
  isOpen: boolean;
  refresh: () => void;
}

const ConvocatoriaContext = createContext<ConvocatoriaContextValue | null>(null);

/**
 * Provee el estado de la convocatoria a toda la app con una sola petición.
 * Se usa para habilitar/ocultar el asistente y la creación de solicitudes:
 * si no hay convocatoria abierta, el ciudadano solo puede usar Seguimiento y Catálogo.
 */
export function ConvocatoriaProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ConvocatoriaStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    api
      .get('/convocatorias/current')
      .then((res: ConvocatoriaStatus) => setData(res))
      .catch((err) => {
        if (err instanceof ApiError) console.warn('ConvocatoriaError:', err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isOpen = data?.status === 'abierta';

  return (
    <ConvocatoriaContext.Provider value={{ data, loading, isOpen, refresh }}>
      {children}
    </ConvocatoriaContext.Provider>
  );
}

export function useConvocatoria(): ConvocatoriaContextValue {
  const ctx = useContext(ConvocatoriaContext);
  if (!ctx) {
    throw new Error('useConvocatoria debe usarse dentro de <ConvocatoriaProvider>');
  }
  return ctx;
}
