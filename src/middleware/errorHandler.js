export function errorHandler(err, req, res, next) { // eslint-disable-line
  console.error(err);
  if (res.headersSent) return;
  res.status(500).json({ error: 'Internal server error' });
}
