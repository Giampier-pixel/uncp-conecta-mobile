import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import {
  AppText,
  Button,
  Card,
  Chip,
  EmptyState,
  Screen,
  Skeleton,
} from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import type { Faculty, Service } from '@/lib/types';
import { colors, space } from '@/theme/theme';

type Tab = 'servicios' | 'facultades';

export default function CatalogoScreen() {
  const params = useLocalSearchParams<{
    areaId?: string;
    areaName?: string;
    category?: string;
    description?: string;
    ts?: string;
  }>();

  const [tab, setTab] = useState<Tab>('servicios');
  const [services, setServices] = useState<Service[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>(
    params.category && !params.areaId ? params.category : 'Todas',
  );
  const [areaFilter, setAreaFilter] = useState<string>(params.areaId ?? '');

  // Resincroniza los filtros cada vez que llegamos con parámetros nuevos (p. ej. desde
  // el asistente con otra necesidad). La pantalla del catálogo permanece montada como tab,
  // por lo que sin esto conservaría el área de la consulta anterior. El nonce `ts` garantiza
  // que también se actualice cuando el área sugerida es la misma que la anterior.
  useEffect(() => {
    setAreaFilter(params.areaId ?? '');
    setCategoryFilter(params.category && !params.areaId ? params.category : 'Todas');
  }, [params.areaId, params.category, params.ts]);

  useEffect(() => {
    setFetchError('');
    setLoading(true);
    Promise.all([
      api.get('/catalog/services') as Promise<Service[]>,
      api.get('/catalog/faculties') as Promise<Faculty[]>,
    ])
      .then(([svc, fac]) => {
        setServices(svc);
        setFaculties(fac);
      })
      .catch((err) => {
        setFetchError(err instanceof ApiError ? err.message : 'Error al cargar el catálogo');
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    'Todas',
    ...Array.from(
      new Set([
        ...(params.category && !params.areaId ? [params.category] : []),
        ...services.map((s) => s.category),
      ]),
    ),
  ];

  const filteredServices = services.filter((s) => {
    const matchArea = areaFilter ? s.facultyArea.id === areaFilter : true;
    const matchCat = categoryFilter === 'Todas' ? true : s.category === categoryFilter;
    return matchArea && matchCat;
  });

  return (
    <Screen scroll>
      <View style={{ marginTop: space[5], marginBottom: space[5] }}>
        <AppText variant="h1" style={{ marginBottom: space[2] }}>
          Catálogo
        </AppText>
        <AppText variant="body" muted>
          Servicios de proyección social y facultades.
        </AppText>
      </View>

      {/* Segmento */}
      <View style={{ flexDirection: 'row', gap: space[2], marginBottom: space[5] }}>
        <Chip label="Servicios" selected={tab === 'servicios'} onPress={() => setTab('servicios')} />
        <Chip label="Facultades" selected={tab === 'facultades'} onPress={() => setTab('facultades')} />
      </View>

      {fetchError ? (
        <Card style={{ gap: space[3] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
            <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
            <AppText variant="body" color={colors.danger}>
              {fetchError}
            </AppText>
          </View>
        </Card>
      ) : null}

      {loading ? (
        <View style={{ gap: space[4] }}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ gap: space[3] }}>
              <Skeleton width="60%" height={22} />
              <Skeleton width="100%" height={16} />
              <Skeleton width="80%" height={16} />
            </View>
          ))}
        </View>
      ) : null}

      {/* Servicios */}
      {!loading && !fetchError && tab === 'servicios' ? (
        <View style={{ gap: space[5] }}>
          {areaFilter ? (
            <Card style={{ gap: space[3], borderColor: colors.primaryRing, borderWidth: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
                <Ionicons name="sparkles" size={18} color={colors.primary} />
                <AppText variant="titleLg" style={{ flex: 1 }}>
                  Servicios sugeridos para tu necesidad
                </AppText>
              </View>
              {params.areaName ? (
                <AppText variant="bodySm" muted>
                  Relacionados con {params.areaName}
                </AppText>
              ) : null}
              <Button
                title="Ver todos los servicios"
                variant="secondary"
                size="sm"
                onPress={() => setAreaFilter('')}
              />
            </Card>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>
              {categories.map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  selected={categoryFilter === cat}
                  onPress={() => setCategoryFilter(cat)}
                />
              ))}
            </View>
          )}

          {filteredServices.length === 0 ? (
            <EmptyState
              icon="grid-outline"
              title="Sin servicios"
              message="No hay servicios para ese filtro."
              action={{
                title: 'Ver todos',
                onPress: () => {
                  setAreaFilter('');
                  setCategoryFilter('Todas');
                },
              }}
            />
          ) : (
            filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                prefillDescription={params.description}
              />
            ))
          )}
        </View>
      ) : null}

      {/* Facultades */}
      {!loading && !fetchError && tab === 'facultades' ? (
        <View style={{ gap: space[4] }}>
          {faculties.length === 0 ? (
            <EmptyState icon="school-outline" title="Sin facultades" message="No se encontraron facultades." />
          ) : (
            faculties.map((faculty) => <FacultyCard key={faculty.id} faculty={faculty} />)
          )}
        </View>
      ) : null}
    </Screen>
  );
}

