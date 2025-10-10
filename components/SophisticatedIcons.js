/**
 * SVG Icons for Record Search App
 * Styled with sophisticated navy and coral palette
 */

import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { sophisticatedColors } from '../styles/sophisticatedTheme';

// Main Vinyl Record Icon
export const VinylRecordIcon = ({ size = 48, animated = false }) => (
  <View style={{ width: size, height: size }}>
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Outer record circle */}
      <Circle
        cx="12"
        cy="12"
        r="10"
        stroke={sophisticatedColors.accent}
        strokeWidth="2"
        fill="none"
      />
      {/* Inner label circle */}
      <Circle
        cx="12"
        cy="12"
        r="4"
        stroke={sophisticatedColors.text}
        strokeWidth="2"
        fill={sophisticatedColors.surface}
      />
      {/* Center hole */}
      <Circle
        cx="12"
        cy="12"
        r="1.5"
        fill={sophisticatedColors.background}
      />
      {/* Groove lines */}
      <Circle
        cx="12"
        cy="12"
        r="7"
        stroke={sophisticatedColors.textSecondary}
        strokeWidth="0.5"
        fill="none"
        strokeDasharray="2,2"
      />
      <Circle
        cx="12"
        cy="12"
        r="8.5"
        stroke={sophisticatedColors.textTertiary}
        strokeWidth="0.5"
        fill="none"
        strokeDasharray="1,1"
      />
    </Svg>
  </View>
);

// Turntable Arm Icon
export const TurntableArmIcon = ({ size = 32 }) => (
  <View style={{ width: size, height: size }}>
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Arm base */}
      <Circle
        cx="20"
        cy="4"
        r="2"
        fill={sophisticatedColors.accent}
      />
      {/* Arm line */}
      <Line
        x1="18"
        y1="6"
        x2="8"
        y2="16"
        stroke={sophisticatedColors.text}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Cartridge */}
      <Circle
        cx="8"
        cy="16"
        r="1.5"
        fill={sophisticatedColors.accentAlt}
      />
    </Svg>
  </View>
);

// Equalizer Bars Icon
export const EqualizerIcon = ({ size = 32, animated = false }) => (
  <View style={{ width: size, height: size }}>
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="12" width="2" height="8" fill={sophisticatedColors.accent} rx="1" />
      <Rect x="7" y="8" width="2" height="12" fill={sophisticatedColors.text} rx="1" />
      <Rect x="11" y="4" width="2" height="16" fill={sophisticatedColors.accentAlt} rx="1" />
      <Rect x="15" y="10" width="2" height="10" fill={sophisticatedColors.textSecondary} rx="1" />
      <Rect x="19" y="6" width="2" height="14" fill={sophisticatedColors.accent} rx="1" />
    </Svg>
  </View>
);

// Search Icon with Vinyl Record
export const SearchRecordIcon = ({ size = 24 }) => (
  <View style={{ width: size, height: size }}>
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Search glass */}
      <Circle
        cx="10"
        cy="10"
        r="7"
        stroke={sophisticatedColors.text}
        strokeWidth="2"
        fill="none"
      />
      {/* Vinyl record inside search glass */}
      <Circle
        cx="10"
        cy="10"
        r="4"
        stroke={sophisticatedColors.accent}
        strokeWidth="1"
        fill="none"
      />
      <Circle
        cx="10"
        cy="10"
        r="1"
        fill={sophisticatedColors.accent}
      />
      {/* Search handle */}
      <Line
        x1="16"
        y1="16"
        x2="21"
        y2="21"
        stroke={sophisticatedColors.text}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  </View>
);

// Music Note Icon
export const MusicNoteIcon = ({ size = 20 }) => (
  <View style={{ width: size, height: size }}>
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
        fill={sophisticatedColors.accent}
      />
    </Svg>
  </View>
);

// Logo Component (Vinyl + App Name)
export const AppLogo = ({ size = 60, showText = true }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <VinylRecordIcon size={size} />
    {showText && (
      <View style={{ marginLeft: 12 }}>
        <Text style={{
          fontSize: 24,
          fontWeight: '700',
          color: sophisticatedColors.text,
        }}>
          LuckyFind
        </Text>
        <Text style={{
          fontSize: 14,
          color: sophisticatedColors.textSecondary,
          marginTop: -4,
        }}>
          Vinyl Search
        </Text>
      </View>
    )}
  </View>
);

// Animated Spinning Vinyl (for loading states)
export const SpinningVinyl = ({ size = 40 }) => {
  // Note: Animation would require react-native-reanimated or Animated API
  return <VinylRecordIcon size={size} animated={true} />;
};

export default {
  VinylRecordIcon,
  TurntableArmIcon,
  EqualizerIcon,
  SearchRecordIcon,
  MusicNoteIcon,
  AppLogo,
  SpinningVinyl,
};