import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';

import { colors, radii, space } from '@/theme/theme';

import { AppText } from './AppText';
import { Button } from './Button';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface EmptyStateProps {
  icon?: IoniconName;
  title: string;
  message?: string;
  action?: {
    title: string;
    onPress: () => void;
  };
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {icon ? (
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={32} color={colors.primary} />
        </View>
      ) : null}
      <AppText variant="h3" style={styles.title}>
        {title}
      </AppText>
      {message ? (
        <AppText variant="body" muted style={styles.message}>
          {message}
        </AppText>
      ) : null}
      {action ? (
        <View style={{ marginTop: space[4] }}>
          <Button title={action.title} onPress={action.onPress} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space[6],
    gap: space[3],
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: space[2],
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
  },
});
