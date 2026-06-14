import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';

import {
  AppText,
  Button,
  Card,
  GradientCard,
  Input,
  Screen,
} from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import type { OrientResult } from '@/lib/types';
import { colors, radii, space } from '@/theme/theme';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// ─── Example prompts ────────────────────────────────────────────────────────────

const EXAMPLE_PROMPTS = [
  'Soy representante de una comunidad campesina en Junín y necesito asistencia técnica para mejorar nuestros sistemas productivos de papa.',
  'Queremos capacitación en alfabetización digital para adultos mayores de nuestro centro poblado.',
];

// ─── Screen ─────────────────────────────────────────────────────────────────────

export default function AsistenteScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [orient, setOrient] = useState<OrientResult | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Al entrar (o volver) a la pantalla, iniciar siempre un chat nuevo: no mostrar el anterior.
  useFocusEffect(
    useCallback(() => {
      setMessages([]);
      setInput('');
      setLoading(false);
      setOrient(null);
      setUnavailable(false);
      setErrorMsg('');
    }, []),
  );

  const hasMessages = messages.length > 0;

  function fillInput(prompt: string) {
    setInput(prompt);
  }

  async function handleSend() {
    const trimmed = input.trim();
    if (trimmed.length < 5) return;

    setErrorMsg('');
    setUnavailable(false);

    const userMsg: Message = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      // Clasificación de un solo paso: NO enviamos historial (ahorra tokens y evita preguntas).
      const result: OrientResult = await api.post('/ai/orient', {
        message: trimmed,
      });

      let assistantContent = result.summary;
      if (result.nextQuestion) {
        assistantContent = result.summary + '\n\n' + result.nextQuestion;
      }

      setMessages([...nextMessages, { role: 'assistant', content: assistantContent }]);
      setOrient(result);
    } catch (err) {
      if (err instanceof ApiError && err.status === 503) {
        setUnavailable(true);
      } else if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Error al conectar con el servidor');
      }
    } finally {
      setLoading(false);
    }
  }

  // The most recent user message (for 503 fallback prefill)
  const lastUserContent = messages.filter((m) => m.role === 'user').slice(-1)[0]?.content ?? input.trim();

  return (
    <Screen scroll>
      {/* Heading */}
      <View style={{ marginTop: space[5], marginBottom: space[5] }}>
        <AppText variant="h1" style={{ marginBottom: space[2] }}>
          Asistente
        </AppText>
        <AppText variant="body" muted>
          Cuéntanos qué necesitas y te orientamos.
        </AppText>
      </View>

      {/* Empty state: intro + example prompts */}
      {!hasMessages ? (
        <View style={{ gap: space[4], marginBottom: space[6] }}>
          <GradientCard>
            <AppText variant="overline" color="rgba(255,255,255,0.70)" style={{ marginBottom: space[2] }}>
              Orientación con IA
            </AppText>
            <AppText variant="bodyLg" color={colors.textOnPrimary} style={{ marginBottom: space[2] }}>
              Te ayudamos a elegir un servicio
            </AppText>
            <AppText variant="bodySm" color="rgba(255,255,255,0.75)">
              Describe brevemente tu situación y recibirás orientación personalizada.
            </AppText>
          </GradientCard>

          <AppText variant="overline" muted style={{ marginTop: space[2] }}>
            Ejemplos de solicitudes
          </AppText>

          {EXAMPLE_PROMPTS.map((prompt, i) => (
            <Pressable
              key={i}
              onPress={() => fillInput(prompt)}
              style={({ pressed }) => ({
                backgroundColor: pressed ? colors.surfaceHover : colors.surfaceElevated,
                borderRadius: radii.md,
                borderWidth: 1,
                borderColor: colors.hairline,
                padding: space[4],
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: space[3],
              })}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={18}
                color={colors.primary}
                style={{ marginTop: 2 }}
              />
              <AppText variant="body" style={{ flex: 1 }}>
                {prompt}
              </AppText>
            </Pressable>
          ))}
        </View>
      ) : null}

      {/* Conversation bubbles */}
      {hasMessages ? (
        <View style={{ gap: space[3], marginBottom: space[4] }}>
          {messages.map((msg, i) => (
            <View
              key={i}
              style={{
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
              <View
                style={{
                  maxWidth: '85%',
                  backgroundColor:
                    msg.role === 'user' ? colors.primary : colors.surfaceElevated,
                  borderRadius: radii.md,
                  borderBottomRightRadius: msg.role === 'user' ? radii.xs : radii.md,
                  borderBottomLeftRadius: msg.role === 'assistant' ? radii.xs : radii.md,
                  padding: space[4],
                  borderWidth: 1,
                  borderColor:
                    msg.role === 'user' ? colors.primaryRing : colors.hairline,
                }}>
                <AppText
                  variant="body"
                  color={msg.role === 'user' ? colors.textOnPrimary : colors.textPrimary}>
                  {msg.content}
                </AppText>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {/* OrientResult card — shown when AI returned a final result (no nextQuestion) */}
      {orient && !orient.nextQuestion ? (
        <Card style={{ gap: space[4], marginBottom: space[4] }}>
          {/* Confidence */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
            <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
            <AppText variant="overline" color={colors.primary}>
              Confianza: {Math.round(orient.confidence * 100)}%
            </AppText>
          </View>

          {/* Category + support type */}
          <View style={{ gap: space[1] }}>
            <View style={{ flexDirection: 'row', gap: space[2] }}>
              <AppText variant="bodySm" muted>
                Categoría:
              </AppText>
              <AppText variant="bodySm">{orient.category}</AppText>
            </View>
            <View style={{ flexDirection: 'row', gap: space[2] }}>
              <AppText variant="bodySm" muted>
                Tipo de apoyo:
              </AppText>
              <AppText variant="bodySm">{orient.supportType}</AppText>
            </View>
            <View style={{ flexDirection: 'row', gap: space[2] }}>
              <AppText variant="bodySm" muted>
                Unidad sugerida:
              </AppText>
              <AppText variant="bodySm">{orient.suggestedArea}</AppText>
            </View>
          </View>

          {/* Missing fields */}
          {orient.missingFields.length > 0 ? (
            <View style={{ gap: space[2] }}>
              <AppText variant="overline" muted>
                Información que ayudaría:
              </AppText>
              {orient.missingFields.map((field, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: space[2] }}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={14}
                    color={colors.warning}
                    style={{ marginTop: 2 }}
                  />
                  <AppText variant="bodySm" muted style={{ flex: 1 }}>
                    {field}
                  </AppText>
                </View>
              ))}
            </View>
          ) : null}

          {/* Sources */}
          {orient.sources.length > 0 ? (
            <View style={{ gap: space[2] }}>
              <AppText variant="overline" muted>
                Fuentes consultadas:
              </AppText>
              {orient.sources.map((src) => (
                <View key={src.documentId} style={{ flexDirection: 'row', gap: space[2] }}>
                  <Ionicons
                    name="document-text-outline"
                    size={14}
                    color={colors.textMuted}
                    style={{ marginTop: 2 }}
                  />
                  <AppText variant="bodySm" muted style={{ flex: 1 }}>
                    {src.title}
                  </AppText>
                </View>
              ))}
            </View>
          ) : null}

          {/* CTA */}
          <Button
            title="Ver servicios que la UNCP puede ofrecerte"
            variant="gradient"
            fullWidth
            onPress={() => {
              router.push({
                pathname: '/catalogo',
                params: {
                  areaId: orient.suggestedAreaId ?? '',
                  areaName: orient.suggestedArea,
                  category: orient.category,
                },
              });
            }}
          />
        </Card>
      ) : null}

      {/* 503 unavailable fallback */}
      {unavailable ? (
        <Card style={{ gap: space[4], marginBottom: space[4] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: radii.pill,
                backgroundColor: colors.primarySoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
            </View>
            <AppText variant="titleLg" style={{ flex: 1 }}>
              Orientación con IA no disponible por ahora
            </AppText>
          </View>

          <AppText variant="body" muted>
            Puedes continuar creando tu solicitud manualmente o explorar el catálogo de apoyos;
            nuestro equipo la clasificará y derivará a la facultad o unidad correspondiente.
          </AppText>

          <View style={{ gap: space[3] }}>
            <Button
              title="Crear solicitud"
              variant="primary"
              fullWidth
              onPress={() => {
                router.push({
                  pathname: '/solicitud/nueva',
                  params: { description: lastUserContent },
                });
              }}
            />
            <Button
              title="Explorar catálogo"
              variant="secondary"
              fullWidth
              onPress={() => router.push('/catalogo')}
            />
          </View>
        </Card>
      ) : null}

      {/* General error */}
      {errorMsg ? (
        <AppText
          variant="bodySm"
          color={colors.danger}
          style={{ marginBottom: space[4], textAlign: 'center' }}>
          {errorMsg}
        </AppText>
      ) : null}

      {/* Composer */}
      <View style={{ gap: space[3], marginBottom: space[4] }}>
        <Input
          label="Tu mensaje"
          value={input}
          onChangeText={(t) => {
            setInput(t);
            setErrorMsg('');
          }}
          placeholder="Describe tu necesidad (mín. 5 caracteres)..."
          multiline
          maxLength={2000}
        />
        <Button
          title="Enviar"
          variant="gradient"
          fullWidth
          loading={loading}
          disabled={input.trim().length < 5 || loading}
          onPress={handleSend}
        />
      </View>
    </Screen>
  );
}
