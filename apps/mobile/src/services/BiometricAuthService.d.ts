/**
 * Biometric Authentication Service
 * Secure access to sensitive crisis support features
 * ASTRAL_CORE 2.0
 */
export interface BiometricConfig {
    requireAuthentication: boolean;
    fallbackToPasscode: boolean;
    authenticateOnAppResume: boolean;
    lockAfterMinutes: number;
}
export interface AuthResult {
    success: boolean;
    error?: string;
    biometricType?: string;
}
declare class BiometricAuthService {
    private static instance;
    private isEnrolled;
    private supportedTypes;
    private lastAuthTime;
    private config;
    private readonly SECURE_KEYS;
    private constructor();
    static getInstance(): BiometricAuthService;
    initialize(): Promise<void>;
    private getBiometricTypeNames;
    authenticate(reason?: string): Promise<AuthResult>;
    authenticateForEmergency(): Promise<AuthResult>;
    private isAuthenticationNeeded;
    setupPIN(pin: string): Promise<boolean>;
    verifyPIN(pin: string): Promise<boolean>;
    private hashPIN;
    setupEmergencyBypass(code: string): Promise<boolean>;
    private getEmergencyBypassCode;
    saveSecureData(key: string, data: any): Promise<boolean>;
    getSecureData(key: string): Promise<any | null>;
    updateConfiguration(config: Partial<BiometricConfig>): Promise<void>;
    private saveConfiguration;
    private loadConfiguration;
    private saveLastAuthTime;
    loadLastAuthTime(): Promise<void>;
    lockSensitiveContent(): Promise<void>;
    unlockSensitiveContent(): Promise<boolean>;
    isAvailable(): boolean;
    getSupportedTypes(): string[];
    getConfiguration(): BiometricConfig;
    requiresAuthentication(): Promise<boolean>;
}
export default BiometricAuthService;
//# sourceMappingURL=BiometricAuthService.d.ts.map