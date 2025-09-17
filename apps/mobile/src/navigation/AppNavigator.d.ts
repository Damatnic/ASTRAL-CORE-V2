/**
 * App Navigator with Enhanced Crisis Features
 * ASTRAL_CORE 2.0 Mobile Navigation
 */
import React from 'react';
export type RootStackParamList = {
    MainTabs: undefined;
    Emergency: undefined;
    CrisisSession: {
        sessionId?: string;
    };
    ChatSession: {
        volunteerId?: string;
    };
    ResourceDetail: {
        resourceId: string;
    };
};
export type TabParamList = {
    Home: undefined;
    Crisis: undefined;
    Chat: undefined;
    Resources: undefined;
    Volunteer: undefined;
    Settings: undefined;
};
export default function AppNavigator(): React.JSX.Element;
//# sourceMappingURL=AppNavigator.d.ts.map