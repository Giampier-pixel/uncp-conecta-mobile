import { ReactNode } from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';

import { colors, radii, space } from '@/theme/theme';

interface CardProps {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
  onPress?: () => void;
}

const cardStyle: ViewStyle = {
  backgroundColor: colors.surface,
  borderRadius: radii.lg,
  padding: space[5],
  borderWidth: 1,
  borderColor: colors.hairline,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.4,
  shadowRadius: 12,
  elevation: 4,
};

export function Card({ style, children, onPress }: CardProps) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          cardStyle,
          style,
          { transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}>
        {children}
      </Pressable>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
}
