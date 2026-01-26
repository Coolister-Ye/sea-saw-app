# Sea-Saw Frontend 部署指南

本项目提供两种部署方式：**手动部署**（适合快速测试）和 **CI/CD 自动部署**（推荐生产环境使用）。

## 方式一：手动部署 (deploy-manual.sh)

### 适用场景
- 快速测试部署流程
- 一次性部署
- 开发环境部署
- 不想配置 CI/CD

### 前置要求
1. 本地已安装 Node.js 和 npm
2. 本地已配置好 `.env.production` 文件
3. 可以通过 SSH 连接到服务器
4. 服务器上已安装 Docker 和 docker-compose

### 使用步骤

#### 1. 给脚本添加执行权限
```bash
cd sea-saw-app
chmod +x deploy-manual.sh
```

#### 2. 确保 .env.production 已配置
```bash
# 如果还没有，复制示例文件
cp .env.production.example .env.production

# 编辑配置文件
vim .env.production
```

需要配置的关键变量：
- `EXPO_PUBLIC_API_URL`: 后端 API 地址（如 `https://api.yourdomain.com`）

#### 3. 运行部署脚本
```bash
./deploy-manual.sh appuser@your-server-ip /home/sea-saw/sea-saw-app
```

参数说明：
- 第一个参数：服务器地址（格式：`用户名@IP地址`）
- 第二个参数：服务器上的部署路径（可选，默认：`/home/sea-saw/sea-saw-app`）

#### 4. 部署流程
脚本将自动完成以下步骤：
1. ✅ 在本地构建前端（`npx expo export -p web`）
2. ✅ 压缩 `dist/` 文件夹
3. ✅ 上传到服务器
4. ✅ 在服务器上解压
5. ✅ 使用 Docker Compose 构建并启动容器

### 示例
```bash
# 示例 1: 使用默认路径
./deploy-manual.sh appuser@123.456.789.0

# 示例 2: 指定自定义路径
./deploy-manual.sh appuser@123.456.789.0 /opt/sea-saw/frontend

# 示例 3: 使用域名
./deploy-manual.sh appuser@sea-saw.example.com
```

---

## 方式二：CI/CD 自动部署 (GitHub Actions)

### 适用场景
- 生产环境部署
- 团队协作开发
- 需要自动化测试 + 部署
- 需要部署通知

### 架构说明
项目已配置完整的 GitHub Actions workflow ([.github/workflows/deploy-production.yml](.github/workflows/deploy-production.yml))，支持两种构建模式：

#### **Local 模式**（默认）
- ✅ 在 GitHub Actions 中构建前端
- ✅ 上传 `dist/` 到服务器
- ✅ 在服务器上本地构建 Docker 镜像
- 优点：无需配置容器镜像服务
- 缺点：服务器需要构建镜像（消耗资源）

#### **Registry 模式**
- ✅ 在 GitHub Actions 中构建前端
- ✅ 构建 Docker 镜像并推送到腾讯云容器镜像服务
- ✅ 服务器从镜像仓库拉取镜像
- 优点：服务器负载低，支持多服务器部署，镜像可复用
- 缺点：需要配置腾讯云容器镜像服务

### 首次配置步骤

#### 1. 安装 GitHub CLI
```bash
# macOS
brew install gh

# Ubuntu/Debian
sudo apt install gh

# 其他系统参考: https://cli.github.com/
```

#### 2. 运行配置脚本
```bash
cd sea-saw-app
chmod +x deploy-cicd-setup.sh
./deploy-cicd-setup.sh
```

脚本将引导您配置以下 GitHub Secrets：
- `TENCENT_SERVER_IP`: 服务器 IP 地址
- `TENCENT_SERVER_USER`: SSH 用户名
- `DEPLOY_PATH`: 部署路径
- `TENCENT_SSH_PRIVATE_KEY`: SSH 私钥（用于 GitHub Actions 连接服务器）
- `TCR_USERNAME`: 腾讯云容器镜像服务用户名（可选，仅 registry 模式需要）
- `TCR_PASSWORD`: 腾讯云容器镜像服务密码（可选，仅 registry 模式需要）
- `WECHAT_WEBHOOK_URL`: 企业微信 Webhook（可选，用于部署通知）

#### 3. 配置 SSH 密钥
确保您的 SSH 公钥已添加到服务器：

```bash
# 1. 查看公钥
cat ~/.ssh/id_rsa.pub

# 2. 登录服务器
ssh appuser@your-server-ip

# 3. 添加公钥到 authorized_keys
echo "你的公钥内容" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

#### 4. 服务器准备 .env.production
在服务器的部署路径下创建 `.env.production` 文件：

```bash
# 登录服务器
ssh appuser@your-server-ip

# 进入部署目录
cd /home/sea-saw/sea-saw-app

# 创建 .env.production
cat > .env.production << EOF
EXPO_PUBLIC_API_URL=https://api.yourdomain.com
EOF
```

### 使用方式

#### 自动触发（推荐）
推送到 `main` 或 `production` 分支时自动部署：

```bash
git add .
git commit -m "feat: add new feature"
git push origin main
```

#### 手动触发
```bash
# 使用默认 local 模式
gh workflow run deploy-production.yml

