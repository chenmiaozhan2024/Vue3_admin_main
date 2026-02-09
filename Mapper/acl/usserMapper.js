const connection = require('../../dataBase/db')
//获取全部已有用户
const reqAllUser=async (page=1,limit=5,username)=>{
    const conn = await connection
    // 构建查询条件
    let whereSql = ''
    const params = []
    if (username) {
        whereSql = 'WHERE u.username LIKE ?'
        params.push(username)
    }
    // 查询总数
    const [countRows] = await conn.query(`SELECT COUNT(DISTINCT u.user_id) as total FROM user u
                                LEFT JOIN user_role ur ON u.user_id = ur.user_id
                                LEFT JOIN role r ON ur.role_id = r.role_id
                                ${whereSql}`, params)
    const total = countRows[0].total
    // 查询分页数据
    const offset = (page - 1) * limit
    const [rows] = await conn.query(`SELECT
                                u.user_id as id,
                                u.username,
                                u.password,
                                u.name,
                                IFNULL(GROUP_CONCAT(DISTINCT r.role_name SEPARATOR ','), '') as roleName,
                                u.create_time as createTime,
                                u.update_time as updateTime
                                FROM user u
                                LEFT JOIN user_role ur ON u.user_id = ur.user_id
                                LEFT JOIN role r ON ur.role_id = r.role_id
                                ${whereSql}
                                GROUP BY u.user_id
                                LIMIT ? OFFSET ?`, [...params, parseInt(limit), parseInt(offset)])

    // 格式化日期时间
    const formatDate = (date) => {
        if (!date) return ''
        const d = new Date(date)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        const hours = String(d.getHours()).padStart(2, '0')
        const minutes = String(d.getMinutes()).padStart(2, '0')
        const seconds = String(d.getSeconds()).padStart(2, '0')
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }

    rows.forEach(row => {
        row.createTime = formatDate(row.createTime)
        row.updateTime = formatDate(row.updateTime)
    })

    return {
        data: rows,
        total: total,
        page: page,
        limit: limit
    }
}
//添加一个新的用户
const reqSaveUser=async (username,name,password)=>{
    const conn = await connection
    const user_id = Date.now()
    const [result]=await  conn.query('insert into user (user_id,username,name,password) values (?,?,?,?)',[user_id,username,name,password])
    return result
}
// 更新已有用户账号
const reqUpdateUser=async (id,username,name)=>{
    const conn = await connection
    const result=  conn.query('update user set username=?,name=?where user_id=?',[username,name,id])
    return result
}
//获取全部角色，当前账号拥有的角色接口
const reqToAssign=async (userId)=>{
    const conn = await connection
    try {
        // 获取用户已分配的角色
        const [assignRoles] = await conn.query(`
            SELECT r.role_id as id,
                   r.role_name as roleName,
                   r.remark,
                   r.create_time as createTime,
                   r.update_time as updateTime
            FROM user_role as ur
            JOIN role r on ur.role_id = r.role_id
            WHERE ur.user_id = ?
        `, [userId])

        // 获取所有角色
        const [allRolesList] = await conn.query(`
            SELECT role_id as id,
                   role_name as roleName,
                   remark,
                   create_time as createTime,
                   update_time as updateTime
            FROM role
        `)

        return {
            assignRoles,
            allRolesList
        }
    } catch (error) {
        console.error('获取角色分配失败:', error)
        throw error
    }
}
// 删除某一个账号
const reqDeleteByUserId=async (userId)=>{
    const conn = await connection
    try {
        // 开启事务
        await conn.beginTransaction()

        // 先删除用户角色关联
        const [result1] = await conn.query('DELETE FROM user_role WHERE user_id=?', [userId])

        // 再删除用户
        const [result2] = await conn.query('DELETE FROM user WHERE user_id=?', [userId])

        // 提交事务
        await conn.commit()

        return {
            userRoleDeleted: result1.affectedRows,
            userDeleted: result2.affectedRows
        }
    } catch (error) {
        // 发生错误时回滚
        await conn.rollback()
        throw error
    }
}
// 批量删除用户接口
const reqBatchRemove=async (deleteArr)=>{
    const conn = await connection
    try {
        // 开启事务
        await conn.beginTransaction()

        // 先批量删除用户角色关联
        const [result1] = await conn.query('DELETE FROM user_role WHERE user_id IN (?)', [deleteArr])

        // 再批量删除用户
        const [result2] = await conn.query('DELETE FROM user WHERE user_id IN (?)', [deleteArr])

        // 提交事务
        await conn.commit()

        return {
            userRoleDeleted: result1.affectedRows,
            userDeleted: result2.affectedRows
        }
    } catch (error) {
        // 发生错误时回滚
        await conn.rollback()
        throw error
    }
}
module.exports={
    reqAllUser,
    reqSaveUser,
    reqUpdateUser,
    reqToAssign,
    reqDeleteByUserId,
    reqBatchRemove
}