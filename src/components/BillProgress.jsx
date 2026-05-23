import React, { useEffect, useState } from 'react';
import {
  PROGRESS_STAGES,
  STAGE_IDS,
  computeBillStatus,
  getProgressIndex,
  getSubStatusConfig,
} from '../utils/billUtils';
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  XCircle,
  Clock,
  Gavel,
  ScrollText,
  Vote,
  ArrowRightLeft,
  Building2,
  Scale,
  FileText,
} from 'lucide-react';

// Stage-specific icons
const STAGE_ICONS = [FileText, Building2, Vote, CheckCircle2, ArrowRightLeft, Gavel, Scale];

// ──────────────────────────────────────────────────────────────────
// Single stage node in the progress stepper
// ──────────────────────────────────────────────────────────────────
function StageNode({ stage, stageIndex, progressIndex, isTerminal, subStatus, isLast }) {
  const Icon = STAGE_ICONS[stageIndex] || Circle;

  const isCompleted = stageIndex < progressIndex;
  const isCurrent = stageIndex === progressIndex;
  const isFuture = stageIndex > progressIndex;

  const heldForStudy = isCurrent && subStatus === 'held_for_study';
  const failedInCommittee = isCurrent && subStatus === 'failed_in_committee';
  const vetoed = isCurrent && subStatus === 'vetoed';
  const reportedOut = isCurrent && subStatus === 'reported_out';
  const isStuck = isTerminal && isCurrent;

  function getCircleStyle() {
    if (isCompleted)
      return 'bg-green-500 border-green-500 text-white shadow-green-200 shadow-lg';
    if (heldForStudy || failedInCommittee)
      return 'bg-amber-500 border-amber-500 text-white glow-amber';
    if (vetoed)
      return 'bg-red-500 border-red-500 text-white';
    if (reportedOut)
      return 'bg-emerald-500 border-emerald-500 text-white glow-animate';
    if (isCurrent && !isStuck)
      return 'bg-ri-navy border-ri-navy text-white glow-animate';
    if (isFuture)
      return 'bg-white border-slate-300 text-slate-400';
    return 'bg-white border-slate-300 text-slate-400';
  }

  function getConnectorStyle() {
    if (isCompleted) return 'bg-green-400';
    if (isCurrent && (reportedOut)) return 'bg-gradient-to-r from-green-400 to-slate-200';
    if (isCurrent) return 'bg-gradient-to-r from-ri-navy/40 to-slate-200';
    return 'bg-slate-200';
  }

  function getLabelStyle() {
    if (isCompleted) return 'text-green-700 font-semibold';
    if (heldForStudy || failedInCommittee) return 'text-amber-700 font-semibold';
    if (vetoed) return 'text-red-700 font-semibold';
    if (isCurrent) return 'text-ri-navy font-bold';
    return 'text-slate-400 font-medium';
  }

  function getNodeIcon() {
    if (isCompleted) return <CheckCircle2 className="w-6 h-6" />;
    if (heldForStudy) return <AlertTriangle className="w-6 h-6" />;
    if (failedInCommittee) return <XCircle className="w-6 h-6" />;
    if (vetoed) return <XCircle className="w-6 h-6" />;
    if (isCurrent) return <Icon className="w-6 h-6" />;
    return <Icon className="w-6 h-6" />;
  }

  return (
    <div className="stage-node flex-1 min-w-0 relative">
      {/* Connector line to the RIGHT */}
      {!isLast && (
        <div
          className={`absolute top-7 left-1/2 w-full h-1 rounded-full transition-all duration-700 ${getConnectorStyle()}`}
          style={{ zIndex: 0 }}
        />
      )}

      {/* Circle */}
      <div className="relative flex justify-center">
        <div
          className={`stage-circle w-14 h-14 rounded-full flex items-center justify-center border-4 z-10 relative transition-all duration-500 ${getCircleStyle()}`}
        >
          {getNodeIcon()}
        </div>

        {/* Pulse ring for current active stage */}
        {isCurrent && !isStuck && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-14 h-14 rounded-full border-4 border-ri-navy/30 animate-ping opacity-60" />
          </div>
        )}
      </div>

      {/* Label */}
      <div className={`mt-2 text-center text-xs leading-tight px-1 ${getLabelStyle()}`}>
        <span className="hidden sm:inline">{stage.label}</span>
        <span className="sm:hidden">{stage.shortLabel}</span>
      </div>

      {/* "Current" indicator dot */}
      {isCurrent && (
        <div className="flex justify-center mt-1">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              heldForStudy || failedInCommittee ? 'bg-amber-500' : vetoed ? 'bg-red-500' : 'bg-ri-navy'
            }`}
          />
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Sub-status banner
// ──────────────────────────────────────────────────────────────────
function SubStatusBanner({ subStatus, isTerminal }) {
  if (!subStatus) return null;
  const config = getSubStatusConfig(subStatus);
  if (!config) return null;

  const colorMap = {
    amber: 'bg-amber-50 border-amber-300 text-amber-900',
    green: 'bg-green-50 border-green-300 text-green-900',
    red: 'bg-red-50 border-red-300 text-red-900',
  };

  return (
    <div
      className={`mt-6 flex items-start gap-3 p-4 rounded-xl border-2 ${
        colorMap[config.color] || colorMap.amber
      }`}
    >
      <span className="text-2xl">{config.emoji}</span>
      <div>
        <p className="font-bold text-sm">{config.label}</p>
        <p className="text-sm opacity-80 mt-0.5">{config.description}</p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Overall progress percentage bar
// ──────────────────────────────────────────────────────────────────
function ProgressBar({ progressIndex, total, isTerminal, subStatus }) {
  const [width, setWidth] = useState(0);
  const stuck = isTerminal && (subStatus === 'held_for_study' || subStatus === 'failed_in_committee');

  useEffect(() => {
    const pct = Math.round(((progressIndex + (subStatus === 'reported_out' ? 0.7 : 0.3)) / (total - 1)) * 100);
    const t = setTimeout(() => setWidth(Math.min(100, pct)), 100);
    return () => clearTimeout(t);
  }, [progressIndex, total, subStatus]);

  const barColor = stuck
    ? 'bg-gradient-to-r from-amber-400 to-amber-500'
    : subStatus === 'vetoed'
    ? 'bg-gradient-to-r from-red-400 to-red-500'
    : progressIndex === PROGRESS_STAGES.length - 1
    ? 'bg-gradient-to-r from-green-400 to-green-600'
    : 'bg-gradient-to-r from-ri-navy to-blue-500';

  return (
    <div className="mt-6 mb-2">
      <div className="flex justify-between text-xs text-slate-500 mb-1.5">
        <span>Bill Progress</span>
        <span className="font-semibold">{Math.round(width)}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Main BillProgress component
// ──────────────────────────────────────────────────────────────────
export default function BillProgress({ bill }) {
  const { stageId, subStatus, isTerminal } = computeBillStatus(bill.actions);
  const progressIndex = getProgressIndex(stageId, subStatus);

  const currentStageName = PROGRESS_STAGES[progressIndex]?.label || 'Unknown';

  return (
    <div className="card p-5 sm:p-6 mb-6">
      {/* Section title */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-800">Legislative Progress</h2>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-ri-navy/5 rounded-lg">
          <Clock className="w-4 h-4 text-ri-navy" />
          <span className="text-sm font-semibold text-ri-navy">{currentStageName}</span>
        </div>
      </div>

      {/* Stepper — horizontal scroll on small screens */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-start min-w-[560px] gap-0 px-2">
          {PROGRESS_STAGES.map((stage, idx) => (
            <StageNode
              key={stage.id}
              stage={stage}
              stageIndex={idx}
              progressIndex={progressIndex}
              isTerminal={isTerminal}
              subStatus={subStatus}
              isLast={idx === PROGRESS_STAGES.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <ProgressBar
        progressIndex={progressIndex}
        total={PROGRESS_STAGES.length}
        isTerminal={isTerminal}
        subStatus={subStatus}
      />

      {/* Sub-status banner */}
      <SubStatusBanner subStatus={subStatus} isTerminal={isTerminal} />

      {/* Tip for small screens */}
      <p className="text-xs text-slate-400 text-center mt-3 sm:hidden">
        ← Scroll horizontally to see all stages →
      </p>
    </div>
  );
}
