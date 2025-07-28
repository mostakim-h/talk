const sendRes = (res, statusCode = 200, message = 'Success', data = null) => {
  return res.status(statusCode).json({
    status: statusCode,
    success: statusCode >= 200 && statusCode < 300,
    message: message,
    res: data,
  });
}

module.exports = sendRes;