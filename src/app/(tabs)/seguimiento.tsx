import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import {
  AppText,
  Button,
  Card,
  EmptyState,
  Input,
  Screen,
  StatusBadge,
  Timeline,
} from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import type { TrackingItem, TrackingResult } from '@/lib/types';
import { colors, radii, space } from '@/theme/theme';

const DNI_KEY = 'last_dni';
const DNI_REGEX = /^\d{8}$/;

export default function SeguimientoScreen() {
  const [dni, setDni] = useState('');
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [dniError, setDniError] = useState('');
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    SecureStore.getItemAsync(DNI_KEY).then((saved) => {
      if (saved) {
        setDni(saved);
        runSearch(saved);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runSearch(dniValue: string) {
    setDniError('');
    setSearchError('');

    if (!DNI_REGEX.test(dniValue)) {
      setDniError('Ingresa exactamente 8 dígitos');
      return;
    }

    setLoading(true);
    try {
      const data: TrackingResult = await api.get(`/tracking?dni=${dniValue}`);
      setResult(data);
      await SecureStore.setItemAsync(DNI_KEY, dniValue);
    } catch (err) {
      if (err instanceof ApiError) {
        setSearchError(err.message);
      } else {
        setSearchError('Error al conectar con el servidor');
      }
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    runSearch(dni);
  }

  return (
    <Screen scroll>
      <View style={{ marginTop: space[5], marginBottom: space[5] }}>
        <AppText variant="h1" style={{ marginBottom: space[2] }}>
          Seguimiento
        </AppText>
        <AppText variant="body" muted>
          Consulta el avance de tus solicitudes con tu DNI.
        </AppText>
      </View>

      <View style={{ gap: space[4], marginBottom: space[6] }}>
        <Input
          label="DNI"
          value={dni}
          onChangeText={(text) => {
            setDni(text);
            setDniError('');
          }}
          placeholder="8 dígitos"
          keyboardType="number-pad"
          maxLength={8}
          error={dniError}
        />
        <Button
          title="Buscar"
          onPress={handleSearch}
          loading={loading}
          fullWidth
        />
        {searchError ? (
          <AppText variant="bodySm" color={colors.danger}>
            {searchError}
          </AppText>
        ) : null}
      </View>

      {result && result.requests.length === 0 ? (
        <EmptyState
          icon="file-tray-outline"
          title="Sin solicitudes"
          message="No encontramos solicitudes para ese DNI."
        />
      ) : null}

      {result && result.requests.length > 0 ? (
        <View style={{ gap: space[4] }}>
          {result.requests.map((item) => (
            <RequestCard
              key={item.id}
              item={item}
              dni={dni}
              onReplySuccess={() => runSearch(dni)}
            />
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

interface RequestCardProps {
  item: TrackingItem;
  dni: string;
  onReplySuccess: () => void;
}

function RequestCard({ item, dni, onReplySuccess }: RequestCardProps) {
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [replyError, setReplyError] = useState('');

  async function handleReply() {
    setReplyError('');
    const trimmed = replyText.trim();
    if (trimmed.length < 5) {
      setReplyError('La respuesta debe tener al menos 5 caracteres');
      return;
    }
    if (trimmed.length > 3000) {
      setReplyError('La respuesta no puede superar los 3000 caracteres');
      return;
    }
    setReplying(true);
    try {
      await api.post('/requests/reply', { requestId: item.id, dni, message: trimmed });
      setReplyText('');
      onReplySuccess();
    } catch (err) {
      if (err instanceof ApiError) {
        setReplyError(err.message);
      } else {
        setReplyError('Error al enviar la respuesta');
      }
    } finally {
      setReplying(false);
    }
  }

  return (
    <Card>
      <AppText variant="titleLg" style={{ marginBottom: space[3] }}>
        {item.title}
      </AppText>

      <View style={{ marginBottom: space[3] }}>
        <StatusBadge status={item.status} />
      </View>

      {item.currentOwner ? (
        <View style={{ flexDirection: 'row', gap: space[1], marginBottom: space[1] }}>
          <AppText variant="bodySm" muted>
            Responsable:
          </AppText>
          <AppText variant="bodySm">{item.currentOwner}</AppText>
        </View>
      ) : null}

      {item.nextStep ? (
        <View style={{ flexDirection: 'row', gap: space[1], marginBottom: space[3] }}>
          <AppText variant="bodySm" muted>
            Siguiente paso:
          </AppText>
          <AppText variant="bodySm" style={{ flex: 1 }}>
            {item.nextStep}
          </AppText>
        </View>
      ) : null}

      {item.timeline.length > 0 ? (
        <View style={{ marginTop: space[3] }}>
          <Timeline items={item.timeline} />
        </View>
      ) : null}

      {item.status === 'INFORMACION_PENDIENTE' ? (
        <View
          style={{
            marginTop: space[4],
            backgroundColor: `${colors.warning}1A`,
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: `${colors.warning}40`,
            padding: space[4],
            gap: space[4],
          }}>
          {item.pendingInfoRequest ? (
            <View>
              <AppText
                variant="overline"
                color={colors.warning}
                style={{ marginBottom: space[1] }}>
                Información solicitada
              </AppText>
              <AppText variant="body">{item.pendingInfoRequest}</AppText>
            </View>
          ) : null}
          <Input
            label="Tu respuesta"
            value={replyText}
            onChangeText={(text) => {
              setReplyText(text);
              setReplyError('');
            }}
            multiline
            placeholder="Escribe tu respuesta aquí..."
            error={replyError}
          />
          <Button
            title="Enviar respuesta"
            onPress={handleReply}
            loading={replying}
            fullWidth
          />
        </View>
      ) : null}
    </Card>
  );
}
