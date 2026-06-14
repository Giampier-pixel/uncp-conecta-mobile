import { View, StyleSheet } from 'react-native';

import type { TimelineEntry } from '@/lib/types';
import { colors, radii, space, statusStyle } from '@/theme/theme';

import { AppText } from './AppText';

interface TimelineProps {
  items: TimelineEntry[];
}

export function Timeline({ items }: TimelineProps) {
  return (
    <View style={styles.container}>
      {items.map((item, index) => {
        const style = statusStyle[item.status];
        const isLast = index === items.length - 1;

        return (
          <View key={index} style={styles.item}>
            {/* Left: line + dot */}
            <View style={styles.lineContainer}>
              <View style={[styles.dot, { backgroundColor: style.color }]} />
              {!isLast && <View style={styles.line} />}
            </View>

            {/* Right: content */}
            <View style={[styles.content, isLast && styles.contentLast]}>
              <View style={styles.header}>
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: style.soft },
                  ]}>
                  <AppText variant="caption" style={{ color: style.color, fontFamily: 'Manrope_600SemiBold' }}>
                    {style.label}
                  </AppText>
                </View>
                <AppText variant="caption" muted>
                  {new Date(item.date).toLocaleDateString('es-PE', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </AppText>
              </View>
              <AppText variant="bodySm" muted style={{ marginTop: 2 }}>
                {item.owner}
              </AppText>
              {item.comment ? (
                <AppText variant="bodySm" style={{ marginTop: space[1] }}>
                  {item.comment}
                </AppText>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: space[2],
  },
  item: {
    flexDirection: 'row',
    gap: space[3],
  },
  lineContainer: {
    alignItems: 'center',
    width: 16,
    paddingTop: 4,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    flexShrink: 0,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: colors.hairline,
    marginTop: 4,
    borderRadius: 1,
    minHeight: 20,
  },
  content: {
    flex: 1,
    paddingBottom: space[4],
  },
  contentLast: {
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    flexWrap: 'wrap',
  },
  statusPill: {
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});
