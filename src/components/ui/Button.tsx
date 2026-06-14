import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { colors, gradients, radii } from '@/theme/theme';

type ButtonVariant = 'primary' | 'gradient' | 'secondary' | 'danger';
type ButtonSize = 'lg' | 'md' | 'sm';

const HEIGHTS: Record<ButtonSize, number> = { lg: 56, md: 48, sm: 40 };
const FONT_SIZES: Record<ButtonSize, number> = { lg: 16, md: 15, sm: 14 };

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  iconLeft?: ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  iconLeft,
}: ButtonProps) {
  const height = HEIGHTS[size];
  const fontSize = FONT_SIZES[size];
  const isDisabled = disabled || loading;

  const containerStyle: ViewStyle = {
    height,
    borderRadius: radii.pill,
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
    opacity: isDisabled ? 0.5 : 1,
  };

  const innerStyle: ViewStyle = {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: size === 'sm' ? 16 : 24,
  };

  const labelColor =
    variant === 'secondary' ? colors.textPrimary : colors.textOnPrimary;

  const labelStyle = {
    fontFamily: 'Manrope_700Bold',
    fontSize,
    color: labelColor,
    letterSpacing: 0,
  };

  const content = (
    <View style={innerStyle}>
      {iconLeft}
      {loading ? (
        <ActivityIndicator color={labelColor} size="small" />
      ) : (
        <Text style={labelStyle}>{title}</Text>
      )}
    </View>
  );

  if (variant === 'gradient') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [
          containerStyle,
          { transform: [{ scale: pressed ? 0.97 : 1 }], overflow: 'hidden' },
        ]}>
        <LinearGradient
          colors={gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radii.pill }]}
        />
        {content}
      </Pressable>
    );
  }

  const bgColor =
    variant === 'primary'
      ? colors.primary
      : variant === 'danger'
        ? colors.danger
        : 'transparent';

  const borderStyle =
    variant === 'secondary'
      ? { borderWidth: 1, borderColor: colors.hairlineStrong }
      : undefined;

  const shadowStyle =
    variant === 'primary'
      ? {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.45,
          shadowRadius: 14,
          elevation: 6,
        }
      : undefined;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        containerStyle,
        shadowStyle,
        borderStyle,
        {
          backgroundColor: bgColor,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
      ]}>
      {content}
    </Pressable>
  );
}
