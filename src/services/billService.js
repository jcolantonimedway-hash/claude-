// Calls our own Vercel serverless function, which scrapes
// the RI General Assembly website server-side. No API key needed.

export async function searchBillByIdentifier(identifier) {
  const clean = identifier.trim().toUpperCase();

  if (!/^[HS]\d+$/.test(clean)) {
    throw new Error('Please enter a valid bill number like H5001 or S0245.');
  }

  const res = await fetch(`/api/bill?identifier=${encodeURIComponent(clean)}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch bill data.');
  }

  return data;
}
