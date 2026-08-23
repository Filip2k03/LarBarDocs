export type ComponentHealth = 'OPERATIONAL' | 'DEGRADED_PERFORMANCE' | 'PARTIAL_OUTAGE' | 'MAJOR_OUTAGE' | 'MAINTENANCE';

export interface ServiceComponentStatus {
  id: string;
  name: string;
  group: 'Core Platform' | 'Payments & Wallets' | 'Maps & Routing' | 'Safety & Telemetry';
  status: ComponentHealth;
  latency_ms: number;
  uptime_percentage_30d: number;
}

export interface PlatformStatusResponse {
  overall_status: ComponentHealth;
  timestamp: string;
  incident_active: boolean;
  active_incidents: {
    id: string;
    title: string;
    impact: 'MINOR' | 'MODERATE' | 'MAJOR';
    status: 'INVESTIGATING' | 'IDENTIFIED' | 'MONITORING' | 'RESOLVED';
    affected_components: string[];
    created_at: string;
    updated_at: string;
  }[];
  components: ServiceComponentStatus[];
  past_7_days_uptime: { date: string; uptime_percent: number }[];
}
