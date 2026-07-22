module.exports = function(api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // expo-router/babel is deprecated since SDK 50; babel-preset-expo covers it.
    plugins: ["nativewind/babel"],
  };
};