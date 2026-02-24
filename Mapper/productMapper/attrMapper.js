const getConnection = require('../../dataBase/db')
// 获取一级分类接口地址
const getCategory1 = async () => {
    let connection = null
    try {
        connection = await getConnection()
        const [rows] = await connection.query("select category1_id as id,name from category1")
        return rows
    } finally {
        if (connection) {
            connection.release()
        }
    }
}
//获取二级分类接口地址
const getCategory2 = async (category1Id) => {
    let connection = null
    try {
        connection = await getConnection()
        const [rows] = await connection.query("select category2_id as id,name,category1_id from category2 where category1_id=?",[category1Id])
        return rows
    } finally {
        if (connection) {
            connection.release()
        }
    }
}
// 获取三级分类接口地址
const getCategory3 = async (category2Id) => {
    let connection = null
    try {
        connection = await getConnection()
        const [rows] = await connection.query("select category3_id as id,name,category2_id from category3 where category2_id=?",[category2Id])
        return rows
    } finally {
        if (connection) {
            connection.release()
        }
    }
}
//获取分类下已有的属性与属性值
const getAttrInfoList = async (category1Id, category2Id, category3Id) => {
    let connection = null
    try {
        connection = await getConnection()
        // 查询属性列表
        const [attrRows] = await connection.query(`
            SELECT attr_id as id, attr_name as attrName, category_id as categoryId, category_level as categoryLevel
                FROM attr c
                JOIN category3 a ON c.category_id = a.category3_id
                JOIN category2 b ON a.category2_id = b.category2_id
                WHERE b.category1_id = ? AND a.category2_id = ? AND a.category3_id = ?
        `, [category1Id, category2Id, category3Id])
        // 查询属性值并组装
        const result = []
        for (const attr of attrRows) {
            const [valueRows] = await connection.query(`
                SELECT attr_value_id as id, value_name as valueName, attr_id as  attrId
                    FROM attr_value
                    WHERE attr_id = ?
            `, [attr.id])

            result.push({
                ...attr,
                attrValueList: valueRows
            })
        }

        return result
    } finally {
        if (connection) {
            connection.release()
        }
    }
}
//添加或修改属性的接口（根据有无 attrId 判断）
const saveAttrInfo = async (attrInfo) => {
    let connection = null
    try {
        connection = await getConnection()
        const { id, attrName, categoryId, categoryLevel, attrValueList } = attrInfo
        console.log(id,attrName,categoryId,categoryLevel,attrValueList)
        let targetAttrId = id

        // 如果没有 attrId，说明是新增
        if (!id) {
            targetAttrId = Date.now()
            // 插入属性
            await connection.query(
                "INSERT INTO attr (attr_id, attr_name, category_id, category_level) VALUES (?, ?, ?, ?)",
                [targetAttrId, attrName, categoryId, categoryLevel]
            )
        } else {
            // 有 attrId，说明是修改
            await connection.query(
                "UPDATE attr SET attr_name = ? WHERE attr_id = ?",
                [attrName, id]
            )
        }

        // 处理属性值
        const existingValueIds = []
        for (const value of attrValueList) {
            if (value.attr_value_id) {
                // 如果有 ID，则更新
                await connection.query(
                    "UPDATE attr_value SET value_name = ? WHERE attr_value_id = ?",
                    [value.valueName, value.attr_value_id]
                )
                existingValueIds.push(value.attr_value_id)
            } else {
                // 如果没有 ID，则插入
                const newValueId = Date.now()
                await connection.query(
                    "INSERT INTO attr_value (attr_value_id, value_name, attr_id) VALUES (?, ?, ?)",
                    [newValueId, value.valueName, targetAttrId]
                )
                existingValueIds.push(newValueId)
            }
        }

        // 删除不存在的属性值（前端删除的值）
        if (existingValueIds.length > 0) {
            await connection.query(
                `DELETE FROM attr_value WHERE attr_id = ? AND attr_value_id NOT IN (${existingValueIds.map(() => '?').join(',')})`,
                [targetAttrId, ...existingValueIds]
            )
        } else {
            await connection.query(
                "DELETE FROM attr_value WHERE attr_id = ?",
                [targetAttrId]
            )
        }
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

//保留 updateAttrInfo 别名，保持兼容性
const updateAttrInfo = saveAttrInfo
// 删除某一个已有的属性
const deleteAttr = async (attrId) => {
    let connection = null
    try {
        connection = await getConnection()
        // 1. 删除属性值
        await connection.query("DELETE FROM attr_value WHERE attr_id = ?", [attrId])

        // 2. 删除属性
        await connection.query("DELETE FROM attr WHERE attr_id = ?", [attrId])
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

module.exports={
    getCategory1,
    getCategory2,
    getCategory3,
    getAttrInfoList,
    saveAttrInfo,
    updateAttrInfo,
    deleteAttr
}