import React from 'react';
import { 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import { DriverCase } from '../types';

interface DashboardProps {
  onSelectCase: (caseId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectCase }) => {
  const pendingCases: DriverCase[] = [
    {
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
      branch: 'Yangon Central',
      status: 'IN_REVIEW',
      riskFlags: ['DOCUMENT_EXPIRED', 'MANUAL_REVIEW_REQUIRED'],
      ocrConfidence: { name: 96, nrc: 97, dob: 99, licence: 95, overall: 96 },
      livenessScore: 99,
      faceMatchScore: 94,
      submittedAt: '23 Aug 2026, 21:40'
    },
    {
      id: 'DREG-260823-013',
      driverName: 'Daw Mya Win',
      driverNameMm: 'ဒေါ်မြဝင်း',
      phone: '09450012948',
      nrcNumber: '12/DAGANA(N)048291',
      licenceNumber: 'B/09812/19',
      licenceClass: 'B',
      licenceExpiry: '2027-04-12',
      vehiclePlate: '3A-8492',
      vehicleModel: 'Toyota Fielder (Silver)',
      branch: 'Hlaing Township',
      status: 'NEEDS_CORRECTION',
      riskFlags: ['FACE_RETRY_REQUESTED'],
      ocrConfidence: { name: 98, nrc: 99, dob: 98, licence: 97, overall: 98 },
      livenessScore: 82,
      faceMatchScore: 88,
      submittedAt: '23 Aug 2026, 20:15'
    },
    {
      id: 'DREG-260823-012',
      driverName: 'Ko Aung Naing',
      driverNameMm: 'ကိုအောင်နိုင်',
      phone: '09250198421',
      nrcNumber: '12/BAHANA(N)019482',
      licenceNumber: 'B/04192/21',
      licenceClass: 'B',
      licenceExpiry: '2028-09-18',
      vehiclePlate: '1D-4920',
      vehicleModel: 'Toyota Axio (Black)',
      branch: 'Kamayut Township',
      status: 'SUBMITTED',
      riskFlags: [],
      ocrConfidence: { name: 99, nrc: 99, dob: 100, licence: 99, overall: 99 },
      livenessScore: 98,
      faceMatchScore: 97,
      submittedAt: '23 Aug 2026, 19:50'
    }
  ];

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 4 Top KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {/* Metric 1 */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid var(--border-main)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink-secondary)' }}>Pending KYC Cases</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-600)' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--ink-primary)', marginTop: '8px' }}>24</div>
          <div style={{ fontSize: '11px', color: 'var(--crimson-600)', fontWeight: 700, marginTop: '4px' }}>
            ⚠️ 6 cases near SLA (&lt; 2 hrs remaining)
          </div>
        </div>

        {/* Metric 2 */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid var(--border-main)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink-secondary)' }}>Correction Requested</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--crimson-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--crimson-600)' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--ink-primary)', marginTop: '8px' }}>11</div>
          <div style={{ fontSize: '11px', color: 'var(--ink-secondary)', marginTop: '4px' }}>
            Driver SMS &amp; In-App push notified
          </div>
        </div>

        {/* Metric 3 */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid var(--border-main)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink-secondary)' }}>Approved &amp; Activated Today</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--emerald-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--emerald-600)' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--emerald-600)', marginTop: '8px' }}>18</div>
          <div style={{ fontSize: '11px', color: 'var(--emerald-600)', fontWeight: 700, marginTop: '4px' }}>
            Median review time: 3h 42m
          </div>
        </div>

        {/* Metric 4 */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid var(--border-main)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink-secondary)' }}>Active Staff Sessions</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--cyan-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan-600)' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--ink-primary)', marginTop: '8px' }}>37</div>
          <div style={{ fontSize: '11px', color: 'var(--emerald-600)', fontWeight: 700, marginTop: '4px' }}>
            100% MFA Protected • 0 Anomalies
          </div>
        </div>
      </div>

      {/* Priority Review Queue Table */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid var(--border-main)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 900, color: 'var(--ink-primary)' }}>
              Priority Driver Verification Queue
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
              Real-time OCR confidence scores, automated risk flags, and identity match status.
            </p>
          </div>
          <button 
            onClick={() => onSelectCase('DREG-260823-014')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--gold-light)',
              border: '1px solid var(--gold-500)',
              color: 'var(--gold-600)',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            <span>Review First Case</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-main)', color: 'var(--ink-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '12px 14px' }}>Case ID</th>
              <th style={{ padding: '12px 14px' }}>Driver Name &amp; NRC</th>
              <th style={{ padding: '12px 14px' }}>Branch</th>
              <th style={{ padding: '12px 14px' }}>OCR Match</th>
              <th style={{ padding: '12px 14px' }}>Risk Assessment</th>
              <th style={{ padding: '12px 14px' }}>Status</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingCases.map((c) => (
              <tr 
                key={c.id}
                onClick={() => onSelectCase(c.id)}
                style={{ 
                  borderBottom: '1px solid var(--border-main)', 
                  cursor: 'pointer',
                  fontSize: '13px',
                  transition: 'background 0.15s ease'
                }}
              >
                <td style={{ padding: '14px', fontWeight: 800, color: 'var(--ink-primary)' }}>
                  {c.id}
                </td>
                <td style={{ padding: '14px' }}>
                  <div style={{ fontWeight: 800, color: 'var(--ink-primary)' }}>{c.driverName} ({c.driverNameMm})</div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-secondary)' }}>{c.nrcNumber}</div>
                </td>
                <td style={{ padding: '14px', color: 'var(--ink-secondary)' }}>
                  {c.branch}
                </td>
                <td style={{ padding: '14px' }}>
                  <span style={{
                    background: c.ocrConfidence.overall >= 95 ? 'var(--emerald-light)' : 'var(--gold-light)',
                    color: c.ocrConfidence.overall >= 95 ? 'var(--emerald-600)' : 'var(--gold-600)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 800
                  }}>
                    {c.ocrConfidence.overall}% Conf
                  </span>
                </td>
                <td style={{ padding: '14px' }}>
                  {c.riskFlags.length > 0 ? (
                    <span style={{
                      background: 'var(--crimson-light)',
                      color: 'var(--crimson-600)',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800
                    }}>
                      ⚠️ {c.riskFlags[0]}
                    </span>
                  ) : (
                    <span style={{
                      background: 'var(--emerald-light)',
                      color: 'var(--emerald-600)',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800
                    }}>
                      ✓ Verified Clear
                    </span>
                  )}
                </td>
                <td style={{ padding: '14px' }}>
                  <span style={{
                    background: c.status === 'IN_REVIEW' ? 'var(--gold-light)' : c.status === 'NEEDS_CORRECTION' ? 'var(--crimson-light)' : 'var(--cyan-light)',
                    color: c.status === 'IN_REVIEW' ? 'var(--gold-600)' : c.status === 'NEEDS_CORRECTION' ? 'var(--crimson-600)' : 'var(--cyan-600)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 800
                  }}>
                    {c.status}
                  </span>
                </td>
                <td style={{ padding: '14px', textAlign: 'right' }}>
                  <button style={{
                    background: 'var(--surface-elevated)',
                    border: '1px solid var(--border-main)',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}>
                    Inspect ❯
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
