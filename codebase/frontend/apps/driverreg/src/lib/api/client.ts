import {environment} from '../config/environment';
import {ApiError} from './errors';
import {clearSession, loadSession, saveSession} from '../auth/secureSession';
import type {ApiEnvelope, ApiErrorBody, Session} from '../../types/api';

type Options = RequestInit & {auth?: boolean; timeoutMs?: number; retry401?: boolean};
let refreshPromise: Promise<Session|null>|null = null;

async function rotate(): Promise<Session|null> {
  const current = await loadSession(); if (!current?.refresh_token) return null;
  try {const next = await request<Session>('/auth/refresh', {method: 'POST', body: JSON.stringify({refresh_token: current.refresh_token}), retry401: false}); await saveSession(next); return next;} catch {await clearSession(); return null;}
}

export async function request<T>(path: string, options: Options = {}): Promise<T> {
  const {auth = false, timeoutMs = 15000, retry401 = true, headers, ...init} = options;
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), timeoutMs);
  const session = auth ? await loadSession() : null;
  try {
    const response = await fetch(`${environment.apiBaseUrl}${path}`, {...init, signal: controller.signal, headers: {'Accept':'application/json','Content-Type':'application/json','X-Client-Platform':'driverreg-mobile', ...(session?.access_token ? {Authorization:`Bearer ${session.access_token}`} : {}), ...headers}});
    if (response.status === 401 && auth && retry401) {refreshPromise ||= rotate().finally(() => {refreshPromise = null;}); const refreshed = await refreshPromise; if (refreshed) return request<T>(path, {...options, retry401: false});}
    const body = (response.status === 204 ? undefined : await response.json().catch(() => undefined)) as ApiEnvelope<T>|ApiErrorBody|undefined;
    if (!response.ok) {const failure = body as ApiErrorBody|undefined; throw new ApiError(failure?.error?.code || `HTTP_${response.status}`, failure?.error?.message || 'The request could not be completed.', response.status, failure?.error?.fields, failure?.meta?.request_id);}
    if (body && 'data' in body) return body.data as T;
    return body as T;
  } catch (error) {if (error instanceof ApiError) throw error; if ((error as Error).name === 'AbortError') throw new ApiError('TIMEOUT','The request timed out.',408); throw new ApiError('NETWORK_ERROR','Unable to reach LaBar. Check your connection and retry.',0);} finally {clearTimeout(timer);}
}
export const api = {get:<T>(p:string, auth=false)=>request<T>(p,{auth}), post:<T>(p:string,b?:unknown,auth=false,h?:Record<string,string>)=>request<T>(p,{method:'POST',body:b===undefined?undefined:JSON.stringify(b),auth,headers:h}), put:<T>(p:string,b:unknown,auth=true)=>request<T>(p,{method:'PUT',body:JSON.stringify(b),auth})};

