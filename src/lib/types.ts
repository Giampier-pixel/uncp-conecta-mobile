export type ApplicantType = 'comunidad_campesina' | 'comunidad_urbana' | 'gobierno_local' | 'otro';
export type RequestChannel = 'app_movil' | 'web';
export type RequestStatus =
  | 'ENVIADA' | 'EN_REVISION' | 'INFORMACION_PENDIENTE' | 'DERIVADA_A_FACULTAD'
  | 'ACEPTADA_GRUPO_ABIERTO' | 'EN_EJECUCION' | 'ATENDIDA_CONSTANCIA_EMITIDA'
  | 'CERRADA' | 'NO_PROCEDE';

export interface ConvocatoriaStatus {
  status: 'abierta' | 'cerrada';
  current: { id: string; name: string; opensAt: string; closesAt: string } | null;
  nextOpensAt: string | null;
  message: string;
}

export interface Faculty {
  id: string; slug: string; name: string; description: string;
  topics: string[]; supportTypes: string[]; contactEmail: string | null;
}
export interface Service {
  id: string; slug: string; name: string; category: string; description: string;
  requirements: string[]; supportTypes: string[];
  facultyArea: { id: string; slug: string; name: string };
}

export interface OrientResult {
  summary: string; category: string; supportType: string; suggestedArea: string;
  suggestedAreaId: string | null; confidence: number; missingFields: string[];
  nextQuestion: string | null; needsInstitutionalValidation: boolean;
  sources: { documentId: string; title: string }[];
}
export interface DraftResult { title: string; formalText: string; fields: Record<string, string>; }

export interface AiClassificationInput {
  category: string; supportType: string; suggestedArea: string; suggestedAreaId?: string;
  confidence: number; missingFields: string[]; reasoningSummary: string;
}
export interface CreateRequestBody {
  representativeName: string; representativeDni: string; contactPhone: string; contactEmail?: string;
  applicantType: ApplicantType; channel: RequestChannel; communityName?: string; location: string; district: string;
  rawDescription: string; formalTitle?: string; formalDescription: string; category: string; supportType: string;
  suggestedAreaId?: string; beneficiariesCount?: number; entityName?: string; officialPosition?: string;
  attachedDocumentName?: string; aiClassification?: AiClassificationInput; signatureImage?: string;
}
export interface CreateRequestResult { id: string; code: string; status: RequestStatus; message: string; createdAt: string; }

export interface PreviewBody {
  applicantType: ApplicantType; representativeName: string; representativeDni?: string; contactPhone?: string;
  contactEmail?: string; communityName: string; location?: string; district?: string;
  category: string; supportType: string; suggestedAreaName?: string; beneficiariesCount?: number;
  formalTitle: string; formalDescription: string; entityName?: string; officialPosition?: string;
  attachedDocumentName?: string; codigo?: string; signatureImage?: string;
}

export interface ReplyBody { requestId: string; dni: string; message: string; }

export interface TimelineEntry {
  status: RequestStatus; statusLabel: string; owner: string;
  nextStep: string | null; comment: string | null; date: string;
}
export interface TrackingItem {
  id: string; code: string; title: string; category: string; supportType: string;
  status: RequestStatus; statusLabel: string; currentOwner: string | null; lastUpdate: string;
  nextStep: string | null; observations: string | null; pendingInfoRequest: string | null;
  acceptedMilestoneReached: boolean; createdAt: string; timeline: TimelineEntry[];
}
export interface TrackingResult { requests: TrackingItem[]; }
