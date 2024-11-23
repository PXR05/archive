import {
  StyleSheet,
  Text,
  View,
  StyleProp,
  ViewStyle,
  FlatList,
  Pressable,
  NativeScrollEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { pressDelay, style } from "../utils/styles";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import {
  Circle,
  Hexagon,
  Diamond,
  Square,
  Triangle,
} from "lucide-react-native";
import Animated, {
  Easing,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { getTimestamp, normalizeMeter } from "../utils/functions";
import { ImpactFeedbackStyle, impactAsync } from "expo-haptics";

export default function Info({
  isPaused = true,
  isRecording = false,
  isSeeking = false,
  replayEnabled = false,
  showIndicator = false,
  meterItem,
  meterMax = 0,
  meterMin = -160,
  ms = 0,
  duration = 1,
  style: extraStyle,
  goToPosition,
  setInDialMode,
}: {
  isPaused: boolean;
  isRecording?: boolean;
  isSeeking?: boolean;
  meterItem?: Meter;
  meterMax?: number;
  meterMin?: number;
  replayEnabled?: boolean;
  showIndicator?: boolean;
  ms: number;
  duration: number;
  style?: StyleProp<ViewStyle>;
  goToPosition?: (position: number) => void;
  setInDialMode?: (inDialMode: boolean) => void;
}) {
  if (replayEnabled) {
    return playerText({
      isPaused,
      isSeeking,
      ms,
      duration,
      meterItem,
      meterMax,
      meterMin,
      style: extraStyle,
      goToPosition,
      setInDialMode,
    });
  }
  return recorderText({
    isPaused,
    isRecording,
    showIndicator,
    meterItem,
    ms,
    style: extraStyle,
  });
}

const infoStates = {
  recording: {
    text: "RECORDING",
    icon: <Circle size={20} color={style.text1.color} />,
  },
  pausedRecording: {
    text: "PAUSED RECORDING",
    icon: <Circle size={20} color={style.text1.color} />,
  },
  standby: {
    text: "STANDBY",
    icon: <Hexagon size={20} color={style.text1.color} />,
  },
  playing: {
    text: "PLAYING",
    icon: <Triangle size={20} color={style.text1.color} />,
  },
  paused: {
    text: "PAUSED",
    icon: <Square size={20} color={style.text1.color} />,
  },
  seeking: {
    text: "SEEKING",
    icon: <Diamond size={20} color={style.text1.color} />,
  },
};

function recorderText({
  isPaused = true,
  isRecording = false,
  showIndicator = false,
  meterItem,
  ms = 0,
  style: extraStyle,
}: {
  isPaused: boolean;
  isRecording?: boolean;
  meterItem?: Meter;
  showIndicator?: boolean;
  ms: number;
  style?: StyleProp<ViewStyle>;
}) {
  const width = useSharedValue(1);
  const opacity = useSharedValue(1);
  const indicator = useSharedValue(0);

  useEffect(() => {
    if (meterItem != undefined) {
      const last = performance.now();
      const normal = normalizeMeter(ms == -1 ? 0 : meterItem.value);
      if (isRecording && !isPaused) {
        width.value = withTiming((normal ?? 0) * 200, {
          duration: 100 - (performance.now() - last),
        });
      }
    }
  }, [meterItem]);

  useEffect(() => {
    indicator.value = withRepeat(withTiming(1, { duration: 150 }), 2, true);
  }, [showIndicator]);

  useEffect(() => {
    if (isPaused == undefined) {
      opacity.value = 1;
    }
    if (isPaused && isRecording) {
      opacity.value = withRepeat(withTiming(0.25, { duration: 300 }), -1, true);
    } else {
      opacity.value = withTiming(1, { duration: 100 });
    }
  }, [isPaused, isRecording]);

  const infoState =
    isPaused && isRecording
      ? infoStates.pausedRecording
      : isRecording
      ? infoStates.recording
      : infoStates.standby;
  const mainText = infoState.text;
  const icon = infoState.icon;

  return (
    <View style={[styles.info, extraStyle]}>
      <Animated.View style={[styles.statusContainer, { opacity: opacity }]}>
        <View style={styles.status}>
          {icon}
          <Text style={[style.text, styles.infoText]}>{mainText}</Text>
        </View>
        <Animated.View style={[styles.indicator, { opacity: indicator }]}>
          <Diamond size={20} color={style.text1.color} />
        </Animated.View>
      </Animated.View>
      <View style={styles.textContainer}>
        {isRecording ? (
          <>
            <Text style={[style.text, styles.subInfoText]}>
              {getTimestamp(ms)}
            </Text>
            <Text style={[style.text, styles.subInfoText]}>|</Text>
            <View style={styles.meterContainer}>
              <Animated.View
                style={[
                  styles.meter,
                  {
                    width: width,
                  },
                ]}
              />
            </View>
          </>
        ) : (
          <Text
            style={[
              style.text,
              styles.subInfoText,
              { color: style.text3.color },
            ]}
          >
            44.1 kHz | 128 kbps
          </Text>
        )}
      </View>
    </View>
  );
}

function playerText({
  isPaused = true,
  isSeeking = false,
  ms = 0,
  duration = 1,
  meterItem,
  meterMax = 0,
  meterMin = -160,
  style: extraStyle,
  goToPosition,
  setInDialMode,
}: {
  isPaused: boolean;
  isSeeking: boolean;
  ms: number;
  duration: number;
  meterItem?: Meter;
  meterMax?: number;
  meterMin?: number;
  style?: StyleProp<ViewStyle>;
  goToPosition?: (position: number) => void;
  setInDialMode?: (inDialMode: boolean) => void;
}) {
  const [isDialOpen, setIsDialOpen] = useState(false);
  const [dialOffset, setDialOffset] = useState(0);
  const [position, setPosition] = useState(0);
  const contentWidth = 11;

  const textOpacity = useSharedValue(1);

  useEffect(() => {
    if (isSeeking) {
      textOpacity.value = withRepeat(
        withTiming(0.25, { duration: 300 }),
        -1,
        true
      );
    } else {
      textOpacity.value = withTiming(1, { duration: 100 });
    }
  }, [isSeeking]);

  const infoState = isSeeking
    ? infoStates.seeking
    : isPaused
    ? infoStates.paused
    : infoStates.playing;
  const mainText = infoState.text;
  const icon = infoState.icon;

  const barCount = duration / 100;
  const bars = Array.from({ length: barCount });

  const sliderRef = useRef<FlatList>(null);

  const onScrollEnd = useCallback(async (e: NativeScrollEvent) => {
    const diffTime = (e.contentOffset.x * 100) / contentWidth;
    setPosition(diffTime);
  }, []);

  const openDial = () => {
    setInDialMode && setInDialMode(true);
    setIsDialOpen(true);
  };

  const closeDial = () => {
    setInDialMode && setInDialMode(false);
    setIsDialOpen(false);
  };

  useEffect(() => {
    if (!isPaused && isDialOpen) {
      closeDial();
    }
  }, [isPaused]);

  useEffect(() => {
    if (goToPosition) {
      goToPosition(position);
    }
  }, [position]);

  const seekStartPos = useMemo(() => {
    return (ms / 100) * contentWidth;
  }, [ms]);

  if (isDialOpen && isPaused) {
    return (
      <View style={[styles.info, extraStyle]}>
        <LinearGradient
          colors={["#000000", "transparent", "#000000"]}
          start={[0, 0]}
          end={[1, 0]}
          style={styles.dialOverlay}
        >
          <Triangle
            size={10}
            color={style.text2.color}
            // fill={style.text2.color}
            style={{
              marginTop: 6,
              transform: [{ rotate: "180deg" }],
            }}
          />
          <Triangle
            size={10}
            color={style.text2.color}
            // fill={style.text2.color}
            style={{
              marginBottom: 6,
            }}
          />
        </LinearGradient>
        <FlatList
          horizontal
          data={bars}
          ref={sliderRef}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          getItemLayout={(_, index) => ({
            length: contentWidth,
            offset: contentWidth * index,
            index,
          })}
          contentContainerStyle={{
            alignItems: "center",
            marginBottom: -12,
          }}
          onMomentumScrollEnd={(e) => {
            onScrollEnd(e.nativeEvent);
          }}
          onLayout={() => {
            sliderRef.current?.scrollToOffset({
              offset: seekStartPos,
              animated: true,
            });
          }}
          ListHeaderComponent={() => {
            return (
              <Pressable
                onLongPress={() => {
                  impactAsync(ImpactFeedbackStyle.Light);
                  closeDial();
                }}
                style={{ width: dialOffset, height: "100%" }}
              />
            );
          }}
          ListFooterComponent={() => {
            return (
              <Pressable
                onLongPress={() => {
                  impactAsync(ImpactFeedbackStyle.Light);
                  closeDial();
                }}
                style={{ width: dialOffset, height: "100%" }}
              />
            );
          }}
          renderItem={({ index }) => {
            return (
              <Pressable
                onLongPress={() => {
                  impactAsync(ImpactFeedbackStyle.Light);
                  closeDial();
                }}
                delayLongPress={pressDelay}
                style={styles.barContainer}
              >
                <View
                  style={[
                    styles.bar,
                    index % 10 === 0 ? { height: 42 } : { height: 28 },
                  ]}
                ></View>
                {index % 10 === 0 && (
                  <Text style={styles.barTimestamp}>
                    {getTimestamp((index / barCount) * duration)}
                  </Text>
                )}
              </Pressable>
            );
          }}
        />
      </View>
    );
  }

  return (
    <Pressable
      onLongPress={() => {
        impactAsync(ImpactFeedbackStyle.Light);
        openDial();
      }}
      delayLongPress={pressDelay}
    >
      <View
        style={[
          styles.info,
          {
            flexDirection: "row",
            alignItems: "center",
          },
          extraStyle,
        ]}
        onLayout={(e) => {
          setDialOffset(e.nativeEvent.layout.width / 2 - 37.5);
        }}
      >
        <View style={{ flexDirection: "column" }}>
          <View style={styles.statusContainer}>
            <View style={styles.status}>
              {icon}
              <Text style={[style.text, styles.infoText]}>{mainText}</Text>
            </View>
          </View>
          <View style={styles.textContainer}>
            <Text style={[style.text, styles.subInfoText]}>
              {getTimestamp(ms)}
            </Text>
            <Text style={[style.text, styles.subInfoText]}>|</Text>
            <Text
              style={[
                style.text,
                styles.subInfoText,
                { color: style.text3.color },
              ]}
            >
              {getTimestamp(duration)}
            </Text>
          </View>
        </View>
        <CircularProgress
          rotation={220}
          angle={280}
          fill={
            ms == duration || ms == 0
              ? 100
              : normalizeMeter(meterItem?.value, meterMax, meterMin) * 100
          }
        />
        <CircularProgress
          rotation={220}
          angle={280}
          fill={
            ms == 0
              ? 100
              : Number.isNaN((ms / duration) * 100)
              ? 0
              : (ms / duration) * 100
          }
        />
      </View>
    </Pressable>
  );
}

function CircularProgress({
  fill,
  extraStyle,
  angle = 360,
  rotation = 0,
}: {
  fill: number;
  extraStyle?: ViewStyle;
  angle?: number;
  rotation?: number;
}) {
  return (
    <View style={extraStyle}>
      <AnimatedCircularProgress
        fill={fill}
        easing={Easing.linear}
        rotation={rotation}
        duration={100}
        arcSweepAngle={angle}
        size={48}
        width={2}
        backgroundWidth={3}
        lineCap="round"
        tintColor={style.text1.color}
        backgroundColor={style.base2.color}
        style={{ marginRight: -8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  info: {
    position: "relative",
    height: 96,
    width: "100%",
    borderRadius: 100,
    backgroundColor: "black",
    alignItems: "flex-start",
    flexDirection: "column",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  dialOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 100,
    zIndex: 1,
    pointerEvents: "none",
    alignItems: "center",
    justifyContent: "space-between",
  },
  barContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    height: 42,
  },
  bar: {
    width: 3,
    backgroundColor: style.text2.color,
    borderRadius: 100,
    position: "relative",
    overflow: "visible",
  },
  barTimestamp: {
    ...style.text,
    ...style.text2,
    fontSize: 12,
    position: "absolute",
    width: 38,
    top: -16,
    left: -14,
    textAlign: "center",
  },
  statusContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  status: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
  },
  textContainer: {
    height: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 20,
  },
  subInfoText: {
    fontSize: 16,
  },
  indicator: {
    opacity: 0,
  },
  meterContainer: { flex: 1, overflow: "hidden", borderRadius: 100 },
  meter: {
    height: 16,
    backgroundColor: style.text1.color,
    borderRadius: 100,
  },
});
