import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  FileText, 
  Car, 
  User, 
  AlertTriangle 
} from 'lucide-react';
import { DriverCase } from '../types';

export const DriverReview: React.FC = () => {
  const [isDocUnblurred, setIsDocUnblurred] = useState<boolean>(false);
  const [decisionNote, setDecisionNote] = useState<string>('Blocking issue: Demonstration licence expired on 24 Nov 2024. Please upload current licence.');

  const sampleCase: DriverCase = {
    id: 'DREG-260823-014',
    driverName: 'MYINT KYAW',
    driverNameMm: 'ဦးမြင့်ကျော်',
    phone: '09798421092',
    nrcNumber: '8/MABANA(N)000903',
    licenceNumber: 'B/00548/11',
    licenceClass: 'B',
    licenceExpiry: '2024-11-24',
    vehiclePlate: '4B-9102',
    vehicleModel: 'Toyota Probox (White)',
    branch: 'Yangon Central HQ',
    status: 'IN_REVIEW',
    riskFlags: ['DOCUMENT_EXPIRED', 'MANUAL_REVIEW_REQUIRED'],
    ocrConfidence: {
      name: 96,
      nrc: 97,
      dob: 99,
      licence: 95,
      overall: 96
    },
    livenessScore: 99,
    faceMatchScore: 94,
    submittedAt: '23 Aug 2026, 21:40',
    assignedReviewer: 'PSO Ko Zaw Min'
  };

  const handleUnlockDoc = () => {
    const reason = prompt('CONFIDENTIAL AUDIT LOG: Please enter your review purpose to view the unredacted original driving licence:');
    if (reason && reason.trim().length > 3) {
      setIsDocUnblurred(true);
      alert(`✓ Purpose recorded in immutable audit log: "${reason}". Document unlocked for this session.`);
    }
  };

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--ink-primary)' }}>
              Case {sampleCase.id} — {sampleCase.driverName}
            </h2>
            <span style={{
              background: 'var(--crimson-light)',
              color: 'var(--crimson-600)',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 800
            }}>
              ⚠️ Expired Licence Flag
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
            Submitted by Registrar: Mya Mya • Branch: {sampleCase.branch} • Timestamp: {sampleCase.submittedAt}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => alert('Case reassigned to secondary KYC specialist.')}
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-main)',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Reassign Case
          </button>
        </div>
      </div>

      {/* Main 2-Column Review Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
        {/* Left Column: Source Evidence & OCR Comparison */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Document Preview Card */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--border-main)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="var(--gold-600)" />
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink-primary)' }}>
                  Myanmar Driving Licence (Smart Card)
                </span>
              </div>
              <button 
                onClick={handleUnlockDoc}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: isDocUnblurred ? 'var(--emerald-light)' : 'var(--surface-elevated)',
                  border: '1px solid var(--border-main)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: isDocUnblurred ? 'var(--emerald-600)' : 'var(--ink-primary)',
                  cursor: 'pointer'
                }}
              >
                {isDocUnblurred ? <Eye size={14} /> : <EyeOff size={14} />}
                <span>{isDocUnblurred ? 'Audited View Active' : 'Unlock Original (Records Audit)'}</span>
              </button>
            </div>

            {/* Simulated Licence Mockup */}
            <div style={{
              height: '200px',
              background: '#F1F5F9',
              border: '2px dashed var(--border-subtle)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                filter: isDocUnblurred ? 'none' : 'blur(4px)',
                textAlign: 'center',
                transition: 'filter 0.3s ease'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>
                  THE REPUBLIC OF THE UNION OF MYANMAR
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', marginTop: '2px' }}>
                  DRIVING LICENCE • CLASS "B" (MOTOR CAR)
                </div>
                <div style={{ marginTop: '10px', fontSize: '13px', fontWeight: 800 }}>
                  Licence No: B/00548/11
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700 }}>
                  Name: MYINT KYAW (ဦးမြင့်ကျော်)
                </div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  NRC: 8/MABANA(N)000903 • DOB: 15/03/1973
                </div>
                <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: 800, color: 'var(--crimson-600)' }}>
                  VALID TO: 24/11/2024 (EXPIRED)
                </div>
              </div>

              {!isDocUnblurred && (
                <div style={{
                  position: 'absolute',
                  background: 'rgba(15, 23, 42, 0.85)',
                  color: '#FFFFFF',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <EyeOff size={14} />
                  <span>Confidential Data Protected — Click to Audit Unlock</span>
                </div>
              )}
            </div>
          </div>

          {/* OCR Assistive Verification Table */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--border-main)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 900, color: 'var(--ink-primary)', marginBottom: '12px' }}>
              Assistive OCR Extraction vs Candidate Claim
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 80px', padding: '8px 0', borderBottom: '1px solid var(--border-main)' }}>
                <span style={{ color: 'var(--ink-secondary)' }}>Full Legal Name:</span>
                <span style={{ fontWeight: 800, color: 'var(--ink-primary)' }}>{sampleCase.driverName}</span>
                <span style={{ color: 'var(--emerald-600)', fontWeight: 800, textAlign: 'right' }}>96% Conf</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 80px', padding: '8px 0', borderBottom: '1px solid var(--border-main)' }}>
                <span style={{ color: 'var(--ink-secondary)' }}>NRC Smartcard:</span>
                <span style={{ fontWeight: 800, color: 'var(--ink-primary)' }}>{sampleCase.nrcNumber}</span>
                <span style={{ color: 'var(--emerald-600)', fontWeight: 800, textAlign: 'right' }}>97% Conf</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 80px', padding: '8px 0', borderBottom: '1px solid var(--border-main)' }}>
                <span style={{ color: 'var(--ink-secondary)' }}>Licence Number:</span>
                <span style={{ fontWeight: 800, color: 'var(--ink-primary)' }}>{sampleCase.licenceNumber}</span>
                <span style={{ color: 'var(--emerald-600)', fontWeight: 800, textAlign: 'right' }}>95% Conf</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 80px', padding: '8px 0', borderBottom: '1px solid var(--border-main)' }}>
                <span style={{ color: 'var(--ink-secondary)' }}>Validity Expiry:</span>
                <span style={{ fontWeight: 900, color: 'var(--crimson-600)' }}>{sampleCase.licenceExpiry} (EXPIRED)</span>
                <span style={{ color: 'var(--crimson-600)', fontWeight: 800, textAlign: 'right' }}>FLAGGED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Identity Matching, Vehicle, and Decision Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Biometric Liveness & Facial Comparison */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--border-main)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 900, color: 'var(--ink-primary)', marginBottom: '12px' }}>
              Biometric Liveness &amp; Face Matching
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-main)' }}>
                <span style={{ color: 'var(--ink-secondary)' }}>Active 3D Liveness:</span>
                <span style={{ fontWeight: 800, color: 'var(--emerald-600)' }}>✓ Passed ({sampleCase.livenessScore}%)</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-main)' }}>
                <span style={{ color: 'var(--ink-secondary)' }}>Face Similarity vs NRC:</span>
                <span style={{ fontWeight: 800, color: 'var(--emerald-600)' }}>✓ 94% Match</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-main)' }}>
                <span style={{ color: 'var(--ink-secondary)' }}>Duplicate Driver Index:</span>
                <span style={{ fontWeight: 800, color: 'var(--emerald-600)' }}>✓ Clean (0 Matches)</span>
              </div>
            </div>
          </div>

          {/* Vehicle & Commercial Compliance */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--border-main)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 900, color: 'var(--ink-primary)', marginBottom: '12px' }}>
              Vehicle &amp; Insurance Records
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-main)' }}>
                <span style={{ color: 'var(--ink-secondary)' }}>License Plate:</span>
                <span style={{ fontWeight: 800, color: 'var(--ink-primary)' }}>{sampleCase.vehiclePlate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-main)' }}>
                <span style={{ color: 'var(--ink-secondary)' }}>Make &amp; Model:</span>
                <span style={{ fontWeight: 700 }}>{sampleCase.vehicleModel}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-main)' }}>
                <span style={{ color: 'var(--ink-secondary)' }}>Commercial Road Tax:</span>
                <span style={{ fontWeight: 800, color: 'var(--emerald-600)' }}>Valid (8 Jan 2027)</span>
              </div>
            </div>
          </div>

          {/* Decision Workflow Box */}
          <div style={{
            background: 'var(--gold-light)',
            border: '1.5px solid var(--gold-500)',
            borderRadius: '16px',
            padding: '20px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 900, color: 'var(--gold-600)', marginBottom: '6px' }}>
              KYC Decision Action
            </h3>
            <p style={{ fontSize: '12px', color: '#92400E', marginBottom: '12px' }}>
              Regulatory note: Expired driving licence cannot be approved. Request a refreshed capture from driver.
            </p>

            <textarea 
              value={decisionNote}
              onChange={(e) => setDecisionNote(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid var(--gold-500)',
                background: '#FFFFFF',
                fontSize: '12px',
                color: 'var(--ink-primary)',
                marginBottom: '12px',
                fontFamily: 'inherit'
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                onClick={() => alert(`✓ Correction request dispatched to driver (${sampleCase.phone}) via SMS and DriverReg mobile app!`)}
                style={{
                  background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px',
                  fontWeight: 900,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Request Correction (မွမ်းမံရန် ပြန်ပို့မည်)
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button 
                  onClick={() => alert('Case rejected with policy reason recorded in audit log.')}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--border-main)',
                    borderRadius: '8px',
                    padding: '8px',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    color: 'var(--crimson-600)'
                  }}
                >
                  Reject Case
                </button>

                <button 
                  disabled
                  style={{
                    background: '#CBD5E1',
                    color: '#64748B',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px',
                    fontWeight: 800,
                    fontSize: '12px',
                    cursor: 'not-allowed'
                  }}
                >
                  Approve (Blocked)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
