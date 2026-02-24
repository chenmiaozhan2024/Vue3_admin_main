const getConnection = require('../../dataBase/db')
const reqAllRole = async (page, limit, roleName) => {
    let connection = null
    try {
        connection = await getConnection()
        const offset = (page - 1) * limit

        // 1. 获取符合条件的角色总数
        const [countRows] = await connection.query(
            `SELECT COUNT(*) as total FROM role WHERE role_name LIKE CONCAT('%', ?, '%')`,
            [roleName || '']
        )
        const total = countRows[0].total

        // 2. 获取分页后的角色列表
        const [dataRows] = await connection.query(
            `SELECT role_id as id, role_name as roleName, remark,
                    DATE_FORMAT(create_time, '%Y-%m-%d %H:%i:%s') as createTime,
                    DATE_FORMAT(update_time, '%Y-%m-%d %H:%i:%s') as updateTime
             FROM role
             WHERE role_name LIKE CONCAT('%', ?, '%')
             LIMIT ?, ?`,
            [roleName || '', offset, Number(limit)]
        )

        return {
            records: dataRows,
            total
        }
    } finally {
        if (connection) {
            connection.release()
        }
    }
}
// 新增角色
const saveRole = async (params) => {
    let connection = null
    try {
        connection = await getConnection()
        const { roleName, remark } = params
        const id=Date.now()

        // 1. 检查角色是否已存在
        const [countRows] = await connection.query(
            `SELECT COUNT(role_id) as count FROM role WHERE role_name = ?`,
            [roleName]
        )

        if (countRows[0].count > 0) {
            throw new Error('角色名称已存在')
        }

        // 2. 插入新角色
        await connection.query(
            `INSERT INTO role (role_id, role_name, remark) VALUES (?, ?, ?)`,
            [id, roleName, remark]
        )
    } finally {
        if (connection) {
            connection.release()
        }
    }
}
// 更新角色
async function updateRole(params) {
    let connection = null
    try {
        connection = await getConnection()
        const { id, roleName, remark, updateTime } = params

        const sql = `
            UPDATE role
            SET role_name = ?, remark = ?, update_time = ?
            WHERE role_id = ?
        `

        const res = await connection.query(sql, [roleName, remark, updateTime || new Date(), id])
        return res
    } finally {
        if (connection) {
            connection.release()
        }
    }
}
// 删除已有角色
const deleteRole= async (roleId)=>{
    let connection = null
    try {
        connection = await getConnection()
        const res= await connection.query('delete from role where role_id=?',[roleId])
        return res
    } finally {
        if (connection) {
            connection.release()
        }
    }
}
// 获取角色分配的菜单（带树形结构）
const permissionToAssing = async (roleId) => {
    let connection = null
    try {
        connection = await getConnection()
        // 1. 查询所有菜单
        const [menuRows] = await connection.query(
            `SELECT menu_id, name, pid, code, to_code, type, status, level, update_time, create_time
             FROM menu`
        )
        const menuList = menuRows.map(row => ({
            ...row,
            SELECT: false,
            children: []
        }))

        // 2. 查询角色已分配的菜单ID列表
        const [assignRows] = await connection.query(
            `SELECT menu_id FROM role_menu WHERE role_id = ?`,
            [roleId]
        )
        const assignMenuIdList = assignRows.map(row => row.menu_id)

        // 3. 将已分配的菜单的 select 值置为 true
        menuList.forEach(menu => {
            if (assignMenuIdList.includes(menu.menu_id)) {
                menu.SELECT = true
            }
        })

        // 4. 构建成树形结构返回
        const map = {}
        const tree = []

        // 创建映射
        menuList.forEach(item => {
            map[item.menu_id] = item
        })

        // 构建树
        menuList.forEach(item => {
            if (item.pid === 0) {
                tree.push(item)
            } else if (map[item.pid]) {
                map[item.pid].children.push(item)
            }
        })

        return tree
    } finally {
        if (connection) {
            connection.release()
        }
    }
}
// 给角色分配权限
const DoAssignPermission = async (params) => {
    let connection = null
    try {
        connection = await getConnection()
        const { roleId, permissionId } = params
        const menuIdList = permissionId ? permissionId.split(',').map(id => Number(id.trim())) : []

        // 开启事务
        await connection.beginTransaction()

        // 1. 删除角色原有的菜单权限
        await connection.query('DELETE FROM role_menu WHERE role_id = ?', [roleId])

        // 2. 重新分配菜单权限（批量 INSERT）
        if (menuIdList.length > 0) {
            const values = menuIdList.map(menuId => `(${roleId}, ${menuId})`).join(', ')
            await connection.query(`INSERT INTO role_menu (role_id, menu_id) VALUES ${values}`)
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
module.exports = {
    reqAllRole,
    saveRole,
    updateRole,
    deleteRole,
    permissionToAssing,
    DoAssignPermission
}