const jwt = require("jsonwebtoken");
// JWT配置
const JWT_SECRET = 'chenmiaozhan2024';

const verifyToken = (req, res, next) => {
    try {
        // 从请求头获取token
        const token = req.headers.token;

        if (!token) {
            return res.error(401, '未提供认证令牌');
        }

        // 验证token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userid;
        next();
    } catch (err) {
        console.log('Token验证失败：', err);
        return res.error(401, '认证令牌无效或已过期');
    }
};
module.exports={
    verifyToken
}