import {Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {api} from '../lib/api/client';
import type {DriverApplication, MobileConfig, RegistrationCase, Session, StepKey, UploadTicket, User} from '../types/api';
export const driverRegService = {
  config: () => api.get<MobileConfig>('/mobile/config'),
  staffLogin: (staff_id:string,password:string) => api.post<Session>('/auth/staff/login',{staff_id,password,app_type:'driverreg',device_name:'LaBar DriverReg'}),
  me: () => api.get<User>('/auth/me',true),
  logout: () => api.post<void>('/auth/logout',undefined,true),
  cases: () => api.get<RegistrationCase[]>('/driver-registration/staff/cases',true),
  createCase: (data:{applicant_name:string;applicant_phone:string;branch_id?:string}) => api.post<RegistrationCase>('/driver-registration/staff/cases',data,true),
  application: (id:string) => api.get<DriverApplication>(`/driver-registration/staff/cases/${id}`,true),
  saveStep: (id:string,step:StepKey,data:Record<string,unknown>,complete:boolean) => api.put<DriverApplication>(`/driver-registration/staff/cases/${id}/steps/${step}`,{data,complete,source_mode:'staff_assisted'}),
  submit: (id:string,key:string) => api.post<DriverApplication>(`/driver-registration/staff/cases/${id}/submit`,undefined,true,{'Idempotency-Key':key}),
  presign: (body:Record<string,unknown>) => api.post<UploadTicket>('/driver-registration/uploads/presign',body,true),
  completeUpload: (id:string) => api.post<{object_key:string}>(`/driver-registration/uploads/${id}/complete`,undefined,true),
  directUpload: async (url:string,file:Blob,headers:Record<string,string>={}) => {const response=await fetch(url,{method:'PUT',body:file,headers});if(!response.ok)throw new Error(`Object upload failed (${response.status}).`);},
  registerDevice: async (pushToken?:string) => api.post('/devices/register',{platform:Platform.OS,device_id:await DeviceInfo.getUniqueId(),push_token:pushToken,push_provider:pushToken?'fcm':undefined,app_type:'driverreg',app_version:DeviceInfo.getVersion(),os_version:DeviceInfo.getSystemVersion(),locale:'en',timezone:Intl.DateTimeFormat().resolvedOptions().timeZone},true),
};
