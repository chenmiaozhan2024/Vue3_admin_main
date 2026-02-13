const connection = require('./dataBase/db');

async function checkTableStructure() {
    const conn = await connection;
    
    try {
        const [rows] = await conn.query("DESCRIBE sku");
        console.log('SKU表结构:');
        console.log(rows);
        
        const [rows2] = await conn.query("DESCRIBE sku_image");
        console.log('\nSKU图片表结构:');
        console.log(rows2);
        
        const [rows3] = await conn.query("DESCRIBE sku_attr_value");
        console.log('\nSKU属性值表结构:');
        console.log(rows3);
        
        const [rows4] = await conn.query("DESCRIBE sku_sale_attr_value");
        console.log('\nSKU销售属性值表结构:');
        console.log(rows4);
        
    } catch (error) {
        console.error('查询失败:', error);
    }
}

checkTableStructure();
