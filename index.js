/**
 * @format
 */

// react-native-gesture-handler MUST be imported first before any other import
import 'react-native-gesture-handler';

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
