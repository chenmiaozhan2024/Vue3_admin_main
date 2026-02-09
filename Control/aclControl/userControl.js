const express = require('express');
const router = express.Router();
const {verifyToken} =require('../../utils/verifyToken')
const {reqAllUser,reqSaveUser,reqUpdateUser,reqToAssign,reqDeleteByUserId,reqBatchRemove}=require('../../Mapper/acl/usserMapper')
//获取全部角色，当前账号拥有的角色接口
/**
 * TODO待完成
 * **/
router.get('/admin/acl/user/toAssign/:userId',verifyToken,async (req,res,next)=>{
    try {
        const userId=req.params.userId
        const result= await reqToAssign(userId)
        res.success(result)
    }catch (err){
        console.log(err)
        res.error(500, '服务器内部错误，请稍后再试');
    }
})
// 获取全部已有用户
router.get('/admin/acl/user/:page/:limit?',verifyToken,async (req,res,next)=>{
    try {
        const page=req.params.page
        const limit=req.params.limit
        const {username}=req.query
       const {data,total}= await reqAllUser(page,limit,username)
        const result={
            records:data,
            total
        }
        res.success(result,'success')
    }catch (err){
        console.log(err)
        res.error(500, '服务器内部错误，请稍后再试');
    }
})
//添加一个新的用户
router.post('/admin/acl/user/save',verifyToken,async (req,res,next)=>{
    try {
        const {username,name,password}=req.body
        await reqSaveUser(username,name,password)
        res.success(null)
    }catch (err){
        console.log(err)
        res.error(500, '服务器内部错误，请稍后再试');
    }
})
// 更新已有用户账号
router.put('/admin/acl/user/update',verifyToken,async (req,res,next)=>{
    try {
        const {id,username,name}=req.body
        console.log(id,username,name)
        await reqUpdateUser(id,username,name)
        res.success(null)
    }catch (err){
        console.log(err)
        res.error(500, '服务器内部错误，请稍后再试');
    }
})

// 删除某一个账号
router.delete('/admin/acl/user/remove/:id',verifyToken,async (req,res,next)=>{
    try {
        const userId=req.params.id
        const result=await reqDeleteByUserId(userId)
        res.success(result)
    }catch (err){
        console.log(err)
        res.error(500, '服务器内部错误，请稍后再试');
    }
})
// 批量删除用户接口
router.delete('/admin/acl/user/batchRemove',verifyToken,async (req,res,next)=>{
    try {
        const deleteArr=req.body
        await reqBatchRemove(deleteArr)
        res.success(null)
    }catch (err){
        console.log(err)
        res.error(500, '服务器内部错误，请稍后再试');
    }
})
module.exports = router;