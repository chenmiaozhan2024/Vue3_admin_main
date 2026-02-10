const express = require('express');
const router = express.Router();
const {verifyToken} =require('../../utils/verifyToken')
const {reqAllRole,saveRole,updateRole, deleteRole,permissionToAssing,DoAssignPermission} = require("../../Mapper/acl/roleMapper");
// 获取全部的角色接口
router.get('/admin/acl/role/:page/:limit',verifyToken,async (req,res)=>{
    try {
        const page=req.params.page
        const limit=req.params.limit
        const {roleName}=req.query
        const result = await reqAllRole(page,limit,roleName)
        res.success(result)
    }catch (err){
        console.log(err)
        res.error(500, '服务器内部错误，请稍后再试');
    }
})
// 新增角色的接口地址
router.post('/admin/acl/role/save',verifyToken,async (req,res)=>{
    try {
        const params = req.body
        await saveRole(params)
        res.success()
    }catch (err){
        console.log(err)
        if (err.message === '角色名称已存在') {
            res.error(400, err.message)
        } else {
            res.error(500, '服务器内部错误，请稍后再试')
        }
    }
})
// 更新已有的角色
router.put('/admin/acl/role/update',verifyToken,async (req,res,next)=>{
    try {
        const params = req.body
        await updateRole(params)
        res.success()
    }catch (err){
        console.log(err)
        res.error(500, '服务器内部错误，请稍后再试')
    }
})
// 删除已有角色
router.delete('/admin/acl/role/remove/:roleId',verifyToken,async (req,res,next)=>{
    try {
        const roleId = req.params.roleId
        await deleteRole(roleId)
        res.success()
    }catch (err){
        console.log(err)
        res.error(500, '服务器内部错误，请稍后再试')
    }
})
// 获取全部菜单与按钮数据
router.get('/admin/acl/permission/toAssign/:userId',verifyToken,async (req,res,next)=>{
    try {
        const roleId = req.params.userId
       const result= await permissionToAssing(roleId)
        console.log(result)
        res.success(result)
    }catch (err){
        console.log(err)
        res.error(500, '服务器内部错误，请稍后再试')
    }
})
//给响应的角色分配权限
router.post('/admin/acl/permission/doAssign',verifyToken, async (req,res)=>{
    try {
        const  params=req.query
        await DoAssignPermission(params)

        res.success()
    }catch (err){
        console.log(err)
        res.error(500, '服务器内部错误，请稍后再试')
    }
})
module.exports = router;