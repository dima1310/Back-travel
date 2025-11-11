export const validateQuery = (schema) => (req, _res, next) => {
  const { value, error } = schema.validate(req.query, { abortEarly: false });
  if (error) {
    error.status = 400;
    return next(error);
  }
  req.query = value;
  next();
};
