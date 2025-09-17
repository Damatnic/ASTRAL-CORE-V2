/**
 * @format
 * React Native Entry Point
 * ASTRAL_CORE 2.0 - Crisis Intervention Mobile App
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Enable gesture handler for React Navigation
import 'react-native-gesture-handler';

// Register the app
AppRegistry.registerComponent(appName, () => App);