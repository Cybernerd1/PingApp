const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    /**
     * RN 0.87 (bridgeless mode) renderer shim resolution
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
      // Silence "not listed in exports" warning for RN private deep imports
      // (used by @react-native/virtualized-lists).
      if (
        moduleName ===
        'react-native/src/private/featureflags/ReactNativeFeatureFlags'
      ) {
        return {
          filePath: path.resolve(
            __dirname,
            'node_modules/react-native/src/private/featureflags/ReactNativeFeatureFlags.js'
          ),
          type: 'sourceFile',
        };
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
