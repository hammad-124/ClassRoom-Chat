const asyncWrapper = (theFunc) => (req, res, next) => {
    if (typeof theFunc !== 'function') {
      return next(new Error('The provided argument is not a function'));
    }
    try {
      Promise.resolve(theFunc(req, res, next)).catch((err) => {
        console.error(err);
        next(err);
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  };
  
  export default asyncWrapper;