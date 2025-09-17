/**
 * ASTRAL_CORE 2.0 Mobile Navigation Types
 *
 * Navigation type definitions for crisis intervention mobile app
 */
export type RootStackParamList = {
    Home: undefined;
    Crisis: {
        sessionId?: string;
        emergencyMode?: boolean;
    };
    Emergency: {
        crisisLevel: 'high' | 'critical';
        sessionId?: string;
    };
    Volunteer: {
        mode: 'register' | 'dashboard' | 'training';
    };
    Settings: undefined;
};
export type NavigationProps = {
    navigation: any;
    route: any;
};
//# sourceMappingURL=navigation.d.ts.map