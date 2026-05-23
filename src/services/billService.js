// ──────────────────────────────────────────────────────────────────
// Bill Service — fetches RI bill data from OpenStates API v3
// OpenStates free tier: 500 req/day, no credit card required
// Sign up at: https://openstates.org/accounts/signup/
// ──────────────────────────────────────────────────────────────────

const OPENSTATES_BASE = 'https://v3.openstates.org';
const RI_JURISDICTION = 'ri';

function getApiKey() {
  return localStorage.getItem('openstates_api_key') || '';
}

export function saveApiKey(key) {
  localStorage.setItem('openstates_api_key', key.trim());
}

export function clearApiKey() {
  localStorage.removeItem('openstates_api_key');
}

// Transform an OpenStates bill record into our internal format
function transformBill(rawBill) {
  const primarySponsor = rawBill.sponsorships?.find((s) => s.primary)?.name
    || rawBill.sponsorships?.[0]?.name
    || 'Unknown';

  const cosponsors = rawBill.sponsorships
    ?.filter((s) => !s.primary)
    ?.map((s) => s.name) || [];

  const abstract = rawBill.abstracts?.[0]?.abstract || rawBill.title || '';

  // Determine committee from the referral action description
  const referralAction = rawBill.actions?.find(
    (a) => a.classification?.includes('referral-committee')
  );
  let committee = 'Unknown Committee';
  if (referralAction?.description) {
    const match = referralAction.description.match(/referred to (.+)$/i);
    if (match) committee = match[1];
  }

  return {
    id: rawBill.id,
    identifier: rawBill.identifier,
    title: rawBill.title,
    abstract,
    primarySponsor,
    cosponsors,
    committee,
    session: rawBill.session,
    chamber: rawBill.from_organization?.name || 'Unknown',
    latestActionDate: rawBill.latest_action_date,
    latestActionDescription: rawBill.latest_action_description,
    openStatesUrl: rawBill.openstates_url,
    actions: (rawBill.actions || []).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    ),
  };
}

export async function searchBillByIdentifier(identifier) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  const clean = identifier.trim().toUpperCase();
  const url = new URL(`${OPENSTATES_BASE}/bills`);
  url.searchParams.set('jurisdiction', RI_JURISDICTION);
  url.searchParams.set('identifier', clean);
  url.searchParams.set('include', 'actions');
  url.searchParams.set('include', 'sponsorships');
  url.searchParams.set('include', 'abstracts');

  const resp = await fetch(url.toString(), {
    headers: {
      'X-API-KEY': apiKey,
      Accept: 'application/json',
    },
  });

  if (resp.status === 401 || resp.status === 403) {
    throw new Error('INVALID_API_KEY');
  }
  if (!resp.ok) {
    throw new Error(`API error: ${resp.status} ${resp.statusText}`);
  }

  const data = await resp.json();
  if (!data.results?.length) {
    throw new Error(`No bill found for identifier "${clean}" in Rhode Island.`);
  }

  return transformBill(data.results[0]);
}

export async function searchBillsByKeyword(keyword, session = '') {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('NO_API_KEY');

  const url = new URL(`${OPENSTATES_BASE}/bills`);
  url.searchParams.set('jurisdiction', RI_JURISDICTION);
  url.searchParams.set('q', keyword.trim());
  if (session) url.searchParams.set('session', session);
  url.searchParams.set('include', 'actions');
  url.searchParams.set('include', 'sponsorships');
  url.searchParams.set('include', 'abstracts');
  url.searchParams.set('per_page', '10');

  const resp = await fetch(url.toString(), {
    headers: {
      'X-API-KEY': apiKey,
      Accept: 'application/json',
    },
  });

  if (resp.status === 401 || resp.status === 403) throw new Error('INVALID_API_KEY');
  if (!resp.ok) throw new Error(`API error: ${resp.status}`);

  const data = await resp.json();
  return (data.results || []).map(transformBill);
}
