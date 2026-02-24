//查询数据库方法
const getConnection = require('./db')

// 用户登录
const userLogin = async (username, password) => {
    let connection = null
    try {
        connection = await getConnection()
        console.log("select * from user where username=? and password =?", [username, password])
        const [rows] = await connection.query("select * from user where username=? and password =?", [username, password])
        return rows
    } finally {
        if (connection) {
            connection.release()
        }
    }
};

// 获取用户权限信息
const getUserPermissions = async (userId) => {
    let connection = null
    try {
        connection = await getConnection()

        // 1. 通过 id 查询用户基本信息，获取 user_id
        const [userRows] = await connection.query("SELECT user_id, username, name, avatar FROM user WHERE id = ?", [userId])
        if (userRows.length === 0) {
            return null
        }
        const userInfo = userRows[0]
        const businessUserId = userInfo.user_id  // 获取业务主键 user_id

        // 2. 查询用户的角色名称（使用 user_id）
        const [roleRows] = await connection.query(`
            SELECT r.role_name
            FROM role r
            INNER JOIN user_role ur ON r.role_id = ur.role_id
            WHERE ur.user_id = ?
        `, [businessUserId])
        const roles = roleRows.map(row => row.role_name)

        // 3. 查询用户的菜单权限（使用 user_id）
        const [menuRows] = await connection.query(`
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
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

// 分页查询属性列表
const attrList = async (page = 1, limit = 10) => {
    let connection = null
    try {
        connection = await getConnection()

        // 计算偏移量
        const offset = (page - 1) * limit

        // 查询总记录数
        const [countRows] = await connection.query("SELECT COUNT(*) as total FROM attr")
        const total = countRows[0].total

        // 查询当前页数据
        const [dataRows] = await connection.query("SELECT * FROM attr LIMIT ? OFFSET ?", [limit, offset])

        return {
            data: dataRows,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

module.exports = {
    userLogin,
    getUserPermissions,
    attrList
}
