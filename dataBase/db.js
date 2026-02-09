//连接数据库
//db.js

const mysql = require('mysql2/promise')
const config = require('./config').db
//连接数据库
module.exports = mysql.createConnection(config)
