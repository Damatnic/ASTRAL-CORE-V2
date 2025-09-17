/**
 * Responsive Layout Component
 * Adapts to all screen sizes and orientations
 * ASTRAL_CORE 2.0
 */
import React, { ReactNode } from 'react';
export type DeviceType = 'phone' | 'tablet' | 'large-tablet';
export type Orientation = 'portrait' | 'landscape';
interface ResponsiveLayoutProps {
    children: ReactNode;
    scrollable?: boolean;
    keyboardAware?: boolean;
    padding?: boolean;
    backgroundColor?: string;
    safeArea?: boolean;
    footer?: ReactNode;
    header?: ReactNode;
}
export declare const useResponsive: () => {
    dimensions: {
        width: number;
        height: number;
    };
    deviceType: DeviceType;
    orientation: Orientation;
    isPhone: boolean;
    isTablet: boolean;
    isLandscape: boolean;
    isPortrait: boolean;
};
export declare const ResponsiveLayout: React.FC<ResponsiveLayoutProps>;
interface ResponsiveGridProps {
    children: ReactNode[];
    columns?: number;
    gap?: number;
}
export declare const ResponsiveGrid: React.FC<ResponsiveGridProps>;
export declare const getResponsiveTextSize: (baseSize: number, deviceType: DeviceType) => number;
export declare const getResponsiveSpacing: (baseSpacing: number, deviceType: DeviceType) => number;
export declare const ResponsiveUtils: {
    isPhone: () => boolean;
    isTablet: () => boolean;
    getDeviceType: () => DeviceType;
    getOrientation: () => "portrait" | "landscape";
    getDimensions: () => {
        width: number;
        height: number;
    };
};
export default ResponsiveLayout;
//# sourceMappingURL=ResponsiveLayout.d.ts.map