const getConnection = require('../../dataBase/db')
//获取全部已有用户
const reqAllUser=async (page=1,limit=5,username)=>{
    let connection = null
    try {
        connection = await getConnection()
        // 构建查询条件
        let whereSql = ''
        const params = []
        if (username) {
            whereSql = 'WHERE u.username LIKE ?'
            params.push(username)
        }
        // 查询总数
        const [countRows] = await connection.query(`SELECT COUNT(DISTINCT u.user_id) as total FROM user u
                                    LEFT JOIN user_role ur ON u.user_id = ur.user_id
                                    LEFT JOIN role r ON ur.role_id = r.role_id
                                    ${whereSql}`, params)
        const total = countRows[0].total
        // 查询分页数据
        const offset = (page - 1) * limit
        const [rows] = await connection.query(`SELECT
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
    } finally {
        if (connection) {
            connection.release()
        }
    }
}
//添加一个新的用户
const reqSaveUser=async (username,name,password)=>{
    let connection = null
    try {
        connection = await getConnection()
        const user_id = Date.now()
        const [result]=await connection.query('insert into user (user_id,username,name,password) values (?,?,?,?)',[user_id,username,name,password])
        return result
    } finally {
        if (connection) {
            connection.release()
        }
    }
}
// 更新已有用户账号
const reqUpdateUser=async (id,username,name)=>{
    let connection = null
    try {
        connection = await getConnection()
        const result= await connection.query('update user set username=?,name=?where user_id=?',[username,name,id])
        return result
    } finally {
        if (connection) {
            connection.release()
        }
    }
}
//获取全部角色，当前账号拥有的角色接口
const reqToAssign=async (userId)=>{
    let connection = null
    try {
        connection = await getConnection()
        // 获取用户已分配的角色
        const [assignRoles] = await connection.query(`
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
        const [allRolesList] = await connection.query(`
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
    } finally {
        if (connection) {
            connection.release()
        }
    }
}
// 删除某一个账号
const reqDeleteByUserId=async (userId)=>{
    let connection = null
    try {
        connection = await getConnection()
        // 开启事务
        await connection.beginTransaction()

        // 先删除用户角色关联
        const [result1] = await connection.query('DELETE FROM user_role WHERE user_id=?', [userId])

        // 再删除用户
        const [result2] = await connection.query('DELETE FROM user WHERE user_id=?', [userId])

        // 提交事务
        await connection.commit()

        return {
            userRoleDeleted: result1.affectedRows,
            userDeleted: result2.affectedRows
        }
    } catch (error) {
        if (connection) {
            // 发生错误时回滚
            await connection.rollback()
        }
        throw error
    } finally {
        if (connection) {
            connection.release()
        }
    }
}
// 批量删除用户接口
const reqBatchRemove=async (deleteArr)=>{
    let connection = null
    try {
        connection = await getConnection()
        // 开启事务
        await connection.beginTransaction()

        // 先批量删除用户角色关联
        const [result1] = await connection.query('DELETE FROM user_role WHERE user_id IN (?)', [deleteArr])

        // 再批量删除用户
        const [result2] = await connection.query('DELETE FROM user WHERE user_id IN (?)', [deleteArr])

        // 提交事务
        await connection.commit()

        return {
            userRoleDeleted: result1.affectedRows,
            userDeleted: result2.affectedRows
        }
    } catch (error) {
        if (connection) {
            // 发生错误时回滚
            await connection.rollback()
        }
        throw error
    } finally {
        if (connection) {
            connection.release()
        }
    }
}
// 分配角色给用户
const doAssisgRole = async (userId, roleIdList) => {
    let connection = null
    try {
        connection = await getConnection()
        // 开启事务
        await connection.beginTransaction()

        // 1. 删除用户原有角色
        await connection.query('DELETE FROM user_role WHERE user_id = ?', [userId])

        // 2. 重新分配角色（批量 INSERT）
        if (roleIdList && roleIdList.length > 0) {
            const values = roleIdList.map(roleId => `(${userId}, ${roleId})`).join(', ')
            await connection.query(`INSERT INTO user_role(user_id, role_id) VALUES ${values}`)
        }

        // 提交事务
        await connection.commit()
    } catch (error) {
        if (connection) {
            // 发生错误时回滚
            await connection.rollback()
        }
        throw error
    } finally {
        if (connection) {
            connection.release()
        }
    }
}
module.exports={
    reqAllUser,
    reqSaveUser,
    reqUpdateUser,
    reqToAssign,
    reqDeleteByUserId,
    reqBatchRemove,
    doAssisgRole
}