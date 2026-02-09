const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// 引入路由
const indexRouter = require('./Control/index');
const usersRouter = require('./Control/users');
const authRouter = require('./Control/auth');
const trademarkRouter=require('./Control/productControl/trademarkControl')
const arrtRouter=require('./Control/productControl/attrControl')
const userRouter=require('./Control/aclControl/userControl')
const roleRouter=require('./Control/aclControl/roleControl')
const permissionRouter=require('./Control/aclControl/permissionControl')
const app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


// 统一响应格式中间件
const responseMiddleware = require('./utils/response');
app.use(responseMiddleware);

app.use(express.static(path.join(__dirname, 'public')));
// 添加 static 目录的静态文件访问
app.use('/static', express.static(path.join(__dirname, 'static')));

// 挂载路由
app.use('/', indexRouter);
app.use('/admin/acl/user', usersRouter);
app.use(authRouter);
app.use(trademarkRouter)
app.use(arrtRouter)
app.use(userRouter)
app.use(roleRouter)
app.use(permissionRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
