const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    /**
     * RN 0.87 (bridgeless mode) removed the Paper renderer shim
     * `react-native/Libraries/Renderer/shims/ReactNative`.
     * Reanimated 3.x falls into the else-branch (isFabric() returns false
     * in bridgeless mode) and requires that file, causing a bundle error.
     * Alias it to the Fabric shim that still exists.
     */
    resolveRequest: (context, moduleName, platform) => {
      if (
        moduleName === 'react-native/Libraries/Renderer/shims/ReactNative'
      ) {
        return {
          filePath: path.resolve(
            __dirname,
            'node_modules/react-native/Libraries/Renderer/shims/ReactFabric.js'
          ),
          type: 'sourceFile',
        };
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
