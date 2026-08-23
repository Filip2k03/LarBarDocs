import React from 'react';
import { ShieldCheck, Bell, Search } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
  branchName?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, branchName = 'Yangon Central HQ' }) => {
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 28px',
      background: '#FFFFFF',
      borderBottom: '1px solid var(--border-main)'
    }}>
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--ink-primary)', letterSpacing: '-0.4px' }}>
          {title}
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
          {subtitle}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Branch Selector */}
        <div style={{
          background: 'var(--surface-elevated)',
          border: '1px solid var(--border-main)',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 700,
          color: 'var(--ink-primary)'
        }}>
          📍 {branchName}
        </div>

        {/* Security / MFA Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--emerald-light)',
          border: '1px solid var(--emerald-500)',
          color: 'var(--emerald-600)',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 800
        }}>
          <ShieldCheck size={14} />
          <span>FIDO2 MFA VERIFIED</span>
        </div>

        {/* Notification Bell */}
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'var(--surface-elevated)',
          border: '1px solid var(--border-main)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--ink-primary)'
        }}>
          <Bell size={16} />
        </div>
      </div>
    </header>
  );
};
