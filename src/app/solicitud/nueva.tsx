import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useLocalSearchParams } from 'expo-router';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { SignaturePad } from '@/components/SignaturePad';

import {
  AppText,
  Button,
  Card,
  Chip,
  EmptyState,
  Input,
  Screen,
  ScreenHeader,
} from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { useConvocatoria } from '@/lib/convocatoria';
import type {
  ApplicantType,
  CreateRequestBody,
  CreateRequestResult,
} from '@/lib/types';
import { colors, radii, space } from '@/theme/theme';

// ─── Constants ────────────────────────────────────────────────────────────────

const APPLICANT_TYPES = [
  { value: 'comunidad_campesina', label: 'Comunidad campesina' },
  { value: 'comunidad_urbana', label: 'Comunidad urbana' },
  { value: 'gobierno_local', label: 'Gobierno local' },
  { value: 'otro', label: 'Otro' },
] as const;

const CATEGORIES = [
  'Agropecuario',
  'Salud',
  'Educación',
  'Medio ambiente',
  'Infraestructura',
  'Desarrollo social',
  'Tecnología',
  'Otro',
];

const SUPPORT_TYPES = [
  'Capacitación',
  'Asistencia técnica',
  'Estudio o diagnóstico',
  'Voluntariado',
  'Otro',
];

// ─── Validation helpers ────────────────────────────────────────────────────────

const DNI_REGEX = /^\d{8}$/;
const PHONE_REGEX = /^\d{6,15}$/;

type FormErrors = Partial<Record<string, string>>;

interface FormState {
  applicantType: ApplicantType | '';
  representativeName: string;
  representativeDni: string;
  contactPhone: string;
  entityName: string;
  officialPosition: string;
  comunidadNombre: string; // optional community name
  direccion: string;       // required: "Dirección donde vive usted"
  localidad: string;       // optional: "Localidad / centro poblado"
  district: string;
  category: string;
  supportType: string;
  description: string;
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.applicantType) {
    errors.applicantType = 'Selecciona el tipo de solicitante';
  }

  const name = form.representativeName.trim();
  if (!name) {
    errors.representativeName = 'Campo requerido';
  } else if (name.length < 3 || name.length > 120) {
    errors.representativeName = 'Debe tener entre 3 y 120 caracteres';
  }

  if (!DNI_REGEX.test(form.representativeDni)) {
    errors.representativeDni = 'Debe tener exactamente 8 dígitos';
  }

  if (!PHONE_REGEX.test(form.contactPhone)) {
    errors.contactPhone = 'Debe tener entre 6 y 15 dígitos';
  }

  // direccion required (3–150)
  const dir = form.direccion.trim();
  if (!dir) {
    errors.direccion = 'Campo requerido';
  } else if (dir.length < 3 || dir.length > 150) {
    errors.direccion = 'Debe tener entre 3 y 150 caracteres';
  }

  // communityName optional; validate if non-empty
  const community = form.comunidadNombre.trim();
  if (community && (community.length < 3 || community.length > 150)) {
    errors.comunidadNombre = 'Debe tener entre 3 y 150 caracteres';
  }

  // localidad optional; validate if non-empty
  const localidad = form.localidad.trim();
  if (localidad && (localidad.length < 3 || localidad.length > 150)) {
    errors.localidad = 'Debe tener entre 3 y 150 caracteres';
  }

  const dist = form.district.trim();
  if (!dist) {
    errors.district = 'Campo requerido';
  } else if (dist.length < 2 || dist.length > 100) {
    errors.district = 'Debe tener entre 2 y 100 caracteres';
  }

  if (!form.category) {
    errors.category = 'Selecciona una categoría';
  }

  if (!form.supportType) {
    errors.supportType = 'Selecciona un tipo de apoyo';
  }

  const desc = form.description.trim();
  if (!desc) {
    errors.description = 'Campo requerido';
  } else if (desc.length < 5) {
    errors.description = 'Debe tener al menos 5 caracteres';
  } else if (desc.length > 5000) {
    errors.description = 'No puede superar los 5000 caracteres';
  }

  if (form.applicantType === 'gobierno_local') {
    const entity = form.entityName.trim();
    if (!entity) {
      errors.entityName = 'Requerido para Gobierno local';
    } else if (entity.length < 3 || entity.length > 150) {
      errors.entityName = 'Debe tener entre 3 y 150 caracteres';
    }

    const position = form.officialPosition.trim();
    if (!position) {
      errors.officialPosition = 'Requerido para Gobierno local';
    } else if (position.length < 3 || position.length > 100) {
      errors.officialPosition = 'Debe tener entre 3 y 100 caracteres';
    }
  }

  return errors;
}

