export type ApplicationState = 'draft'|'submitted'|'under_review'|'documents_requested'|'verification'|'approved'|'rejected'|'withdrawn';
export type StepKey = 'consent'|'personal'|'nrc'|'driving_licence'|'face_liveness'|'vehicle'|'vehicle_documents'|'payout'|'agreement';
export interface User {id: string; phone: string; display_name?: string; roles: string[]}
export interface Session {access_token: string; refresh_token: string; expires_in: number; token_type: string; user: User}
export interface RegistrationCase {id:string; application_id:string; applicant_user_id:string; actor_user_id:string; applicant_name:string; applicant_phone_masked:string; status:ApplicationState; updated_at:string; source_mode:'staff_assisted'}
export interface ApplicationStep {step: StepKey; data: Record<string, unknown>; completed_at?: string; updated_at?: string}
export interface DriverApplication {id: string; user_id: string; applicant_user_id:string; actor_user_id:string; source_mode:'staff_assisted'; status: ApplicationState; legal_name: string; date_of_birth?: string; submitted_at?: string; reviewed_at?: string; decision_reason?: string; updated_at: string; steps: Partial<Record<StepKey|'identity'|'driver_license'|'vehicle_photos'|'documents'|'bank',Record<string,unknown>>>; requested_corrections?: Array<{step: StepKey; document_types?: string[]; message: string; due_at?: string}>}
export interface MobileConfig {driverreg?: {enabled?: boolean; maintenance?: boolean; staff_assisted_enabled?: boolean; ocr_enabled?: boolean; liveness_enabled?: boolean; payout_enabled?: boolean; required_steps?: StepKey[]}; minimum_version?: string; latest_version?: string; force_update?: boolean}
export interface UploadTicket {upload_id: string; object_key: string; upload_url: string; expires_at: string}
export interface ApiEnvelope<T> {success: boolean; data: T; meta?: {request_id?: string}}
export interface ApiErrorBody {success?: false; error?: {code?: string; message?: string; fields?: Record<string,string>}; meta?: {request_id?: string}}
