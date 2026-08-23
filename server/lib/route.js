function asyncRoute(label, handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (err) {
      console.error(`${label}:`, err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  };
}

module.exports = { asyncRoute };