// ─── Build body helper ────────────────────────────────────────────────────────

function buildCreateBody(
  form: FormState,
  signature: string,
  suggestedAreaId?: string,
): CreateRequestBody {
  // location = "direccion - localidad" (localidad only when non-empty)
  const locationParts = [form.direccion.trim(), form.localidad.trim()].filter(Boolean);
  const location = locationParts.join(' - ');

  const body: CreateRequestBody = {
    representativeName: form.representativeName.trim(),
    representativeDni: form.representativeDni,
    contactPhone: form.contactPhone,
    applicantType: form.applicantType as ApplicantType,
    channel: 'app_movil',
    location,
    district: form.district.trim(),
    rawDescription: form.description.trim(),
    formalDescription: form.description.trim(),
    category: form.category,
    supportType: form.supportType,
  };

  const community = form.comunidadNombre.trim();
  if (community) {
    body.communityName = community;
  }

  if (form.applicantType === 'gobierno_local') {
    body.entityName = form.entityName.trim();
  }

  const position = form.officialPosition.trim();
  if (position.length >= 3) {
    body.officialPosition = position;
  }

  if (signature) {
    body.signatureImage = signature;
  }

  if (suggestedAreaId) {
    body.suggestedAreaId = suggestedAreaId;
  }

  return body;
}

// ─── Main screen ───────────────────────────────────────────────────────────────

