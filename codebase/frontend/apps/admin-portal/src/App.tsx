import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { DriverReview } from './pages/DriverReview';
import { StaffManagement } from './pages/StaffManagement';
import { RolesAccess } from './pages/RolesAccess';
import { AuditLog } from './pages/AuditLog';
import { LiveFleetMap } from './pages/LiveFleetMap';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const currentUser = {
    name: 'Ko Zaw Min',
    roleTitle: 'PSO • Executive Superadmin',
    roleBadge: 'EXEC_SUPERADMIN'
  };

  const getHeaderMeta = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Operations Dashboard', subtitle: 'Driver verification, safety telemetry, and access-control overview.' };
      case 'driver-review':
        return { title: 'Driver KYC Case Verification', subtitle: 'Independent comparison of source documents, OCR confidence, liveness, and vehicle records.' };
      case 'fleet-map':
        return { title: 'Live Fleet & Emergency Safety Map', subtitle: 'Real-time WebSocket telemetry, speed tracking, and 1km SOS distress intercept radar.' };
      case 'staff-mgmt':
        return { title: 'Staff Provisioning & Accounts', subtitle: 'Invite staff with least privilege; privilege escalation strictly prohibited by security ceiling.' };
      case 'roles-access':
        return { title: 'Roles & Trust Boundaries', subtitle: 'CEO, CTO, and PSO share one executive superadmin permission set.' };
      case 'audit-log':
        return { title: 'Immutable Compliance Audit Ledger', subtitle: 'Every sensitive document view, KYC decision, role change, and session revocation is cryptographically logged.' };
      default:
        return { title: 'LaBar Control Center', subtitle: 'Enterprise Operations Console' };
    }
  };

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveTab('driver-review');
  };

  const meta = getHeaderMeta();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-base)' }}>
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser} 
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        <Header 
          title={meta.title} 
          subtitle={meta.subtitle} 
        />

        <main style={{ flex: 1, overflowY: 'auto' }}>
          {activeTab === 'dashboard' && <Dashboard onSelectCase={handleSelectCase} />}
          {activeTab === 'driver-review' && <DriverReview />}
          {activeTab === 'fleet-map' && <LiveFleetMap />}
          {activeTab === 'staff-mgmt' && <StaffManagement />}
          {activeTab === 'roles-access' && <RolesAccess />}
          {activeTab === 'audit-log' && <AuditLog />}
        </main>
      </div>
    </div>
  );
}

export default App;
