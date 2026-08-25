import React from 'react';
import {StyleSheet} from 'react-native';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {AuthProvider} from './AuthProvider';
import {RegistrationCaseProvider} from './RegistrationCaseProvider';

const client=new QueryClient({defaultOptions:{queries:{retry:(count,error)=>count<2&&(error as {status?:number}).status!==401,staleTime:15000},mutations:{retry:false}}});
export function AppProviders({children}:{children:React.ReactNode}){return <GestureHandlerRootView style={styles.root}><SafeAreaProvider><QueryClientProvider client={client}><AuthProvider><RegistrationCaseProvider>{children}</RegistrationCaseProvider></AuthProvider></QueryClientProvider></SafeAreaProvider></GestureHandlerRootView>;}
const styles=StyleSheet.create({root:{flex:1}});
