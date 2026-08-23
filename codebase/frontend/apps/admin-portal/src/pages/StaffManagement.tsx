import React, { useState } from 'react';
import { Users, UserPlus, Shield, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';
import { StaffMember, StaffRole } from '../types';

export const StaffManagement: React.FC = () => {
  const [inviteName, setInviteName] = useState<string>('');
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteRole, setInviteRole] = useState<StaffRole>('MARKETER');
  const [inviteBranch, setInviteBranch] = useState<string>('Yangon Central');

  const staffRoster: StaffMember[] = [
    {
      id: 'STF-001',
      fullName: 'Ko Zaw Min',
      email: 'zawmin@labar.example',
      phone: '09790001122',
      role: 'EXEC_SUPERADMIN',
      branch: 'Yangon Central HQ',
      mfaType: 'PASSKEY',
      status: 'ACTIVE',
      lastActive: 'Just now'
    },
    {
      id: 'STF-002',
      fullName: 'Khin Lay',
      email: 'khinlay@labar.example',
      phone: '09790003344',
      role: 'KYC_MANAGER',
      branch: 'Yangon Central HQ',
      mfaType: 'HARDWARE_KEY',
      status: 'ACTIVE',
      lastActive: '5 mins ago'
    },
    {
      id: 'STF-003',
      fullName: 'Mya Mya',
      email: 'myamya@labar.example',
      phone: '09450005566',
      role: 'DRIVER_REGISTRAR',
      branch: 'Yangon Central',
      mfaType: 'PASSKEY',
      status: 'ACTIVE',
      lastActive: '12 mins ago'
    },
    {
      id: 'STF-004',
      fullName: 'Thura Lin',
      email: 'thuralin@labar.example',
      phone: '09250007788',
      role: 'MARKETER',
      branch: 'Hlaing Township',
      mfaType: 'TOTP',
      status: 'ACTIVE',
      lastActive: '1 hour ago'
    }
  ];

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) {
      alert('Please fill in staff full name and work email.');
      return;
    }
    alert(`✓ Secure staff invitation link generated for ${inviteName} (${inviteRole} at ${inviteBranch}). Invitation requires hardware MFA registration.`);
    setInviteName('');
    setInviteEmail('');
  };

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Invite Form Card */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid var(--border-main)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <UserPlus size={20} color="var(--gold-600)" />
          <h2 style={{ fontSize: '16px', fontWeight: 900, color: 'var(--ink-primary)' }}>
            Provision &amp; Invite Staff Member (Least-Privilege Standard)
          </h2>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginBottom: '18px' }}>
          Grant permissions strictly within your authority ceiling. Registrars and Marketers cannot invite Superadmins or KYC Managers.
        </p>

        <form onSubmit={handleSendInvite} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '12px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--ink-secondary)', marginBottom: '6px' }}>
              Full Name
            </label>
            <input 
              type="text"
              placeholder="e.g. Thandar Aye"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-main)',
                fontSize: '13px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--ink-secondary)', marginBottom: '6px' }}>
              Work Email / Phone
            </label>
            <input 
              type="text"
              placeholder="thandar@labar.example"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-main)',
                fontSize: '13px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--ink-secondary)', marginBottom: '6px' }}>
              Staff Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as StaffRole)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-main)',
                fontSize: '13px',
                background: '#FFFFFF'
              }}
            >
              <option value="MARKETER">MARKETER (Driver Lead Registration)</option>
              <option value="DRIVER_REGISTRAR">DRIVER_REGISTRAR (Branch Document Capture)</option>
              <option value="SUPPORT">SUPPORT (Passenger/Driver Inquiries)</option>
              <option value="STAFF_REGISTRAR">STAFF_REGISTRAR (Limited Invitations)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--ink-secondary)', marginBottom: '6px' }}>
              Assigned Branch
            </label>
            <select
              value={inviteBranch}
              onChange={(e) => setInviteBranch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-main)',
                fontSize: '13px',
                background: '#FFFFFF'
              }}
            >
              <option value="Yangon Central">Yangon Central HQ</option>
              <option value="Hlaing Township">Hlaing Township Office</option>
              <option value="Kamayut Township">Kamayut Branch</option>
              <option value="Mandalay Hub">Mandalay Hub</option>
            </select>
          </div>

          <button
            type="submit"
            style={{
              background: 'linear-gradient(135deg, var(--gold-500), var(--gold-600))',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '11px 18px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Send Invite
          </button>
        </form>
      </div>

      {/* Staff Roster Table */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid var(--border-main)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: 900, color: 'var(--ink-primary)', marginBottom: '16px' }}>
          Active Staff Roster &amp; MFA Enforcement
        </h2>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-main)', color: 'var(--ink-secondary)', fontSize: '11px', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px 14px' }}>Staff ID &amp; Name</th>
              <th style={{ padding: '12px 14px' }}>Role</th>
              <th style={{ padding: '12px 14px' }}>Branch</th>
              <th style={{ padding: '12px 14px' }}>MFA Method</th>
              <th style={{ padding: '12px 14px' }}>Status</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>Controls</th>
            </tr>
          </thead>
          <tbody>
            {staffRoster.map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--border-main)', fontSize: '13px' }}>
                <td style={{ padding: '14px' }}>
                  <div style={{ fontWeight: 800, color: 'var(--ink-primary)' }}>{s.fullName}</div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-secondary)' }}>{s.email}</div>
                </td>
                <td style={{ padding: '14px' }}>
                  <span style={{
                    background: s.role.includes('ADMIN') ? 'var(--gold-light)' : 'var(--cyan-light)',
                    color: s.role.includes('ADMIN') ? 'var(--gold-600)' : 'var(--cyan-600)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 800
                  }}>
                    {s.role}
                  </span>
                </td>
                <td style={{ padding: '14px', color: 'var(--ink-secondary)' }}>
                  {s.branch}
                </td>
                <td style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700 }}>
                    <KeyRound size={14} color="var(--emerald-600)" />
                    <span>{s.mfaType}</span>
                  </div>
                </td>
                <td style={{ padding: '14px' }}>
                  <span style={{
                    background: 'var(--emerald-light)',
                    color: 'var(--emerald-600)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 800
                  }}>
                    Active
                  </span>
                </td>
                <td style={{ padding: '14px', textAlign: 'right' }}>
                  <button 
                    onClick={() => alert(`Session revoked for ${s.fullName}. Driver / Admin login invalidated.`)}
                    style={{
                      background: 'var(--surface-elevated)',
                      border: '1px solid var(--border-main)',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      color: 'var(--crimson-600)'
                    }}
                  >
                    Revoke Session
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
