/**
 * Responsive Layout Component
 * Adapts to all screen sizes and orientations
 * ASTRAL_CORE 2.0
 */

import React, { ReactNode, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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

interface ResponsiveStyles {
  container: any;
  content: any;
  scrollContent: any;
  header: any;
  footer: any;
  padding: any;
}

// Device size breakpoints
const BREAKPOINTS = {
  phone: 428,      // iPhone 14 Pro Max width
  tablet: 768,     // iPad Mini width
  largeTablet: 1024, // iPad Pro width
};

export const useResponsive = () => {
  const [dimensions, setDimensions] = useState({
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  });
  const [deviceType, setDeviceType] = useState<DeviceType>(getDeviceType(SCREEN_WIDTH));
  const [orientation, setOrientation] = useState<Orientation>(
    SCREEN_WIDTH < SCREEN_HEIGHT ? 'portrait' : 'landscape'
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
      setDeviceType(getDeviceType(window.width));
      setOrientation(window.width < window.height ? 'portrait' : 'landscape');
    });

    return () => subscription?.remove();
  }, []);

  return {
    dimensions,
    deviceType,
    orientation,
    isPhone: deviceType === 'phone',
    isTablet: deviceType === 'tablet' || deviceType === 'large-tablet',
    isLandscape: orientation === 'landscape',
    isPortrait: orientation === 'portrait',
  };
};

function getDeviceType(width: number): DeviceType {
  if (width < BREAKPOINTS.phone) return 'phone';
  if (width < BREAKPOINTS.tablet) return 'tablet';
  return 'large-tablet';
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  scrollable = true,
  keyboardAware = true,
  padding = true,
  backgroundColor = '#FFFFFF',
  safeArea = true,
  footer,
  header,
}) => {
  const insets = useSafeAreaInsets();
  const { deviceType, orientation, dimensions } = useResponsive();

  const styles = getResponsiveStyles(deviceType, orientation, dimensions);

  const containerStyle = [
    styles.container,
    { backgroundColor },
    safeArea && {
      paddingTop: insets.top || StatusBar.currentHeight || 0,
      paddingBottom: footer ? 0 : insets.bottom,
    },
  ];

  const contentStyle = [
    styles.content,
    padding && styles.padding,
  ];

  const MainContainer = safeArea ? SafeAreaView : View;
  const ContentWrapper = scrollable ? ScrollView : View;

  const content = (
    <MainContainer style={containerStyle}>
      {header && <View style={styles.header}>{header}</View>}
      
      <ContentWrapper
        style={scrollable ? undefined : contentStyle}
        contentContainerStyle={scrollable ? styles.scrollContent : undefined}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {scrollable ? (
          <View style={contentStyle}>{children}</View>
        ) : (
          children
        )}
      </ContentWrapper>

      {footer && (
        <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
          {footer}
        </View>
      )}
    </MainContainer>
  );

  if (keyboardAware && Platform.OS === 'ios') {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  return content;
};

function getResponsiveStyles(
  deviceType: DeviceType,
  orientation: Orientation,
  dimensions: { width: number; height: number }
): ResponsiveStyles {
  const isPhone = deviceType === 'phone';
  const isTablet = deviceType === 'tablet' || deviceType === 'large-tablet';
  const isLandscape = orientation === 'landscape';

  // Responsive padding and margins
  const horizontalPadding = isPhone ? 16 : isTablet ? 24 : 32;
  const verticalPadding = isPhone ? 12 : 16;

  // Responsive font sizes
  const baseFontSize = isPhone ? 14 : 16;
  const headerFontSize = isPhone ? 20 : 24;

  // Responsive component sizes
  const buttonHeight = isPhone ? 48 : 56;
  const inputHeight = isPhone ? 44 : 52;

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      maxWidth: isTablet && !isLandscape ? 768 : undefined,
      alignSelf: isTablet && !isLandscape ? 'center' : undefined,
      width: isTablet && !isLandscape ? '100%' : undefined,
    },
    scrollContent: {
      flexGrow: 1,
    },
    header: {
      paddingHorizontal: horizontalPadding,
      paddingVertical: verticalPadding,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    },
    footer: {
      paddingHorizontal: horizontalPadding,
      paddingVertical: verticalPadding,
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
    },
    padding: {
      paddingHorizontal: horizontalPadding,
      paddingVertical: verticalPadding,
    },
  });
}

// Responsive Grid Component
interface ResponsiveGridProps {
  children: ReactNode[];
  columns?: number;
  gap?: number;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns,
  gap = 12,
}) => {
  const { deviceType, orientation } = useResponsive();
  
  const getColumns = () => {
    if (columns) return columns;
    
    const isPhone = deviceType === 'phone';
    const isLandscape = orientation === 'landscape';
    
    if (isPhone) return isLandscape ? 2 : 1;
    return isLandscape ? 3 : 2;
  };

  const cols = getColumns();
  const rows = Math.ceil(children.length / cols);

  return (
    <View style={{ marginHorizontal: -gap / 2 }}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <View
          key={rowIndex}
          style={{
            flexDirection: 'row',
            marginBottom: rowIndex < rows - 1 ? gap : 0,
          }}
        >
          {Array.from({ length: cols }).map((_, colIndex) => {
            const index = rowIndex * cols + colIndex;
            if (index >= children.length) return null;
            
            return (
              <View
                key={colIndex}
                style={{
                  flex: 1,
                  paddingHorizontal: gap / 2,
                }}
              >
                {children[index]}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

// Responsive Text Sizes
export const getResponsiveTextSize = (
  baseSize: number,
  deviceType: DeviceType
): number => {
  switch (deviceType) {
    case 'phone':
      return baseSize;
    case 'tablet':
      return baseSize * 1.1;
    case 'large-tablet':
      return baseSize * 1.2;
    default:
      return baseSize;
  }
};

// Responsive Spacing
export const getResponsiveSpacing = (
  baseSpacing: number,
  deviceType: DeviceType
): number => {
  switch (deviceType) {
    case 'phone':
      return baseSpacing;
    case 'tablet':
      return baseSpacing * 1.25;
    case 'large-tablet':
      return baseSpacing * 1.5;
    default:
      return baseSpacing;
  }
};

// Export utility functions
export const ResponsiveUtils = {
  isPhone: () => getDeviceType(SCREEN_WIDTH) === 'phone',
  isTablet: () => {
    const type = getDeviceType(SCREEN_WIDTH);
    return type === 'tablet' || type === 'large-tablet';
  },
  getDeviceType: () => getDeviceType(SCREEN_WIDTH),
  getOrientation: () => SCREEN_WIDTH < SCREEN_HEIGHT ? 'portrait' : 'landscape',
  getDimensions: () => ({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }),
};

export default ResponsiveLayout;