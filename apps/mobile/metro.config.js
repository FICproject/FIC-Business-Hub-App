const path = require('path');
const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);
  return {
    ...defaultConfig,
    projectRoot: path.resolve(__dirname),
    watchFolders: [path.resolve(__dirname)],
    transformer: {
      ...defaultConfig.transformer,
      assetRegistryPath: 'react-native/Libraries/Image/AssetRegistry',
    },
    serializer: {
      ...defaultConfig.serializer,
      getPolyfills: () => require(path.resolve(__dirname, 'node_modules/@react-native/js-polyfills'))(),
    },
    server: {
      ...defaultConfig.server,
      enhanceMiddleware: (middleware) => middleware,
    },
  };
})();
