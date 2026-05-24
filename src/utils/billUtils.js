// ──────────────────────────────────────────────────────────────────
// Rhode Island Bill Progress Stages
// ──────────────────────────────────────────────────────────────────

export const STAGE_IDS = {
  INTRODUCED: 'introduced',
  COMMITTEE: 'committee',
  COMMITTEE_PASSED: 'committee_passed',
  HELD_FOR_STUDY: 'held_for_study',
  COMMITTEE_FAILED: 'committee_failed',
  FLOOR: 'floor',
  PASSED_CHAMBER: 'passed_chamber',
  FAILED_CHAMBER: 'failed_chamber',
  OTHER_CHAMBER_COMMITTEE: 'other_chamber_committee',
  OTHER_CHAMBER_FLOOR: 'other_chamber_floor',
  GOVERNOR: 'governor',
  SIGNED: 'signed',
  VETOED: 'vetoed',
};

// The linear "happy path" stages shown in the progress bar
export const PROGRESS_STAGES = [
  {
    id: STAGE_IDS.INTRODUCED,
    label: 'Introduced',
    shortLabel: 'Filed',
    emoji: '📄',
    description: 'Bill has been filed with the legislature',
    color: 'blue',
  },
  {
    id: STAGE_IDS.COMMITTEE,
    label: 'In Committee',
    shortLabel: 'Committee',
    emoji: '🏛️',
    description: 'Referred to a committee for review and hearings',
    color: 'blue',
  },
  {
    id: STAGE_IDS.FLOOR,
    label: 'Floor Vote',
    shortLabel: 'Floor',
    emoji: '🗳️',
    description: 'Scheduled for or undergoing a floor debate and vote',
    color: 'blue',
  },
  {
    id: STAGE_IDS.PASSED_CHAMBER,
    label: 'Passed First Chamber',
    shortLabel: 'Passed',
    emoji: '✅',
    description: 'Passed the originating chamber (House or Senate)',
    color: 'green',
  },
  {
    id: STAGE_IDS.OTHER_CHAMBER_COMMITTEE,
    label: 'Other Chamber',
    shortLabel: '2nd Chamber',
    emoji: '🔄',
    description: 'Now in the other chamber\'s committee and floor process',
    color: 'blue',
  },
  {
    id: STAGE_IDS.GOVERNOR,
    label: "Governor's Desk",
    shortLabel: 'Governor',
    emoji: '📋',
    description: 'Passed both chambers, awaiting Governor\'s action',
    color: 'purple',
  },
  {
    id: STAGE_IDS.SIGNED,
    label: 'Signed into Law',
    shortLabel: 'Enacted',
    emoji: '⚖️',
    description: 'Signed by the Governor and enacted into law',
    color: 'green',
  },
];

// Maps OpenStates action classifications → our internal stage IDs
const CLASSIFICATION_MAP = {
  introduction: STAGE_IDS.INTRODUCED,
  'referral-committee': STAGE_IDS.COMMITTEE,
  'committee-passage': STAGE_IDS.COMMITTEE_PASSED,
  'committee-failure': STAGE_IDS.COMMITTEE_FAILED,
  'reading-1': STAGE_IDS.FLOOR,
  'reading-2': STAGE_IDS.FLOOR,
  'reading-3': STAGE_IDS.FLOOR,
  passage: STAGE_IDS.PASSED_CHAMBER,
  failure: STAGE_IDS.FAILED_CHAMBER,
  'executive-signature': STAGE_IDS.SIGNED,
  'executive-veto': STAGE_IDS.VETOED,
};

// RI-specific phrases found in action descriptions (checked after classification map)
const RI_DESCRIPTION_PATTERNS = [
  // Terminal / special states
  { pattern: /held for further study/i,           stage: STAGE_IDS.HELD_FOR_STUDY },
  { pattern: /recommended for study/i,            stage: STAGE_IDS.HELD_FOR_STUDY },
  { pattern: /signed by (the )?governor/i,        stage: STAGE_IDS.SIGNED },
  { pattern: /vetoed/i,                           stage: STAGE_IDS.VETOED },
  // Cross-chamber referral — must come before generic "referred to" / "passed"
  { pattern: /referred to (the )?(senate|house)\b/i, stage: STAGE_IDS.OTHER_CHAMBER_COMMITTEE },
  { pattern: /transmit(ted)? to (the )?(senate|house)/i, stage: STAGE_IDS.OTHER_CHAMBER_COMMITTEE },
  // Committee outcomes
  { pattern: /committee recommends passage/i,     stage: STAGE_IDS.COMMITTEE_PASSED },
  { pattern: /reported out/i,                     stage: STAGE_IDS.COMMITTEE_PASSED },
  { pattern: /reported favorably/i,               stage: STAGE_IDS.COMMITTEE_PASSED },
  // Floor / passage
  { pattern: /placed on.*calendar/i,              stage: STAGE_IDS.FLOOR },
  { pattern: /second reading/i,                   stage: STAGE_IDS.FLOOR },
  { pattern: /\bread and passed\b/i,              stage: STAGE_IDS.PASSED_CHAMBER },
  { pattern: /passed/i,                           stage: STAGE_IDS.PASSED_CHAMBER },
  { pattern: /failed/i,                           stage: STAGE_IDS.FAILED_CHAMBER },
  // Earlier stages
  { pattern: /committee hearing/i,                stage: STAGE_IDS.COMMITTEE },
  { pattern: /scheduled for hearing/i,            stage: STAGE_IDS.COMMITTEE },
  { pattern: /introduced/i,                       stage: STAGE_IDS.INTRODUCED },
];

