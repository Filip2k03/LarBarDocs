import React from 'react';
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  ShieldAlert, 
  FileText, 
  MapPin,
  Lock,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: {
    name: string;
    roleTitle: string;
    roleBadge: string;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, currentUser }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Operations Dashboard', icon: LayoutDashboard },
    { id: 'driver-review', label: 'Driver KYC Review', icon: UserCheck, badge: '24' },
    { id: 'fleet-map', label: 'Live Fleet & Safety Map', icon: MapPin, badge: 'Live' },
    { id: 'staff-mgmt', label: 'Staff Accounts', icon: Users },
    { id: 'roles-access', label: 'Roles & Permissions', icon: Lock },
    { id: 'audit-log', label: 'Immutable Audit Log', icon: FileText },
  ];

  return (
    <aside style={{
      width: '260px',
      background: 'var(--sidebar-bg)',
      color: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      padding: '24px 16px',
      borderRight: '1px solid #1E293B'
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingLeft: '8px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--gold-500), var(--gold-600))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          color: '#FFFFFF',
          fontSize: '18px'
        }}>
          L
        </div>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.3px' }}>
            LaBar Control
          </div>
          <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700 }}>
            ENTERPRISE CONSOLE
          </div>
        </div>
      </div>

      {/* User Session Profile Box */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.06)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '12px',
        marginBottom: '24px'
      }}>
        <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{currentUser.name}</div>
        <div style={{ fontSize: '11px', color: '#CBD5E1', marginTop: '2px' }}>{currentUser.roleTitle}</div>
        <div style={{
          display: 'inline-block',
          marginTop: '6px',
          background: 'rgba(245, 158, 11, 0.2)',
          color: 'var(--gold-500)',
          fontSize: '9px',
          fontWeight: 800,
          padding: '2px 6px',
          borderRadius: '4px',
          border: '1px solid rgba(245, 158, 11, 0.4)'
        }}>
          {currentUser.roleBadge}
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'rgba(245, 158, 11, 0.18)' : 'transparent',
                color: isActive ? '#FFFFFF' : '#94A3B8',
                fontWeight: isActive ? 800 : 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={18} color={isActive ? 'var(--gold-500)' : '#94A3B8'} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '10px',
                  background: item.badge === 'Live' ? 'var(--crimson-500)' : 'var(--gold-500)',
                  color: '#FFFFFF'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px' }}>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: '100%',
          padding: '8px 12px',
          background: 'transparent',
          border: 'none',
          color: '#94A3B8',
          fontSize: '12px',
          fontWeight: 700,
          cursor: 'pointer'
        }}>
          <LogOut size={16} />
          <span>Lock &amp; Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
