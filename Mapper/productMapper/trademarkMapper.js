const getConnection = require('../../dataBase/db')
// 分页查询属性列表
const trademarkList = async (current = 1, size = 10) => {
    let connection = null
    try {
        connection = await getConnection()
        // 计算偏移量
        const offset = (current - 1) * size

        // 查询总记录数
        const [countRows] = await connection.query("SELECT COUNT(*) as total FROM trademark")
        const total = countRows[0].total

        // 查询当前页数据
        const [dataRows] = await connection.query("SELECT create_time as createTime,update_time as updateTime,id,tm_name as tmName,logo_url as logoUrl FROM trademark LIMIT ? OFFSET ?", [size, offset])

        return {
            records:dataRows,
            total,
            size,
            current,
            pages: Math.ceil(total / size)
        }
    } finally {
        if (connection) {
            connection.release()
        }
    }
}
// 新增品牌接口
const trademarkSave = async (tmName, logoUrl) => {
    let connection = null
    try {
        connection = await getConnection()
        const tmId = Date.now()
        const sql = "INSERT INTO trademark (tm_id, tm_name, logo_url) VALUES (?, ?, ?)"
        const [result] = await connection.query(sql, [tmId, tmName, logoUrl])
        return result
    } finally {
        if (connection) {
            connection.release()
        }
    }
}
// 修改品牌接口
const trademarkUpdate=async (id,tmName,logoUrl)=>{
    let connection = null
    try {
        connection = await getConnection()
        const res=await connection.query("update trademark set tm_name=?,logo_url=? where id=?",[tmName,logoUrl,id])
        return res
    } finally {
        if (connection) {
            connection.release()
        }
    }
}
// 删除已有品牌
const trademarkDelete=async (Id)=>{
    let connection = null
    try {
        connection = await getConnection()
        const res=await connection.query("delete from trademark where id=?",[Id])
        return res
    } finally {
        if (connection) {
            connection.release()
        }
    }
}
module.exports={
    trademarkList,
    trademarkSave,
    trademarkUpdate,
    trademarkDelete
}