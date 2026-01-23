# AuthService 优化总结

## ✅ 已完成的改进

### 1. 代码质量提升

#### 清理和整理
- ✅ 移除重复导入（所有 utils 从一个地方导入）
- ✅ 统一注释语言（全部使用英文 JSDoc）
- ✅ 添加详细的文件头部文档
- ✅ 使用分区注释提高可读性

#### 类型安全
- ✅ 导出所有类型（`UserProfile`, `UserToken`, `AuthError`）以供外部使用
- ✅ 添加新的接口类型：`LoginCredentials`, `PasswordChangeRequest`
- ✅ 增强 `UserProfile` 类型，添加更多字段（`phone`, `department`, 完整的 `role` 结构）
- ✅ 为 `AuthError` 添加 `originalError` 属性用于调试

#### API 设计改进
- ✅ **方法重载支持**：`login()` 和 `setPassword()` 支持对象或独立参数两种调用方式
  ```typescript
  // 两种方式都支持
  await AuthService.login({ username, password });
  await AuthService.login(username, password);
  ```
- ✅ **简化返回值**：移除不必要的 `{ status: boolean }` 包装，成功返回 void，失败抛异常
- ✅ **更好的方法命名**：`isLogin()` → `isLoggedIn()`（更符合英语习惯）

### 2. 新增功能

#### 新的公共方法
```typescript
// 检查是否有存储的 token（不验证有效性）
await AuthService.hasStoredToken(): boolean

// 清理所有认证数据（用于调试/重置）
await AuthService.clearAuthData(): void
```

#### 向后兼容
```typescript
// 提供已弃用的别名，平滑迁移
export const isLogin = AuthService.isLoggedIn;
```

### 3. 错误处理改进

#### 增强的 AuthError 类
```typescript
export class AuthError extends Error {
  constructor(
    message: string,
    public readonly originalError?: unknown // 保留原始错误用于调试
  ) {
    super(message);
    this.name = "AuthError";

    // 保持正确的堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthError);
    }
  }
}
```

#### 统一的错误创建
- ✅ 使用 `createAuthError()` 方法统一处理错误
- ✅ 保留原始错误对象用于调试
- ✅ 提供清晰的错误消息

### 4. 日志改进

#### 使用 devLogger
```typescript
import { devLog, devWarn, devError } from "@/utils/logger";

// 开发环境日志，生产环境自动禁用
devLog("Login successful for user:", username);
devWarn("Access token invalid, attempting refresh...");
devError("Login failed:", error);
```

**优势：**
- ✅ 开发环境有详细日志
- ✅ 生产环境自动静默
- ✅ 统一的日志格式

### 5. Token 管理改进

#### 更好的验证
```typescript
// 验证 token 结构
if (!tokenData.access || !tokenData.refresh) {
  throw new AuthError("Invalid token structure. Please log in again.");
}
```

#### 添加 autoRefresh 和 isUseToken 标志
```typescript
// 在 login/refresh 时明确禁用自动刷新，避免循环
await fetchJson({
  url: getUrl("login"),
  method: "POST",
  body: { username, password },
  autoRefresh: false,  // 防止递归
  isUseToken: false,   // 登录时不使用 token
});
```

## 📊 优化对比

### 代码行数
| 指标 | 优化前 | 优化后 | 变化 |
|------|--------|--------|------|
| 总行数 | 184 | 322 | +138 |
| 有效代码行 | ~120 | ~220 | +100 |
| 注释行 | ~15 | ~80 | +65 |
| 公共方法 | 6 | 9 | +3 |

**说明：** 虽然行数增加，但主要是增加了文档、类型和新功能，代码质量显著提升。

### API 变化

