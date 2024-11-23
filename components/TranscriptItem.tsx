import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from "react-native";
import React from "react";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";
import { getTimestamp, normalizeMeter } from "../utils/functions";
import { pressDelay, style } from "../utils/styles";

export function TranscriptItem({
  children,
  item,
  onPress,
  onLongPress,
  style: extraStyle,
}: {
  children: React.ReactElement[] | React.ReactElement;
  item?: TranscriptSegment;
  onPress: () => void;
  onLongPress?: (data: TranscriptSegment) => void;
  style?: ViewStyle;
}) {
  if (item) {
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        style={[styles.transcriptContainer, extraStyle]}
        onPress={() => {
          onPress();
        }}
        onLongPress={() => onLongPress && onLongPress(item)}
        delayLongPress={pressDelay}
      >
        <View>
          <Text style={[style.text, styles.transcriptTimestamp]}>
            {getTimestamp(item.t0.time)}
          </Text>
          {item.t0.text.length > 0 && (
            <Text style={[style.text, styles.transcriptText]}>
              {item.t0.text}
            </Text>
          )}
        </View>
        {children}
      </TouchableOpacity>
    );
  }
  return <View>{children}</View>;
}

export function TextSegment({ item }: { item: TranscriptSegment }) {
  return <Text style={[style.text, styles.transcriptText]}>{item.text}</Text>;
}

export function MeterSegment({
  item,
  max,
  min,
}: {
  item: Meter;
  max: number;
  min: number;
}) {
  const width = useSharedValue(0);
  width.value = withTiming(
    normalizeMeter(item.value, max, min) * style.recorderContainer.width + 2,
    {
      duration: 250,
    }
  );

  return (
    <View style={styles.barContainer}>
      <Animated.View style={[styles.barBg, { width: width }]} />
    </View>
  );
}

export function Marker({
  mark = {
    time: 0,
    text: "",
  },
  meter,
  max,
  min,
  duration = 1,
}: {
  mark: Marker;
  meter?: Meter;
  max?: number;
  min?: number;
  duration: number;
}) {
  const width = useSharedValue(0);
  width.value = withTiming(
    Math.max(
      6,
      (meter && max && min
        ? normalizeMeter(meter.value, max, min)
        : mark!.time / duration!) *
        (style.recorderContainer.width - 16)
    ),
    { duration: 250 }
  );

  return (
    <View style={styles.barContainer}>
      <Animated.View style={[styles.bar, { width: width }]} />
      <View style={styles.barBg} />
    </View>
  );
}

const styles = StyleSheet.create({
  barContainer: {
    position: "relative",
    height: 16,
    justifyContent: "center",
  },
  bar: {
    width: 0,
    height: 6,
    backgroundColor: style.text1.color,
    borderRadius: 100,
  },
  barBg: {
    position: "absolute",
    zIndex: -1,
    width: "100%",
    height: 1.5,
    backgroundColor: style.text3.color,
    borderRadius: 100,
  },
  transcriptContainer: {
    width: "100%",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 4,
  },
  transcriptTimestamp: {
    fontSize: 16,
    color: style.text3.color,
  },
  transcriptText: {
    fontSize: 16,
  },
});
