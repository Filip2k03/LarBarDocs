import * as Keychain from 'react-native-keychain';
import type {Session} from '../../types/api';
const service = 'mm.labar.driverreg.session';
export async function saveSession(session: Session) {await Keychain.setGenericPassword('session', JSON.stringify(session), {service, accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY});}
export async function loadSession(): Promise<Session|null> {const value = await Keychain.getGenericPassword({service}); if (!value) return null; try {return JSON.parse(value.password) as Session;} catch {await clearSession(); return null;}}
export async function clearSession() {await Keychain.resetGenericPassword({service});}

