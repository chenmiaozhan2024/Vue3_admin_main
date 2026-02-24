//连接数据库
//db.js

const mysql = require('mysql2/promise')
const config = require('./config').db
//创建数据库连接池
const pool = mysql.createPool({
    ...config,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

//获取数据库连接
module.exports = async () => {
    try {
        const connection = await pool.getConnection()
        return connection
    } catch (error) {
        console.error('获取数据库连接失败:', error)
        throw error
    }
}
