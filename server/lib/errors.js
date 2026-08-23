// Shared error helpers.
//
// Upstream failures (Odoo, Pesapal) arrive as axios errors whose useful
// detail lives in err.response.data — logging only err.message throws that
// away and leaves nothing to debug with. describeError extracts it, logError
// records the full picture, and sendError keeps the JSON error shape the
// frontend already expects while attaching the correct status code.

// Collapse an unknown thrown value into { status, message, detail }.
function describeError(err) {
  if (err && err.response) {
    const { status, data } = err.response;
    const upstream =
      (data && (data.error || data.message || data.detail)) || null;
    return {
      // We reached the upstream service and it refused or failed.
      status: 502,
      message:
        (upstream && (upstream.message || upstream.data?.message)) ||
        (typeof upstream === 'string' ? upstream : null) ||
        err.message ||
        'Upstream request failed',
      detail: data ?? null,
      upstreamStatus: status,
    };
  }

  if (err && err.request) {
    return {
      status: 504,
      message: err.message || 'Upstream service did not respond',
      detail: null,
    };
  }

  return {
    status: err?.status || 500,
    message: err?.message || 'Unexpected error',
    detail: null,
  };
}

function logError(context, err) {
  const info = describeError(err);
  console.error(
    `[${context}] ${info.message}`,
    JSON.stringify({
      status: info.status,
      upstreamStatus: info.upstreamStatus,
      detail: info.detail,
    })
  );
  if (err instanceof Error && err.stack) console.error(err.stack);
  return info;
}

// Wrap an async express handler so a rejected promise reaches the error
// middleware instead of hanging the request.
function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

module.exports = { describeError, logError, asyncRoute };
