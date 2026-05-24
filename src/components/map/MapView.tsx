/**
 * MapView — The centerpiece of the application.
 * Uses MapLibre GL JS for a fully interactive, GPU-accelerated map.
 *
 * Key patterns:
 *  - Map is initialized ONCE in a useEffect with cleanup
 *  - Markers are managed imperatively via separate useEffects
 *  - flyTo animations triggered by selectedBattle changes
 *  - Campaign paths drawn as animated GeoJSON layers
 *  - Custom DOM markers with CSS animations
 *  - Tooltip via a fixed-position div (no Leaflet popups)
 */

import React, { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useApp } from '../../context/AppContext';
import type { Battle, Outcome } from '../../types/battle';

// ─── Constants ─────────────────────────────────────────────────────────────────

// Free CartoDB Dark Matter GL style — no API key needed
const MAP_STYLE_URL = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const INITIAL_CENTER: [number, number] = [-77, 38.8];
const INITIAL_ZOOM = 4.8;
const SELECTED_ZOOM = 7.5;
const FLY_DURATION = 1600;

// Coordinate conversion: battles use [lat, lng], MapLibre uses [lng, lat]
const toLngLat = (coords: [number, number]): [number, number] => [coords[1], coords[0]];

// ─── Outcome Configuration ─────────────────────────────────────────────────────

const OUTCOME_CFG: Record<Outcome, { fill: string; glow: string; border: string; ping: string }> = {
  'American Victory': {
    fill:   '#2D7A1A',
    glow:   'rgba(45,122,26,0.55)',
    border: '#5CB842',
    ping:   'rgba(92,184,66,0.6)',
  },
  'British Victory': {
    fill:   '#9B1515',
    glow:   'rgba(155,21,21,0.55)',
    border: '#D44444',
    ping:   'rgba(212,68,68,0.6)',
  },
  Draw: {
    fill:   '#A88820',
    glow:   'rgba(168,136,32,0.55)',
    border: '#E8C96B',
    ping:   'rgba(232,201,107,0.6)',
  },
  Inconclusive: {
    fill:   '#4B5563',
    glow:   'rgba(75,85,99,0.55)',
    border: '#9CA3AF',
    ping:   'rgba(156,163,175,0.6)',
  },
};

// ─── Marker DOM Factory ────────────────────────────────────────────────────────

function createMarkerElement(battle: Battle, selected: boolean): HTMLDivElement {
  const cfg = OUTCOME_CFG[battle.outcome];
  const size = selected ? 38 : 28;
  const glowSize = size + 24;

  const wrapper = document.createElement('div');
  wrapper.className = `battle-marker-wrapper${selected ? ' selected' : ''}`;
  wrapper.style.cssText = `width:${glowSize}px;height:${glowSize}px;`;
  wrapper.setAttribute('data-battle-id', battle.id);

  // Ambient glow
  const glow = document.createElement('div');
  glow.className = 'battle-marker-glow';
  glow.style.cssText = `
    width:${glowSize}px;height:${glowSize}px;
    background:radial-gradient(circle,${cfg.glow} 0%,transparent 70%);
  `;

  // Ping ring (selected only)
  if (selected) {
    const ping = document.createElement('div');
    ping.className = 'battle-marker-ping';
    ping.style.cssText = `
      width:${size}px;height:${size}px;
      top:${(glowSize - size) / 2}px;left:${(glowSize - size) / 2}px;
      border-color:${cfg.ping};
      position:absolute;
    `;
    wrapper.appendChild(ping);
  }

  // Core circle
  const core = document.createElement('div');
  core.className = 'battle-marker-core';
  core.style.cssText = `
    width:${size}px;height:${size}px;
    top:${(glowSize - size) / 2}px;left:${(glowSize - size) / 2}px;
    background:${cfg.fill};
    border-color:${cfg.border};
    box-shadow:0 0 ${selected ? 20 : 10}px ${cfg.glow},0 3px 12px rgba(0,0,0,0.7);
    position:absolute;
    font-size:${selected ? 14 : 10}px;
  `;
  core.textContent = '⚔';

  wrapper.appendChild(glow);
  wrapper.appendChild(core);

  return wrapper;
}

// ─── Campaign Path Helpers ─────────────────────────────────────────────────────

const ROUTE_SOURCE_ID = 'campaign-route';
const ROUTE_LAYER_CASING = 'campaign-route-casing';
const ROUTE_LAYER_LINE   = 'campaign-route-line';

