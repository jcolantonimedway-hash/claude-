import React, { useState } from 'react';
import { User, Users, Building2, Calendar, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate, getBillChamber } from '../utils/billUtils';

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
        <div className="text-sm font-medium text-slate-800 mt-0.5">{children}</div>
      </div>
    </div>
  );
}

export default function BillDetails({ bill }) {
  const [expanded, setExpanded] = useState(false);
  const chamber = bill.chamber || getBillChamber(bill.identifier);

  return (
    <div className="card p-5 mb-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-ri-navy text-white text-xs font-bold font-mono">
              {bill.identifier}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
              {chamber}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
              {bill.session || '2025'} Session
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800 leading-snug">
            {bill.title}
          </h2>
        </div>
        {bill.openStatesUrl && bill.openStatesUrl !== '#' && (
          <a
            href={bill.openStatesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-ri-navy hover:underline flex-shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            OpenStates
          </a>
        )}
      </div>

      {/* Abstract */}
      {bill.abstract && (
        <div className="mb-4">
          <div
            className={`text-sm text-slate-600 leading-relaxed ${!expanded && bill.abstract.length > 200 ? 'line-clamp-3' : ''}`}
          >
            {bill.abstract}
          </div>
          {bill.abstract.length > 200 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 mt-1 text-xs text-ri-navy font-medium hover:underline"
            >
              {expanded ? (
                <><ChevronUp className="w-3.5 h-3.5" /> Show less</>
              ) : (
                <><ChevronDown className="w-3.5 h-3.5" /> Read more</>
              )}
            </button>
          )}
        </div>
      )}

      {/* Info grid */}
      <div className="divide-y divide-slate-50">
        <InfoRow icon={User} label="Primary Sponsor">
          {bill.primarySponsor || 'Unknown'}
        </InfoRow>

        {bill.cosponsors?.length > 0 && (
          <InfoRow icon={Users} label={`Cosponsors (${bill.cosponsors.length})`}>
            <span className="text-slate-600">{bill.cosponsors.join(', ')}</span>
          </InfoRow>
        )}

        <InfoRow icon={Building2} label="Committee">
          {bill.committee || 'Pending assignment'}
        </InfoRow>

        {bill.latestActionDate && (
          <InfoRow icon={Calendar} label="Latest Action">
            <span>{formatDate(bill.latestActionDate)}</span>
            {bill.latestActionDescription && (
              <p className="text-xs text-slate-500 mt-0.5">{bill.latestActionDescription}</p>
            )}
          </InfoRow>
        )}
      </div>

      {/* RI legislature link */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <a
          href={bill.riLegUrl || `https://webserver.rilegislature.gov/BillText26/${bill.identifier.charAt(0) === 'H' ? 'HouseText26' : 'SenateText26'}/${bill.identifier}.htm`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-ri-navy hover:underline font-medium"
        >
          <ExternalLink className="w-4 h-4" />
          View on RI General Assembly website →
        </a>
      </div>
    </div>
  );
}
