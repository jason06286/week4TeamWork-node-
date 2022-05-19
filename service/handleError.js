const resErrorDev = (err, res) => {
  res.status(err.statusCode).send({
    message: err.message,
    error: err,
    stack: err.stack,
  });
};
const resErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).send({
      message: err.message,
    });
  } else {
    console.error("出現重大錯誤");
    res.status(500).send({
      status: "error",
      message: "系統錯誤，請洽系統管理員!!",
    });
  }
};

const appError = (httpStatus, errMessage, next) => {
  const error = new Error(errMessage);
  error.statusCode = httpStatus;
  error.isOperational = true;
  next(error);
};

module.exports = {
  resErrorDev,
  resErrorProd,
  appError,
};
