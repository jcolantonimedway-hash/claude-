import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ZoomControls, ZoomButtonGroup } from './ZoomControls';
import type { Battle, Outcome } from '../types/battle';

// ─── Marker Colors by Outcome ────────────────────────────────────────────────

const MARKER_CONFIG: Record<Outcome, { fill: string; stroke: string; glow: string }> = {
  'American Victory': { fill: '#4A8A2E', stroke: '#2D5A1B', glow: '#6CBF4A' },
  'British Victory':  { fill: '#8B1A1A', stroke: '#5C0E0E', glow: '#C44444' },
  'Draw':             { fill: '#C4A43A', stroke: '#8B7020', glow: '#E8C96B' },
  'Inconclusive':     { fill: '#6B7280', stroke: '#4B5563', glow: '#9CA3AF' },
};

// ─── Custom Marker SVG Factory ───────────────────────────────────────────────

function createMarkerIcon(battle: Battle, isSelected: boolean): L.DivIcon {
  const cfg = MARKER_CONFIG[battle.outcome];
  const size = isSelected ? 36 : 28;
  const ringSize = size + 16;

  const svg = `
    <svg width="${ringSize}" height="${ringSize}" viewBox="0 0 ${ringSize} ${ringSize}" xmlns="http://www.w3.org/2000/svg">
      ${isSelected ? `
        <circle cx="${ringSize / 2}" cy="${ringSize / 2}" r="${ringSize / 2 - 2}"
          fill="none" stroke="${cfg.glow}" stroke-width="2" opacity="0.5"
          style="animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite"/>
      ` : ''}
      <!-- Shadow -->
      <circle cx="${ringSize / 2 + 1}" cy="${ringSize / 2 + 2}" r="${size / 2}"
        fill="rgba(0,0,0,0.35)"/>
      <!-- Main circle -->
      <circle cx="${ringSize / 2}" cy="${ringSize / 2}" r="${size / 2}"
        fill="${cfg.fill}" stroke="${cfg.stroke}" stroke-width="2"/>
      <!-- Inner highlight -->
      <circle cx="${ringSize / 2 - 2}" cy="${ringSize / 2 - 2}" r="${size / 2 - 5}"
        fill="rgba(255,255,255,0.15)"/>
      <!-- Crossed swords icon -->
      <text x="${ringSize / 2}" y="${ringSize / 2 + 4}"
        text-anchor="middle" font-size="${isSelected ? 14 : 11}"
        fill="rgba(255,255,255,0.95)"
        style="font-family: serif; user-select: none;">⚔</text>
    </svg>`;

  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [ringSize, ringSize],
    iconAnchor: [ringSize / 2, ringSize / 2],
    popupAnchor: [0, -ringSize / 2],
  });
}

// ─── Sub-component: Map Controller (handles fly-to on selection) ─────────────

interface ControllerProps {
  selectedBattle: Battle | null;
  campaignBattle: Battle | null;
}

function MapController({ selectedBattle, campaignBattle }: ControllerProps) {
  const map = useMap();
  const target = campaignBattle ?? selectedBattle;

  useEffect(() => {
    if (target) {
      const zoom = campaignBattle ? 8 : 7;
      map.flyTo(target.coordinates, zoom, { duration: 1.4, easeLinearity: 0.4 });
    }
  }, [target, map, campaignBattle]);

  return null;
}

// ─── Sub-component: Battle Markers ──────────────────────────────────────────

interface MarkersProps {
  battles: Battle[];
  selectedBattle: Battle | null;
  onSelect: (b: Battle) => void;
}

function BattleMarkers({ battles, selectedBattle, onSelect }: MarkersProps) {
  const map = useMap();
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    // Remove markers that are no longer in battles list
    markersRef.current.forEach((marker, id) => {
      if (!battles.find((b) => b.id === id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add or update markers
    battles.forEach((battle) => {
      const isSelected = selectedBattle?.id === battle.id;
      const icon = createMarkerIcon(battle, isSelected);

      const existing = markersRef.current.get(battle.id);
      if (existing) {
        existing.setIcon(icon);
      } else {
        const marker = L.marker(battle.coordinates, { icon, zIndexOffset: 100 });

        // Tooltip
        marker.bindTooltip(
          `<div class="battle-tooltip">
            <strong>${battle.name}</strong>
            <span>${battle.date}</span>
          </div>`,
          { direction: 'top', offset: [0, -14], className: 'leaflet-battle-tooltip' }
        );

        marker.on('click', () => onSelect(battle));
        marker.addTo(map);
        markersRef.current.set(battle.id, marker);
      }
    });

    // Bring selected to front
    if (selectedBattle) {
      const m = markersRef.current.get(selectedBattle.id);
      if (m) (m as any).setZIndexOffset(1000);
    }

    return () => {
      // Cleanup on unmount
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battles, selectedBattle]);

  return null;
}

// ─── Main Map Component ──────────────────────────────────────────────────────

interface Props {
  battles: Battle[];
  selectedBattle: Battle | null;
  campaignBattle: Battle | null;
  onBattleSelect: (b: Battle) => void;
}

export function BattleMap({ battles, selectedBattle, campaignBattle, onBattleSelect }: Props) {
  return (
    <div className="flex-1 relative overflow-hidden">
      <MapContainer
        center={[39.5, -76.0]}
        zoom={5}
        minZoom={4}
        maxZoom={12}
        className="w-full h-full"
        style={{ background: '#0D1A2D' }}
        zoomControl={false}
      >
        {/* Tile Layer — CartoDB Voyager with historical warmth */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={20}
          className="map-tiles"
        />

        <MapController selectedBattle={selectedBattle} campaignBattle={campaignBattle} />
        <BattleMarkers
          battles={battles}
          selectedBattle={selectedBattle}
          onSelect={onBattleSelect}
        />
        <ZoomControls />
      </MapContainer>

      {/* Map vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 50%, rgba(13,26,45,0.5) 100%)',
        }}
      />

      {/* Legend */}
      <MapLegend />

      {/* Zoom controls */}
      <ZoomButtonGroup />
    </div>
  );
}

// ─── Legend Component ────────────────────────────────────────────────────────

function MapLegend() {
  const items = [
    { color: '#4A8A2E', label: 'Patriot Win' },
    { color: '#8B1A1A', label: 'British Win' },
    { color: '#C4A43A', label: 'Draw' },
  ];

  return (
    <div
      className="
        absolute bottom-4 left-3 z-20
        bg-navy/85 backdrop-blur-sm
        border border-navy-400/30 rounded-xl
        px-3 py-2.5 shadow-parchment
      "
    >
      <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.15em] text-parchment-300/50 mb-2">
        Outcome
      </p>
      <div className="space-y-1.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-parchment-200/70 font-sans">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
