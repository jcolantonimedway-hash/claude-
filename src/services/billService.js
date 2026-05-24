// Calls our Vercel serverless function, which scrapes the RI General Assembly.
// No API key needed.

export async function searchBillByIdentifier(identifier) {
  const clean = identifier.trim().toUpperCase();

  if (!/^[HS]\d+$/.test(clean)) {
    throw new Error('Please enter a valid bill number like H7632 or S2977.');
  }

  let res;
  try {
    res = await fetch(`/api/bill?identifier=${encodeURIComponent(clean)}`);
  } catch {
    throw new Error('Network error — check your connection and try again.');
  }

  // Guard against non-JSON responses (HTML error pages, etc.)
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(
      `Server error (${res.status}). The API route may not be deployed yet — try refreshing.`
    );
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch bill data.');
  }

  return data;
}
