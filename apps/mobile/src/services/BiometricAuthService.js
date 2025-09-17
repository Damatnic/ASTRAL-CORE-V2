/**
 * Biometric Authentication Service
 * Secure access to sensitive crisis support features
 * ASTRAL_CORE 2.0
 */
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
class BiometricAuthService {
    static instance;
    isEnrolled = false;
    supportedTypes = [];
    lastAuthTime = 0;
    config = {
        requireAuthentication: true,
        fallbackToPasscode: true,
        authenticateOnAppResume: true,
        lockAfterMinutes: 5,
    };
    SECURE_KEYS = {
        USER_PIN: 'astral_user_pin',
        EMERGENCY_BYPASS: 'astral_emergency_bypass',
        AUTH_CONFIG: 'astral_auth_config',
        SENSITIVE_DATA: 'astral_sensitive_data',
    };
    constructor() { }
    static getInstance() {
        if (!BiometricAuthService.instance) {
            BiometricAuthService.instance = new BiometricAuthService();
        }
        return BiometricAuthService.instance;
    }
    async initialize() {
        try {
            // Check hardware support
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            if (!hasHardware) {
                console.log('Device does not support biometric authentication');
                return;
            }
            // Check enrollment
            this.isEnrolled = await LocalAuthentication.isEnrolledAsync();
            if (!this.isEnrolled) {
                console.log('No biometric data enrolled');
            }
            // Get supported authentication types
            this.supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
            console.log('Supported biometric types:', this.getBiometricTypeNames());
            // Load saved configuration
            await this.loadConfiguration();
            console.log('Biometric authentication initialized');
        }
        catch (error) {
            console.error('Error initializing biometric auth:', error);
        }
    }
    getBiometricTypeNames() {
        return this.supportedTypes.map(type => {
            switch (type) {
                case LocalAuthentication.AuthenticationType.FINGERPRINT:
                    return 'Fingerprint';
                case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
                    return 'Face ID';
                case LocalAuthentication.AuthenticationType.IRIS:
                    return 'Iris';
                default:
                    return 'Unknown';
            }
        });
    }
    async authenticate(reason) {
        try {
            if (!this.isEnrolled) {
                return {
                    success: false,
                    error: 'No biometric authentication enrolled',
                };
            }
            // Check if authentication is needed based on last auth time
            if (!this.isAuthenticationNeeded()) {
                return { success: true, biometricType: 'cached' };
            }
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: reason || 'Authenticate to access your crisis support profile',
                cancelLabel: 'Cancel',
                fallbackLabel: this.config.fallbackToPasscode ? 'Use Passcode' : undefined,
                disableDeviceFallback: !this.config.fallbackToPasscode,
            });
            if (result.success) {
                this.lastAuthTime = Date.now();
                await this.saveLastAuthTime();
            }
            return {
                success: result.success,
                error: result.error,
                biometricType: this.getBiometricTypeNames()[0],
            };
        }
        catch (error) {
            console.error('Authentication error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Authentication failed',
            };
        }
    }
    async authenticateForEmergency() {
        // Special authentication for emergency situations
        // May have different rules or bypass options
        try {
            // Check for emergency bypass code
            const bypassCode = await this.getEmergencyBypassCode();
            if (bypassCode) {
                // In a real app, you'd validate this against user input
                console.log('Emergency bypass available');
            }
            // For emergencies, we might want quicker access
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: '🚨 Emergency Access Required',
                cancelLabel: 'Cancel',
                fallbackLabel: 'Emergency Code',
                disableDeviceFallback: false,
            });
            return {
                success: result.success,
                error: result.error,
                biometricType: 'emergency',
            };
        }
        catch (error) {
            // In emergency, we might want to be more lenient
            console.error('Emergency authentication error:', error);
            return {
                success: true, // Allow access in emergency
                biometricType: 'emergency_override',
            };
        }
    }
    isAuthenticationNeeded() {
        if (!this.config.requireAuthentication) {
            return false;
        }
        const now = Date.now();
        const lockTimeout = this.config.lockAfterMinutes * 60 * 1000;
        return (now - this.lastAuthTime) > lockTimeout;
    }
    // PIN Management
    async setupPIN(pin) {
        try {
            // Hash the PIN before storing (in production, use proper hashing)
            const hashedPin = await this.hashPIN(pin);
            await SecureStore.setItemAsync(this.SECURE_KEYS.USER_PIN, hashedPin);
            return true;
        }
        catch (error) {
            console.error('Error setting up PIN:', error);
            return false;
        }
    }
    async verifyPIN(pin) {
        try {
            const storedPin = await SecureStore.getItemAsync(this.SECURE_KEYS.USER_PIN);
            if (!storedPin)
                return false;
            const hashedPin = await this.hashPIN(pin);
            return hashedPin === storedPin;
        }
        catch (error) {
            console.error('Error verifying PIN:', error);
            return false;
        }
    }
    async hashPIN(pin) {
        // In production, use proper cryptographic hashing
        // This is a simple example
        return Buffer.from(pin).toString('base64');
    }
    // Emergency Bypass
    async setupEmergencyBypass(code) {
        try {
            await SecureStore.setItemAsync(this.SECURE_KEYS.EMERGENCY_BYPASS, code);
            return true;
        }
        catch (error) {
            console.error('Error setting emergency bypass:', error);
            return false;
        }
    }
    async getEmergencyBypassCode() {
        try {
            return await SecureStore.getItemAsync(this.SECURE_KEYS.EMERGENCY_BYPASS);
        }
        catch (error) {
            console.error('Error getting emergency bypass:', error);
            return null;
        }
    }
    // Secure Data Storage
    async saveSecureData(key, data) {
        try {
            // Require authentication before saving sensitive data
            const auth = await this.authenticate('Authenticate to save secure data');
            if (!auth.success) {
                return false;
            }
            const jsonData = JSON.stringify(data);
            await SecureStore.setItemAsync(`${this.SECURE_KEYS.SENSITIVE_DATA}_${key}`, jsonData);
            return true;
        }
        catch (error) {
            console.error('Error saving secure data:', error);
            return false;
        }
    }
    async getSecureData(key) {
        try {
            // Require authentication before accessing sensitive data
            const auth = await this.authenticate('Authenticate to access secure data');
            if (!auth.success) {
                return null;
            }
            const jsonData = await SecureStore.getItemAsync(`${this.SECURE_KEYS.SENSITIVE_DATA}_${key}`);
            return jsonData ? JSON.parse(jsonData) : null;
        }
        catch (error) {
            console.error('Error getting secure data:', error);
            return null;
        }
    }
    // Configuration Management
    async updateConfiguration(config) {
        this.config = { ...this.config, ...config };
        await this.saveConfiguration();
    }
    async saveConfiguration() {
        try {
            await AsyncStorage.setItem(this.SECURE_KEYS.AUTH_CONFIG, JSON.stringify(this.config));
        }
        catch (error) {
            console.error('Error saving configuration:', error);
        }
    }
    async loadConfiguration() {
        try {
            const saved = await AsyncStorage.getItem(this.SECURE_KEYS.AUTH_CONFIG);
            if (saved) {
                this.config = JSON.parse(saved);
            }
        }
        catch (error) {
            console.error('Error loading configuration:', error);
        }
    }
    async saveLastAuthTime() {
        try {
            await AsyncStorage.setItem('last_auth_time', this.lastAuthTime.toString());
        }
        catch (error) {
            console.error('Error saving last auth time:', error);
        }
    }
    async loadLastAuthTime() {
        try {
            const saved = await AsyncStorage.getItem('last_auth_time');
            if (saved) {
                this.lastAuthTime = parseInt(saved);
            }
        }
        catch (error) {
            console.error('Error loading last auth time:', error);
        }
    }
    // Privacy Features
    async lockSensitiveContent() {
        // Lock sensitive content when app goes to background
        this.lastAuthTime = 0;
        await AsyncStorage.setItem('content_locked', 'true');
    }
    async unlockSensitiveContent() {
        const auth = await this.authenticate('Unlock sensitive content');
        if (auth.success) {
            await AsyncStorage.removeItem('content_locked');
        }
        return auth.success;
    }
    // Status Checks
    isAvailable() {
        return this.isEnrolled;
    }
    getSupportedTypes() {
        return this.getBiometricTypeNames();
    }
    getConfiguration() {
        return this.config;
    }
    async requiresAuthentication() {
        return this.config.requireAuthentication && this.isAuthenticationNeeded();
    }
}
export default BiometricAuthService;
//# sourceMappingURL=BiometricAuthService.js.map