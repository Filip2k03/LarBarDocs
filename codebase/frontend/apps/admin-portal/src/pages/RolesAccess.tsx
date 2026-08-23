import React from 'react';
import { Lock, Shield, Check, AlertTriangle, KeyRound } from 'lucide-react';

export const RolesAccess: React.FC = () => {
  const roles = [
    {
      name: 'GOD_ADMIN',
      title: 'Break-Glass Root Owner',
      desc: 'Top-tier infrastructure emergency access. Creates/revokes executive superadmins. Requires hardware security keys (FIDO2) and dual authorization. Never used for daily KYC or dispatch operations.',
      badge: '1 Root Key',
      badgeColor: 'var(--crimson-light)',
      textColor: 'var(--crimson-600)',
      permissions: ['Full Root Access', 'Emergency Override', 'Superadmin Revocation', 'Immutable Log Export']
    },
    {
      name: 'EXEC_SUPERADMIN',
      title: 'Executive Superadmin (CEO / CTO / PSO)',
      desc: 'Equal executive authorization level. Full system configuration, tariff tuning, security policy management, session revocation, and organizational audit oversight.',
      badge: '3 Accounts (CEO/CTO/PSO)',
      badgeColor: 'var(--gold-light)',
      textColor: 'var(--gold-600)',
      permissions: ['Platform Tariffs', 'Staff Provisioning', 'Audit Trail Inspection', 'Global Geofencing']
    },
    {
      name: 'KYC_MANAGER / REVIEWER',
      title: 'Identity Verification Specialist',
      desc: 'Inspects Myanmar Driving Licences, NRC Smartcards, face liveness scores, and vehicle roadworthiness. Authorized to decide cases (Approve / Correction / Reject). Cannot invite privileged staff.',
      badge: '8 Active Specialists',
      badgeColor: 'var(--emerald-light)',
      textColor: 'var(--emerald-600)',
      permissions: ['Driver Case Approval', 'Document Inspection', 'Liveness Verification', 'Correction Requests']
    },
    {
      name: 'DRIVER_REGISTRAR',
      title: 'Field & Branch Registration Staff',
      desc: 'Assists prospective drivers with physical camera scan of licence, NRC smartcard, face selfie, and vehicle details via DriverReg mobile app. Cannot approve own submitted cases.',
      badge: '26 Branch Agents',
      badgeColor: 'var(--cyan-light)',
      textColor: 'var(--cyan-600)',
      permissions: ['DriverReg Mobile Access', 'Camera OCR Assist', 'Case Submission', 'Driver Handoff']
    },
    {
      name: 'STAFF_REGISTRAR',
      title: 'Staff Onboarding Coordinator',
      desc: 'Permitted to issue limited invitations for Marketer and Support roles only. Strict ceiling enforcement prevents privilege escalation.',
      badge: '4 Coordinators',
      badgeColor: 'var(--surface-elevated)',
      textColor: 'var(--ink-secondary)',
      permissions: ['Invite Marketers', 'Invite Support Staff', 'Branch Assignment']
    },
    {
      name: 'MARKETER',
      title: 'Field Growth & Driver Lead Capture',
      desc: 'Creates initial driver lead records in the field with driver phone and consent. Cannot inspect KYC documents or approve drivers.',
      badge: '14 Field Marketers',
      badgeColor: 'var(--surface-elevated)',
      textColor: 'var(--ink-secondary)',
      permissions: ['Create Driver Lead', 'Campaign Performance View']
    }
  ];

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{
        background: '#FFFFFF',
        border: '1px solid var(--border-main)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <Lock size={20} color="var(--gold-600)" />
          <h2 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--ink-primary)' }}>
            Enterprise Role-Based Access Control (RBAC) &amp; Trust Boundaries
          </h2>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--ink-secondary)', lineHeight: 1.5 }}>
          LaBar enforces strict principle of least privilege, two-person rule for privileged actions, and complete separation between Driver Registration, KYC Verification, and Staff Provisioning.
        </p>
      </div>

      {/* Role Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {roles.map((r) => (
          <div 
            key={r.name}
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-main)',
              borderRadius: '16px',
              padding: '20px 24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              display: 'grid',
              gridTemplateColumns: '260px 1fr 240px',
              gap: '20px',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontSize: '15px', fontWeight: 900, color: 'var(--ink-primary)' }}>{r.name}</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink-secondary)', marginTop: '2px' }}>{r.title}</div>
              <span style={{
                display: 'inline-block',
                marginTop: '8px',
                background: r.badgeColor,
                color: r.textColor,
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 800
              }}>
                {r.badge}
              </span>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', lineHeight: 1.6 }}>
              {r.desc}
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--ink-primary)', marginBottom: '6px' }}>
                Key Authorizations:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {r.permissions.map((p) => (
                  <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--ink-primary)' }}>
                    <Check size={12} color="var(--emerald-600)" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
