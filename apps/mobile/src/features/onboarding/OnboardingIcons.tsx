import React from 'react';
import { View, StyleSheet } from 'react-native';

// -------------------------------------------------------------
// Pure Vector Icons for Pixel-Perfect Matching with Reference
// -------------------------------------------------------------

// 1. People / Connections Icon (Two People)
export const ConnectionsIcon: React.FC<{ color?: string; size?: number }> = ({
  color = '#0D684D',
  size = 20,
}) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    {/* Left person */}
    <View style={{ position: 'absolute', left: 1, top: 2, alignItems: 'center' }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
      <View
        style={{
          width: 9,
          height: 6,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
          backgroundColor: color,
          marginTop: 1.5,
        }}
      />
    </View>
    {/* Right person (overlapping front) */}
    <View style={{ position: 'absolute', right: 1, top: 4, alignItems: 'center' }}>
      <View style={{ width: 6.5, height: 6.5, borderRadius: 3.25, backgroundColor: color }} />
      <View
        style={{
          width: 10,
          height: 7,
          borderTopLeftRadius: 5.5,
          borderTopRightRadius: 5.5,
          backgroundColor: color,
          marginTop: 1.5,
        }}
      />
    </View>
  </View>
);

// 2. Opportunities / Growth Chart Icon
export const OpportunitiesIcon: React.FC<{ color?: string; size?: number }> = ({
  color = '#C88536',
  size = 20,
}) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    {/* Axes & Bars */}
    <View style={{ width: 16, height: 14, flexDirection: 'row', alignItems: 'flex-end', gap: 2.2 }}>
      <View style={{ width: 3, height: 6, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: 3, height: 9.5, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: 3, height: 13, backgroundColor: color, borderRadius: 1 }} />
      {/* Upward diagonal line */}
      <View
        style={{
          position: 'absolute',
          top: 1,
          left: 1,
          width: 14,
          height: 1.8,
          backgroundColor: color,
          transform: [{ rotate: '-32deg' }],
        }}
      />
    </View>
  </View>
);

// 3. Partnerships / Handshake Icon
export const PartnershipsIcon: React.FC<{ color?: string; size?: number }> = ({
  color = '#2563EB',
  size = 20,
}) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    {/* Left arm */}
    <View
      style={{
        position: 'absolute',
        left: 2,
        top: 6,
        width: 7,
        height: 5,
        borderTopLeftRadius: 3,
        borderBottomLeftRadius: 3,
        backgroundColor: color,
        transform: [{ rotate: '25deg' }],
      }}
    />
    {/* Right arm */}
    <View
      style={{
        position: 'absolute',
        right: 2,
        top: 6,
        width: 7,
        height: 5,
        borderTopRightRadius: 3,
        borderBottomRightRadius: 3,
        backgroundColor: color,
        transform: [{ rotate: '-25deg' }],
      }}
    />
    {/* Center clasp */}
    <View
      style={{
        width: 8,
        height: 7,
        borderRadius: 2,
        borderWidth: 1.6,
        borderColor: color,
        transform: [{ rotate: '45deg' }],
      }}
    />
  </View>
);

// 4. Business Ideas / Lightbulb Icon
export const IdeasIcon: React.FC<{ color?: string; size?: number }> = ({
  color = '#D97706',
  size = 20,
}) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    {/* Bulb glass */}
    <View
      style={{
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 1.6,
        borderColor: color,
        backgroundColor: '#FFFBEB',
      }}
    />
    {/* Bulb base */}
    <View
      style={{
        width: 5,
        height: 3,
        backgroundColor: color,
        borderBottomLeftRadius: 1.5,
        borderBottomRightRadius: 1.5,
        marginTop: -1,
      }}
    />
    <View style={{ width: 3, height: 1.2, backgroundColor: color, marginTop: 0.5 }} />
  </View>
);

// 5. Investment Opportunities / Finance Icon (Bar Chart)
export const InvestmentIcon: React.FC<{ color?: string; size?: number }> = ({
  color = '#1D4ED8',
  size = 20,
}) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ width: 15, height: 13, flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
      <View style={{ width: 3, height: 5, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: 3, height: 8.5, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: 3, height: 12.5, backgroundColor: color, borderRadius: 1 }} />
    </View>
  </View>
);

// 6. Networking / Nodes Icon
export const NetworkingIcon: React.FC<{ color?: string; size?: number }> = ({
  color = '#7C3AED',
  size = 20,
}) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    {/* Top node */}
    <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: color }} />
    {/* Connecting lines */}
    <View
      style={{
        width: 11,
        height: 6,
        borderTopWidth: 1.5,
        borderLeftWidth: 1.5,
        borderRightWidth: 1.5,
        borderColor: color,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        marginTop: 1,
      }}
    />
    {/* Bottom 2 nodes */}
    <View style={{ width: 14, flexDirection: 'row', justifyContent: 'space-between', marginTop: -2 }}>
      <View style={{ width: 4.5, height: 4.5, borderRadius: 2.25, backgroundColor: color }} />
      <View style={{ width: 4.5, height: 4.5, borderRadius: 2.25, backgroundColor: color }} />
    </View>
  </View>
);

