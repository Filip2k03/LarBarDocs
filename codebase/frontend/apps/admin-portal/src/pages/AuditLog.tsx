import React, { useState } from 'react';
import { FileText, ShieldCheck, Download, Filter, Search } from 'lucide-react';
import { AuditEvent } from '../types';

export const AuditLog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const auditEvents: AuditEvent[] = [
    {
      id: 'AUD-984210',
      timestamp: '23 Aug 2026 • 22:48:12',
      actorName: 'Ko Zaw Min',
      actorRole: 'EXEC_SUPERADMIN',
      action: 'CORRECTION_REQUESTED',
      targetResource: 'DriverCase:DREG-260823-014',
      purposeReason: 'Reason: Myanmar licence expired on 24 Nov 2024. Requested refreshed scan.',
      ipAddress: '103.217.158.42 (Yangon HQ)',
      severity: 'WARNING'
    },
    {
      id: 'AUD-984209',
      timestamp: '23 Aug 2026 • 22:41:05',
      actorName: 'Khin Lay',
      actorRole: 'KYC_MANAGER',
      action: 'DOCUMENT_UNBLUR_VIEW',
      targetResource: 'DrivingLicenceImage:DREG-260823-014',
      purposeReason: 'Audit Reason: Verify licence expiry date and anti-tamper watermark hologram.',
      ipAddress: '103.217.158.42 (Yangon HQ)',
      severity: 'INFO'
    },
    {
      id: 'AUD-984208',
      timestamp: '23 Aug 2026 • 21:16:30',
      actorName: 'Mya Mya',
      actorRole: 'DRIVER_REGISTRAR',
      action: 'CASE_SUBMITTED',
      targetResource: 'DriverCase:DREG-260823-014',
      purposeReason: 'Field capture completed at Sule Central Branch with physical candidate presence.',
      ipAddress: '103.217.158.89 (Branch WiFi)',
      severity: 'INFO'
    },
    {
      id: 'AUD-984207',
      timestamp: '23 Aug 2026 • 20:04:18',
      actorName: 'Ko Zaw Min',
      actorRole: 'EXEC_SUPERADMIN',
      action: 'SESSION_REVOKED',
      targetResource: 'StaffSession:STF-009 (Device 2C11)',
      purposeReason: 'Security alert: Anomalous foreign IP login attempt prevented by geographic lockdown policy.',
      ipAddress: '103.217.158.42 (Yangon HQ)',
      severity: 'CRITICAL'
    },
    {
      id: 'AUD-984206',
      timestamp: '23 Aug 2026 • 19:30:00',
      actorName: 'Thura Lin',
      actorRole: 'MARKETER',
      action: 'DRIVER_LEAD_CREATED',
      targetResource: 'DriverLead:LEAD-88492',
      purposeReason: 'Prospective driver consent given at Hlaing Township taxi stand.',
      ipAddress: '103.112.45.12 (Mobile 5G)',
      severity: 'INFO'
    }
  ];

  const filteredEvents = auditEvents.filter(e => 
    e.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.targetResource.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Search & Filter Bar */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid var(--border-main)',
        borderRadius: '16px',
        padding: '20px 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '480px' }}>
          <Search size={18} color="var(--ink-secondary)" />
          <input 
            type="text"
            placeholder="Search by actor, action type, case ID, or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '13px',
              color: 'var(--ink-primary)'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => alert('Exporting signed SHA-256 JSON audit package for regulatory compliance.')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border-main)',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            <Download size={14} />
            <span>Export Compliance Archive</span>
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid var(--border-main)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <ShieldCheck size={18} color="var(--emerald-600)" />
          <h2 style={{ fontSize: '16px', fontWeight: 900, color: 'var(--ink-primary)' }}>
            Immutable Security &amp; Compliance Audit Ledger (Append-Only)
          </h2>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-main)', color: 'var(--ink-secondary)', fontSize: '11px', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px 14px' }}>Timestamp</th>
              <th style={{ padding: '12px 14px' }}>Actor &amp; Role</th>
              <th style={{ padding: '12px 14px' }}>Action &amp; Resource</th>
              <th style={{ padding: '12px 14px' }}>Recorded Purpose / Reason</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>Severity</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((evt) => (
              <tr key={evt.id} style={{ borderBottom: '1px solid var(--border-main)', fontSize: '12px' }}>
                <td style={{ padding: '14px', color: 'var(--ink-secondary)', whiteSpace: 'nowrap' }}>
                  {evt.timestamp}
                </td>
                <td style={{ padding: '14px' }}>
                  <div style={{ fontWeight: 800, color: 'var(--ink-primary)' }}>{evt.actorName}</div>
                  <div style={{ fontSize: '10px', color: 'var(--ink-secondary)' }}>{evt.actorRole}</div>
                </td>
                <td style={{ padding: '14px' }}>
                  <div style={{ fontWeight: 800, color: 'var(--ink-primary)' }}>{evt.action}</div>
                  <div style={{ fontSize: '11px', color: 'var(--cyan-600)' }}>{evt.targetResource}</div>
                </td>
                <td style={{ padding: '14px', color: 'var(--ink-secondary)', lineHeight: 1.4 }}>
                  {evt.purposeReason}
                  <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>IP: {evt.ipAddress}</div>
                </td>
                <td style={{ padding: '14px', textAlign: 'right' }}>
                  <span style={{
                    background: evt.severity === 'CRITICAL' ? 'var(--crimson-light)' : evt.severity === 'WARNING' ? 'var(--gold-light)' : 'var(--emerald-light)',
                    color: evt.severity === 'CRITICAL' ? 'var(--crimson-600)' : evt.severity === 'WARNING' ? 'var(--gold-600)' : 'var(--emerald-600)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 800
                  }}>
                    {evt.severity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
