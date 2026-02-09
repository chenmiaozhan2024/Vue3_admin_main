const connection = require('../../dataBase/db')

const reqAllRole = async (page, limit, roleName) => {
    const conn = await connection
    const offset = (page - 1) * limit

    // 1. 获取符合条件的角色总数
    const [countRows] = await conn.query(
        `SELECT COUNT(*) as total FROM role WHERE role_name LIKE CONCAT('%', ?, '%')`,
        [roleName || '']
    )
    const total = countRows[0].total

    // 2. 获取分页后的角色列表
    const [dataRows] = await conn.query(
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
}
// 新增角色
const saveRole = async (params) => {
    const conn = await connection
    const {  roleName, remark } = params
    const id=Date.now()

    // 1. 检查角色是否已存在
    const [countRows] = await conn.query(
        `SELECT COUNT(role_id) as count FROM role WHERE role_name = ?`,
        [roleName]
    )

    if (countRows[0].count > 0) {
        throw new Error('角色名称已存在')
    }

    // 2. 插入新角色
    await conn.query(
        `INSERT INTO role (role_id, role_name, remark) VALUES (?, ?, ?)`,
        [id, roleName, remark]
    )
}
// 更新角色
async function updateRole(params) {
    const conn = await connection
    const { id, roleName, remark, updateTime } = params

    const sql = `
        UPDATE role
        SET role_name = ?, remark = ?, update_time = ?
        WHERE role_id = ?
    `

    const res = await conn.query(sql, [roleName, remark, updateTime || new Date(), id])
    return res
}
// 删除已有角色
const deleteRole= async (roleId)=>{
    const conn = await connection
    const res= await conn.query('delete from role where role_id=?',[roleId])
    return res
}
// 获取角色分配的菜单（带树形结构）
const permissionToAssing = async (roleId) => {
    const conn = await connection

    // 1. 查询所有菜单
    const [menuRows] = await conn.query(
        `SELECT menu_id, name, pid, code, to_code, type, status, level, update_time, create_time
         FROM menu`
    )
    const menuList = menuRows.map(row => ({
        ...row,
        SELECT: false,
        children: []
    }))

    // 2. 查询角色已分配的菜单ID列表
    const [assignRows] = await conn.query(
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
}
module.exports = {
    reqAllRole,
    saveRole,
    updateRole,
    deleteRole,
    permissionToAssing
}