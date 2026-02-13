const connection = require('../../dataBase/db')
const getAdminProduct= async (page,limit,category3Id)=>{
    const size=parseInt(limit)
    const conn = await connection
    //计算偏移量
    const offset =parseInt((page-1)*limit)
    const [countRows] =await conn.query("select COUNT(*) as total from spu")
    const total=countRows[0].total
    const [row]=await conn.query("select spu_id as id,spu_name as spuName,description,category3_id as category3Id,tm_id as tmId from spu limit ? offset ?",[size,offset])
    const result={}
    result.records=row
    result.total=total
    return result
}
// 获取全部品牌的数据
const getTrademarkList= async ()=>{
    const conn = await connection
    const [row]=await conn.query("select tm_id as id,tm_name as tmName,logo_url as logoUrl from trademark")
    return row
}
//获取某个SPU下的全部的售卖商品的图片数据
const getSpuImageList= async (spuId)=>{
    const conn = await connection
    const [row]=await conn.query("select image_id as id, image_name as imgName,image_url as imgUrl, spu_id as spuId from spu_image_list where spu_id=?",[spuId])
    return row
    // console.log(row)
}
//
const getSpuSaleAttrList=async (spuId)=>{
    const conn = await connection
    const [row]=await conn.query("select spu_sale_attr_id as id,base_sale_attr_id as baseSaleAttrId,sale_attr_name as saleAttrName, spu_id as spuId from spu_sale_attr where spu_id=?",[spuId])
    const result=[]
    // const spuSaleAttrValueList=[]
    for(let item of row){
        const [row1]=await conn.query("select sale_attr_value_id as id,sale_attr_value_name as saleAttrValueName,sale_attr_id as baseSaleAttrId, spu_id as spuId from sale_attr_value where spu_id=?&& sale_attr_id=?",[item.spuId,item.baseSaleAttrId])
        console.log(item)
        item.spuSaleAttrValueList=row1
        result.push(item)
    }
    return result
    // console.log( result)
}
const getBaseAttrList=async ()=>{
    const conn = await connection
    const [row]= await conn.query("select sale_attr_id as id,sale_attr_name as name from sale_attr")
    return row
}
// 完善后的删除SPU方法（带事务）
const deleteSpuBySpuId = async (spuId) => {
    const conn = await connection

    try {
        // 1. 开启事务
        await conn.beginTransaction();

        // 2. 定义需要执行的四个删除SQL（注意执行顺序，先删子表再删主表）
        const deleteSqls = [
            'DELETE FROM spu_image_list WHERE spu_id = ?',
            'DELETE FROM spu_sale_attr WHERE spu_id = ?',
            'DELETE FROM sale_attr_value WHERE spu_id = ?',
            'DELETE FROM spu WHERE spu_id = ?'
        ];

        // 3. 依次执行每个删除操作
        for (const sql of deleteSqls) {
            const [result] = await conn.query(sql, [spuId]);
            console.log(`执行SQL: ${sql}，影响行数:`, result.affectedRows);
        }
        // 4. 所有操作成功，提交事务
        await conn.commit();
    } catch (error) {
        await conn.rollback();
        console.error(`删除SPU ${spuId} 失败，事务已回滚:`, error);

    }
};
// 查看某一个已有的SPU下全部售卖的商品
const finBySpuId=async (spuId)=>{
    const conn = await connection
    const [row]=  await conn.query("select sku_id as id,spu_id as spuID,category_3_id,tm_id as tmId,sku_name as skuName,weight,price,sku_desc as skuDesc,sku_default_img as skuDefaultImg,is_sale as isSale from sku where spu_id=?",[spuId])
    return row
}
//追加一个新的SPU
const saveSpuInfo = async (params) => {
    const conn = await connection;
    const { spuName, description, category3Id, tmId, spuImageList, spuSaleAttrList } = params;

    // 参数验证（移除id验证）
    if (!spuName || !category3Id || !tmId) {
        throw new Error('缺少必要参数');
    }

    try {
        // 开始事务
        await conn.beginTransaction();

        // 生成唯一的 SPU ID（使用时间戳+随机数）
        const spuId = Date.now() + Math.floor(Math.random() * 1000);

        // 保存 SPU 主数据
        await conn.query(
            "INSERT INTO spu (spu_id, spu_name, description, category3_id, tm_id) VALUES (?, ?, ?, ?, ?)",
            [spuId, spuName, description, category3Id, tmId]
        );

        // 保存图片列表
        for (let item of spuImageList) {
            if (item.imgUrl && item.imgName) {
                const imageId = Date.now() + Math.floor(Math.random() * 1000); // 增加随机数避免冲突
                await conn.query(
                    "INSERT INTO spu_image_list (image_id, image_name, image_url, spu_id) VALUES (?, ?, ?, ?)",
                    [imageId, item.imgName, item.imgUrl, spuId]
                );
            }
        }

        // 保存销售属性和属性值
        for (let attrItem of spuSaleAttrList) {
            if (attrItem.baseSaleAttrId && attrItem.saleAttrName) {
                const spuSaleAttrId = Date.now() + Math.floor(Math.random() * 1000);
                // 保存销售属性
                await conn.query(
                    "INSERT INTO spu_sale_attr (spu_sale_attr_id, base_sale_attr_id, sale_attr_name, spu_id) VALUES (?, ?, ?, ?)",
                    [spuSaleAttrId, attrItem.baseSaleAttrId, attrItem.saleAttrName, spuId]
                );

                // 保存销售属性值
                if (attrItem.spuSaleAttrValueList && attrItem.spuSaleAttrValueList.length > 0) {
                    for (let valueItem of attrItem.spuSaleAttrValueList) {
                        if (valueItem.saleAttrValueName) {
                            const saleAttrValueId = Date.now() + Math.floor(Math.random() * 1000);
                            await conn.query(
                                "INSERT INTO sale_attr_value (sale_attr_value_id, sale_attr_value_name, sale_attr_id, spu_id) VALUES (?, ?, ?, ?)",
                                [saleAttrValueId, valueItem.saleAttrValueName, attrItem.baseSaleAttrId, spuId]
                            );
                        }
                    }
                }
            }
        }

        // 提交事务
        await conn.commit();
        console.log('SPU 信息保存成功，生成的 SPU ID:', spuId);
        return { success: true, message: '保存成功', spuId: spuId };
    } catch (error) {
        // 回滚事务
        await conn.rollback();
        console.error('保存失败:', error);
        throw new Error('保存失败: ' + error.message);
    }
};
module.exports={
    getAdminProduct,
    getTrademarkList,
    getSpuImageList,
    getSpuSaleAttrList,
    getBaseAttrList,
    deleteSpuBySpuId,
    finBySpuId,
    saveSpuInfo
}