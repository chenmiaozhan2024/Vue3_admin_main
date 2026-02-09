const connection = require('../../dataBase/db')
// 分页查询属性列表
const trademarkList = async (current = 1, size = 10) => {
    const conn = await connection
    // 计算偏移量
    const offset = (current - 1) * size

    // 查询总记录数
    const [countRows] = await conn.query("SELECT COUNT(*) as total FROM trademark")
    const total = countRows[0].total

    // 查询当前页数据
    const [dataRows] = await conn.query("SELECT create_time as createTime,update_time as updateTime,id,tm_name as tmName,logo_url as logoUrl FROM trademark LIMIT ? OFFSET ?", [size, offset])

    return {
        records:dataRows,
        total,
        size,
        current,
        pages: Math.ceil(total / size)
    }
}
// 新增品牌接口
const trademarkSave = async (tmName, logoUrl) => {
    const conn = await connection
    const tmId = Date.now()
    const sql = "INSERT INTO trademark (tm_id, tm_name, logo_url) VALUES (?, ?, ?)"
    const [result] = await conn.query(sql, [tmId, tmName, logoUrl])
    return result
}
// 修改品牌接口
const trademarkUpdate=async (id,tmName,logoUrl)=>{
    const conn = await connection
    const res=await conn.query("update trademark set tm_name=?,logo_url=? where id=?",[tmName,logoUrl,id])
    return res
}
// 删除已有品牌
const trademarkDelete=async (Id)=>{
    const conn = await connection
    const res=await conn.query("delete from trademark where id=?",[Id])
    return res
}
module.exports={
    trademarkList,
    trademarkSave,
    trademarkUpdate,
    trademarkDelete
}