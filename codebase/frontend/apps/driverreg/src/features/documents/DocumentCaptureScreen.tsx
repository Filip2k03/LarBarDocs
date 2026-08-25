import React,{useEffect,useRef,useState} from 'react';
import {ActivityIndicator,StyleSheet,Text,View} from 'react-native';
import {Camera,useCameraDevice} from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Screen} from '../../components/layout/Screen';
import {ErrorSummary,PrimaryButton} from '../../components/forms/Fields';
import {colors} from '../../design-system/colors';
import {driverRegService} from '../../services/driverReg.service';
import {useRegistrationCase} from '../../app/providers/RegistrationCaseProvider';
import type {RootParams} from '../../app/navigation/types';

type State='permission'|'ready'|'captured'|'preparing'|'uploading'|'verifying'|'failed';
export function DocumentCaptureScreen({route,navigation}:NativeStackScreenProps<RootParams,'Capture'>){
  const{caseId}=useRegistrationCase();const device=useCameraDevice('back');const camera=useRef<Camera>(null);const[state,setState]=useState<State>('permission');const[path,setPath]=useState('');const[error,setError]=useState('');
  useEffect(()=>{setState(Camera.getCameraPermissionStatus()==='granted'?'ready':'permission');},[]);
  const permission=async()=>{const value=await Camera.requestCameraPermission();setState(value==='granted'?'ready':'permission');if(value!=='granted')setError('Camera permission is required. Enable it in system settings to capture this evidence.');};
  const capture=async()=>{if(!camera.current)return;try{const photo=await camera.current.takePhoto({flash:'off'});setPath(photo.path);setState('captured');}catch(e){setError((e as Error).message);setState('failed');}};
  const cleanup=async()=>{if(path&&await RNFS.exists(path))await RNFS.unlink(path);setPath('');};
  const upload=async()=>{try{setState('preparing');const stat=await RNFS.stat(path);const checksum=await RNFS.hash(path,'sha256');const ticket=await driverRegService.presign({application_id:caseId,mime_type:'image/jpeg',size_bytes:Number(stat.size),checksum_sha256:checksum,document_type:route.params.documentType,source_mode:'staff_assisted'});setState('uploading');const blob=await(await fetch(`file://${path}`)).blob();await driverRegService.directUpload(ticket.upload_url,blob,{'Content-Type':'image/jpeg'});setState('verifying');await driverRegService.completeUpload(ticket.upload_id);await cleanup();navigation.goBack();}catch(e){setError((e as Error).message);setState('failed');}};
  if(!device&&state==='ready')return <Screen title="Camera unavailable" dark><ErrorSummary message="No compatible rear camera is available."/></Screen>;
  return <Screen title={route.params.title} eyebrow="Secure staff evidence capture" dark footer={state==='permission'?<PrimaryButton label="Allow camera" onPress={permission}/>:state==='ready'?<PrimaryButton label="Capture" onPress={capture}/>:state==='captured'||state==='failed'?<PrimaryButton label="Use photo and upload" onPress={upload}/>:undefined}><ErrorSummary message={error}/>{state==='ready'&&device?<View style={s.camera}><Camera ref={camera} style={StyleSheet.absoluteFill} device={device} isActive photo/><View style={s.guide}/></View>:null}{state==='captured'?<View style={s.review}><Text style={s.light}>Photo captured in temporary app storage.</Text><PrimaryButton label="Retake" tone="yellow" onPress={()=>{cleanup().then(()=>setState('ready'));}}/></View>:null}{['preparing','uploading','verifying'].includes(state)?<View style={s.center}><ActivityIndicator color={colors.yellow} size="large"/><Text style={s.light}>{state==='preparing'?'Preparing and hashing…':state==='uploading'?'Uploading securely…':'Verifying with LaBar API…'}</Text></View>:null}</Screen>;
}
const s=StyleSheet.create({camera:{height:430,borderRadius:20,overflow:'hidden',backgroundColor:'#000'},guide:{position:'absolute',left:20,right:20,top:100,height:220,borderWidth:2,borderColor:'#fff',borderRadius:16},review:{gap:20},center:{flex:1,alignItems:'center',justifyContent:'center',gap:16},light:{color:'#fff',textAlign:'center'}});
