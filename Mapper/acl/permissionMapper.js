const connection = require('../../dataBase/db')

// 查询所有菜单
const getMenuList = async () => {
    const conn = await connection
    const [rows] = await conn.query(
        `SELECT menu_id, name, pid, code, to_code, type, status, level, update_time, create_time
         FROM menu`
    )
    return rows
}

// 查询角色已分配的菜单ID
const getAssignMenuIds = async (roleId) => {
    const conn = await connection
    const [rows] = await conn.query(
        `SELECT menu_id FROM role_menu WHERE role_id = ?`,
        [roleId]
    )
    return rows.map(row => row.menu_id)
}

// 构建树形结构
const buildTree = (menuList) => {
    const map = {}
    const tree = []

    // 创建映射
    menuList.forEach(item => {
        map[item.menu_id] = { ...item, children: [], select: item.SELECT || false }
    })

    // 构建树
    menuList.forEach(item => {
        const node = map[item.menu_id]
        if (item.pid === 0) {
            tree.push(node)
        } else if (map[item.pid]) {
            map[item.pid].children.push(node)
        }
    })

    return tree
}

// 获取角色分配菜单（带树形结构）
const getPermissionToAssign = async (roleId) => {
    // 1. 查询所有菜单
    const menuList = await getMenuList()

    // 2. 查询已分配的菜单ID列表
    const assignMenuIdList = await getAssignMenuIds(roleId)

    // 3. 将已分配的菜单的 select 值置为 true
    menuList.forEach(menu => {
        if (assignMenuIdList.includes(menu.menu_id)) {
            menu.SELECT = true
        } else {
            menu.SELECT = false
        }
    })

    // 4. 构建成树形结构返回
    const data = buildTree(menuList)
    return data
}

module.exports = {
    getMenuList,
    getAssignMenuIds,
    getPermissionToAssign
}