export default function NuevaSolicitudScreen() {
  const params = useLocalSearchParams<{
    title?: string;
    description?: string;
    category?: string;
    supportType?: string;
    applicantType?: string;
    suggestedAreaId?: string;
    suggestedAreaName?: string;
  }>();

  const [suggestedAreaId] = useState<string | undefined>(params.suggestedAreaId || undefined);

  // Build chip option lists: de-duplicated union of prefilled value + predefined list
  const categoryOptions = Array.from(
    new Set([...(params.category ? [params.category] : []), ...CATEGORIES]),
  );
  const supportOptions = Array.from(
    new Set([...(params.supportType ? [params.supportType] : []), ...SUPPORT_TYPES]),
  );

  // ─── Form state (pre-filled from params when available) ──────────────────
  const [form, setForm] = useState<FormState>({
    applicantType: (params.applicantType as ApplicantType) || '',
    representativeName: '',
    representativeDni: '',
    contactPhone: '',
    entityName: '',
    officialPosition: '',
    comunidadNombre: '',
    direccion: '',
    localidad: '',
    district: '',
    category: params.category || '',
    supportType: params.supportType || '',
    description: params.description || '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CreateRequestResult | null>(null);
  const [signature, setSignature] = useState('');
  const [padOpen, setPadOpen] = useState(false);

  const { isOpen, loading: convoLoading } = useConvocatoria();

  function setField(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setFormError('');
  }

  // ─── Submit ───────────────────────────────────────────────────────────────
  async function handleSubmit() {
    setFormError('');
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setFormError('Corrige los errores antes de enviar.');
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const body = buildCreateBody(form, signature, suggestedAreaId);
      const res: CreateRequestResult = await api.post('/requests', body);
      await SecureStore.setItemAsync('last_dni', form.representativeDni);
      setResult(res);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setFormError(
            'La convocatoria está cerrada en este momento. No se pueden enviar solicitudes.',
          );
        } else {
          setFormError(err.message);
        }
      } else if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Error al enviar la solicitud');
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Convocatoria cerrada: no se permite crear solicitudes ─────────────────
  if (!convoLoading && !isOpen) {
    return (
      <Screen scroll>
        <ScreenHeader title="Nueva solicitud" subtitle="Solicitud de apoyo a la UNCP" />
        <EmptyState
          icon="time-outline"
          title="Convocatoria cerrada"
          message="El envío de solicitudes está disponible solo cuando hay una convocatoria abierta. Puedes hacer seguimiento de tus solicitudes o explorar el catálogo de servicios mientras tanto."
          action={{ title: 'Ver catálogo de servicios', onPress: () => router.push('/catalogo') }}
        />
        <View style={{ marginTop: space[4] }}>
          <Button
            title="Hacer seguimiento"
            variant="secondary"
            fullWidth
            onPress={() => router.replace('/seguimiento')}
          />
        </View>
      </Screen>
    );
  }

  // ─── Success view ─────────────────────────────────────────────────────────
  if (result) {
    return (
      <SuccessView
        result={result}
        representativeDni={form.representativeDni}
        onReset={() => setResult(null)}
      />
    );
  }

  // ─── Form view ────────────────────────────────────────────────────────────
  return (
    <Screen scroll>
      <ScreenHeader title="Nueva solicitud" subtitle="Solicitud de apoyo a la UNCP" />

      {/* 1. Tipo de solicitante */}
      <AppText
        variant="overline"
        muted
        style={{ marginTop: space[6], marginBottom: space[3] }}>
        ELIGE EL GRUPO AL CUAL PERTENECES
      </AppText>
      <Card style={{ gap: space[4] }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>
          {APPLICANT_TYPES.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              selected={form.applicantType === opt.value}
              onPress={() => setField('applicantType', opt.value)}
            />
          ))}
        </View>
        {errors.applicantType ? (
          <AppText variant="bodySm" color={colors.danger}>
            {errors.applicantType}
          </AppText>
        ) : null}
      </Card>

      {/* 2. Datos del representante */}
      <AppText
        variant="overline"
        muted
        style={{ marginTop: space[6], marginBottom: space[3] }}>
        Datos del representante
      </AppText>
      <Card style={{ gap: space[4] }}>
        <Input
          label="Nombre completo"
          value={form.representativeName}
          onChangeText={(t) => setField('representativeName', t)}
          placeholder="Nombre y apellidos del representante"
          error={errors.representativeName}
        />
        <Input
          label="DNI"
          value={form.representativeDni}
          onChangeText={(t) => setField('representativeDni', t)}
          placeholder="8 dígitos"
          keyboardType="number-pad"
          maxLength={8}
          error={errors.representativeDni}
        />
        <Input
          label="Número de celular"
          value={form.contactPhone}
          onChangeText={(t) => setField('contactPhone', t)}
          placeholder="Número de celular"
          keyboardType="phone-pad"
          error={errors.contactPhone}
        />
        <Input
          label="Dirección donde vive usted"
          value={form.direccion}
          onChangeText={(t) => setField('direccion', t)}
          placeholder="Av./Jr./Calle y número"
          error={errors.direccion}
        />
        <Input
          label="Cargo / condición"
          value={form.officialPosition}
          onChangeText={(t) => setField('officialPosition', t)}
          placeholder="Ej. Presidente de la Comunidad"
          error={errors.officialPosition}
        />
      </Card>

      {/* 3. Datos institucionales — solo para gobierno_local */}
      {form.applicantType === 'gobierno_local' ? (
        <>
          <AppText
            variant="overline"
            muted
            style={{ marginTop: space[6], marginBottom: space[3] }}>
            Datos institucionales
          </AppText>
          <Card style={{ gap: space[4] }}>
            <Input
              label="Nombre de la entidad"
              value={form.entityName}
              onChangeText={(t) => setField('entityName', t)}
              placeholder="Nombre de la municipalidad u organismo"
              error={errors.entityName}
            />
          </Card>
        </>
      ) : null}

      {/* 4. Comunidad y ubicación */}
      <AppText
        variant="overline"
        muted
        style={{ marginTop: space[6], marginBottom: space[3] }}>
        Comunidad y ubicación
      </AppText>
      <Card style={{ gap: space[4] }}>
        <Input
          label="Nombre de la comunidad (opcional)"
          value={form.comunidadNombre}
          onChangeText={(t) => setField('comunidadNombre', t)}
          placeholder="Nombre de la comunidad o institución"
          error={errors.comunidadNombre}
        />
        <Input
          label="Localidad / centro poblado (opcional)"
          value={form.localidad}
          onChangeText={(t) => setField('localidad', t)}
          placeholder="Localidad donde se ubican"
          error={errors.localidad}
        />
        <Input
          label="Distrito"
          value={form.district}
          onChangeText={(t) => setField('district', t)}
          placeholder="Distrito de Junín"
          error={errors.district}
        />
      </Card>

      {/* 5. Tu solicitud */}
      <AppText
        variant="overline"
        muted
        style={{ marginTop: space[6], marginBottom: space[3] }}>
        Tu solicitud
      </AppText>
      <Card style={{ gap: space[4] }}>
        {/* Categoría */}
        <View>
          <AppText variant="overline" muted style={{ marginBottom: space[3] }}>
            Categoría
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>
            {categoryOptions.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                selected={form.category === cat}
                onPress={() => setField('category', cat)}
              />
            ))}
          </View>
          {errors.category ? (
            <AppText variant="bodySm" color={colors.danger} style={{ marginTop: space[2] }}>
              {errors.category}
            </AppText>
          ) : null}
        </View>

        {/* Tipo de apoyo */}
        <View>
          <AppText variant="overline" muted style={{ marginBottom: space[3] }}>
            Tipo de apoyo solicitado
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>
            {supportOptions.map((st) => (
              <Chip
                key={st}
                label={st}
                selected={form.supportType === st}
                onPress={() => setField('supportType', st)}
              />
            ))}
          </View>
          {errors.supportType ? (
            <AppText variant="bodySm" color={colors.danger} style={{ marginTop: space[2] }}>
              {errors.supportType}
            </AppText>
          ) : null}
        </View>

        <Input
          label="Descripción de la solicitud"
          value={form.description}
          onChangeText={(t) => setField('description', t)}
          placeholder="Describe detalladamente tu solicitud, necesidades y contexto..."
          multiline
          error={errors.description}
        />
      </Card>

      {/* 6. Firma del solicitante */}
      <AppText
        variant="overline"
        muted
        style={{ marginTop: space[6], marginBottom: space[3] }}>
        Firma del solicitante
      </AppText>
      <Card style={{ gap: space[4] }}>
        {!signature ? (
          <>
            <Button
              title="Firmar solicitud"
              variant="secondary"
              iconLeft={<Ionicons name="create-outline" size={18} color={colors.textPrimary} />}
              onPress={() => setPadOpen(true)}
              fullWidth
            />
            <AppText variant="bodySm" muted style={{ textAlign: 'center' }}>
              La firma es opcional pero se recomienda para validar la solicitud.
            </AppText>
          </>
        ) : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
              <Ionicons name="checkmark-circle" size={22} color={colors.success} />
              <AppText variant="body" style={{ flex: 1 }}>
                Firma registrada
              </AppText>
            </View>
            <View style={{ flexDirection: 'row', gap: space[3] }}>
              <Button
                title="Volver a firmar"
                variant="secondary"
                size="sm"
                onPress={() => setPadOpen(true)}
              />
              <Button
                title="Borrar"
                variant="danger"
                size="sm"
                onPress={() => setSignature('')}
              />
            </View>
          </>
        )}
      </Card>

      <SignaturePad
        visible={padOpen}
        onClose={() => setPadOpen(false)}
        onSave={(url) => setSignature(url)}
      />

      {/* Error global */}
      {formError ? (
        <AppText
          variant="bodySm"
          color={colors.danger}
          style={{ marginTop: space[4], textAlign: 'center' }}>
          {formError}
        </AppText>
      ) : null}

      {/* Acción */}
      <View style={{ marginTop: space[6], gap: space[3] }}>
        <Button
          title="Enviar solicitud"
          variant="primary"
          onPress={handleSubmit}
          loading={submitting}
          fullWidth
        />
      </View>
    </Screen>
  );
}

