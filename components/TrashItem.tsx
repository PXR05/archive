import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import { pressDelay, style } from "../utils/styles";
import { Undo2, Trash2, Circle } from "lucide-react-native";
import { useState } from "react";

export default function ListItem({
  item,
  style: extraStyle,
  selected,
  onLongPress,
  onRemoveSelected,
  onRestoreClick,
  onDeleteClick,
}: {
  item: Log;
  style?: StyleProp<ViewStyle>;
  selected: Log[];
  onLongPress?: (data: Log) => void;
  onRemoveSelected?: (data: Log) => void;
  onRestoreClick?: (data: Log) => void;
  onDeleteClick?: (data: Log) => void;
}) {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[styles.item, extraStyle ?? {}]}
      delayLongPress={pressDelay}
      onLongPress={() => {
        if (onLongPress) {
          setIsSelected(true);
          onLongPress(item);
        }
      }}
      onPress={() => {
        if (isSelected) {
          if (onRemoveSelected) {
            setIsSelected(false);
            onRemoveSelected(item);
          }
        } else if (selected.length > 0) {
          if (onLongPress) {
            setIsSelected(true);
            onLongPress(item);
          }
        }
      }}
    >
      <View style={[styles.textContainer, { opacity: isSelected ? 0.5 : 1 }]}>
        <Text numberOfLines={1} style={[style.text, styles.title]}>
          {item.title}
        </Text>
        <Text style={[style.text, styles.date]}>
          {new Date(item.date).toLocaleString().replace(",", " -")}
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 20,
          paddingRight: 12,
        }}
      >
        {selected.length > 0 ? (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              if (isSelected) {
                if (onRemoveSelected) {
                  setIsSelected(false);
                  onRemoveSelected(item);
                }
              } else {
                if (onLongPress) {
                  setIsSelected(true);
                  onLongPress(item);
                }
              }
            }}
          >
            <Circle
              fill={style.text1.color}
              fillOpacity={isSelected ? 1 : 0}
              color={isSelected ? style.text1.color : style.text3.color}
              size={24}
            />
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => {
                if (onRestoreClick) {
                  onRestoreClick(item);
                }
              }}
            >
              <Undo2 color={style.text3.color} size={24} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => {
                if (onDeleteClick) {
                  onDeleteClick(item);
                }
              }}
            >
              <Trash2 color={style.text3.color} size={24} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 4,
  },
  title: {
    fontSize: 20,
  },
  date: {
    fontSize: 12,
    color: style.text3.color,
  },
  options: {
    marginRight: 24,
    width: 4,
    height: 46,
    borderRadius: 100,
    backgroundColor: style.text3.color,
  },
});
