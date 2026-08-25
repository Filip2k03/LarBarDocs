import React,{useState} from 'react';
import {Text} from 'react-native';
import {Screen} from '../../components/layout/Screen';
import {ErrorSummary,PrimaryButton,TextField} from '../../components/forms/Fields';
import {api} from '../../lib/api/client';
import {useAuth} from '../../app/providers/AuthProvider';
import {useRegistrationCase} from '../../app/providers/RegistrationCaseProvider';

export function SupportScreen(){const{caseId}=useRegistrationCase();const[subject,setSubject]=useState('');const[message,setMessage]=useState('');const[error,setError]=useState('');const[sent,setSent]=useState(false);const submit=async()=>{setError('');try{await api.post('/support/tickets',{category:'driver_registration',application_id:caseId,subject,message},true);setSent(true);}catch(e){setError((e as Error).message);}};return <Screen title="DriverReg support"><ErrorSummary message={error}/>{sent?<Text>Your support request was accepted by LaBar.</Text>:<><TextField label="Subject" value={subject} onChangeText={setSubject}/><TextField label="Message" value={message} onChangeText={setMessage} multiline/><PrimaryButton label="Send support request" disabled={!subject||!message} onPress={submit}/></>}</Screen>;}
export function PrivacyScreen(){const{signOut}=useAuth();const{clearCase}=useRegistrationCase();const logout=async()=>{clearCase();await signOut();};return <Screen title="Privacy and security"><Text>DriverReg protects staff sessions with platform secure storage. Sensitive applicant evidence uses short-lived signed uploads and is never stored in preferences, analytics, or push payloads.</Text><PrimaryButton label="Secure sign out" onPress={logout}/></Screen>;}
