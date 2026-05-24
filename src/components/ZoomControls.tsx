import React from 'react';
import { useMap } from 'react-leaflet';
import { Plus, Minus, Home } from 'lucide-react';

const HOME_CENTER: [number, number] = [39.5, -76.0];
const HOME_ZOOM = 5;

/**
 * Must be rendered inside a <MapContainer>.
 * Uses a Leaflet custom control to inject native DOM buttons
 * outside of Leaflet's tile layers so clicks aren't swallowed.
 */
export function ZoomControls() {
  const map = useMap();

  // Render nothing — we directly call map methods from outside
  // The actual buttons are rendered as a portal-overlay in BattleMap
  React.useEffect(() => {
    // Attach the map instance to a global so the overlay can call it
    (window as any).__battleMap = map;
    return () => {
      (window as any).__battleMap = null;
    };
  }, [map]);

  return null;
}

/** Standalone button group rendered OUTSIDE MapContainer (positioned absolutely) */
export function ZoomButtonGroup() {
  function zoomIn() { (window as any).__battleMap?.zoomIn(); }
  function zoomOut() { (window as any).__battleMap?.zoomOut(); }
  function resetView() {
    (window as any).__battleMap?.flyTo(HOME_CENTER, HOME_ZOOM, { duration: 1 });
  }

  return (
    <div className="absolute right-3 bottom-4 z-20 flex flex-col gap-1">
      <button
        onClick={zoomIn}
        title="Zoom in"
        className="w-8 h-8 rounded-t-lg bg-navy/90 backdrop-blur-sm border border-navy-400/30 flex items-center justify-center text-parchment-300/70 hover:text-parchment-100 hover:border-gold/30 transition-colors duration-150"
      >
        <Plus className="w-4 h-4" />
      </button>
      <button
        onClick={zoomOut}
        title="Zoom out"
        className="w-8 h-8 bg-navy/90 backdrop-blur-sm border border-b-0 border-navy-400/30 flex items-center justify-center text-parchment-300/70 hover:text-parchment-100 hover:border-gold/30 transition-colors duration-150"
      >
        <Minus className="w-4 h-4" />
      </button>
      <button
        onClick={resetView}
        title="Reset view"
        className="w-8 h-8 rounded-b-lg bg-navy/90 backdrop-blur-sm border border-navy-400/30 flex items-center justify-center text-parchment-300/70 hover:text-parchment-100 hover:border-gold/30 transition-colors duration-150"
      >
        <Home className="w-4 h-4" />
      </button>
    </div>
  );
}
