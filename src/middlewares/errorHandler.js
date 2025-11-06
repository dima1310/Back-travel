export const errorHandler = (err, req, res, next) => {
  console.error('Error occurred', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  const status = err.status || err.statusCode || 500;

  const message = status == 500 ? 'Something went wrong' : err.message;

  res.status(status).json({
    status: status,
    message: message,
    data: err.message,
  });
};
