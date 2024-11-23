import { View, Text, StyleSheet, Pressable, Modal } from "react-native";
import React, {
  ForwardedRef,
  MutableRefObject,
  forwardRef,
  useEffect,
} from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import Animated from "react-native-reanimated";
import { Minus } from "lucide-react-native";
import { ModalProps } from "./ModalItem";
import { pressDelay, style } from "../utils/styles";
import { getTimestamp } from "../utils/functions";
import { useSharedValue, withTiming } from "react-native-reanimated";

export const Dialog = ({
  children,
  isVisible,
  onDismiss,
}: {
  children: React.ReactElement<ModalProps>[] | React.ReactElement<ModalProps>;
  isVisible: boolean;
  onDismiss: () => void;
}) => {
  const styles = StyleSheet.create({
    container: {
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    overlay: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 0,
      backgroundColor: "#0000007b",
    },
    childrenContainer: {
      position: "absolute",
      width: "80%",
      top: "40%",
      left: "10%",
      backgroundColor: style.base1.color,
      borderRadius: 24,
    },
  });

  return (
    <Modal
      style={styles.container}
      animationType="slide"
      transparent={true}
      visible={isVisible}
    >
      <Pressable style={styles.overlay} onPress={onDismiss} />
      <View style={styles.childrenContainer}>{children}</View>
    </Modal>
  );
};

export const Sheet = forwardRef(function (
  {
    children,
    data,
    resetData,
    isInput = false,
  }: {
    children: React.ReactElement<ModalProps>[] | React.ReactElement<ModalProps>;
    data: any | undefined;
    resetData?: () => void;
    isInput?: boolean;
  },
  ref: ForwardedRef<BottomSheetModal>
) {
  const styles = StyleSheet.create({
    overlay: {
      backgroundColor: "#000",
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 0,
    },
    overlayButton: {
      width: "100%",
      height: "100%",
      flex: 1,
    },
  });

  const withProps = Array.isArray(children)
    ? children.map((child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { data });
        }
        return child;
      })
    : React.cloneElement(children, { data });

  const sheetRef = ref as MutableRefObject<BottomSheetModal>;

  let child = (
    <BottomSheet
      children={withProps}
      title={data?.title ?? getTimestamp(data?.t0.time ?? "0") ?? ""}
    />
  );
  if (isInput) {
    child = <BottomSheet children={withProps} />;
  }

  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (data) {
      overlayOpacity.value = withTiming(0.5, { duration: pressDelay });
    } else {
      overlayOpacity.value = withTiming(0, { duration: pressDelay / 2 });
    }
  }, [data]);

  return (
    <>
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: overlayOpacity,
            pointerEvents: data ? "auto" : "none",
          },
        ]}
      >
        <Pressable
          style={styles.overlayButton}
          onPress={() => {
            sheetRef.current?.dismiss();
            resetData?.();
          }}
        />
      </Animated.View>
      <BottomSheetModal
        ref={sheetRef}
        index={0}
        snapPoints={["32.5%"]}
        enableOverDrag={false}
        backgroundStyle={{ backgroundColor: "transparent" }}
        handleStyle={{ display: "none" }}
        onDismiss={resetData}
      >
        {child}
      </BottomSheetModal>
    </>
  );
});

function BottomSheet({
  title,
  children,
}: {
  title?: string;
  children: React.ReactElement | React.ReactElement[];
}) {
  const styles = StyleSheet.create({
    modal: {
      zIndex: 1,
      bottom: 0,
      gap: 8,
      height: "100%",
      backgroundColor: style.base1.color,
    },
    titleText: {
      fontSize: 24,
      textAlign: "center",
      paddingTop: 16,
      paddingBottom: 8,
    },
    handle: {
      height: 32,
      alignItems: "center",
      justifyContent: "center",
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      backgroundColor: style.base1.color,
    },
    itemContainer: {
      flex: 1,
      backgroundColor: style.base1.color,
      paddingVertical: 8,
      paddingHorizontal: 24,
      gap: 32,
    },
  });

  return (
    <>
      <View style={styles.handle}>
        <Minus style={{ marginTop: 12 }} color={style.text2.color} />
      </View>
      <View style={styles.modal}>
        {title && <Text style={[style.text, styles.titleText]}>{title}</Text>}
        <View style={styles.itemContainer}>{children}</View>
      </View>
    </>
  );
}