// Derive a stage ID from an OpenStates action object
export function actionToStage(action) {
  // Try classification first
  if (action.classification?.length) {
    for (const cls of action.classification) {
      if (CLASSIFICATION_MAP[cls]) return CLASSIFICATION_MAP[cls];
    }
  }
  // Then try description pattern matching
  const desc = action.description || '';
  for (const { pattern, stage } of RI_DESCRIPTION_PATTERNS) {
    if (pattern.test(desc)) return stage;
  }
  return null;
}

// Given a list of OpenStates actions, compute the "current stage" and "sub-status"
export function computeBillStatus(actions) {
  if (!actions?.length) return { stageId: STAGE_IDS.INTRODUCED, subStatus: null, isTerminal: false };

  let currentStage = STAGE_IDS.INTRODUCED;
  let subStatus = null;
  let isTerminal = false;

  const stageOrder = [
    STAGE_IDS.INTRODUCED,
    STAGE_IDS.COMMITTEE,
    STAGE_IDS.COMMITTEE_PASSED,
    STAGE_IDS.FLOOR,
    STAGE_IDS.PASSED_CHAMBER,
    STAGE_IDS.OTHER_CHAMBER_COMMITTEE,
    STAGE_IDS.OTHER_CHAMBER_FLOOR,
    STAGE_IDS.GOVERNOR,
    STAGE_IDS.SIGNED,
  ];

  for (const action of actions) {
    const stage = actionToStage(action);
    if (!stage) continue;

    if (stage === STAGE_IDS.HELD_FOR_STUDY) {
      // Don't regress if we're already in the other chamber
      const ci = stageOrder.indexOf(currentStage);
      if (ci < stageOrder.indexOf(STAGE_IDS.OTHER_CHAMBER_COMMITTEE)) {
        currentStage = STAGE_IDS.COMMITTEE;
      }
      subStatus = 'held_for_study';
      isTerminal = true;
      continue;
    }
    if (stage === STAGE_IDS.COMMITTEE_FAILED) {
      const ci = stageOrder.indexOf(currentStage);
      if (ci < stageOrder.indexOf(STAGE_IDS.OTHER_CHAMBER_COMMITTEE)) {
        currentStage = STAGE_IDS.COMMITTEE;
      }
      subStatus = 'failed_in_committee';
      isTerminal = true;
      continue;
    }
    if (stage === STAGE_IDS.FAILED_CHAMBER) {
      currentStage = STAGE_IDS.FAILED_CHAMBER;
      isTerminal = true;
      continue;
    }
    if (stage === STAGE_IDS.VETOED) {
      currentStage = STAGE_IDS.VETOED;
      subStatus = 'vetoed';
      isTerminal = true;
      continue;
    }
    if (stage === STAGE_IDS.COMMITTEE_PASSED) {
      // If we're already in the other chamber, don't regress to COMMITTEE
      const ci = stageOrder.indexOf(currentStage);
      if (ci < stageOrder.indexOf(STAGE_IDS.OTHER_CHAMBER_COMMITTEE)) {
        currentStage = STAGE_IDS.COMMITTEE;
      }
      subStatus = 'reported_out';
      isTerminal = false;
      continue;
    }

    const stageIdx = stageOrder.indexOf(stage);
    const currentIdx = stageOrder.indexOf(currentStage);
    if (stageIdx > currentIdx) {
      currentStage = stage;
      subStatus = null;
      isTerminal = false;
    }
  }

  return { stageId: currentStage, subStatus, isTerminal };
}

// How far along the progress bar is the bill? Returns index into PROGRESS_STAGES
export function getProgressIndex(stageId, subStatus) {
  const map = {
    [STAGE_IDS.INTRODUCED]: 0,
    [STAGE_IDS.COMMITTEE]: 1,
    [STAGE_IDS.FLOOR]: 2,
    [STAGE_IDS.PASSED_CHAMBER]: 3,
    [STAGE_IDS.OTHER_CHAMBER_COMMITTEE]: 4,
    [STAGE_IDS.OTHER_CHAMBER_FLOOR]: 4,
    [STAGE_IDS.GOVERNOR]: 5,
    [STAGE_IDS.SIGNED]: 6,
    [STAGE_IDS.VETOED]: 5,
    [STAGE_IDS.FAILED_CHAMBER]: 2,
  };
  return map[stageId] ?? 0;
}

export function getSubStatusConfig(subStatus) {
  const configs = {
    held_for_study: {
      label: 'Held for Further Study',
      description: 'The committee has tabled this bill. It may not advance this session.',
      color: 'amber',
      emoji: '⏸️',
      severity: 'warning',
    },
    reported_out: {
      label: 'Reported Out of Committee',
      description: 'The committee voted to advance this bill to the full chamber.',
      color: 'green',
      emoji: '🚀',
      severity: 'success',
    },
    failed_in_committee: {
      label: 'Failed in Committee',
      description: 'The committee voted against advancing this bill.',
      color: 'red',
      emoji: '❌',
      severity: 'error',
    },
    vetoed: {
      label: 'Vetoed by Governor',
      description: 'The Governor has vetoed this bill. It may be overridden by the legislature.',
      color: 'red',
      emoji: '🚫',
      severity: 'error',
    },
  };
  return configs[subStatus] || null;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getBillChamber(identifier) {
  if (!identifier) return 'Unknown';
  const upper = identifier.toUpperCase();
  if (upper.startsWith('H')) return 'House';
  if (upper.startsWith('S')) return 'Senate';
  return 'Unknown';
}
