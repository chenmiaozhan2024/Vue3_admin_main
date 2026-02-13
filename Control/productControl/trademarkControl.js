const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { verifyToken } = require('../../utils/verifyToken')
const { trademarkList,trademarkSave,trademarkUpdate,trademarkDelete } = require('../../Mapper/productMapper/trademarkMapper')

// 配置 multer 存储
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 生成日期目录路径: static/img/sph/20250208
        const now = new Date();
        const date = now.toISOString().slice(0, 10).replace(/-/g, ''); // 20250208
        const uploadDir = path.join(__dirname, '..', '..', 'static', 'img', 'sph', date);

        // 如果目录不存在则创建
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // 保持原文件名
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });
// 获取已有品牌接口
router.get('/admin/product/baseTrademark/:page/:pageSize', verifyToken, async (req, res) => {
    try {
        const page = parseInt(req.params.page) || 1
        const pageSize = parseInt(req.params.pageSize) || 10
        const result = await trademarkList(page, pageSize)
        res.success({...result} , 'success')
    } catch (error) {
        console.error('查询失败:', error)
        res.error(500, '服务器内部错误，请稍后再试');
    }
})
// 新增品牌接口
router.post('/admin/product/baseTrademark/save',verifyToken,async (req,res,next)=>{
    try{
        const tmName=req.body.tmName
        const logoUrl=req.body.logoUrl
        await trademarkSave(tmName,logoUrl)
        res.success(null,'success')
    }catch (err){
        console.error('查询失败:', err)
        res.error(500, '服务器内部错误，请稍后再试');
    }

})
// 修改品牌接口
router.put('/admin/product/baseTrademark/update',verifyToken,async (req,res,next)=>{
    try{
        const id=req.body.id
        const tmName=req.body.tmName
        const logoUrl=req.body.logoUrl
         await trademarkUpdate(id,tmName,logoUrl)
        res.success(null,'success')
    }catch (err){
        console.error('查询失败:', err)
        res.error(500, '服务器内部错误，请稍后再试');
    }
})
// 删除已有品牌
router.delete('/admin/product/baseTrademark/remove/:id',async (req,res,next)=>{
    try {
        await trademarkDelete(req.params.id)
        res.success(null,'success')
    }catch (err){
        console.error('查询失败:', err)
        res.error(500, '服务器内部错误，请稍后再试');
    }
})

// 文件上传接口
router.get('/admin/product/fileUpload', verifyToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.error(400, '请选择要上传的文件');
        }

        // 生成日期
        const now = new Date();
        const date = now.toISOString().slice(0, 10).replace(/-/g, '');

        // 返回图片 URL
        const imgUrl = `/api/static/img/sph/${date}/${req.file.originalname}`;
        res.success(imgUrl, 'success');
    } catch (err) {
        console.error('上传失败:', err);
        res.error(500, '文件上传失败');
    }
});
router.post('/admin/product/fileUpload', verifyToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.error(400, '请选择要上传的文件');
        }

        // 生成日期
        const now = new Date();
        const date = now.toISOString().slice(0, 10).replace(/-/g, '');

        // 返回图片 URL
        const imgUrl = `/api/static/img/sph/${date}/${req.file.originalname}`;
        res.success(imgUrl, 'success');
    } catch (err) {
        console.error('上传失败:', err);
        res.error(500, '文件上传失败');
    }
});


module.exports = router;