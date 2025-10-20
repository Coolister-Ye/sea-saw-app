// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");

const config = getDefaultConfig(__dirname);

const nativeWindConfig = withNativeWind(config, {
  input: "./global.css",
  inlineRem: 16,
});
const finalConfig = wrapWithReanimatedMetroConfig(nativeWindConfig);

module.exports = finalConfig;
