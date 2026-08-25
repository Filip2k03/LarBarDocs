import React from 'react';
import {ActivityIndicator,StyleSheet,View} from 'react-native';
import {NavigationContainer,DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {colors} from '../../design-system/colors';
import {useAuth} from '../providers/AuthProvider';
import {useRegistrationCase} from '../providers/RegistrationCaseProvider';
import {StaffLoginScreen} from '../../features/auth/AuthScreens';
import {StaffCasesScreen,NewStaffCaseScreen} from '../../features/application/StaffCaseScreens';
import {ActivationScreen,ApplicationHome,PersonalScreen,RequirementsScreen,ReviewScreen,StatusScreen,SubmitScreen} from '../../features/application/ApplicationScreens';
import {DocumentCaptureScreen} from '../../features/documents/DocumentCaptureScreen';
import {PrivacyScreen,SupportScreen} from '../../features/utility/UtilityScreens';
import type {RootParams} from './types';

const Stack=createNativeStackNavigator<RootParams>();
const theme={...DefaultTheme,colors:{...DefaultTheme.colors,background:colors.background,primary:colors.primary,card:colors.surface,text:colors.text,border:colors.border}};

export function RootNavigator(){
  const{session,restoring}=useAuth();const{caseId}=useRegistrationCase();
  if(restoring)return <View style={s.loading}><ActivityIndicator color={colors.primary} size="large" accessibilityLabel="Restoring secure staff session"/></View>;
  return <NavigationContainer theme={theme} linking={{prefixes:['labar-driverreg://','https://labar.com.mm/driver-registration'],config:{screens:{Status:'application/status',Activation:'activation'}}}}><Stack.Navigator screenOptions={{headerShown:false,animation:'slide_from_right'}}>{!session?<Stack.Screen name="StaffLogin" component={StaffLoginScreen}/>:!caseId?<><Stack.Screen name="Cases" component={StaffCasesScreen}/><Stack.Screen name="NewCase" component={NewStaffCaseScreen}/><Stack.Screen name="Privacy" component={PrivacyScreen}/></>:<><Stack.Screen name="Home" component={ApplicationHome}/><Stack.Screen name="Cases" component={StaffCasesScreen}/><Stack.Screen name="NewCase" component={NewStaffCaseScreen}/><Stack.Screen name="Personal" component={PersonalScreen}/><Stack.Screen name="Requirements" component={RequirementsScreen}/><Stack.Screen name="Capture" component={DocumentCaptureScreen} options={{presentation:'fullScreenModal'}}/><Stack.Screen name="Review" component={ReviewScreen}/><Stack.Screen name="Submit" component={SubmitScreen}/><Stack.Screen name="Status" component={StatusScreen}/><Stack.Screen name="Activation" component={ActivationScreen}/><Stack.Screen name="Support" component={SupportScreen}/><Stack.Screen name="Privacy" component={PrivacyScreen}/></>}</Stack.Navigator></NavigationContainer>;
}
const s=StyleSheet.create({loading:{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:colors.background}});
