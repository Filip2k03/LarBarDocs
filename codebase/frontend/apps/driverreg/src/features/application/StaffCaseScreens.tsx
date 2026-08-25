import React,{useState} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useMutation,useQuery,useQueryClient} from '@tanstack/react-query';
import {z} from 'zod';
import {Screen} from '../../components/layout/Screen';
import {ErrorSummary,PrimaryButton,TextField} from '../../components/forms/Fields';
import {colors} from '../../design-system/colors';
import {driverRegService} from '../../services/driverReg.service';
import {useRegistrationCase} from '../../app/providers/RegistrationCaseProvider';
import type {RootParams} from '../../app/navigation/types';

export function StaffCasesScreen({navigation}:NativeStackScreenProps<RootParams,'Cases'>){
  const query=useQuery({queryKey:['staff-cases'],queryFn:driverRegService.cases});const{selectCase}=useRegistrationCase();
  return <Screen title="Driver registration center" eyebrow="Marketer workspace"><Text style={s.lead}>Create and continue prospective-driver cases. Applicants do not sign in to DriverReg.</Text><ErrorSummary message={query.error?.message}/><PrimaryButton label="Register a new driver" onPress={()=>navigation.navigate('NewCase')}/><View style={s.space}/>{query.isLoading?<Text style={s.muted}>Loading assigned cases…</Text>:query.data?.length?query.data.map(item=><Pressable key={item.id} accessibilityRole="button" onPress={()=>selectCase(item.application_id)} style={s.caseCard}><View><Text style={s.caseName}>{item.applicant_name}</Text><Text style={s.muted}>{item.applicant_phone_masked}</Text></View><Text style={s.status}>{item.status.replaceAll('_',' ')}</Text></Pressable>):<Text style={s.muted}>No registration cases are assigned to this account.</Text>}</Screen>;
}

const schema=z.object({applicant_name:z.string().min(2,'Enter the applicant legal name.'),applicant_phone:z.string().regex(/^09\d{7,9}$/,'Enter a valid Myanmar phone number.'),branch_id:z.string().optional()});
export function NewStaffCaseScreen({navigation}:NativeStackScreenProps<RootParams,'NewCase'>){
  const[name,setName]=useState('');const[phone,setPhone]=useState('');const[branch,setBranch]=useState('');const[error,setError]=useState('');const{selectCase}=useRegistrationCase();const client=useQueryClient();
  const mutation=useMutation({mutationFn:driverRegService.createCase,onSuccess:async created=>{await client.invalidateQueries({queryKey:['staff-cases']});selectCase(created.application_id);navigation.replace('Home');},onError:e=>setError(e.message)});
  const submit=()=>{const parsed=schema.safeParse({applicant_name:name,applicant_phone:phone.replace(/[\s()-]/g,''),branch_id:branch||undefined});if(!parsed.success){setError(parsed.error.issues[0]?.message||'Check the applicant details.');return;}mutation.mutate(parsed.data);};
  return <Screen title="Register a prospective driver" eyebrow="Staff assisted" footer={<PrimaryButton label={mutation.isPending?'Creating secure case…':'Create registration case'} disabled={mutation.isPending} onPress={submit}/>}><ErrorSummary message={error}/><Text style={s.lead}>The marketer is the actor. The prospective driver is the applicant. These identities remain separate in the audit record.</Text><TextField label="Applicant legal name" value={name} onChangeText={setName}/><TextField label="Applicant phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="09xxxxxxxxx"/><TextField label="Registration branch ID (optional)" value={branch} onChangeText={setBranch} autoCapitalize="none"/></Screen>;
}

const s=StyleSheet.create({lead:{fontSize:15,lineHeight:23,color:colors.secondaryText,marginBottom:24},muted:{color:colors.secondaryText},space:{height:24},caseCard:{minHeight:76,marginBottom:12,padding:16,borderRadius:16,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12},caseName:{fontSize:16,fontWeight:'800',color:colors.text,marginBottom:4},status:{fontSize:12,fontWeight:'800',color:colors.primary,textTransform:'capitalize'}});
