import { Audio } from "expo-av";
import { View } from "react-native";
import { Circle, Square, Pause, Play, Diamond } from "lucide-react-native";
import React, { useState } from "react";
import { style } from "../utils/styles";
import RingButton, { Buttons } from "./RingButton";
import Info from "./Info";
import { mGetNewId } from "../utils/fileManager";

export default function Recorder({
  addData,
  setStatus,
}: {
  addData: (item: Log) => void;
  setStatus: (status: boolean) => void;
}) {
  const [buffer, setBuffer] = useState<Audio.Recording | undefined>();
  const [markers, setMarkers] = useState<number[]>([]);
  const [meters, setMeters] = useState<Meter[]>([]);
  const [currentMeter, setCurrentMeter] = useState<Meter>();
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [showIndicator, setShowIndicator] = useState<boolean | undefined>();

  async function startRecording() {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const temp: Meter[] = [];
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY,
          async ({ metering, durationMillis, uri }) => {
            if (duration == durationMillis) {
              return;
            }
            setDuration(durationMillis);
            setCurrentMeter({ time: durationMillis, value: metering ?? -160 });
            temp.push({ time: durationMillis, value: metering ?? -160 });
          },
          100
        );

        setMeters(temp);
        setTimeout(() => {
          setIsLoading(false);
        }, 100);
        setBuffer(recording);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function stopRecording() {
    await buffer!.stopAndUnloadAsync();
    await buffer!.createNewLoadedSoundAsync();

    const id = await mGetNewId();

    addData({
      id: id,
      title: "Log " + id,
      path: buffer!.getURI(),
      date: Date.now(),
      duration: (await buffer!.getStatusAsync())!.durationMillis,
      markers: markers.map((m) => {
        return {
          time: m,
          text: "",
        };
      }),
      meters: meters,
    });

    setTimeout(() => {
      setIsLoading(false);
    }, 100);
    setDuration(-1);
    setBuffer(undefined);
  }

  async function onRecord() {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    if (!isRecording) {
      setMarkers([]);
      setStatus(true);
      await startRecording();
      // await v.start();
      setIsRecording(true);
      setIsPaused(false);
    } else {
      setStatus(false);
      await stopRecording();
      // await v.stop();
      setIsRecording(false);
      setIsPaused(true);
      setShowIndicator(undefined);
    }
  }

  async function onPaused() {
    if (isLoading) {
      return;
    }
    if (isPaused) {
      setIsLoading(true);
      await buffer?.startAsync();
      // await v.start();
      setTimeout(() => {
        setIsLoading(false);
        setIsPaused(false);
      }, 100);
    } else {
      setIsLoading(true);
      await buffer?.pauseAsync();
      // await v.stop();
      setTimeout(() => {
        setIsLoading(false);
        setIsPaused(true);
      }, 100);
    }
  }

  function addMarker() {
    if (markers.includes(duration) && isLoading) {
      return;
    }
    setMarkers(markers.concat(duration));
    setShowIndicator(showIndicator ? !showIndicator : true);
  }

  return (
    <View style={style.recorderContainer}>
      <View style={{ width: "100%", paddingHorizontal: 24 }}>
        <Info
          isPaused={isPaused}
          isRecording={isRecording}
          showIndicator={showIndicator}
          meterItem={currentMeter}
          ms={duration}
          duration={duration}
        />
      </View>
      <Buttons>
        {isRecording ? (
          <RingButton
            onPress={onPaused}
            icon={
              isPaused ? (
                <Play
                  style={{ marginLeft: 4 }}
                  size={24}
                  color={style.text1.color}
                  fill={style.text1.color}
                />
              ) : (
                <Pause
                  size={28}
                  color={"transparent"}
                  fill={style.text1.color}
                />
              )
            }
          />
        ) : (
          <View />
        )}
        <RingButton
          size={160}
          ringWidth={5}
          onPress={onRecord}
          icon={
            isRecording ? (
              <Square size={36} fill={"#FF334C"} color={"#FF334C"} />
            ) : (
              <Circle size={36} fill={"#FF334C"} color={"#FF334C"} />
            )
          }
        />
        {isRecording ? (
          <RingButton
            onPress={addMarker}
            icon={
              <Diamond
                size={20}
                color={style.text1.color}
                fill={style.text1.color}
              />
            }
          />
        ) : (
          <View />
        )}
      </Buttons>
    </View>
  );
}
