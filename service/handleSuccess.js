const express = require("express");

const handleSuccess = (res, httpStatus, data, message) => {
  data
    ? res.status(httpStatus).send({ data })
    : res.status(httpStatus).send({ message });
};

module.exports = handleSuccess;
