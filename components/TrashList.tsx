import { View, Text, FlatList, Dimensions, StyleSheet } from "react-native";
import React from "react";
import { style } from "../utils/styles";
import TrashItem from "./TrashItem";

export default function TrashList({
  data,
  selected,
  setSelected,
  onDeleteClick,
  onRestoreClick,
}: {
  data: Log[];
  selected: Log[];
  setSelected?: (data: Log[]) => void;
  onDeleteClick?: (data: Log) => void;
  onRestoreClick?: (data: Log) => void;
}) {
  const onLongPress = (item: Log) => {
    if (setSelected) {
      setSelected(selected.concat(item));
    }
  };

  const onRemoveSelected = (item: Log) => {
    if (setSelected) {
      setSelected(selected.filter((i) => i.id !== item.id));
    }
  };

  return (
    <>
      {data.length > 0 ? (
        <FlatList
          data={data}
          ItemSeparatorComponent={() => <View style={{ height: 32 }} />}
          renderItem={({ item, index }) => {
            return (
              <View
                style={{
                  paddingTop: index == 0 ? 28 : 0,
                  paddingBottom: index == data.length - 1 ? 64 : 0,
                }}
              >
                <TrashItem
                  item={item}
                  selected={selected}
                  onLongPress={(item) => onLongPress(item)}
                  onRemoveSelected={(item) => onRemoveSelected(item)}
                  onRestoreClick={(data) =>
                    onRestoreClick && onRestoreClick(data)
                  }
                  onDeleteClick={(data) => onDeleteClick && onDeleteClick(data)}
                />
              </View>
            );
          }}
        />
      ) : (
        <Text style={[style.text, styles.text]}>No trashed log</Text>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
    color: style.text2.color,
    textAlign: "center",
    paddingTop: Dimensions.get("window").height / 2 - 64,
  },
});
