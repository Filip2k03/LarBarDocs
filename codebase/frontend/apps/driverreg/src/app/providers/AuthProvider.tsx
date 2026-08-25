import React,{createContext,useCallback,useContext,useEffect,useMemo,useState} from 'react';
import type {Session} from '../../types/api';
import {clearSession,loadSession,saveSession} from '../../lib/auth/secureSession';
import {driverRegService} from '../../services/driverReg.service';

type AuthValue={session:Session|null;restoring:boolean;accept:(session:Session)=>Promise<void>;signOut:()=>Promise<void>};
const Context=createContext<AuthValue|null>(null);
const staffRoles=new Set(['marketer','driver_registrar','registration_manager']);
const isRegistrationStaff=(roles:string[])=>roles.some(role=>staffRoles.has(role));

export function AuthProvider({children}:{children:React.ReactNode}){
  const[session,setSession]=useState<Session|null>(null);const[restoring,setRestoring]=useState(true);
  useEffect(()=>{loadSession().then(async saved=>{if(!saved)return;try{const user=await driverRegService.me();if(!isRegistrationStaff(user.roles))throw new Error('DriverReg is restricted to registration staff.');setSession({...saved,user});}catch{await clearSession();}}).finally(()=>setRestoring(false));},[]);
  const accept=useCallback(async(next:Session)=>{if(!isRegistrationStaff(next.user.roles))throw new Error('This account is not authorized for DriverReg.');await saveSession(next);setSession(next);driverRegService.registerDevice().catch(()=>undefined);},[]);
  const signOut=useCallback(async()=>{try{await driverRegService.logout();}finally{await clearSession();setSession(null);}},[]);
  const value=useMemo(()=>({session,restoring,accept,signOut}),[session,restoring,accept,signOut]);return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useAuth(){const value=useContext(Context);if(!value)throw new Error('useAuth must be inside AuthProvider');return value;}
