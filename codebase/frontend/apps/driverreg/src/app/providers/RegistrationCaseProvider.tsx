import React,{createContext,useContext,useMemo,useState} from 'react';

type CaseValue={caseId:string|null;selectCase:(id:string)=>void;clearCase:()=>void};
const Context=createContext<CaseValue|null>(null);

export function RegistrationCaseProvider({children}:{children:React.ReactNode}){
  const[caseId,setCaseId]=useState<string|null>(null);
  const value=useMemo(()=>({caseId,selectCase:setCaseId,clearCase:()=>setCaseId(null)}),[caseId]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useRegistrationCase(){const value=useContext(Context);if(!value)throw new Error('useRegistrationCase must be inside RegistrationCaseProvider');return value;}
