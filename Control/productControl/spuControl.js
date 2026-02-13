const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../utils/verifyToken')
const {getAdminProduct,getTrademarkList,getSpuImageList,getSpuSaleAttrList,getBaseAttrList,deleteSpuBySpuId,finBySpuId, saveSpuInfo} =require('../../Mapper/productMapper/spuMapper')

// 查看某一个已有的SPU下全部售卖的商品
router.get('/admin/product/findBySpuId/:spuId',verifyToken, async (req,res,next)=>{
    try {
        const supId=req.params.spuId
        const result=  await finBySpuId(supId)
        res.success(result)
    }catch (error){
        console.error('查询失败:', error)
        res.error(500, '服务器内部错误，请稍后再试');
    }
})
// 获取某个SPU下的全部的已有的销售属性接口
router.get('/admin/product/spuSaleAttrList/:spuId',verifyToken,async (req,res,next)=>{
    try {
        const spuId=req.params.spuId
       const result= await getSpuSaleAttrList(spuId)
        res.success(result)
    }catch (error){
        console.error('查询失败:', error)
        res.error(500, '服务器内部错误，请稍后再试');
    }
})
//获取某个SPU下的全部的售卖商品的图片数据
router.get('/admin/product/spuImageList/:spuId',verifyToken,async (req,res,next)=>{
    try {
        const spuId=req.params.spuId
        const result= await getSpuImageList(spuId)
        // const result=  await getTrademarkList()
        res.success(result)
    }catch (error){
        console.error('查询失败:', error)
        res.error(500, '服务器内部错误，请稍后再试');
    }
})
// 获取全部品牌的数据
router.get('/admin/product/baseTrademark/getTrademarkList',verifyToken,async (req,res,next)=>{
    try {
      const result=  await getTrademarkList()
        res.success(result)
    }catch (error){
        console.error('查询失败:', error)
        res.error(500, '服务器内部错误，请稍后再试');
    }
})
// 获取SPU的数据
router.get('/admin/product/:page/:limit',verifyToken,async (req,res,next)=>{
   try {
       const page=req.params.page
       const limit=req.params.limit
       const { category3Id} =req.query
       const result= await getAdminProduct(page,limit,category3Id)

       res.success(result)

   }catch (error){
       console.error('查询失败:', error)
       res.error(500, '服务器内部错误，请稍后再试');
   }
})
// 获取整个项目全部的销售属性【颜色、版本、尺码】
router.get('/admin/product/baseSaleAttrList',verifyToken,async (req,res,next)=>{
    try {
       const result= await getBaseAttrList()
        res.success(result)
    }catch (error){
        console.error('查询失败:', error)
        res.error(500, '服务器内部错误，请稍后再试');
    }
})
// 删除已有的SPU
router.delete('/admin/product/deleteSpu/:spuId',verifyToken,async (req,res,next)=>{
    try {
        const supId=req.params.spuId
         await deleteSpuBySpuId(supId)
        res.success()
    }catch (error){
        console.error('查询失败:', error)
        res.error(500, '服务器内部错误，请稍后再试');
    }
})
// 追加一个新的SPU
router.post('/admin/product/saveSpuInfo',verifyToken,async (req,res,next)=>{
    try {
        const body=req.body
        await saveSpuInfo(body)

        res.success()
    }catch (error){
        console.error('查询失败:', error)
        res.error(500, '服务器内部错误，请稍后再试');
    }
})



module.exports = router;