// ─── Success view component ────────────────────────────────────────────────────

interface SuccessViewProps {
  result: CreateRequestResult;
  representativeDni: string;
  onReset: () => void;
}

function SuccessView({ result, representativeDni, onReset }: SuccessViewProps) {
  return (
    <Screen scroll>
      <ScreenHeader title="Solicitud enviada" />

      <View
        style={{
          flex: 1,
          alignItems: 'center',
          paddingTop: space[6],
        }}>
        <Ionicons name="checkmark-circle" size={56} color={colors.success} />

        <AppText
          variant="h2"
          style={{ marginTop: space[4], marginBottom: space[3], textAlign: 'center' }}>
          ¡Solicitud enviada!
        </AppText>

        <Card
          style={{
            width: '100%',
            gap: space[4],
            alignItems: 'center',
          }}>
          {/* DNI as tracking code */}
          <View
            style={{
              backgroundColor: colors.primarySoft,
              borderRadius: radii.md,
              paddingHorizontal: space[5],
              paddingVertical: space[3],
              borderWidth: 1,
              borderColor: colors.primaryRing,
              alignItems: 'center',
              width: '100%',
            }}>
            <AppText variant="overline" muted style={{ textAlign: 'center', marginBottom: space[1] }}>
              CÓDIGO DE SEGUIMIENTO
            </AppText>
            <AppText
              variant="h2"
              color={colors.primary}
              style={{ textAlign: 'center', letterSpacing: 2 }}>
              {representativeDni}
            </AppText>
          </View>

          <AppText variant="body" style={{ textAlign: 'center' }}>
            {result.message}
          </AppText>
        </Card>

        <View style={{ width: '100%', marginTop: space[6], gap: space[3] }}>
          <Button
            title="Hacer seguimiento"
            variant="primary"
            onPress={() => router.replace('/seguimiento')}
            fullWidth
          />
          <Button
            title="Crear otra solicitud"
            variant="secondary"
            onPress={onReset}
            fullWidth
          />
        </View>
      </View>
    </Screen>
  );
}
