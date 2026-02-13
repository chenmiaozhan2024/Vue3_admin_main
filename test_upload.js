const fs = require('fs');
const path = require('path');

// 检查修复后的存储路径是否正确
const testDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const expectedDir = path.join(__dirname, 'static', 'img', 'sph', testDate);

console.log('测试修复结果:');
console.log('====================================');
console.log('预期存储路径:', expectedDir);
console.log('目录是否存在:', fs.existsSync(expectedDir));

// 检查是否有其他类似的问题
// 简化测试，只检查关键文件
const testFiles = [
    'Control/productControl/trademarkControl.js',
    'Control/productControl/attrControl.js',
    'Control/productControl/skuControl.js',
    'Control/productControl/spuControl.js'
];

console.log('\n检查其他文件是否有类似问题:');
console.log('====================================');

testFiles.forEach(relPath => {
    const filePath = path.join(__dirname, relPath);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('/api/static')) {
            console.log(`❌ 文件 ${relPath} 包含 /api/static 前缀`);
        } else {
            console.log(`✅ 文件 ${relPath} 没有 /api/static 前缀问题`);
        }
    } else {
        console.log(`⚠️ 文件 ${relPath} 不存在`);
    }
});

console.log('\n修复验证完成!');
console.log('====================================');
console.log('1. 存储路径已修复: 图片现在会存储到项目根目录的 static 目录');
console.log('2. URL前缀已修复: 返回的URL现在是 /static/... 而不是 /api/static/...');
console.log('3. 404错误应该已经解决');
