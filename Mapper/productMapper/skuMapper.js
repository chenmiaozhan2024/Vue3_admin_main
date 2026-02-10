const connection = require('../../dataBase/db')
// 获取已有的商品的数据-SKU
const getSkuList=async (page,pageSize)=>{
    const conn = await connection
    const [row] =await conn.query("select sku_id as id,spu_id as spuID,category_3_id as category3Id,tm_id as tmId,sku_name as skuName,weight,price,sku_desc as skuDesc,sku_Desc as skuDesc,sku_default_img as skuDefaultImg, is_sale as isSale from sku")
    return row
}
// 商品上架
const putGoosOnSale=async (skuId)=>{
    const conn = await connection
    //校验商品Id参数
    if(!skuId){
        throw new Error('商品ID不能为空')
    }
    const [row] =await conn.query('select is_sale as isSale from sku where sku_id=?',[skuId])
    //没有查到商品
    if(row.length===0){
        throw new Error('商品不存在')
    }
    const  currentState=row[0].isSale
    const newState=1-currentState

    const result= await conn.query("update sku set is_sale=?",[newState])
    return result
}
// 获取商品详情
const getSkuInfo=async (skuId)=>{
    const conn = await connection
    const [row1] =await conn.query("select sku_id as id,spu_id as spuID,category_3_id as category3Id,tm_id as tmId,sku_name as skuName,weight,price,sku_desc as skuDesc,sku_Desc as skuDesc,sku_default_img as skuDefaultImg, is_sale as isSale from sku")
    //获取平台属性
    const [row2]=await conn.query("select id as Id,sku_attr_value_id as id,attr_id as attrId,value_name as valueName,attr_name as attrName,sku_id as skuId from sku_attr_value where sku_id=?",[skuId])

    //获取销售属性
    const [row3] =await conn.query("select id as ID,sku_sale_attr_value_id as id,sale_attr_value_id as saleAttrValueId,sale_attr_name as saleAttrName, sale_attr_value_name as saleAttrValueName,sku_id as skuId from sku_sale_attr_value")
    //获取商品图片
    const [row4]= await conn.query("select id as ID,image_id as id,sku_id as skuId,image_url as imgUrl,spu_image_id as spuImgId,is_default as isDefault from sku_image where sku_id=?",[skuId])
    const result={
        ...row1[0],
        "skuAttrValueList":row2,
        "skuSaleAttrValueList":row3,
        "skuImageList":row4
    }
    // console.log(result)

    return result
}

module.exports={
    getSkuList,
    putGoosOnSale,
    getSkuInfo
}