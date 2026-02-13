const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../utils/verifyToken')
const {getSkuList,putGoosOnSale,getSkuInfo,saveSkuInfo} = require("../../Mapper/productMapper/skuMapper");
// 获取已有的商品的数据-SKU
router.get('/admin/product/list/:page/:pageSize',verifyToken,async (req,res,next)=>{
    try {
        const page = parseInt(req.params.page) || 1
        const pageSize = parseInt(req.params.pageSize) || 10
        const data={
            records:[]
        }
        const result= await getSkuList(page,pageSize)
        data.records=result
        res.success(data)
    } catch (error) {
        console.error('查询失败:', error)
        res.error(500, '服务器内部错误，请稍后再试');
    }
})
// 商品上架
router.get('/admin/product/onSale/:skuId',verifyToken,async (req,res,next)=>{
    try {
        const skuId=req.params.skuId
        await putGoosOnSale(skuId)
        res.success()
    }catch (error){
        console.error('查询失败:', error)
        res.error(500, '服务器内部错误，请稍后再试');
    }
})
// 商品下架
router.get('/admin/product/cancelSale/:skuId',verifyToken,async (req,res,next)=>{
    try {
        const skuId=req.params.skuId
        await putGoosOnSale(skuId)

        res.success()
    }catch (error){
        console.error('查询失败:', error)
        res.error(500, '服务器内部错误，请稍后再试');
    }
})
// 获取商品详情
router.get('/admin/product/getSkuInfo/:skuId',verifyToken,async (req,res,next)=>{
    try {
        const skuId=req.params.skuId
        const result=  await getSkuInfo(skuId)
        // const data={...result[0]}

        // console.log(data)
        res.success(result)
    }catch (error){
        console.error('查询失败:', error)
        res.error(500, '服务器内部错误，请稍后再试');
    }
})
// 删除已有的商品
/**
 * TODO
 * 待完善删除sku功能，后续会进行二次功能验证的时候再删除
 * **/
router.delete('/admin/product/deleteSku/:skuId',verifyToken,async (req,res,next)=>{
    try {
        const skuId=req.params.skuId
        console.log(skuId)
        res.success()
    }catch (error){
        console.error('查询失败:', error)
        res.error(500, '服务器内部错误，请稍后再试');
    }
})
// 保存SKU信息
router.post('/admin/product/saveSkuInfo',verifyToken,async (req,res,next)=>{
    try {
        const body=req.body
        await saveSkuInfo(body)
        res.success()
    }catch (error){
        console.error('保存失败:', error)
        res.error(500, '服务器内部错误，请稍后再试');
    }
})
module.exports = router;