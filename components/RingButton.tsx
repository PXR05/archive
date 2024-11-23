import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import React from "react";
import { pressDelay, style } from "../utils/styles";
import * as Haptics from "expo-haptics";

export default function RingButton({
  icon,
  onPress,
  onLongPress,
  onPressIn,
  onPressOut,
  size,
  ringWidth,
  style: extraStyle,
  color = style.base2.color,
}: {
  icon: React.ReactNode;
  onPress: () => any;
  onLongPress?: () => any;
  onPressIn?: () => any;
  onPressOut?: () => any;
  size?: number;
  ringWidth?: number;
  style?: ViewStyle;
  color?: string;
}) {
  const styles = StyleSheet.create({
    button: {
      borderRadius: 100,
      borderColor: color,
      borderWidth: ringWidth ?? 4,
      justifyContent: "center",
      alignItems: "center",
      height: size ?? 62,
      width: size ?? 62,
    },
    subButton: {},
  });

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[styles.button, styles.subButton, extraStyle ?? {}]}
      delayLongPress={pressDelay}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      onLongPress={() => {
        if (onLongPress) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onLongPress();
        }
      }}
      onPressIn={() => {
        if (onPressIn) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPressIn();
        }
      }}
      onPressOut={() => {
        if (onPressOut) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPressOut();
        }
      }}
    >
      {icon}
    </TouchableOpacity>
  );
}

export function Buttons({ children }: { children: React.ReactElement[] }) {
  const styles = StyleSheet.create({
    buttons: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      alignItems: "center",
      width: "100%",
    },
  });

  return <View style={styles.buttons}>{children}</View>;
}
