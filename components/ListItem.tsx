import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import { pressDelay, style } from "../utils/styles";
import { router } from "expo-router";
import { useContext } from "react";
import { PageDataContext } from "../utils/contexts";

export default function ListItem({
  item,
  style: extraStyle,
  openModal,
}: {
  item: Log;
  style?: StyleProp<ViewStyle>;
  openModal?: (data: Log) => void;
}) {
  const { setPageData } = useContext(PageDataContext) as PageDataContextType;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[styles.item, extraStyle ?? {}]}
      onPress={() => {
        setPageData(item);
        router.push({
          pathname: `/record/${item.id}`,
        });
      }}
      delayLongPress={pressDelay}
      onLongPress={() => {
        if (openModal) {
          openModal(item);
        }
      }}
    >
      <View style={styles.textContainer}>
        <Text numberOfLines={1} style={[style.text, styles.title]}>
          {item.title}
        </Text>
        <Text style={[style.text, styles.date]}>
          {new Date(item.date).toLocaleString().replace(",", " -")}
        </Text>
      </View>
      <TouchableOpacity
        activeOpacity={0.75}
        style={{ width: 32, marginRight: -8, alignItems: "flex-end" }}
        onPress={() => {
          if (openModal) {
            openModal(item);
          }
        }}
      >
        <View style={styles.options}></View>
      </TouchableOpacity>
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
