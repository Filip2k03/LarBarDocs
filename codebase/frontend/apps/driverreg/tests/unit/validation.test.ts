import {ageFromDateOfBirth,isExpired,isMyanmarPhone,normalizeMyanmarPhone,redact} from '../../src/utils/validation';
describe('identity-safe validation',()=>{
  it('normalizes common Myanmar phone presentation',()=>expect(normalizeMyanmarPhone('+959 123 456 789')).toBe('09123456789'));
  it('validates Myanmar mobile numbers',()=>{expect(isMyanmarPhone('09 123 456 789')).toBe(true);expect(isMyanmarPhone('123')).toBe(false)});
  it('derives age instead of storing it',()=>expect(ageFromDateOfBirth('2000-08-25',new Date('2026-08-24T00:00:00Z'))).toBe(25));
  it('detects expired evidence',()=>expect(isExpired('2025-01-01',new Date('2026-01-01T00:00:00Z'))).toBe(true));
  it('redacts sensitive telemetry',()=>expect(redact({phone:'0912',event:'step_saved'})).toEqual({phone:'[REDACTED]',event:'step_saved'}));
});