# 指定 local 模式
gh workflow run deploy-production.yml -f build_mode=local

# 指定 registry 模式（需要先配置 TCR）
gh workflow run deploy-production.yml -f build_mode=registry
```

#### 查看部署状态
```bash
# 列出最近的运行记录
gh run list --workflow=deploy-production.yml

# 实时查看部署进度
gh run watch

# 查看特定运行的日志
gh run view <run-id> --log
```

### CI/CD 流程说明

```
┌─────────────┐
│  推送代码   │
└──────┬──────┘
       │
       v
┌─────────────┐
│ 1. 运行测试 │ (Test: npm run lint + npm run test)
└──────┬──────┘
       │
       v
┌─────────────┐
│ 2. 构建前端 │ (Build: npx expo export -p web)
└──────┬──────┘
       │
       ├─────────────────┬─────────────────┐
       v                 v                 v
┌──────────────┐  ┌─────────────┐  ┌─────────────┐
│ 3a. 上传     │  │ 3b. 构建    │  │ 3c. 推送    │
│  到服务器    │  │ Docker镜像  │  │  到TCR      │
│ (Local模式)  │  │(Registry模式│  │(Registry模式│
└──────┬───────┘  └──────┬──────┘  └──────┬──────┘
       │                 │                 │
       v                 └────────┬────────┘
┌─────────────┐                  │
│ 4a. 本地    │                  v
│  构建镜像   │          ┌────────────────┐
│  并启动     │          │ 4b. 拉取镜像   │
└──────┬──────┘          │   并启动       │
       │                 └────────┬───────┘
       │                          │
       └────────────┬─────────────┘
                    v
            ┌──────────────┐
            │ 5. 健康检查  │
            └──────┬───────┘
                   │
                   v
            ┌──────────────┐
            │ 6. 发送通知  │ (可选: 企业微信)
            └──────────────┘
```

---

## 对比总结

| 特性 | 手动部署 | CI/CD (Local) | CI/CD (Registry) |
|------|---------|---------------|------------------|
| 配置复杂度 | ⭐ 简单 | ⭐⭐ 中等 | ⭐⭐⭐ 复杂 |
| 部署速度 | 慢（本地构建） | 中等 | 快（预构建镜像） |
| 自动化测试 | ❌ 无 | ✅ 有 | ✅ 有 |
| 部署通知 | ❌ 无 | ✅ 有 | ✅ 有 |
| 多服务器支持 | ❌ 需手动 | ⚠️ 需多次运行 | ✅ 支持 |
| 服务器资源消耗 | 高（构建） | 中（构建） | 低（拉取） |
| 镜像版本管理 | ❌ 无 | ❌ 无 | ✅ 有 |
| 适用场景 | 开发/测试 | 小型生产 | 企业生产 |

---

## 常见问题

### Q1: deploy-manual.sh 报错 "npx: command not found"
**A:** 确保本地已安装 Node.js：
```bash
node --version
npm --version
```

### Q2: SSH 连接失败
**A:** 检查：
1. 服务器 IP 地址是否正确
2. SSH 端口是否开放（默认 22）
3. 防火墙是否允许 SSH 连接
4. SSH 密钥是否正确配置

### Q3: GitHub Actions 部署失败
**A:** 查看日志：
```bash
gh run list --workflow=deploy-production.yml
gh run view <run-id> --log
```

常见原因：
- GitHub Secrets 配置错误
- SSH 密钥未添加到服务器
- 服务器上 Docker 未运行
- .env.production 未配置

### Q4: 如何切换 CI/CD 模式？
**A:**
- 默认使用 local 模式
- 手动触发时指定：`gh workflow run deploy-production.yml -f build_mode=registry`
- 修改 workflow 默认值：编辑 `.github/workflows/deploy-production.yml` 第 25 行

### Q5: 部署后访问不了？
**A:** 检查：
1. Nginx 容器是否运行：`docker ps`
2. 端口是否映射正确：`docker-compose.yml` 中的 ports 配置
3. 防火墙是否开放端口：`sudo ufw allow 80`
4. .env.production 中的 API_URL 是否正确

### Q6: 如何回滚到上一个版本？
**A:**
- Registry 模式：`docker pull` 指定版本标签
- Local 模式：需要重新部署上一个提交

```bash
# 示例：回滚到特定 commit
git checkout <commit-hash>
./deploy-manual.sh appuser@server-ip
```

---

## 推荐实践

### 开发阶段
```bash
# 使用手动部署快速迭代
./deploy-manual.sh dev-user@dev-server
```

### 预发布阶段
```bash
# 推送到 main 分支，自动部署到测试服务器
git push origin main
```

### 生产部署
```bash
# 使用 registry 模式部署到生产
git push origin production
# 或手动触发
gh workflow run deploy-production.yml -f build_mode=registry
```

---

## 获取帮助

- GitHub Actions 文档: https://docs.github.com/actions
- Docker Compose 文档: https://docs.docker.com/compose/
- Expo 文档: https://docs.expo.dev/
- 腾讯云容器镜像服务: https://cloud.tencent.com/product/tcr

如有问题，请提交 Issue 或联系团队。
