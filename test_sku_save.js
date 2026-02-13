const connection = require('./dataBase/db');

async function testSaveSku() {
    const conn = await connection;
    
    try {
        await conn.beginTransaction();

        const skuId = Date.now();
        
        console.log('开始测试SKU保存功能...');
        console.log('SKU ID:', skuId);

        const skuData = {
            spuID: 1770800581385,
            category3Id: 61,
            tmId: 8883595895936,
            skuName: '测试SKU名称',
            weight: '1000',
            price: '99900',
            skuDesc: '测试SKU描述',
            skuDefaultImg: 'http://example.com/default.jpg',
            isSale: 1,
            skuAttrValueList: [
                {
                    attrId: '1',
                    valueId: '2'
                }
            ],
            skuSaleAttrValueList: [
                {
                    saleAttrId: '1',
                    saleAttrValueId: '4'
                }
            ],
            skuImageList: [
                {
                    imgName: 'SKU图片1',
                    imgUrl: 'http://example.com/sku1.jpg',
                    spuImgId: 5,
                    isDefault: '1'
                }
            ]
        };

        await conn.query(
            "INSERT INTO sku (sku_id, spu_id, category_3_id, tm_id, sku_name, weight, price, sku_desc, sku_default_img, is_sale) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [skuId, skuData.spuID, skuData.category3Id, skuData.tmId, skuData.skuName, skuData.weight, skuData.price, skuData.skuDesc, skuData.skuDefaultImg, skuData.isSale]
        );
        console.log('插入SKU主表，影响行数: 1');

        for (let imageItem of skuData.skuImageList) {
            if (imageItem.imgUrl) {
                const imageId = Date.now() + Math.floor(Math.random() * 1000);
                const isDefault = imageItem.isDefault === "1" ? 1 : 0;
                await conn.query(
                    "INSERT INTO sku_image (image_id, sku_id, image_url, spu_image_id, is_default) VALUES (?, ?, ?, ?, ?)",
                    [imageId, skuId, imageItem.imgUrl, imageItem.spuImgId, isDefault]
                );
                console.log('插入SKU图片，影响行数: 1');
            }
        }

        for (let attrItem of skuData.skuAttrValueList) {
            if (attrItem.attrId && attrItem.valueId) {
                const [attrNameResult] = await conn.query("SELECT attr_name FROM attr WHERE attr_id = ?", [attrItem.attrId]);
                const [valueNameResult] = await conn.query("SELECT value_name FROM attr_value WHERE attr_value_id = ?", [attrItem.valueId]);
                
                if (attrNameResult.length > 0 && valueNameResult.length > 0) {
                    const skuAttrValueId = Date.now() + Math.floor(Math.random() * 1000);
                    await conn.query(
                        "INSERT INTO sku_attr_value (sku_attr_value_id, attr_id, value_id, value_name, attr_name, sku_id) VALUES (?, ?, ?, ?, ?, ?)",
                        [skuAttrValueId, attrItem.attrId, attrItem.valueId, valueNameResult[0].value_name, attrNameResult[0].attr_name, skuId]
                    );
                    console.log('插入平台属性，影响行数: 1');
                }
            }
        }

        for (let saleAttrItem of skuData.skuSaleAttrValueList) {
            if (saleAttrItem.saleAttrId && saleAttrItem.saleAttrValueId) {
                const [saleAttrNameResult] = await conn.query("SELECT sale_attr_name FROM spu_sale_attr WHERE spu_sale_attr_id = ?", [saleAttrItem.saleAttrId]);
                const [saleAttrValueNameResult] = await conn.query("SELECT sale_attr_value_name FROM sale_attr_value WHERE sale_attr_value_id = ?", [saleAttrItem.saleAttrValueId]);
                
                if (saleAttrNameResult.length > 0 && saleAttrValueNameResult.length > 0) {
                    const skuSaleAttrValueId = Date.now() + Math.floor(Math.random() * 1000);
                    await conn.query(
                        "INSERT INTO sku_sale_attr_value (sku_sale_attr_value_id, sale_attr_id, sale_attr_value_id, sale_attr_name, sale_attr_value_name, sku_id) VALUES (?, ?, ?, ?, ?, ?)",
                        [skuSaleAttrValueId, saleAttrItem.saleAttrId, saleAttrItem.saleAttrValueId, saleAttrNameResult[0].sale_attr_name, saleAttrValueNameResult[0].sale_attr_value_name, skuId]
                    );
                    console.log('插入销售属性，影响行数: 1');
                }
            }
        }

        await conn.commit();
        console.log('✅ 测试成功！所有操作已完成');
        
    } catch (error) {
        await conn.rollback();
        console.error('❌ 测试失败:', error);
    }
}

testSaveSku();
