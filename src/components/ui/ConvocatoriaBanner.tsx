import { View } from 'react-native';

import type { ConvocatoriaStatus } from '@/lib/types';
import { colors, space, radii } from '@/theme/theme';

import { AppText } from './AppText';
import { GradientCard } from './GradientCard';
import { Skeleton } from './Skeleton';

interface ConvocatoriaBannerProps {
  data: ConvocatoriaStatus | null;
  loading?: boolean;
}

export function ConvocatoriaBanner({ data, loading = false }: ConvocatoriaBannerProps) {
  if (loading) {
    return <Skeleton width="100%" height={120} radius={radii.xl} />;
  }

  if (!data) return null;

  if (data.status === 'abierta') {
    return (
      <GradientCard>
        <AppText variant="overline" color="rgba(255,255,255,0.75)" style={{ marginBottom: space[2] }}>
          Convocatoria abierta
        </AppText>
        <AppText variant="h3" color={colors.textOnPrimary} style={{ marginBottom: space[1] }}>
          {data.current?.name ?? 'Convocatoria activa'}
        </AppText>
        <AppText variant="bodySm" color="rgba(255,255,255,0.80)">
          {data.message}
        </AppText>
        {data.current?.closesAt ? (
          <AppText variant="caption" color="rgba(255,255,255,0.60)" style={{ marginTop: space[2] }}>
            Cierra: {new Date(data.current.closesAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
          </AppText>
        ) : null}
      </GradientCard>
    );
  }

  // cerrada
  return (
    <View
      style={{
        backgroundColor: colors.surfaceElevated,
        borderRadius: radii.xl,
        padding: space[5],
        borderWidth: 1,
        borderColor: colors.warning + '40',
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], marginBottom: space[2] }}>
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors.warning,
          }}
        />
        <AppText variant="overline" color={colors.warning}>
          Convocatoria cerrada
        </AppText>
      </View>
      <AppText variant="bodySm" muted>
        {data.message}
      </AppText>
      {data.nextOpensAt ? (
        <AppText variant="caption" muted style={{ marginTop: space[1] }}>
          Próxima apertura: {new Date(data.nextOpensAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
        </AppText>
      ) : null}
    </View>
  );
}
