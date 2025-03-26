
# 欢迎使用 Sea-Saw App 👋

<img src="./assets/images/sea-saw-logo.png" style="width: 20%">

👉 [English Version](./README.md) | [中文版](./README_zh.md)

这是 Sea-Saw CRM 系统的前端应用，使用 [Expo](https://expo.dev) 和 [`create-expo-app`](https://www.npmjs.com/package/create-expo-app) 构建。它提供了一个灵活且可扩展的移动端和 Web 解决方案，用于高效管理 CRM 任务。为了使事情简单，这个项目在进行数据管理和展示时主要是以表格或树状表格来进行。 这个项目可以被用作 CRM 前端开发的模板。[后端仓库](https://github.com/Coolister-Ye/sea-saw-server) | [前端仓库](https://github.com/Coolister-Ye/sea-saw-app)

## 🚀 功能

- **跨平台**：在 iOS、Android 和 Web 上无缝运行。
- **基于文件的路由**：使用 Expo Router 提供直观的导航结构。
- **优化性能**：支持开发和生产环境构建，包含代码压缩。
- **Docker 支持**：轻松使用 Docker 部署应用。
- **基于环境的配置**：支持 `.env` 文件配置不同环境。
- **国际化 (i18n)**：轻松扩展支持多种语言，服务更广泛的受众。
- **实时更新**：与后端系统集成，保持数据实时更新。

## 📦 安装

### 1. 安装依赖

```bash
npm install
```

### 2. 启动应用进行开发

#### 开发模式

```bash
npx expo start
```

#### 生产模式（已压缩）

```bash
npx expo start --no-dev --minify
```

### 3. 导出 Web 应用

（默认配置使用 `.env.production` 配置环境变量）

```bash
npx expo export -p web
```

### 4. 在 Docker 中运行

```bash
docker compose up --build -d
```

## ⚡ 快速入门问题

1. 确保 **Watchman** 和你的终端具有完全的磁盘权限。
2. 使用 `.env` 文件选择开发或生产环境：

   ```bash
   NODE_ENV=dev npx expo start
   ```

3. **Web 应用导出**：导出过程默认使用 `.env.production` 配置环境变量。如果需要调整，请相应地修改 `.env` 文件。

## 📚 了解更多

想了解更多关于 Expo 开发的内容，请参考：

- [Expo 文档](https://docs.expo.dev/)：指南和参考。
- [学习 Expo 教程](https://docs.expo.dev/tutorial/introduction/)：逐步的项目教程。

## 🛠 代码风格

本项目遵循 [ESLint](https://eslint.org/) 指南来保持一致的代码风格。为了自动修复问题并格式化代码，我们使用了 [Prettier](https://prettier.io/)。我们鼓励在提交拉取请求之前格式化代码。

运行以下命令来格式化代码：

```bash
npm run format
```

## 🤝 贡献

我们欢迎对 Sea-Saw 应用的贡献！如果你想参与：

1. Fork 该仓库。
2. 创建一个新分支：`git checkout -b feature/your-feature`。
3. 进行更改并提交。
4. 推送到你的 Fork：`git push origin feature/your-feature`。
5. 打开一个拉取请求，并详细说明你的更改。

请遵循代码风格，并为你的代码编写测试。

## 🧪 测试

确保为你的新功能编写测试。我们使用 [Jest](https://jestjs.io/) 进行应用的单元和集成测试。

运行以下命令以运行测试：

```bash
npm run test
```

## 🔑 许可证

本项目使用 MIT 许可证 - 详情请见 [LICENSE](LICENSE) 文件。
