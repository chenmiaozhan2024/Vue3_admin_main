const connection = require('./dataBase/db');

async function testUpdateSpu() {
    const conn = await connection;
    
    try {
        await conn.beginTransaction();

        const spuId = 1770800581385;
        
        console.log('开始测试SPU更新功能...');
        console.log('SPU ID:', spuId);

        const updateResult = await conn.query(
            "UPDATE spu SET spu_name = ?, description = ?, category3_id = ?, tm_id = ? WHERE spu_id = ?",
            ['测试商品名称', '测试商品描述', 61, 8883595895936, spuId]
        );
        console.log('更新SPU主表，影响行数:', updateResult[0].affectedRows);

        const deleteImages = await conn.query("DELETE FROM spu_image_list WHERE spu_id = ?", [spuId]);
        console.log('删除旧图片，影响行数:', deleteImages[0].affectedRows);

        const imageId = Date.now();
        const insertImage = await conn.query(
            "INSERT INTO spu_image_list (image_id, image_name, image_url, spu_id) VALUES (?, ?, ?, ?)",
            [imageId, '测试图片', 'http://example.com/img1.jpg', spuId]
        );
        console.log('插入新图片，影响行数:', insertImage[0].affectedRows);

        const deleteAttrs = await conn.query("DELETE FROM spu_sale_attr WHERE spu_id = ?", [spuId]);
        console.log('删除旧销售属性，影响行数:', deleteAttrs[0].affectedRows);

        const spuSaleAttrId = Date.now() + 1;
        const insertAttr = await conn.query(
            "INSERT INTO spu_sale_attr (spu_sale_attr_id, base_sale_attr_id, sale_attr_name, spu_id) VALUES (?, ?, ?, ?)",
            [spuSaleAttrId, 1, '颜色', spuId]
        );
        console.log('插入销售属性，影响行数:', insertAttr[0].affectedRows);

        const saleAttrValueId = Date.now() + 2;
        const insertValue = await conn.query(
            "INSERT INTO sale_attr_value (sale_attr_value_id, sale_attr_value_name, sale_attr_id, spu_id) VALUES (?, ?, ?, ?)",
            [saleAttrValueId, '红色', 1, spuId]
        );
        console.log('插入销售属性值，影响行数:', insertValue[0].affectedRows);

        await conn.commit();
        console.log('✅ 测试成功！所有操作已完成');
        
    } catch (error) {
        await conn.rollback();
        console.error('❌ 测试失败:', error);
    }
}

testUpdateSpu();
