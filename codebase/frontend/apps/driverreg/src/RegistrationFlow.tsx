import React, { useState } from 'react';

export interface DriverRegState {
  step: number;
  staffId: string;
  driverPhone: string;
  driverNameEn: string;
  driverNameMm: string;
  nrcNumber: string;
  licenceNumber: string;
  licenceClass: string;
  licenceExpiry: string;
  vehiclePlate: string;
  vehicleModel: string;
  vehicleYear: string;
  consentGiven: boolean;
  livenessPassed: boolean;
  ocrConfidence: number;
}

export const DriverRegistrationFlow: React.FC = () => {
  const [state, setState] = useState<DriverRegState>({
    step: 1,
    staffId: 'STF-003 (Mya Mya)',
    driverPhone: '09798421092',
    driverNameEn: 'MYINT KYAW',
    driverNameMm: 'ဦးမြင့်ကျော်',
    nrcNumber: '8/MABANA(N)000903',
    licenceNumber: 'B/00548/11',
    licenceClass: 'B',
    licenceExpiry: '2024-11-24',
    vehiclePlate: '4B-9102',
    vehicleModel: 'Toyota Probox',
    vehicleYear: '2016',
    consentGiven: true,
    livenessPassed: true,
    ocrConfidence: 96
  });

  const nextStep = () => setState(prev => ({ ...prev, step: Math.min(prev.step + 1, 10) }));
  const prevStep = () => setState(prev => ({ ...prev, step: Math.max(prev.step - 1, 1) }));

  return (
    <div style={{ maxWidth: '420px', margin: '0 auto', padding: '16px', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#D97706' }}>LaBar DriverReg</span>
          <span style={{ fontSize: '11px', background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
            Step {state.step} of 10
          </span>
        </div>

        {state.step === 1 && (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '6px' }}>1. Staff Authentication</h3>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '14px' }}>Logged in as: <b>{state.staffId}</b> (Yangon Central Branch)</p>
            <button onClick={nextStep} style={{ width: '100%', padding: '12px', background: '#D97706', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>Start New Driver Case ❯</button>
          </div>
        )}

        {state.step === 2 && (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '6px' }}>2. Driver Consent</h3>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '14px' }}>Candidate agrees to biometric and driving licence validation under Myanmar Telecommunications and Transport laws.</p>
            <button onClick={nextStep} style={{ width: '100%', padding: '12px', background: '#059669', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>I Confirm Driver Consent ❯</button>
          </div>
        )}

        {state.step === 5 && (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '6px' }}>5. Myanmar Driving Licence Scan</h3>
            <div style={{ height: '140px', background: '#F1F5F9', border: '2px dashed #CBD5E1', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              📷 Align Smartcard Inside Guide Frame
            </div>
            <button onClick={nextStep} style={{ width: '100%', padding: '12px', background: '#D97706', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>Capture &amp; Run OCR ❯</button>
          </div>
        )}

        {state.step >= 6 && (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '6px' }}>Case Snapshot Ready</h3>
            <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6, marginBottom: '14px' }}>
              <div>Driver: <b>{state.driverNameEn}</b> ({state.driverNameMm})</div>
              <div>NRC: <b>{state.nrcNumber}</b></div>
              <div>Licence: <b>{state.licenceNumber}</b> (Class {state.licenceClass})</div>
              <div>Expiry: <b style={{ color: '#DC2626' }}>{state.licenceExpiry} (Expired)</b></div>
              <div>Vehicle: <b>{state.vehiclePlate}</b> ({state.vehicleModel})</div>
              <div>OCR Confidence: <b style={{ color: '#059669' }}>{state.ocrConfidence}%</b></div>
            </div>
            <button onClick={() => alert('✓ Case submitted to central KYC review queue!')} style={{ width: '100%', padding: '12px', background: '#D97706', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>Submit Case for Review ❯</button>
          </div>
        )}

        {state.step > 1 && (
          <button onClick={prevStep} style={{ width: '100%', marginTop: '8px', padding: '8px', background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>❮ Previous Step</button>
        )}
      </div>
    </div>
  );
};