| 方法 | 优化前 | 优化后 | 说明 |
|------|--------|--------|------|
| `login()` | `Promise<{ status: boolean }>` | `Promise<void>` | 简化返回，抛异常表示失败 |
| `logout()` | `Promise<{ status: boolean }>` | `Promise<void>` | 同上 |
| `setPassword()` | `Promise<{ status: boolean }>` | `Promise<void>` | 同上 |
| `isLogin()` | `Promise<boolean>` | 已弃用，使用 `isLoggedIn()` | 更好的命名 |
| `hasStoredToken()` | ❌ 不存在 | ✅ `Promise<boolean>` | 新增 |
| `clearAuthData()` | ❌ 不存在 | ✅ `Promise<void>` | 新增 |

### 类型导出

| 类型 | 优化前 | 优化后 |
|------|--------|--------|
| `AuthError` | ✅ 导出 | ✅ 导出（增强） |
| `UserToken` | ❌ 不导出 | ✅ 导出 |
| `UserProfile` | ❌ 不导出 | ✅ 导出（增强） |
| `LoginCredentials` | ❌ 不存在 | ✅ 导出 |
| `PasswordChangeRequest` | ❌ 不存在 | ✅ 导出 |

## 🔄 迁移指南

### 调用方式变化

#### login() 方法
**优化前：**
```typescript
const response = await AuthService.login(username, password);
if (response.status) {
  // 登录成功
} else {
  // 不会到这里，因为失败会抛异常
}
```

**优化后：**
```typescript
try {
  await AuthService.login(username, password);
  // 登录成功
} catch (error) {
  // 登录失败
  const errorMsg = error instanceof AuthError ? error.message : 'Login failed';
}

// 或者使用对象参数
await AuthService.login({ username, password });
```

#### isLogin() → isLoggedIn()
**优化前：**
```typescript
const loggedIn = await AuthService.isLogin();
```

**优化后：**
```typescript
// 推荐
const loggedIn = await AuthService.isLoggedIn();

// 或使用兼容别名（将来会移除）
const loggedIn = await isLogin();
```

### authStore 已自动更新
authStore 已经更新为适配新的 API：

```typescript
// stores/authStore.ts - 已更新
login: async (username, password) => {
  set({ loading: true });
  try {
    await AuthService.login(username, password); // 不再检查 response.status
    await get().getUserProfile();
    return { status: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Login failed';
    return { status: false, errorMsg };
  } finally {
    set({ loading: false });
  }
}
```

## 💡 使用示例

### 基本登录流程
```typescript
import { AuthService, AuthError } from '@/services/AuthService';

async function handleLogin(username: string, password: string) {
  try {
    // 登录
    await AuthService.login(username, password);

    // 获取用户信息
    const profile = await AuthService.getUserProfile();
    console.log('Logged in as:', profile.username);

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      console.error('Auth error:', error.message);
      console.error('Original error:', error.originalError);
    }
    return { success: false, error };
  }
}
```

### 检查登录状态
```typescript
// 方式 1: 验证 token 有效性（会尝试刷新）
const isValid = await AuthService.isLoggedIn();

// 方式 2: 仅检查 token 是否存在（不验证）
const hasToken = await AuthService.hasStoredToken();
```

### 获取有效的 Access Token
```typescript
try {
  // 自动处理刷新
  const token = await AuthService.getJwtToken();

  // 使用 token 调用 API
  const response = await fetch('/api/data', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
} catch (error) {
  // Token 无效且无法刷新，需要重新登录
  console.error('Please log in again');
}
```

### 修改密码
```typescript
// 两种调用方式
await AuthService.setPassword(newPassword, currentPassword);

// 或
await AuthService.setPassword({
  newPassword,
  currentPassword,
});
```

### 调试和清理
```typescript
// 清理所有认证数据（重置状态）
await AuthService.clearAuthData();

// 检查是否有 token（调试用）
const hasToken = await AuthService.hasStoredToken();
console.log('Has stored token:', hasToken);
```

## 🎯 最佳实践

