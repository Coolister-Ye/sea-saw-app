# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## quickstart
```bash
npx expo export -p web
```

```
sea-saw-app
├─ .env
├─ README.md
├─ app
│  ├─ (tabs)
│  │  ├─ _layout.tsx
│  │  ├─ company.tsx
│  │  ├─ contact.tsx
│  │  ├─ contract.tsx
│  │  ├─ download.tsx
│  │  ├─ index.tsx
│  │  ├─ playground.tsx
│  │  └─ production.tsx
│  ├─ +html.tsx
│  ├─ +not-found.tsx
│  ├─ _layout.tsx
│  ├─ login.tsx
│  ├─ set_passwd.tsx
│  └─ user.tsx
├─ app.json
├─ assets
│  ├─ fonts
│  │  ├─ AntDesign.ttf
│  │  ├─ FontAwesome.ttf
│  │  ├─ MaterialCommunityIcons.ttf
│  │  ├─ MaterialIcons-Regular.ttf
│  │  └─ SpaceMono-Regular.ttf
│  └─ images
│     ├─ adaptive-icon.png
│     ├─ app.png
│     ├─ favicon.png
│     ├─ icon.png
│     ├─ partial-react-logo.png
│     ├─ react-logo.png
│     ├─ react-logo@2x.png
│     ├─ react-logo@3x.png
│     └─ splash.png
├─ babel.config.js
├─ components
│  ├─ Collapsible.tsx
│  ├─ ExternalLink.tsx
│  ├─ HelloWave.tsx
│  ├─ ParallaxScrollView.tsx
│  ├─ ThemedText.tsx
│  ├─ ThemedView.tsx
│  ├─ __tests__
│  │  ├─ ThemedText-test.tsx
│  │  └─ __snapshots__
│  │     └─ ThemedText-test.tsx.snap
│  ├─ data
│  │  ├─ Calendar.tsx
│  │  ├─ PlanList.tsx
│  │  └─ Stats.tsx
│  ├─ navigation
│  │  ├─ Avatar.tsx
│  │  ├─ CloseIcon.tsx
│  │  ├─ Header.tsx
│  │  ├─ TabBarIcon.tsx
│  │  ├─ UserModal.tsx
│  │  └─ WebSplashScreen.tsx
│  ├─ sea
│  │  ├─ BasicFrame.tsx
│  │  ├─ DatePickerInput.tsx
│  │  ├─ Dropdown.tsx
│  │  ├─ Form.tsx
│  │  ├─ FormView.tsx
│  │  ├─ InputGroup.tsx
│  │  ├─ SelectList.tsx
│  │  ├─ download
│  │  │  ├─ donwloadList.tsx
│  │  │  └─ downloadItem.tsx
│  │  └─ login
│  │     ├─ InputGroup.tsx
│  │     └─ UserProfile.tsx
│  ├─ table
│  │  ├─ ActionCell.tsx
│  │  ├─ AntdTable.tsx
│  │  ├─ ColumnToolBar.tsx
│  │  ├─ DebounceSelect.tsx
│  │  ├─ EditableCell.tsx
│  │  ├─ EditableRow.tsx
│  │  ├─ EllipsisTooltip.tsx
│  │  ├─ NumberRangeInput.tsx
│  │  ├─ SearchToolBar.tsx
│  │  └─ styles.css
│  └─ themed
│     ├─ Alert.tsx
│     ├─ Button.tsx
│     ├─ Image.tsx
│     ├─ Text.tsx
│     ├─ TextInput.tsx
│     ├─ Toast.tsx
│     └─ View.tsx
├─ constants
│  ├─ Colors.ts
│  ├─ Constants.ts
│  └─ Themes.ts
├─ context
│  ├─ Auth.tsx
│  ├─ Locale.tsx
│  └─ Toast.tsx
├─ docker-compose.yml
├─ global.css
├─ hooks
│  ├─ useColorScheme.ts
│  ├─ useColorScheme.web.ts
│  ├─ useDataService.ts
│  ├─ useDevice.ts
│  ├─ useOutside.ts
│  ├─ useTable.tsx
│  └─ useThemeColor.ts
├─ locale
│  ├─ en.json
│  ├─ i18n.ts
│  └─ zh.json
├─ metro.config.js
├─ nativewind-env.d.ts
├─ nginx
│  ├─ Dockerfile
│  └─ nginx.conf
├─ package-lock.json
├─ package.json
├─ scripts
│  └─ reset-project.js
├─ services
│  ├─ AuthService.ts
│  └─ DataService.ts
├─ tailwind.config.js
├─ tsconfig.json
└─ utlis
   ├─ .serializer.ts.swp
   ├─ commonUtils.ts
   ├─ data.ts
   ├─ emailValidator.js
   ├─ exampleData.ts
   ├─ fieldConverter.tsx
   ├─ nameValidator.js
   ├─ passwordValidator.js
   ├─ serializer-b.ts
   ├─ serializer.ts
   ├─ storageHelper.ts
   ├─ validator.ts
   └─ webHelper.ts

```