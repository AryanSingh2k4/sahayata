'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import { PersonReport, InfrastructureFacility, NDRFUnit } from '@/lib/types';

interface IncidentMapProps {
  center: [number, number];
  hazardPolygon: [number, number][];
  reports: PersonReport[];
  infrastructure: InfrastructureFacility[];
  ndrfUnits: NDRFUnit[];
  onSelectReport?: (report: PersonReport) => void;
  onSelectUnit?: (unit: NDRFUnit) => void;
}

function createPersonIcon(status: string, priority: string) {
  let bgColor = '#e11d48'; // crimson default for missing
  let ringColor = 'rgba(225, 29, 72, 0.2)';
  let letter = 'M';

  if (status === 'located_safe' || status === 'reunited') {
    bgColor = '#059669'; // emerald
    ringColor = 'rgba(5, 150, 105, 0.2)';
    letter = 'S';
  } else if (status === 'located_injured' || priority === 'P0') {
    bgColor = '#d97706'; // amber
    ringColor = 'rgba(217, 119, 6, 0.25)';
    letter = 'P0';
  }

  return L.divIcon({
    className: 'custom-person-pin',
    html: `
      <div style="
        background-color: ${bgColor};
        color: white;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 11px;
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.15), 0 0 0 4px ${ringColor};
      ">
        ${letter}
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13]
  });
}

function createFacilityIcon(type: string) {
  let label = 'H';
  let color = '#2563eb';
  if (type === 'relief_camp') {
    label = 'RC';
    color = '#059669';
  } else if (type === 'heli_base') {
    label = 'HB';
    color = '#4f46e5';
  }

  return L.divIcon({
    className: 'custom-facility-pin',
    html: `
      <div style="
        background-color: white;
        border: 1.5px solid #cbd5e1;
        border-radius: 6px;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: 800;
        color: ${color};
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      ">
        ${label}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
}

function createNDRFIcon() {
  return L.divIcon({
    className: 'custom-ndrf-pin',
    html: `
      <div style="
        background-color: #0f172a;
        color: white;
        border: 2px solid white;
        border-radius: 6px;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 9px;
        font-weight: 800;
        box-shadow: 0 2px 5px rgba(0,0,0,0.25);
      ">
        NDRF
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
}

export default function IncidentMapInner({
  center,
  hazardPolygon,
  reports,
  infrastructure,
  ndrfUnits,
  onSelectReport
}: IncidentMapProps) {
  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden border border-border bg-card shadow-sm">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[500px]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Hazard Zone Polygon */}
        <Polygon
          positions={hazardPolygon}
          pathOptions={{
            color: '#2563eb',
            fillColor: '#3b82f6',
            fillOpacity: 0.18,
            weight: 2,
            dashArray: '4, 4'
          }}
        >
          <Popup>
            <div className="p-1 space-y-1 text-xs">
              <span className="font-semibold text-blue-900 uppercase tracking-wider text-[10px]">
                Active Hazard Zone
              </span>
              <p className="font-bold text-slate-900">
                Bhotekoshi Flood Corridor (Sector 3)
              </p>
              <p className="text-slate-500 text-[11px]">
                High debris and inundation risk. Evacuation order in effect.
              </p>
            </div>
          </Popup>
        </Polygon>

        {/* Victim Markers */}
        {reports.map(report => (
          <Marker
            key={report.id}
            position={report.coordinates}
            icon={createPersonIcon(report.status, report.priority)}
          >
            <Popup>
              <div className="p-1 min-w-[210px] space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-mono text-[10px] font-semibold text-slate-500">
                    {report.id}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    report.priority === 'P0' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {report.priority}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {report.fullName} ({report.approxAge}y)
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {report.lastKnownLocation}
                  </div>
                </div>
                {report.medicalConditions && (
                  <div className="text-[11px] text-rose-700 font-medium bg-rose-50/80 p-1.5 rounded border border-rose-200/60">
                    Medical: {report.medicalConditions}
                  </div>
                )}
                {onSelectReport && (
                  <button
                    onClick={() => onSelectReport(report)}
                    className="w-full mt-1 py-1.5 px-2.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    Inspect Lead
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Infrastructure Markers */}
        {infrastructure.map(fac => (
          <Marker
            key={fac.id}
            position={fac.coordinates}
            icon={createFacilityIcon(fac.type)}
          >
            <Popup>
              <div className="p-1 min-w-[190px] space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {fac.type.replace('_', ' ')}
                </span>
                <div className="font-bold text-slate-900 text-sm">{fac.name}</div>
                <div className="text-xs text-slate-600">
                  Occupancy: <span className="font-semibold text-slate-900">{fac.currentOccupancy}</span> / {fac.capacity}
                </div>
                <div className="text-xs text-slate-500">
                  Contact: {fac.contactNumber}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* NDRF Units */}
        {ndrfUnits.map((unit, idx) => (
          <Marker
            key={unit.id}
            position={[center[0] - 0.015 - idx * 0.01, center[1] + 0.01 + idx * 0.01]}
            icon={createNDRFIcon()}
          >
            <Popup>
              <div className="p-1 min-w-[190px] space-y-1">
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                  NDRF Quick Reaction Unit
                </span>
                <div className="font-bold text-slate-900 text-sm">{unit.callsign}</div>
                <div className="text-xs text-slate-600">{unit.battalion}</div>
                <div className="text-xs font-semibold text-emerald-700">
                  Status: {unit.status.toUpperCase()} ({unit.distanceKm} km out)
                </div>
                <div className="text-[11px] text-slate-500">
                  Gear: {unit.equipment.join(', ')}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
