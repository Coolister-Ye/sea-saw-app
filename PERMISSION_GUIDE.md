# 权限系统使用指南 / Permission System Guide

本指南说明如何使用新实现的用户账户管理和权限控制功能。

## 目录

1. [用户注册功能](#用户注册功能)
2. [用户资料编辑功能](#用户资料编辑功能)
3. [权限控制组件和 Hooks](#权限控制组件和-hooks)
4. [API 端点](#api-端点)
5. [使用示例](#使用示例)

---

## 用户注册功能

### 前端路由

- **注册页面**: `/register`
- **登录页面**: `/login` (已添加注册链接)

### 注册表单字段

**必填字段**:
- `username` - 用户名 (至少3个字符)
- `email` - 邮箱地址
- `password` - 密码 (至少8个字符)
- `password_confirm` - 确认密码

**可选字段**:
- `first_name` - 名字
- `last_name` - 姓氏
- `phone` - 电话号码
- `department` - 部门

### 后端 API

**端点**: `POST /api/auth/register/`

**请求体**:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "password_confirm": "SecurePass123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "department": "Sales"
}
```

**响应**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    ...
  }
}
```

### 在代码中使用

```typescript
import { useAuthStore } from "@/stores/authStore";

const register = useAuthStore((state) => state.register);

const handleRegister = async () => {
  const result = await register({
    username: "johndoe",
    email: "john@example.com",
    password: "SecurePass123",
    password_confirm: "SecurePass123",
  });

  if (result.status) {
    console.log("Registration successful!");
  } else {
    console.error("Registration failed:", result.errorMsg);
  }
};
```

---

## 用户资料编辑功能

### 前端路由

- **查看资料**: `/(app)/(setting)/profile`
- **编辑资料**: `/(app)/(setting)/profile-edit`

### 可编辑字段

- `email` - 邮箱地址 (必填)
- `first_name` - 名字
- `last_name` - 姓氏
- `phone` - 电话号码
- `department` - 部门

### 只读字段

- `username` - 用户名 (不可修改)
- `id` - 用户 ID
- `is_staff` - 是否为员工
- `date_joined` - 注册日期
- `role` - 角色
- `groups` - 用户组

### 后端 API

**端点**: `PATCH /api/auth/profile/update/`

**请求头**: 需要 `Authorization: Bearer <token>`

**请求体**:
```json
{
  "email": "newemail@example.com",
  "first_name": "John",
  "last_name": "Smith",
  "phone": "+1234567890",
  "department": "Marketing"
}
```

**响应**:
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "newemail@example.com",
    ...
  }
}
```

### 在代码中使用

```typescript
import { useAuthStore } from "@/stores/authStore";

const updateProfile = useAuthStore((state) => state.updateProfile);

const handleUpdate = async () => {
  const result = await updateProfile({
    email: "newemail@example.com",
    first_name: "John",
    phone: "+1234567890",
  });

  if (result.status) {
    console.log("Profile updated!");
  } else {
    console.error("Update failed:", result.errorMsg);
  }
};
```

---

## 权限控制组件和 Hooks

### usePermission Hook

强大的权限检查 Hook，提供多种权限检查方法。

```typescript
import { usePermission } from "@/hooks/usePermission";

function MyComponent() {
  const {
    hasRole,
    hasAnyRole,
    canView,
    canEdit,
    canDelete,
    isOwner,
  } = usePermission();

  // 检查角色
  if (hasRole('ADMIN')) {
    // 管理员专属逻辑
  }

  // 检查多个角色
  if (hasAnyRole(['SALE', 'ADMIN'])) {
    // 销售或管理员可见
  }

  // 检查资源权限
  if (canEdit('order')) {
    // 显示编辑按钮
  }

  // 检查所有权
  if (isOwner(order.owner_id)) {
    // 只有所有者可见
  }
}
```

### PermissionGuard 组件

包装组件以进行权限控制，无权限时自动隐藏或显示提示。

#### 基本用法

```typescript
import { PermissionGuard } from "@/components/sea-saw-design/permission";

// 按角色控制
<PermissionGuard role="ADMIN">
  <AdminPanel />
</PermissionGuard>

// 按资源操作控制
<PermissionGuard resource="order" action="delete">
  <DeleteButton />
</PermissionGuard>

// 多角色 (任一)
<PermissionGuard anyRole={['SALE', 'ADMIN']}>
  <OrderForm />
</PermissionGuard>

// 检查所有权
<PermissionGuard resource="order" action="edit" ownerId={order.owner_id}>
  <EditButton />
</PermissionGuard>

// 无权限时隐藏 (不显示提示)
<PermissionGuard role="ADMIN" hideWhenDenied>
  <AdminButton />
</PermissionGuard>

// 自定义无权限提示
<PermissionGuard
  role="ADMIN"
  fallback={<Text>Contact admin for access</Text>}
>
  <AdminPanel />
</PermissionGuard>
```

### PermissionDenied 组件

显示友好的权限拒绝提示。

```typescript
import { PermissionDenied } from "@/components/sea-saw-design/permission";

// 内联样式 (默认)
<PermissionDenied />

// 自定义消息
<PermissionDenied message="You need admin privileges" />

// 全页样式
<PermissionDenied
  variant="page"
  message="This section is for managers only"
/>
```

---

## API 端点

### 认证相关

| 端点 | 方法 | 认证 | 描述 |
|------|------|------|------|
| `/api/token/` | POST | ✗ | 登录获取 JWT |
| `/api/token/refresh/` | POST | ✗ | 刷新 access token |
| `/api/token/verify/` | POST | ✗ | 验证 token |
| `/api/auth/register/` | POST | ✗ | 注册新用户 |
| `/api/auth/user-detail/` | GET | ✓ | 获取当前用户信息 |
| `/api/auth/profile/update/` | PATCH | ✓ | 更新用户资料 |
| `/auth/users/set_password/` | POST | ✓ | 修改密码 |

---

## 使用示例

### 示例 1: 在页面中使用权限控制

```typescript
import { PermissionGuard } from "@/components/sea-saw-design/permission";
import { usePermission } from "@/hooks/usePermission";

export default function OrderPage() {
  const { canEdit, canDelete } = usePermission();

  return (
    <View>
      <Text>Order Details</Text>

      {/* 只有销售或管理员可以创建订单 */}
      <PermissionGuard anyRole={['SALE', 'ADMIN']}>
        <Button>Create New Order</Button>
      </PermissionGuard>

      {/* 可编辑时显示编辑按钮 */}
      {canEdit('order') && (
        <Button>Edit Order</Button>
      )}

      {/* 只有管理员可以删除 */}
      <PermissionGuard resource="order" action="delete">
        <Button>Delete Order</Button>
      </PermissionGuard>
    </View>
  );
}
```

### 示例 2: 条件渲染菜单项

```typescript
import { usePermission } from "@/hooks/usePermission";

export function NavigationMenu() {
  const { canView, hasRole } = usePermission();

  return (
    <View>
      {canView('order') && (
        <MenuItem href="/order">Orders</MenuItem>
      )}

      {canView('production') && (
        <MenuItem href="/production">Production</MenuItem>
      )}

      {hasRole('ADMIN') && (
        <MenuItem href="/admin">Admin Panel</MenuItem>
      )}
    </View>
  );
}
```

### 示例 3: 组合多个权限条件

```typescript
<PermissionGuard
  anyRole={['SALE', 'ADMIN']}
  resource="order"
  action="edit"
  ownerId={order.created_by}
>
  <EditOrderForm order={order} />
</PermissionGuard>
```

此示例要求:
- 用户必须是 SALE 或 ADMIN 角色
- 用户有编辑订单的权限
- 用户是订单的创建者

### 示例 4: 完整的表单权限控制

```typescript
import { PermissionGuard, PermissionDenied } from "@/components/sea-saw-design/permission";

export function OrderForm({ orderId }: { orderId: number }) {
  const { canEdit } = usePermission();

  if (!canEdit('order')) {
    return <PermissionDenied variant="page" />;
  }

  return (
    <View>
      <Text>Edit Order</Text>
      <Input label="Customer Name" />
      <Input label="Amount" />

      <PermissionGuard resource="order" action="delete">
        <Button variant="danger">Delete Order</Button>
      </PermissionGuard>

      <Button>Save Changes</Button>
    </View>
  );
}
```

---

## 角色权限矩阵

### 资源访问权限

| 资源 | ADMIN | SALE | PRODUCTION | WAREHOUSE | FINANCE |
|------|-------|------|------------|-----------|---------|
| Order | ✓✓✓✓ | ✓✓✓ | ✓ | ✓ | ✓ |
| Company | ✓✓✓✓ | ✓✓✓ | ✗ | ✗ | ✗ |
| Contact | ✓✓✓✓ | ✓✓✓ | ✗ | ✗ | ✗ |
| Production | ✓✓✓✓ | ✓ | ✓✓✓ | ✓ | ✗ |
| Pipeline | ✓✓✓✓ | ✓✓✓ | ✓✓ | ✓✓ | ✓ |
| Payment | ✓✓✓✓ | ✓✓ | ✗ | ✗ | ✓✓✓ |
| Download | ✓✓✓✓ | ✓ | ✓ | ✓ | ✓ |

图例:
- ✓✓✓✓ = 完全权限 (CRUD)
- ✓✓✓ = 创建、读取、更新
- ✓✓ = 读取、更新
- ✓ = 仅读取
- ✗ = 无权限

---

## 最佳实践

### 1. 优先使用 PermissionGuard 组件

```typescript
// 推荐 ✓
<PermissionGuard role="ADMIN">
  <AdminPanel />
</PermissionGuard>

// 不推荐 ✗
{isAdmin && <AdminPanel />}
```

### 2. 组合使用 Hook 和组件

```typescript
// Hook 用于逻辑判断
const { canEdit } = usePermission();

if (canEdit('order')) {
  // 复杂的逻辑处理
  processOrder();
}

// 组件用于 UI 渲染
<PermissionGuard resource="order" action="edit">
  <EditButton />
</PermissionGuard>
```

### 3. 提供友好的无权限提示

```typescript
<PermissionGuard
  role="ADMIN"
  fallback={
    <PermissionDenied
      message="This feature is only available to administrators"
    />
  }
>
  <AdminFeature />
</PermissionGuard>
```

### 4. 按需隐藏而非禁用

```typescript
// 推荐: 完全隐藏无权限的按钮
<PermissionGuard resource="order" action="delete" hideWhenDenied>
  <DeleteButton />
</PermissionGuard>

// 不推荐: 显示禁用的按钮
<Button disabled={!canDelete('order')}>Delete</Button>
```

---

## 故障排除

### 问题: 权限检查不生效

**解决方案**:
1. 确保用户已登录且 token 有效
2. 检查用户的 role 和 groups 是否正确设置
3. 查看后端日志确认权限配置

### 问题: 注册失败

**常见原因**:
- 用户名已存在
- 邮箱格式错误
- 密码不符合要求 (少于8个字符)
- 两次密码不匹配

### 问题: 更新资料失败

**常见原因**:
- Token 过期 (需要重新登录)
- 邮箱已被其他用户使用
- 网络连接问题

---

## 扩展和自定义

### 添加新的权限检查

在 `usePermission.ts` 中添加自定义权限逻辑:

```typescript
export function usePermission() {
  // ... 现有代码

  const canExport = (resource: string): boolean => {
    if (isAdmin || isStaff) {
      return true;
    }
    // 自定义导出权限逻辑
    return hasAnyRole(['SALE', 'FINANCE']);
  };

  return {
    // ... 现有返回
    canExport, // 添加新方法
  };
}
```

### 添加新的角色类型

1. 在后端 `models.py` 的 `RoleType` 中添加新角色
2. 在前端 `usePermission.ts` 的 `RoleType` 类型中添加
3. 更新权限逻辑以支持新角色

---

## 总结

现在你的 CRM 系统已经具备完整的用户账户管理和权限控制功能:

✅ **用户注册** - 新用户可以自助注册账户
✅ **资料编辑** - 用户可以更新个人信息
✅ **权限检查 Hook** - 灵活的权限检查工具
✅ **权限保护组件** - 声明式的UI权限控制
✅ **权限拒绝提示** - 友好的用户体验
✅ **角色权限矩阵** - 清晰的权限分配

如需更多帮助，请参考代码注释或联系开发团队。
