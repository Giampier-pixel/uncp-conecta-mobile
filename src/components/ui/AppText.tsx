import { Text, TextProps } from 'react-native';

import { colors, type } from '@/theme/theme';

type TypeVariant = keyof typeof type;

interface AppTextProps extends Omit<TextProps, 'style'> {
  variant?: TypeVariant;
  color?: string;
  muted?: boolean;
  style?: TextProps['style'];
  children?: React.ReactNode;
  numberOfLines?: number;
}

export function AppText({
  variant = 'body',
  color,
  muted = false,
  style,
  children,
  numberOfLines,
  ...rest
}: AppTextProps) {
  const textColor = color ?? (muted ? colors.textMuted : colors.textPrimary);
  const typeStyle = type[variant];

  return (
    <Text
      style={[typeStyle, { color: textColor }, style]}
      numberOfLines={numberOfLines}
      {...rest}>
      {children}
    </Text>
  );
}
