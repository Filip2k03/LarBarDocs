import React, { useEffect, useRef } from 'react';
import { MapPin, ShieldAlert, Radio, Activity } from 'lucide-react';

export const LiveFleetMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<any>(null);

  useEffect(() => {
    if (mapRef.current && !leafletInstance.current && (window as any).L) {
      const L = (window as any).L;
      const map = L.map(mapRef.current, {
        center: [16.7794, 96.1554], // Sule Pagoda, Yangon
        zoom: 14,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(map);

      // Active Taxis Markers
      const taxis = [
        { name: 'U Aung Kyaw (3A-8492)', pos: [16.7794, 96.1554], speed: '38 km/h', status: 'IN_TRIP' },
        { name: 'Ko Thura (2B-1942)', pos: [16.7820, 96.1495], speed: '24 km/h', status: 'AVAILABLE' },
        { name: 'U Myo Min (1C-8421)', pos: [16.7983, 96.1497], speed: '42 km/h', status: 'IN_TRIP' },
        { name: 'U Kyaw Swar (4B-9102)', pos: [16.7804, 96.1530], speed: '0 km/h', status: 'SOS_ACTIVE' }
      ];

      taxis.forEach(t => {
        const isSOS = t.status === 'SOS_ACTIVE';
        L.marker(t.pos, {
          icon: L.divIcon({
            className: 'taxi-marker',
            html: `<div style="background:${isSOS ? '#EF4444' : '#F59E0B'}; color:#FFFFFF; font-weight:900; font-size:10px; padding:3px 6px; border-radius:6px; border:2px solid #FFFFFF; box-shadow:0 2px 6px rgba(0,0,0,0.15); white-space:nowrap;">🚖 ${t.name} (${t.speed})</div>`,
            iconSize: [120, 24]
          })
        }).addTo(map);

        if (isSOS) {
          L.circle(t.pos, {
            color: '#EF4444',
            fillColor: '#EF4444',
            fillOpacity: 0.25,
            radius: 350
          }).addTo(map);
        }
      });

      leafletInstance.current = map;
    }
  }, []);

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="var(--emerald-600)" />
            <h2 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--ink-primary)' }}>
              Real-Time Fleet Telemetry &amp; Yangon Safety Map
            </h2>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '2px' }}>
            1-second WebSocket driver pings, downtown Yangon geofence monitoring, and emergency SOS radar.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--emerald-600)' }}>
            🟢 142 Active Drivers Online
          </span>
          <span style={{
            background: 'var(--crimson-light)',
            color: 'var(--crimson-600)',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 800
          }}>
            🚨 1 Active SOS Distress
          </span>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef} 
        style={{
          width: '100%',
          height: '620px',
          borderRadius: '16px',
          border: '1px solid var(--border-main)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          overflow: 'hidden'
        }}
      />
    </div>
  );
};
