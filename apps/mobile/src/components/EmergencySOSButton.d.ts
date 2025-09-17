/**
 * Emergency SOS Button Component
 * Critical one-tap crisis intervention button
 * ASTRAL_CORE 2.0
 */
import React from 'react';
import * as Location from 'expo-location';
interface EmergencySOSButtonProps {
    onEmergencyActivated?: (location?: Location.LocationObject) => void;
    style?: any;
    size?: 'small' | 'medium' | 'large';
    floating?: boolean;
}
declare const EmergencySOSButton: React.FC<EmergencySOSButtonProps>;
export default EmergencySOSButton;
//# sourceMappingURL=EmergencySOSButton.d.ts.map