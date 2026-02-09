# 硅谷甄选后端API

> 一个基于 Express框架搭建的硅谷甄选后台API应用，已完成所有接口。

## 项目简介
> 本项目是***尚硅谷***的硅谷甄选（前端项目）项目为基础，参考gitHub大神go语言版
硅谷甄选API开发的Express框架版本。
## 项目亮点
- 基于Express框架开发，对前端开发人员来说比较友好 
- Express 框架基于 Node.js，安装便捷、上手门槛低，更适合前端开发者快速搭建与运行 API，而 Go 版本因涉及 Web 框架与容器化部署，学习成本较高。
- 能让前端开发者了解一些后端开发知识
## 快速开始
### 克隆项目
```https://github.com/chenmiaozhan2024/Vue3_admin_main.git```
### 安装依赖
```npm install```
### 启动
```npm run start```
## 在线演示地址
## 技术栈

| 技术 | 说明 |
|------|------|
| Node.js | 运行环境 |
| Express.js | Web 框架 v4.16.1 |
| MySQL | 数据库 |
| mysql2 | MySQL 驱动 v3.16.3 |
| JWT | 身份验证 v9.0.3 |
| EJS | 模板引擎 v2.6.1 |

## 项目结构

```
vue3_admin__template-main/
├── bin/                # 应用启动入口
├── Control/             # 控制器层 (路由处理)
│   ├── aclControl/      # ACL 权限控制
│   │   ├── userControl.js      # 用户管理
│   │   ├── roleControl.js      # 角色管理
│   │   └── permissionControl.js # 权限/菜单管理
│   ├── productControl/  # 商品管理
│   ├── auth.js         # 认证相关
│   └── index.js        # 首页
├── Mapper/             # 数据访问层 (DAO)
│   ├── acl/            # ACL 相关数据操作
│   └── productMapper/   # 商品相关数据操作
├── dataBase/           # 数据库配置
│   ├── db.js           # 数据库连接
│   ├── config.js       # 数据库配置
│   └── api.js         # 数据库操作方法
├── utils/             # 工具函数
│   ├── verifyToken.js   # JWT 令牌验证
│   └── response.js     # 统一响应格式
├── public/            # 静态资源
├── static/            # 静态文件
├── views/             # 模板文件
└── app.js             # 应用主入口
```

## 快速开始

### 环境要求

- Node.js >= 14.x
- MySQL >= 5.7

### 安装依赖

```bash
npm install
```

### 配置数据库

修改 `dataBase/config.js` 文件中的数据库配置：

```javascript
module.exports = {
    db: {
        host: '127.0.0.1',    // 数据库地址
        port: '3306',           // 数据库端口
        user: 'root',           // 用户名
        password: '123456',      // 密码
        database: 'sv_selection_db' // 数据库名
    }
}
```

### 启动项目

```bash
npm start
```

项目默认运行在 `http://localhost:3000`

## API 接口文档

### 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/auth/login` | 用户登录 |

### 用户管理 (ACL)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/admin/acl/user/:page/:limit` | 分页获取用户列表 |
| GET | `/admin/acl/user/toAssign/:userId` | 获取用户分配的角色 |
| POST | `/admin/acl/user/save` | 新增用户 |
| PUT | `/admin/acl/user/update` | 更新用户 |
| DELETE | `/admin/acl/user/remove/:id` | 删除用户 |
| DELETE | `/admin/acl/user/batchRemove` | 批量删除用户 |
| POST | `/admin/acl/user/doAssignRole` | 为用户分配角色 |

### 角色管理 (ACL)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/admin/acl/role/:page/:limit` | 分页获取角色列表 |
| GET | `/admin/acl/role/toAssign/:roleId` | 获取角色分配的权限 |
| POST | `/admin/acl/role/save` | 新增角色 |
| PUT | `/admin/acl/role/update` | 更新角色 |
| DELETE | `/admin/acl/role/remove/:id` | 删除角色 |

### 权限/菜单管理 (ACL)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/admin/acl/permission` | 获取所有菜单（树形结构） |
| POST | `/admin/acl/permission/save` | 新增菜单/权限 |
| PUT | `/admin/acl/permission/update` | 更新菜单/权限 |
| DELETE | `/admin/acl/permission/remove/:id` | 删除菜单/权限 |

### 商品管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/admin/product/trademark/:page/:limit` | 品牌列表 |
| GET | `/admin/product/attr/:page/:limit` | 属性列表 |

## 统一响应格式

所有接口返回统一的 JSON 格式：

### 成功响应

```json
{
  "code": 200,
  "data": {},
  "message": "success",
  "ok": true
}
```

### 错误响应

```json
{
  "code": 400/500,
  "message": "错误信息",
  "ok": false
}
```

## JWT 认证

大部分接口需要在请求头中携带 Token：

```
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 数据库表结构

### 核心表

- `user` - 用户表
- `role` - 角色表
- `menu` - 菜单/权限表
- `user_role` - 用户角色关联表
- `role_menu` - 角色菜单关联表
- `attr` - 商品属性表
- `trademark` - 品牌表

## 开发说明

### MVC 架构

项目采用经典的三层架构：

1. **Controller 层** (`Control/`) - 处理 HTTP 请求，调用 Mapper 层
2. **Mapper 层** (`Mapper/`) - 数据访问层，执行 SQL 查询
3. **Database 层** (`dataBase/`) - 数据库连接配置

### 添加新接口

1. 在 `Mapper/` 中添加数据操作函数
2. 在 `Control/` 中添加路由处理函数
3. 在 `app.js` 中注册路由

## License

MIT
