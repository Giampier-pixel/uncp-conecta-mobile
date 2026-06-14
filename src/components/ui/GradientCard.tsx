import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

import { gradients, radii, space } from '@/theme/theme';

interface GradientCardProps {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
  colors?: readonly [string, string, ...string[]];
}

export function GradientCard({ style, children, colors: customColors }: GradientCardProps) {
  return (
    <View
      style={[
        {
          borderRadius: radii.xl,
          overflow: 'hidden',
        },
        style,
      ]}>
      <LinearGradient
        colors={customColors ?? gradients.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: space[6] }}>
        {children}
      </LinearGradient>
    </View>
  );
}
