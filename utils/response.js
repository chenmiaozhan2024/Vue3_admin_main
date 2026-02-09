/**
 * 统一响应格式中间件
 *
 * 返回格式:
 * {
 *   "code": 0,
 *   "data": {},
 *   "message": "",
 *   "ok": true
 * }
 */

const success = (res, data = '', message = 'success') => {
  res.send({
    code: 200,
    data,
    message,
    ok: true
  });
};

const error = (res, code, message, data = '') => {
  res.send({
    code,
    data,
    message,
    ok: false
  });
};

const responseMiddleware = (req, res, next) => {
  // 成功响应: res.success(data, message)
  res.success = (data, message) => success(res, data, message);

  // 失败响应: res.error(code, message, data)
  res.error = (code, message, data) => error(res, code, message, data);

  next();
};

module.exports = responseMiddleware;
