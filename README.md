
# Welcome to Sea-Saw App 👋

<img src="./assets/images/sea-saw-logo.png" style="width: 20%">

👉 [English Version](./README.md) | [中文版](./README_zh.md)

This is the frontend application for the Sea-Saw CRM system, built with [Expo](https://expo.dev) using [`create-expo-app`](https://www.npmjs.com/package/create-expo-app). It provides a flexible and scalable mobile and web solution for managing CRM tasks efficiently. To make thing simple, this application is mainly based on table and tree-like table to manage data. This project can be used as a tmplate for CRM frontend development. [Backend Repository](https://github.com/Coolister-Ye/sea-saw-server) | [Frontend Repository](https://github.com/Coolister-Ye/sea-saw-app)

## 🚀 Features

- **Cross-Platform**: Run seamlessly on iOS, Android, and web.
- **File-Based Routing**: Uses Expo Router for an intuitive navigation structure.
- **Optimized Performance**: Supports development and production builds with minification.
- **Docker Support**: Easily deploy the application using Docker.
- **Environment-Based Configuration**: Supports `.env` files for different environments.
- **Internationalization (i18n)**: Easily extend to multiple languages for broader audience support.
- **Real-time Updates**: Integration with backend systems to keep data up-to-date in real-time.

## 📦 Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the App for Development

#### Development Mode

```bash
npx expo start
```

#### Production Mode (Minified)

```bash
npx expo start --no-dev --minify
```

### 3. Export Web Application

(Default configuration uses `.env.production` for environment variables)

```bash
npx expo export -p web
```

### 4. Run in Docker

```bash
docker compose up --build -d
```

## ⚡ Getting Started Issues

1. Ensure **Watchman** and your terminal have full disk permissions.
2. Choose a development or production environment using `.env` files:

   ```bash
   NODE_ENV=dev npx expo start
   ```

3. **Web App Export**: The export process defaults to using the `.env.production` configuration for environment variables. If you need to adjust this, please modify the `.env` files accordingly.

## 📚 Learn More

For further details on developing with Expo, check out:

- [Expo Documentation](https://docs.expo.dev/): Guides and references.
- [Learn Expo Tutorial](https://docs.expo.dev/tutorial/introduction/): Step-by-step project tutorial.


## 🛠 Code Style

This project follows the [ESLint](https://eslint.org/) guidelines for consistent code style. To automatically fix issues and format your code, we use [Prettier](https://prettier.io/). We encourage you to format your code before submitting pull requests.

Run the following command to format the code:

```bash
npm run format
```

## 🤝 Contributing

We welcome contributions to the Sea-Saw app! If you want to contribute:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature`.
3. Make your changes and commit them.
4. Push to your fork: `git push origin feature/your-feature`.
5. Open a pull request with a detailed explanation of your changes.

Please follow the code style and write tests for your code.

## 🧪 Testing

Make sure you write tests for your new features. We use [Jest](https://jestjs.io/) for unit and integration testing in the app.

Run the following command to run tests:

```bash
npm run test
```

## 🔑 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