function addCampaignRoute(map: maplibregl.Map, battles: Battle[]) {
  if (battles.length < 2) return;

  const coords = battles.map((b) => toLngLat(b.coordinates));

  const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: coords },
    properties: {},
  };

  if (map.getSource(ROUTE_SOURCE_ID)) {
    (map.getSource(ROUTE_SOURCE_ID) as maplibregl.GeoJSONSource).setData(geojson);
    return;
  }

  map.addSource(ROUTE_SOURCE_ID, { type: 'geojson', data: geojson });

  // Glow casing layer
  map.addLayer({
    id: ROUTE_LAYER_CASING,
    type: 'line',
    source: ROUTE_SOURCE_ID,
    paint: {
      'line-color': 'rgba(196,164,58,0.15)',
      'line-width': 6,
      'line-blur': 4,
    },
    layout: { 'line-join': 'round', 'line-cap': 'round' },
  });

  // Main dashed line
  map.addLayer({
    id: ROUTE_LAYER_LINE,
    type: 'line',
    source: ROUTE_SOURCE_ID,
    paint: {
      'line-color': '#C4A43A',
      'line-width': 1.5,
      'line-opacity': 0.65,
      'line-dasharray': [3, 5],
    },
    layout: { 'line-join': 'round', 'line-cap': 'round' },
  });
}

