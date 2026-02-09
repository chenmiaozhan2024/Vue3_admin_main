const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../utils/verifyToken')
const {getCategory1,getCategory2,getCategory3,getAttrInfoList,saveAttrInfo,deleteAttr}=require('../../Mapper/productMapper/attrMapper')
// 获取一级分类接口地址
router.get('/admin/product/getCategory1',verifyToken,async (req,res,next)=>{
    try {
      const result=  await getCategory1()
        res.success(result,'success')
    }catch (err){
        console.log(err)
        res.error(500, '服务器内部错误，请稍后再试');
    }

})
//获取二级分类接口地址
router.get('/admin/product/getCategory2/:category1',verifyToken,async (req,res,next)=>{
    try {
        const category1Params=req.params.category1
        const result=  await getCategory2(category1Params)
        res.success(result,'success')
    }catch (err){
        console.log(err)
        res.error(500, '服务器内部错误，请稍后再试');
    }

})
// 获取三级分类接口地址
router.get('/admin/product/getCategory3/:category2',verifyToken,async (req,res,next)=>{
    try {
        const category1Params=req.params.category2
        const result=  await getCategory3(category1Params)
        res.success(result,'success')
    }catch (err){
        console.log(err)
        res.error(500, '服务器内部错误，请稍后再试');
    }

})
//获取分类下已有的属性与属性值
router.get('/admin/product/attrInfoList/:category1/:category2/:category3',verifyToken,async (req,res,next)=>{
    try {
        const category1Params=req.params.category1
        const category2Params=req.params.category2
        const category3Params=req.params.category3
       const result= await getAttrInfoList(category1Params,category2Params,category3Params)
        res.success(result,'success')
        // res.success(result,'success')
    }catch (err){
        console.log(err)
        res.error(500, '服务器内部错误，请稍后再试');
    }

})
//添加或修改属性的接口（根据有无 attrId 判断）
router.post('/admin/product/saveAttrInfo', verifyToken, async (req, res, next) => {
   try {
       await saveAttrInfo(req.body)
       res.success(null, 'success')
   } catch (err) {
       console.log(err)
       res.error(500, '操作失败')
   }
})
// 删除某一个已有的属性
router.delete('/admin/product/deleteAttr/:attrId', verifyToken, async (req, res, next) => {
    try {
        const attrId = req.params.attrId
        await deleteAttr(attrId)
        res.success(null, 'success')
    } catch (err) {
        console.log(err)
        res.error(500, '删除失败')
    }
})

module.exports = router;