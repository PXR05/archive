import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import { style } from "../utils/styles";

export interface ModalProps {
  icon?: React.ReactNode;
  data?: Log | Log[];
  defaultValue?: string;
  label?: string;
  disabled?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  onPress?: (data?: Log | undefined) => any;
  onConfirm?: (data?: Log | Log[], inputValue?: string | undefined) => any;
  onCancel?: () => void;
}

export function ModalItem({
  icon,
  label,
  data,
  onPress,
  disabled,
}: ModalProps): React.ReactElement<ModalProps> {
  return (
    <TouchableOpacity
      disabled={disabled}
      activeOpacity={0.75}
      style={[styles.itemContainer, { opacity: disabled ? 0.5 : 1 }]}
      onPress={async () => (onPress ? await onPress(data as Log) : {})}
    >
      {icon && icon}
      <Text style={[style.text, styles.text]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function ModalInput({
  data,
  defaultValue,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ModalProps): React.ReactElement<ModalProps> {
  const [text, setText] = useState(defaultValue ?? "");

  return (
    <View style={styles.container}>
      <TextInput
        style={[style.text, styles.input]}
        defaultValue={defaultValue}
        onChangeText={(t) => setText(t)}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity activeOpacity={0.75} onPress={onCancel}>
          <Text style={[style.text, styles.button]}>{cancelLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => onConfirm && onConfirm(data, text)}
        >
          <Text style={[style.text, styles.button]}>{confirmLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function ModalAlert({
  data,
  label,
  onConfirm,
  onCancel,
}: ModalProps): React.ReactElement<ModalProps> {
  return (
    <View
      style={{
        padding: 32,
        gap: 24,
      }}
    >
      <Text
        style={[
          style.text,
          {
            fontSize: 16,
          },
        ]}
      >
        {label}
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity activeOpacity={0.75} onPress={onCancel}>
          <Text style={[style.text, styles.button]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => onConfirm && onConfirm(data)}
        >
          <Text style={[style.text, styles.button]}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 32,
    paddingVertical: 32,
    gap: 42,
  },
  itemContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  text: {
    fontSize: 20,
  },
  input: {
    fontSize: 20,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: style.bg.color,
    borderRadius: 100,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  button: {
    fontSize: 18,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
  },
});
