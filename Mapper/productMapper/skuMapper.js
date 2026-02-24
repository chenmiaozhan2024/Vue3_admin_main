const getConnection = require('../../dataBase/db')
// 获取已有的商品的数据-SKU
const getSkuList=async (page,pageSize)=>{
    let connection = null
    try {
        connection = await getConnection()
        const [row] =await connection.query("select sku_id as id,spu_id as spuID,category_3_id as category3Id,tm_id as tmId,sku_name as skuName,weight,price,sku_desc as skuDesc,sku_Desc as skuDesc,sku_default_img as skuDefaultImg, is_sale as isSale from sku")
        return row
    } finally {
        if (connection) {
            connection.release()
        }
    }
}
// 商品上架
const putGoosOnSale=async (skuId)=>{
    let connection = null
    try {
        connection = await getConnection()
        //校验商品Id参数
        if(!skuId){
            throw new Error('商品ID不能为空')
        }
        const [row] =await connection.query('select is_sale as isSale from sku where sku_id=?',[skuId])
        //没有查到商品
        if(row.length===0){
            throw new Error('商品不存在')
        }
        const  currentState=row[0].isSale
        const newState=1-currentState

        const result= await connection.query("update sku set is_sale=?",[newState])
        return result
    } finally {
        if (connection) {
            connection.release()
        }
    }
}
// 获取商品详情
const getSkuInfo=async (skuId)=>{
    let connection = null
    try {
        connection = await getConnection()
        const [row1] =await connection.query("select sku_id as id,spu_id as spuID,category_3_id as category3Id,tm_id as tmId,sku_name as skuName,weight,price,sku_desc as skuDesc,sku_Desc as skuDesc,sku_default_img as skuDefaultImg, is_sale as isSale from sku")
        //获取平台属性
        const [row2]=await connection.query("select id as Id,sku_attr_value_id as id,attr_id as attrId,value_name as valueName,attr_name as attrName,sku_id as skuId from sku_attr_value where sku_id=?",[skuId])

        //获取销售属性
        const [row3] =await connection.query("select id as ID,sku_sale_attr_value_id as id,sale_attr_value_id as saleAttrValueId,sale_attr_name as saleAttrName, sale_attr_value_name as saleAttrValueName,sku_id as skuId from sku_sale_attr_value")
        //获取商品图片
        const [row4]= await connection.query("select id as ID,image_id as id,sku_id as skuId,image_url as imgUrl,spu_image_id as spuImgId,is_default as isDefault from sku_image where sku_id=?",[skuId])
        const result={
            ...row1[0],
            "skuAttrValueList":row2,
            "skuSaleAttrValueList":row3,
            "skuImageList":row4
        }
        // console.log(result)

        return result
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

const saveSkuInfo = async (params) => {
    let connection = null
    try {
        connection = await getConnection()
        const { spuID, category3Id, tmId, skuName, weight, price, skuDesc, skuDefaultImg, isSale, skuAttrValueList, skuSaleAttrValueList, skuImageList } = params;

        if (!spuID || !category3Id || !tmId || !skuName) {
            throw new Error('缺少必要参数');
        }

        await connection.beginTransaction();

        const skuId = Date.now() + Math.floor(Math.random() * 1000);

        await connection.query(
            "INSERT INTO sku (sku_id, spu_id, category_3_id, tm_id, sku_name, weight, price, sku_desc, sku_default_img, is_sale) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [skuId, spuID, category3Id, tmId, skuName, weight, price, skuDesc, skuDefaultImg, isSale]
        );

        for (let imageItem of skuImageList) {
            if (imageItem.imgUrl) {
                const imageId = Date.now() + Math.floor(Math.random() * 1000);
                const isDefault = imageItem.isDefault === "1" ? 1 : 0;
                await connection.query(
                    "INSERT INTO sku_image (image_id, sku_id, image_url, spu_image_id, is_default) VALUES (?, ?, ?, ?, ?)",
                    [imageId, skuId, imageItem.imgUrl, imageItem.spuImgId, isDefault]
                );
            }
        }

        for (let attrItem of skuAttrValueList) {
            if (attrItem.attrId && attrItem.valueId) {
                const [attrNameResult] = await connection.query("SELECT attr_name FROM attr WHERE attr_id = ?", [attrItem.attrId]);
                const [valueNameResult] = await connection.query("SELECT value_name FROM attr_value WHERE attr_value_id = ?", [attrItem.valueId]);
                
                if (attrNameResult.length > 0 && valueNameResult.length > 0) {
                    const skuAttrValueId = Date.now() + Math.floor(Math.random() * 1000);
                    await connection.query(
                        "INSERT INTO sku_attr_value (sku_attr_value_id, attr_id, value_id, value_name, attr_name, sku_id) VALUES (?, ?, ?, ?, ?, ?)",
                        [skuAttrValueId, attrItem.attrId, attrItem.valueId, valueNameResult[0].value_name, attrNameResult[0].attr_name, skuId]
                    );
                }
            }
        }

        for (let saleAttrItem of skuSaleAttrValueList) {
            if (saleAttrItem.saleAttrId && saleAttrItem.saleAttrValueId) {
                const [saleAttrNameResult] = await connection.query("SELECT sale_attr_name FROM spu_sale_attr WHERE spu_sale_attr_id = ?", [saleAttrItem.saleAttrId]);
                const [saleAttrValueNameResult] = await connection.query("SELECT sale_attr_value_name FROM sale_attr_value WHERE sale_attr_value_id = ?", [saleAttrItem.saleAttrValueId]);
                
                if (saleAttrNameResult.length > 0 && saleAttrValueNameResult.length > 0) {
                    const skuSaleAttrValueId = Date.now() + Math.floor(Math.random() * 1000);
                    await connection.query(
                        "INSERT INTO sku_sale_attr_value (sku_sale_attr_value_id, sale_attr_id, sale_attr_value_id, sale_attr_name, sale_attr_value_name, sku_id) VALUES (?, ?, ?, ?, ?, ?)",
                        [skuSaleAttrValueId, saleAttrItem.saleAttrId, saleAttrItem.saleAttrValueId, saleAttrNameResult[0].sale_attr_name, saleAttrValueNameResult[0].sale_attr_value_name, skuId]
                    );
                }
            }
        }

        await connection.commit();
        console.log('SKU 信息保存成功，SKU ID:', skuId);
        return { success: true, message: '保存成功', skuId: skuId };
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('保存失败:', error);
        throw new Error('保存失败: ' + error.message);
    } finally {
        if (connection) {
            connection.release()
        }
    }
};

module.exports={
    getSkuList,
    putGoosOnSale,
    getSkuInfo,
    saveSkuInfo
}