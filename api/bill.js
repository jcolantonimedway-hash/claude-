// Minimal test — if this works, we know the function deploys correctly
export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    ok: true,
    identifier: req.query.identifier,
    message: 'API route is working',
  });
}
