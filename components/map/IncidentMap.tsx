'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { PersonReport, InfrastructureFacility, NDRFUnit } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface IncidentMapProps {
  center: [number, number];
  hazardPolygon: [number, number][];
  reports: PersonReport[];
  infrastructure: InfrastructureFacility[];
  ndrfUnits: NDRFUnit[];
  onSelectReport?: (report: PersonReport) => void;
  onSelectUnit?: (unit: NDRFUnit) => void;
}

const DynamicIncidentMapInner = dynamic(
  () => import('./IncidentMapInner'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[480px] bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-2 border border-slate-200">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="text-xs font-semibold">Initializing PostGIS GIS Tactical Map...</span>
      </div>
    )
  }
);

export default function IncidentMap(props: IncidentMapProps) {
  return <DynamicIncidentMapInner {...props} />;
}
