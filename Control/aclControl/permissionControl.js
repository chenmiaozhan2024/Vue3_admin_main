const express = require('express')
const router = express.Router()
const {verifyToken} = require('../../utils/verifyToken')
const {getPermissionToAssign} = require("../../Mapper/acl/permissionMapper")

// 获取角色分配的菜单（树形结构）
router.get('/admin/acl/permission/toAssign/:roleId', verifyToken, async (req, res) => {
    try {
        const roleId = req.params.roleId
        const data = await getPermissionToAssign(roleId)
        res.success(data)
    } catch (err) {
        console.log(err)
        res.error(500, '服务器内部错误，请稍后再试')
    }
})

module.exports = router