function removeCampaignRoute(map: maplibregl.Map) {
  if (map.getLayer(ROUTE_LAYER_LINE))   map.removeLayer(ROUTE_LAYER_LINE);
  if (map.getLayer(ROUTE_LAYER_CASING)) map.removeLayer(ROUTE_LAYER_CASING);
  if (map.getSource(ROUTE_SOURCE_ID))   map.removeSource(ROUTE_SOURCE_ID);
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function MapView() {
  const { state, dispatch, filteredBattles, allBattles } = useApp();
  const { selectedBattle, hoveredBattle, campaign } = state;

  const containerRef  = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<maplibregl.Map | null>(null);
  const markersRef    = useRef<Map<string, maplibregl.Marker>>(new Map());
  const tooltipRef    = useRef<HTMLDivElement | null>(null);
  const rafRef        = useRef<number | null>(null);
  const animStepRef   = useRef(0);

  // ── Tooltip management ────────────────────────────────────────────────────────

  const showTooltip = useCallback((battle: Battle, x: number, y: number) => {
    if (!tooltipRef.current) return;
    const cfg = OUTCOME_CFG[battle.outcome];
    tooltipRef.current.style.display = 'block';
    tooltipRef.current.style.left = `${x}px`;
    tooltipRef.current.style.top  = `${y}px`;
    tooltipRef.current.innerHTML = `
      <span class="map-battle-tooltip-name">${battle.name}</span>
      <span class="map-battle-tooltip-date" style="color:${cfg.border}80">${battle.date}</span>
    `;
  }, []);

  const hideTooltip = useCallback(() => {
    if (tooltipRef.current) tooltipRef.current.style.display = 'none';
  }, []);

  // ── Map initialisation ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      minZoom: 3,
      maxZoom: 13,
      attributionControl: true,
      pitchWithRotate: false,
      dragRotate: false,
    });

    // Disable rotation gestures
    map.keyboard.disableRotation();

    // Expose map ref for FloatingControls zoom buttons
    (window as any).__mapRef = map;

    // Add attribution only — no other default controls
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    mapRef.current = map;

    // Create tooltip DOM element
    const tooltip = document.createElement('div');
    tooltip.className = 'map-battle-tooltip';
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);
    tooltipRef.current = tooltip;

    // Handle resize — critical for iOS Safari
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => map.resize());
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      tooltip.remove();
      tooltipRef.current = null;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Animated dash for campaign path ──────────────────────────────────────────

  const startDashAnimation = useCallback(() => {
    if (!mapRef.current) return;

    const sequences: number[][] = [
      [0, 4, 3],   [0.5, 4, 2.5], [1, 4, 2],   [1.5, 4, 1.5],
      [2, 4, 1],   [2.5, 4, 0.5], [3, 4, 0],
      [0, 0.5, 3, 3.5], [0, 1, 3, 3], [0, 1.5, 3, 2.5],
      [0, 2, 3, 2], [0, 2.5, 3, 1.5], [0, 3, 3, 1], [0, 3.5, 3, 0.5],
    ];

    let step = 0;
    let last = 0;

    const animate = (ts: number) => {
      if (!mapRef.current) return;
      if (ts - last > 60) {
        if (mapRef.current.getLayer(ROUTE_LAYER_LINE)) {
          mapRef.current.setPaintProperty(
            ROUTE_LAYER_LINE,
            'line-dasharray',
            sequences[step % sequences.length]
          );
        }
        step++;
        last = ts;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  const stopDashAnimation = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // ── Sync markers with filtered battles ───────────────────────────────────────

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const waitForLoad = () => {
      const currentIds = new Set(filteredBattles.map((b) => b.id));

      // Remove stale markers
      markersRef.current.forEach((marker, id) => {
        if (!currentIds.has(id)) {
          marker.remove();
          markersRef.current.delete(id);
        }
      });

      // Add / refresh markers
      filteredBattles.forEach((battle) => {
        const isSelected = selectedBattle?.id === battle.id;
        const existing = markersRef.current.get(battle.id);

        if (existing) {
          // Update icon if selection state changed
          const el = existing.getElement();
          const wasSelected = el.classList.contains('selected');
          if (isSelected !== wasSelected) {
            const newEl = createMarkerElement(battle, isSelected);
            newEl.addEventListener('click', () => {
              dispatch({ type: 'SELECT_BATTLE', payload: battle });
            });
            newEl.addEventListener('mouseenter', (e) => {
              dispatch({ type: 'HOVER_BATTLE', payload: battle });
              showTooltip(battle, e.clientX, e.clientY);
            });
            newEl.addEventListener('mouseleave', () => {
              dispatch({ type: 'HOVER_BATTLE', payload: null });
              hideTooltip();
            });
            newEl.addEventListener('mousemove', (e) => {
              showTooltip(battle, e.clientX, e.clientY);
            });
            existing.remove();
            const updated = new maplibregl.Marker({ element: newEl, anchor: 'center' })
              .setLngLat(toLngLat(battle.coordinates))
              .addTo(map);
            markersRef.current.set(battle.id, updated);
          }
        } else {
          // Create new marker
          const el = createMarkerElement(battle, isSelected);

          el.addEventListener('click', (e) => {
            e.stopPropagation();
            dispatch({ type: 'SELECT_BATTLE', payload: battle });
          });
          el.addEventListener('mouseenter', (e) => {
            dispatch({ type: 'HOVER_BATTLE', payload: battle });
            showTooltip(battle, e.clientX, e.clientY);
          });
          el.addEventListener('mouseleave', () => {
            dispatch({ type: 'HOVER_BATTLE', payload: null });
            hideTooltip();
          });
          el.addEventListener('mousemove', (e) => {
            showTooltip(battle, e.clientX, e.clientY);
          });

          const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
            .setLngLat(toLngLat(battle.coordinates))
            .addTo(map);

          markersRef.current.set(battle.id, marker);
        }
      });
    };

    if (map.loaded()) {
      waitForLoad();
    } else {
      map.on('load', waitForLoad);
    }
  }, [filteredBattles, selectedBattle, dispatch, showTooltip, hideTooltip]);

  // ── Fly to selected battle ────────────────────────────────────────────────────

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedBattle) return;

    const currentZoom = map.getZoom();
    const targetZoom = Math.max(currentZoom, SELECTED_ZOOM);

    map.flyTo({
      center: toLngLat(selectedBattle.coordinates),
      zoom: targetZoom,
      duration: FLY_DURATION,
      curve: 1.4,
      easing: (t) => 1 - Math.pow(1 - t, 4), // ease-out-quart
    });
  }, [selectedBattle]);

  // ── Campaign path ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const addRoute = () => {
      if (campaign.active) {
        addCampaignRoute(map, allBattles);
        startDashAnimation();
      } else {
        stopDashAnimation();
        removeCampaignRoute(map);
      }
    };

    if (map.loaded()) {
      addRoute();
    } else {
      map.on('load', addRoute);
    }

    return () => { stopDashAnimation(); };
  }, [campaign.active, allBattles, startDashAnimation, stopDashAnimation]);

  // ── Deselect on map click ─────────────────────────────────────────────────────

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = () => {
      dispatch({ type: 'SELECT_BATTLE', payload: null });
    };

    map.on('click', handleMapClick);
    return () => { map.off('click', handleMapClick); };
  }, [dispatch]);

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Map container — fills entire parent */}
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ background: '#070B14' }}
      />

      {/* Cinematic vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: `
            radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(7,11,20,0.55) 100%),
            linear-gradient(to bottom, rgba(7,11,20,0.3) 0%, transparent 15%, transparent 75%, rgba(7,11,20,0.4) 100%)
          `,
        }}
      />

      {/* Subtle gold tint vignette at extreme edges */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            'radial-gradient(ellipse 110% 110% at 50% 50%, transparent 55%, rgba(196,164,58,0.03) 100%)',
        }}
      />
    </>
  );
}
