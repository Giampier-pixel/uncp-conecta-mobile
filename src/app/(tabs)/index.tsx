import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText, Card, GradientCard, Screen, Skeleton } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import type { ConvocatoriaStatus } from '@/lib/types';
import { colors, radii, space } from '@/theme/theme';

function formatFecha(iso?: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function ActionCard({
  icon,
  text,
  onPress,
}: {
  icon: IoniconName;
  text: string;
  onPress: () => void;
}) {
  return (
    <Card onPress={onPress} style={{ marginBottom: space[3] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: radii.pill,
            backgroundColor: colors.primarySoft,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
          <Ionicons name={icon} size={22} color={colors.primary} />
        </View>
        <AppText variant="bodyLg" style={{ flex: 1 }}>
          {text}
        </AppText>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>
    </Card>
  );
}

export default function InicioScreen() {
  const [convocatoria, setConvocatoria] = useState<ConvocatoriaStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/convocatorias/current')
      .then((data: ConvocatoriaStatus) => setConvocatoria(data))
      .catch((err) => {
        if (err instanceof ApiError) console.warn('ConvocatoriaError:', err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const abierta = convocatoria?.status === 'abierta';
  const cierre = formatFecha(convocatoria?.current?.closesAt);

  return (
    <Screen scroll>
      {/* Top row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: space[5],
          marginBottom: space[5],
        }}>
        <AppText variant="h1">UNCP Conecta</AppText>
        <Pressable
          onPress={() => router.push('/ajustes')}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            borderRadius: radii.pill,
            backgroundColor: colors.surfaceElevated,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.7 : 1,
          })}>
          <Ionicons name="settings-outline" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      {/* Hero card → asistente */}
      <Pressable
        onPress={() => router.push('/asistente')}
        style={({ pressed }) => ({
          transform: [{ scale: pressed ? 0.98 : 1 }],
          marginBottom: space[4],
        })}>
        <GradientCard>
          <AppText
            variant="h2"
            color={colors.textOnPrimary}
            style={{ marginBottom: space[3] }}>
            Cuéntanos tu necesidad y te ayudaremos a realizar tu solicitud
          </AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
            <Ionicons name="sparkles" size={18} color={colors.textOnPrimary} />
            <AppText variant="bodyLg" color="rgba(255,255,255,0.92)">
              Abrir asistente
            </AppText>
          </View>
        </GradientCard>
      </Pressable>

      {/* Convocatoria */}
      <Card style={{ marginBottom: space[6] }}>
        {loading ? (
          <Skeleton width="80%" height={22} />
        ) : abierta && cierre ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
            <Ionicons name="calendar-outline" size={22} color={colors.primary} />
            <AppText variant="bodyLg" style={{ flex: 1 }}>
              Puede solicitar hasta la fecha {cierre}
            </AppText>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
            <Ionicons name="alert-circle-outline" size={22} color={colors.warning} />
            <AppText variant="bodyLg" style={{ flex: 1 }}>
              {convocatoria?.message ?? 'La convocatoria está cerrada por ahora.'}
            </AppText>
          </View>
        )}
      </Card>

      {/* Action cards */}
      <ActionCard
        icon="document-text-outline"
        text="Si tienes claro todo, solicita aquí"
        onPress={() => router.push('/solicitud/nueva')}
      />
      <ActionCard
        icon="search-outline"
        text="Si quieres saber en qué estado está tu solicitud, ingresa aquí"
        onPress={() => router.push('/seguimiento')}
      />
      <ActionCard
        icon="grid-outline"
        text="¿Quieres conocer qué servicios ofrece la universidad? Ingresa aquí"
        onPress={() => router.push('/catalogo')}
      />
    </Screen>
  );
}