### 1. 使用 try-catch 处理错误
```typescript
try {
  await AuthService.login(username, password);
} catch (error) {
  if (error instanceof AuthError) {
    // 处理认证错误
    showError(error.message);
  } else {
    // 处理其他错误
    showError('Unexpected error occurred');
  }
}
```

### 2. 类型安全
```typescript
import type { UserProfile } from '@/services/AuthService';

// 使用导出的类型
function displayUser(user: UserProfile) {
  console.log(user.username, user.email);
}
```

### 3. 错误调试
```typescript
import { AuthError } from '@/services/AuthService';

try {
  await someAuthOperation();
} catch (error) {
  if (error instanceof AuthError) {
    console.error('Auth failed:', error.message);
    // 查看原始错误用于调试
    console.debug('Original error:', error.originalError);
  }
}
```

### 4. 方法重载
```typescript
// 对象参数（推荐用于可选参数多的情况）
await AuthService.login({ username, password });

// 独立参数（更简洁）
await AuthService.login(username, password);
```

## ⚠️ 破坏性变化

### 1. login/logout/setPassword 返回值变化
**影响：** 调用这些方法的代码需要更新

**修复：**
```typescript
// 旧代码
const result = await AuthService.login(username, password);
if (result.status) { /* ... */ }

// 新代码
try {
  await AuthService.login(username, password);
  // 成功
} catch (error) {
  // 失败
}
```

**已更新的文件：**
- ✅ `stores/authStore.ts` - 已更新

### 2. isLogin() 改名为 isLoggedIn()
**影响：** 直接调用此方法的代码

**修复：**
```typescript
// 旧代码
const loggedIn = await AuthService.isLogin();

// 新代码
const loggedIn = await AuthService.isLoggedIn();
```

**已提供兼容别名：**
```typescript
// 向后兼容（将来会移除）
import { isLogin } from '@/services/AuthService';
const loggedIn = await isLogin();
```

## 📚 导出的类型参考

### UserProfile
```typescript
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  groups: Array<{ id: number; name: string }>;
  role?: {
    id: number;
    role_name: string;
    role_type: string;
    parent?: number | null;
    is_peer_visible: boolean;
    description?: string;
  };
  phone?: string;
  department?: string;
}
```

### UserToken
```typescript
export interface UserToken {
  access: string;
  refresh: string;
}
```

### AuthError
```typescript
export class AuthError extends Error {
  constructor(
    message: string,
    public readonly originalError?: unknown
  );
}
```

## 🔍 测试建议

### 单元测试示例
```typescript
import { AuthService, AuthError } from '@/services/AuthService';

describe('AuthService', () => {
  it('should throw AuthError on login failure', async () => {
    await expect(
      AuthService.login('invalid', 'credentials')
    ).rejects.toThrow(AuthError);
  });

  it('should return user profile after successful login', async () => {
    await AuthService.login('testuser', 'password');
    const profile = await AuthService.getUserProfile();
    expect(profile).toHaveProperty('username', 'testuser');
  });

  it('should check login status correctly', async () => {
    await AuthService.clearAuthData();
    expect(await AuthService.isLoggedIn()).toBe(false);

    await AuthService.login('testuser', 'password');
    expect(await AuthService.isLoggedIn()).toBe(true);
  });
});
```

## ✅ 总结

**主要改进：**
1. ✅ 更好的类型安全和导出
2. ✅ 更清晰的 API 设计（void vs { status }）
3. ✅ 增强的错误处理（originalError）
4. ✅ 统一的日志系统（devLogger）
5. ✅ 新增实用方法（hasStoredToken, clearAuthData）
6. ✅ 完整的 JSDoc 文档
7. ✅ 方法重载支持
8. ✅ 向后兼容（deprecated aliases）

**破坏性变化：**
- ⚠️ login/logout/setPassword 返回值变化（已更新 authStore）
- ⚠️ isLogin() → isLoggedIn()（提供了兼容别名）

**推荐：** 立即开始使用新的 API，逐步移除对已弃用功能的依赖。
