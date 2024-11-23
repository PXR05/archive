import { FlatList, StyleSheet, Text, View, Dimensions } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { style } from "../utils/styles";
import {
  TranscriptItem,
  Marker,
  TextSegment,
  MeterSegment,
} from "./TranscriptItem";

export default function Transcript({
  data,
  modalData,
  onMarkerPress,
  onLongPress,
}: {
  data: Log;
  modalData?: TranscriptSegment;
  onMarkerPress: (position: number) => void;
  onLongPress?: (data: TranscriptSegment) => void;
}) {
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);

  const segMarkers = useMemo(() => {
    return data.markers!.map((mark) => {
      return {
        t0: mark,
        t1: mark,
        text: "|Mark|",
        meter: data.meters!.find((m) => m.time === mark.time),
      };
    });
  }, [data.markers, data.meters]);

  useEffect(() => {
    setTranscript(data.transcript ?? []);
  }, [data.transcript]);

  // const segMeters = useMemo(() => {
  //   return data.meters!.map((m) => {
  //     return {
  //       t0: { time: m.time, text: "" },
  //       t1: { time: m.time, text: "" },
  //       text: "|Meter|",
  //       meter: m,
  //     };
  //   });
  // }, [data.meters]);

  const combined = useMemo(() => {
    return transcript.concat(segMarkers).sort((a, b) => a.t0.time - b.t0.time);
  }, [transcript, segMarkers]);

  if (combined.length === 0) {
    return (
      <View>
        <Text style={[style.text, styles.text]}>...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={combined}
      scrollEnabled={modalData ? false : true}
      contentContainerStyle={[styles.listContainer]}
      renderItem={({ item, index: i }) => {
        return (
          <TranscriptItem
            item={item}
            style={
              modalData
                ? {
                    opacity: modalData === item ? 1 : 0.5,
                  }
                : i == combined.length - 1
                ? { marginBottom: 48 }
                : {}
            }
            onPress={() => {
              onMarkerPress(item.t0.time);
            }}
            onLongPress={(data) => {
              onLongPress && onLongPress(data);
            }}
          >
            {item.text === "|Mark|" ? (
              <Marker
                mark={item.t0 as Marker}
                meter={item.meter}
                max={Math.max(...data.meters.map((m) => m.value))}
                min={Math.min(...data.meters.map((m) => m.value))}
                duration={data.duration}
              />
            ) : item.text === "|Meter|" ? (
              <MeterSegment
                item={item.meter!}
                max={Math.max(...data.meters.map((m) => m.value))}
                min={Math.min(...data.meters.map((m) => m.value))}
              />
            ) : (
              <TextSegment item={item} />
            )}
          </TranscriptItem>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 12,
    paddingVertical: 32,
    gap: 24,
  },
  inProgress: {
    gap: 8,
    height: "90%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 20,
    color: style.text2.color,
    textAlign: "center",
    paddingTop:
      (Dimensions.get("window").height - Dimensions.get("window").width) / 2 -
      16,
  },
});
