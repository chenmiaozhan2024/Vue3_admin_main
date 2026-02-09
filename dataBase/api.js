//查询数据库方法
const connection = require('./db')

// 用户登录
const userLogin = async (username, password) => {
    const conn = await connection
    console.log("select * from user where username=? and password =?", [username, password])
    const [rows] = await conn.query("select * from user where username=? and password =?", [username, password])
    return rows
};

// 获取用户权限信息
const getUserPermissions = async (userId) => {
    const conn = await connection

    // 1. 通过 id 查询用户基本信息，获取 user_id
    const [userRows] = await conn.query("SELECT user_id, username, name, avatar FROM user WHERE id = ?", [userId])
    if (userRows.length === 0) {
        return null
    }
    const userInfo = userRows[0]
    const businessUserId = userInfo.user_id  // 获取业务主键 user_id

    // 2. 查询用户的角色名称（使用 user_id）
    const [roleRows] = await conn.query(`
        SELECT r.role_name
        FROM role r
        INNER JOIN user_role ur ON r.role_id = ur.role_id
        WHERE ur.user_id = ?
    `, [businessUserId])
    const roles = roleRows.map(row => row.role_name)

    // 3. 查询用户的菜单权限（使用 user_id）
    const [menuRows] = await conn.query(`
        SELECT DISTINCT m.code, m.type
        FROM menu m
        INNER JOIN role_menu rm ON m.menu_id = rm.menu_id
        INNER JOIN user_role ur ON rm.role_id = ur.role_id
        WHERE ur.user_id = ?
        AND m.type IN (1, 2)
        AND m.code != ''
    `, [businessUserId])

    // 分离路由和按钮权限
    const routes = []
    const buttons = []
    menuRows.forEach(menu => {
        if (menu.type === 1) {
            // type=1 是菜单/路由
            routes.push(menu.code)
        } else if (menu.type === 2 && menu.code.startsWith('btn.')) {
            // type=2 是按钮
            buttons.push(menu.code)
        }
    })

    return {
        routes,
        buttons,
        roles,
        name: userInfo.username,
        avatar: userInfo.avatar
    }
}

// 分页查询属性列表
const attrList = async (page = 1, limit = 10) => {
    const conn = await connection

    // 计算偏移量
    const offset = (page - 1) * limit

    // 查询总记录数
    const [countRows] = await conn.query("SELECT COUNT(*) as total FROM attr")
    const total = countRows[0].total

    // 查询当前页数据
    const [dataRows] = await conn.query("SELECT * FROM attr LIMIT ? OFFSET ?", [limit, offset])

    return {
        data: dataRows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    }
}

module.exports = {
    userLogin,
    getUserPermissions,
    attrList
}
