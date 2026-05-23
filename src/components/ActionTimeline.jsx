import React, { useState } from 'react';
import { formatDate, actionToStage, STAGE_IDS } from '../utils/billUtils';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Clock,
} from 'lucide-react';

const TERMINAL_STAGES = new Set([
  STAGE_IDS.HELD_FOR_STUDY,
  STAGE_IDS.COMMITTEE_FAILED,
  STAGE_IDS.FAILED_CHAMBER,
  STAGE_IDS.VETOED,
]);

function getActionStyle(action) {
  const desc = (action.description || '').toLowerCase();
  const cls = action.classification || [];

  if (/held for further study|recommended for study/i.test(desc)) {
    return {
      dot: 'bg-amber-500 ring-amber-200',
      icon: AlertTriangle,
      iconClass: 'text-amber-600',
      textClass: 'text-amber-800 font-semibold',
      bg: 'bg-amber-50 border-amber-200',
    };
  }
  if (/signed by governor|executive-signature/.test(desc + cls.join(' '))) {
    return {
      dot: 'bg-green-600 ring-green-200',
      icon: CheckCircle2,
      iconClass: 'text-green-600',
      textClass: 'text-green-800 font-semibold',
      bg: 'bg-green-50 border-green-200',
    };
  }
  if (/passed|reported out|reported favorably/i.test(desc) || cls.includes('passage') || cls.includes('committee-passage')) {
    return {
      dot: 'bg-blue-500 ring-blue-200',
      icon: CheckCircle2,
      iconClass: 'text-blue-600',
      textClass: 'text-slate-700 font-medium',
      bg: 'bg-blue-50 border-blue-100',
    };
  }
  if (/failed|vetoed/i.test(desc) || cls.includes('failure') || cls.includes('executive-veto')) {
    return {
      dot: 'bg-red-500 ring-red-200',
      icon: XCircle,
      iconClass: 'text-red-600',
      textClass: 'text-red-800 font-semibold',
      bg: 'bg-red-50 border-red-200',
    };
  }
  // Default
  return {
    dot: 'bg-slate-400 ring-slate-100',
    icon: Info,
    iconClass: 'text-slate-400',
    textClass: 'text-slate-700',
    bg: 'bg-white border-slate-100',
  };
}

function ActionItem({ action, isFirst, isLast }) {
  const style = getActionStyle(action);
  const Icon = style.icon;

  return (
    <div className="flex gap-3 relative">
      {/* Vertical connector line */}
      {!isLast && (
        <div className="absolute left-[11px] top-5 bottom-0 w-0.5 bg-slate-200" />
      )}

      {/* Dot */}
      <div className={`w-5 h-5 rounded-full flex-shrink-0 mt-0.5 ring-4 z-10 ${style.dot}`} />

      {/* Content */}
      <div className={`flex-1 min-w-0 mb-4 p-3 rounded-xl border ${style.bg}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${style.iconClass}`} />
            <p className={`text-sm leading-snug ${style.textClass}`}>
              {action.description}
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 text-xs text-slate-400 mt-0.5">
            <Clock className="w-3 h-3" />
            <span>{formatDate(action.date)}</span>
          </div>
        </div>
        {action.organization && (
          <p className="text-xs text-slate-400 mt-1 ml-6">
            {action.organization}
          </p>
        )}
      </div>
    </div>
  );
}

const INITIAL_DISPLAY = 5;

export default function ActionTimeline({ bill }) {
  const [showAll, setShowAll] = useState(false);

  const actions = [...(bill.actions || [])].reverse(); // newest first
  const displayed = showAll ? actions : actions.slice(0, INITIAL_DISPLAY);
  const hasMore = actions.length > INITIAL_DISPLAY;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-slate-800">Action History</h2>
        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
          {actions.length} {actions.length === 1 ? 'action' : 'actions'}
        </span>
      </div>

      {actions.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">No actions recorded yet.</p>
      ) : (
        <>
          <div>
            {displayed.map((action, idx) => (
              <ActionItem
                key={`${action.date}-${idx}`}
                action={action}
                isFirst={idx === 0}
                isLast={idx === displayed.length - 1}
              />
            ))}
          </div>

          {hasMore && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2 mx-auto mt-2 px-4 py-2 text-sm font-medium text-ri-navy hover:bg-ri-navy/5 rounded-lg transition-colors"
            >
              {showAll ? (
                <><ChevronUp className="w-4 h-4" /> Show fewer</>
              ) : (
                <><ChevronDown className="w-4 h-4" /> Show all {actions.length} actions</>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}
