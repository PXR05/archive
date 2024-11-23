import { Dimensions, StyleSheet } from "react-native";

export const style = StyleSheet.create({
  bg: {
    color: "black",
  },
  base1: {
    color: "#111111",
  },
  base2: {
    color: "#2a2a2a",
  },
  text1: {
    color: "#ededed",
  },
  text2: {
    color: "#b8b8b8",
  },
  text3: {
    color: "#7f7f7f",
  },
  text: {
    color: "#ededed",
    fontFamily: "JetBrainsMono_400Regular",
  },
  page: {
    flex: 1,
    backgroundColor: "black",
    paddingHorizontal: 8,
  },
  top: {
    position: "relative",
    flex: 1,
    gap: 8,
    marginTop: 8,
  },
  recorderContainer: {
    width: Dimensions.get("window").width - 16,
    height: Dimensions.get("window").width - 16,
    alignItems: "center",
    justifyContent: "space-evenly",
    backgroundColor: "#111",
    borderRadius: 48,
    marginVertical: 8,
  },
});

export const pressDelay = 300;
