import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText, Button, Card, Input, Screen, ScreenHeader } from '@/components/ui';
import { getApiBaseUrl, setApiBaseUrl } from '@/config';
import { colors, space } from '@/theme/theme';

type TestState =
  | { kind: 'idle' }
  | { kind: 'testing' }
  | { kind: 'ok'; detail: string }
  | { kind: 'fail'; detail: string };

const HINT =
  'Dispositivo físico: usa la IP de tu PC (ej. http://192.168.1.10:3000/api). Emulador Android: http://10.0.2.2:3000/api.';

function normalize(value: string) {
  return value.trim().replace(/\/+$/, '');
}

export default function AjustesScreen() {
  const [url, setUrl] = useState(getApiBaseUrl());
  const [saved, setSaved] = useState(false);
  const [test, setTest] = useState<TestState>({ kind: 'idle' });

  async function handleSave() {
    const clean = normalize(url);
    if (!/^https?:\/\//i.test(clean)) {
      setTest({ kind: 'fail', detail: 'La URL debe empezar con http:// o https://' });
      return;
    }
    await setApiBaseUrl(clean);
    setUrl(clean);
    setSaved(true);
  }

  async function handleTest() {
    const clean = normalize(url);
    setSaved(false);
    setTest({ kind: 'testing' });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    try {
      const res = await fetch(`${clean}/convocatorias/current`, {
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) {
        setTest({ kind: 'fail', detail: `El servidor respondió con error ${res.status}.` });
        return;
      }
      const data = await res.json();
      const status =
        data?.status === 'abierta'
          ? 'convocatoria abierta'
          : data?.status === 'cerrada'
            ? 'convocatoria cerrada'
            : 'respuesta válida';
      setTest({ kind: 'ok', detail: `Conexión exitosa (${status}).` });
    } catch {
      clearTimeout(timer);
      setTest({
        kind: 'fail',
        detail: 'No se pudo conectar. Verifica la URL y que el servidor esté activo.',
      });
    }
  }

  return (
    <Screen scroll>
      <ScreenHeader title="Ajustes" subtitle="Configuración de la app" />

      <AppText variant="overline" muted style={{ marginBottom: space[3] }}>
        Servidor (API)
      </AppText>

      <Card style={{ gap: space[4] }}>
        <Input
          label="URL base del API"
          value={url}
          onChangeText={(t) => {
            setUrl(t);
            setSaved(false);
            setTest({ kind: 'idle' });
          }}
          placeholder="http://localhost:3000/api"
          autoCapitalize="none"
          keyboardType="url"
        />
        <AppText variant="caption" muted>
          {HINT}
        </AppText>

        <View style={{ gap: space[3] }}>
          <Button title="Guardar" onPress={handleSave} fullWidth />
          <Button
            title="Probar conexión"
            variant="secondary"
            onPress={handleTest}
            loading={test.kind === 'testing'}
            fullWidth
          />
        </View>

        {saved ? (
          <FeedbackRow
            icon="checkmark-circle"
            color={colors.success}
            text="Guardado. Se usará en las próximas consultas."
          />
        ) : null}
        {test.kind === 'ok' ? (
          <FeedbackRow icon="checkmark-circle" color={colors.success} text={test.detail} />
        ) : null}
        {test.kind === 'fail' ? (
          <FeedbackRow icon="alert-circle" color={colors.danger} text={test.detail} />
        ) : null}
      </Card>

      <View style={{ marginTop: space[9], alignItems: 'center', gap: space[1] }}>
        <AppText variant="titleLg">UNCP Conecta</AppText>
        <AppText variant="bodySm" muted>
          Ciudadano · v1.0.0
        </AppText>
        <AppText
          variant="caption"
          muted
          style={{ textAlign: 'center', marginTop: space[2] }}>
          Universidad Nacional del Centro del Perú
        </AppText>
      </View>
    </Screen>
  );
}

function FeedbackRow({
  icon,
  color,
  text,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  text: string;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
      <Ionicons name={icon} size={18} color={color} />
      <AppText variant="bodySm" color={color} style={{ flex: 1 }}>
        {text}
      </AppText>
    </View>
  );
}
