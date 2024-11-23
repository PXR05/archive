import {
  View,
  Text,
  FlatList,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { style } from "../utils/styles";
import ListItem from "./ListItem";
import { Trash } from "lucide-react-native";
import { router } from "expo-router";

export default function List({
  data,
  openModal,
}: {
  data: Log[];
  openModal?: (data: Log) => void;
}) {
  return (
    <View style={{ paddingLeft: 12 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingRight: 12,
        }}
      >
        <Text style={[style.text, { fontSize: 32 }]}>Archive</Text>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => {
            router.push({ pathname: "/trash" });
          }}
        >
          <Trash size={24} color={style.text2.color} />
        </TouchableOpacity>
      </View>
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
                <ListItem
                  item={item}
                  openModal={(data) => openModal && openModal(data)}
                />
              </View>
            );
          }}
        />
      ) : (
        <Text style={[style.text, styles.text]}>No log recoded</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
    color: style.text2.color,
    textAlign: "center",
    paddingTop:
      (Dimensions.get("window").height - Dimensions.get("window").width) / 2 -
      16,
  },
});