function ServiceCard({
  service,
  prefillDescription,
}: {
  service: Service;
  prefillDescription?: string;
}) {
  return (
    <Card style={{ gap: space[4] }}>
      <AppText variant="overline" color={colors.primary}>
        {service.category}
      </AppText>
      <AppText variant="titleLg">{service.name}</AppText>
      <AppText variant="body" muted>
        {service.description}
      </AppText>

      {service.requirements.length > 0 ? (
        <View style={{ gap: space[2] }}>
          <AppText variant="overline" muted>
            Requisitos
          </AppText>
          {service.requirements.map((req, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: space[2], alignItems: 'flex-start' }}>
              <Ionicons name="checkmark-circle-outline" size={14} color={colors.success} style={{ marginTop: 3 }} />
              <AppText variant="bodySm" muted style={{ flex: 1 }}>
                {req}
              </AppText>
            </View>
          ))}
        </View>
      ) : null}

      {service.supportTypes.length > 0 ? (
        <View style={{ gap: space[2] }}>
          <AppText variant="overline" muted>
            Tipos de apoyo
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>
            {service.supportTypes.map((st) => (
              <Chip key={st} label={st} selected={false} />
            ))}
          </View>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', gap: space[2], alignItems: 'center' }}>
        <AppText variant="bodySm" muted>
          Facultad/Unidad:
        </AppText>
        <AppText variant="bodySm">{service.facultyArea.name}</AppText>
      </View>

      <Button
        title="Solicitar este apoyo"
        variant="primary"
        fullWidth
        onPress={() => {
          router.push({
            pathname: '/solicitud/nueva',
            params: {
              category: service.category,
              supportType: service.supportTypes[0] ?? '',
              suggestedAreaId: service.facultyArea.id,
              suggestedAreaName: service.facultyArea.name,
              ...(prefillDescription ? { description: prefillDescription } : {}),
            },
          });
        }}
      />
    </Card>
  );
}

function FacultyCard({ faculty }: { faculty: Faculty }) {
  return (
    <Card style={{ gap: space[4] }}>
      <AppText variant="titleLg">{faculty.name}</AppText>
      <AppText variant="body" muted>
        {faculty.description}
      </AppText>

      {faculty.topics.length > 0 ? (
        <View style={{ gap: space[2] }}>
          <AppText variant="overline" muted>
            Temas
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>
            {faculty.topics.map((topic) => (
              <Chip key={topic} label={topic} selected={false} />
            ))}
          </View>
        </View>
      ) : null}

      {faculty.supportTypes.length > 0 ? (
        <View style={{ gap: space[2] }}>
          <AppText variant="overline" muted>
            Tipos de apoyo
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>
            {faculty.supportTypes.map((st) => (
              <Chip key={st} label={st} selected={false} />
            ))}
          </View>
        </View>
      ) : null}

      {faculty.contactEmail ? (
        <View style={{ flexDirection: 'row', gap: space[2], alignItems: 'center' }}>
          <Ionicons name="mail-outline" size={16} color={colors.textMuted} />
          <AppText variant="bodySm" muted>
            {faculty.contactEmail}
          </AppText>
        </View>
      ) : null}
    </Card>
  );
}
