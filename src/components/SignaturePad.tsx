import { useRef, useState } from 'react';
import {
  Modal,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';
import { Path, Rect, Svg } from 'react-native-svg';

import { Button } from '@/components/ui/Button';
import { AppText } from '@/components/ui/AppText';
import { colors, radii, space } from '@/theme/theme';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface SignaturePadProps {
  visible: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Convert an array of "x,y" strings to an SVG path d attribute */
function toPath(points: string[]): string {
  if (points.length === 0) return '';
  return 'M ' + points.join(' L ');
}

/** Build a data:image/svg+xml, URL from all strokes */
function buildDataUrl(
  allStrokes: string[][],
  width: number,
  height: number,
): string {
  const paths = allStrokes
    .filter((s) => s.length > 0)
    .map(
      (s) =>
        `<path d="M ${s.join(' L ')}" fill="none" stroke="#111111" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    )
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#ffffff"/>${paths}</svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

// ─── Component ─────────────────────────────────────────────────────────────────

const PAD_HEIGHT = 240;

export function SignaturePad({ visible, onClose, onSave }: SignaturePadProps) {
  // Committed strokes — array of "x,y" string arrays
  const strokes = useRef<string[][]>([]);
  // In-progress stroke
  const currentStroke = useRef<string[]>([]);
  // Tick to force re-render on move
  const [tick, setTick] = useState(0);
  // Measured pad width
  const [padWidth, setPadWidth] = useState(320);

  function forceRender() {
    setTick((t) => t + 1);
  }

  function clearAll() {
    strokes.current = [];
    currentStroke.current = [];
    forceRender();
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentStroke.current = [`${locationX},${locationY}`];
        forceRender();
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentStroke.current.push(`${locationX},${locationY}`);
        forceRender();
      },
      onPanResponderRelease: () => {
        if (currentStroke.current.length > 0) {
          strokes.current.push([...currentStroke.current]);
          currentStroke.current = [];
          forceRender();
        }
      },
      onPanResponderTerminate: () => {
        if (currentStroke.current.length > 0) {
          strokes.current.push([...currentStroke.current]);
          currentStroke.current = [];
          forceRender();
        }
      },
    }),
  ).current;

  const allStrokes = [...strokes.current];
  const inProgress = currentStroke.current;
  const hasStrokes = allStrokes.length > 0 || inProgress.length > 0;

  function handleSave() {
    const dataUrl = buildDataUrl(allStrokes, padWidth, PAD_HEIGHT);
    onSave(dataUrl);
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <AppText variant="h3" style={styles.title}>
            Dibuja tu firma
          </AppText>
          <AppText variant="bodySm" muted style={styles.hint}>
            Firma dentro del recuadro
          </AppText>

          {/* Drawing box */}
          <View
            style={styles.padBox}
            onLayout={(e) => setPadWidth(e.nativeEvent.layout.width)}
            {...panResponder.panHandlers}>
            <Svg
              width="100%"
              height={PAD_HEIGHT}
              style={StyleSheet.absoluteFill}>
              {/* White background */}
              <Rect
                x={0}
                y={0}
                width={padWidth}
                height={PAD_HEIGHT}
                fill="#FFFFFF"
              />
              {/* Committed strokes */}
              {allStrokes.map((stroke, i) =>
                stroke.length > 0 ? (
                  <Path
                    key={i}
                    d={toPath(stroke)}
                    stroke="#111111"
                    strokeWidth={2.5}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : null,
              )}
              {/* In-progress stroke */}
              {inProgress.length > 0 ? (
                <Path
                  d={toPath(inProgress)}
                  stroke="#111111"
                  strokeWidth={2.5}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}
            </Svg>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="Borrar"
              variant="secondary"
              size="sm"
              onPress={clearAll}
            />
            <Button
              title="Cancelar"
              variant="secondary"
              size="sm"
              onPress={onClose}
            />
            <Button
              title="Guardar"
              variant="primary"
              size="sm"
              disabled={!hasStrokes}
              onPress={handleSave}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: space[5],
    paddingBottom: space[8],
    gap: space[4],
  },
  title: {
    textAlign: 'center',
  },
  hint: {
    textAlign: 'center',
  },
  padBox: {
    height: PAD_HEIGHT,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: space[3],
  },
});
