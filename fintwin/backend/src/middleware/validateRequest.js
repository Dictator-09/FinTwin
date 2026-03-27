export const validateBody = (requiredFields) => {
  return (req, res, next) => {
    if (!req.body) {
      return res.status(400).json({ error: `Missing required field: ${requiredFields[0]}` });
    }

    for (const field of requiredFields) {
      if (!(field in req.body)) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }
    next();
  };
};
