import createHttpError from 'http-errors';

export const validateQuery = (schema) => (req, _res, next) => {
  if (!schema) return next();

  const { value, error } = schema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    return next(
      createHttpError(
        400,
        error.details?.map((d) => d.message).join(', ') || error.message,
      ),
    );
  }

  Object.keys(req.query).forEach((k) => {
    delete req.query[k];
  });
  Object.assign(req.query, value);

  req.validated = req.validated || {};
  req.validated.query = value;

  next();
};
