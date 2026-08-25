import React,{useState} from 'react';
import {StyleSheet,Text} from 'react-native';
import {Screen} from '../../components/layout/Screen';
import {ErrorSummary,PrimaryButton,TextField} from '../../components/forms/Fields';
import {colors} from '../../design-system/colors';
import {driverRegService} from '../../services/driverReg.service';
import {useAuth} from '../../app/providers/AuthProvider';

export function StaffLoginScreen(){
  const[staffId,setStaffId]=useState('');const[password,setPassword]=useState('');const[error,setError]=useState('');const[loading,setLoading]=useState(false);const{accept}=useAuth();
  const submit=async()=>{if(!staffId.trim()||!password){setError('Enter your staff ID and password.');return;}setLoading(true);setError('');try{await accept(await driverRegService.staffLogin(staffId.trim(),password));}catch(e){setError((e as Error).message);}finally{setLoading(false)}};
  return <Screen title="Staff sign in" eyebrow="LaBar DriverReg"><ErrorSummary message={error}/><Text style={s.lead}>DriverReg is for authorized LaBar marketers and registration-center staff. Prospective drivers do not sign in here.</Text><TextField label="Staff ID" value={staffId} onChangeText={setStaffId} autoCapitalize="none" autoComplete="username"/><TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password"/><PrimaryButton label={loading?'Signing in securely…':'Sign in to registration center'} disabled={loading} onPress={submit}/><Text style={s.note}>Driver approval remains independent. Registration staff cannot approve a case they created or edited.</Text></Screen>;
}
const s=StyleSheet.create({lead:{fontSize:15,lineHeight:23,color:colors.secondaryText,marginBottom:24},note:{fontSize:13,lineHeight:20,color:colors.secondaryText,marginTop:20}});
