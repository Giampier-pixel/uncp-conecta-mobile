import { useState } from 'react';
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, radii, type } from '@/theme/theme';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secureTextEntry?: boolean;
  maxLength?: number;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType,
  multiline,
  autoCapitalize,
  secureTextEntry,
  maxLength,
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={styles.label}>{label.toUpperCase()}</Text>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textDisabled}
        keyboardType={keyboardType}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        maxLength={maxLength}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          multiline && styles.multilineInput,
          focused && styles.focused,
          error ? styles.errorBorder : null,
        ]}
      />
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    ...type.overline,
    color: colors.textMuted,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    height: 52,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.hairline,
    color: colors.textPrimary,
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
  },
  multilineInput: {
    height: 120,
    paddingTop: 14,
    paddingBottom: 14,
    textAlignVertical: 'top',
  },
  focused: {
    borderColor: colors.primary,
    shadowColor: colors.primaryRing,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  errorBorder: {
    borderColor: colors.danger,
  },
  errorText: {
    ...type.bodySm,
    color: colors.danger,
  },
});
