import {differenceInYears,parseISO} from 'date-fns';
export function normalizeMyanmarPhone(value:string){return value.replace(/[\s()-]/g,'').replace(/^\+?959/,'09');}
export function isMyanmarPhone(value:string){return /^09\d{7,9}$/.test(normalizeMyanmarPhone(value));}
export function ageFromDateOfBirth(value:string,at=new Date()){const date=parseISO(value);if(Number.isNaN(date.getTime())||date>at)throw new Error('Invalid date of birth');return differenceInYears(at,date);}
export function isExpired(value:string,at=new Date()){const date=parseISO(value);if(Number.isNaN(date.getTime()))return true;return date.getTime()<at.getTime();}
export function redact(value:Record<string,unknown>){const blocked=new Set(['phone','email','nrc','licence_number','address','token','authorization','document_url','face']);return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,blocked.has(key.toLowerCase())?'[REDACTED]':item]));}

