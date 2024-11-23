import { View, StyleSheet } from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pause,
  Play,
  Rewind,
  FastForward,
  RotateCcw,
  Diamond,
  TextCursor,
} from "lucide-react-native";
import { AVPlaybackStatus, Audio } from "expo-av";
import RingButton, { Buttons } from "./RingButton";
import { style } from "../utils/styles";
import Info from "./Info";
import { useInterval } from "../utils/useInterval";

export default function Player({
  data,
  seekTo,
  addMarker,
  openDialog,
  setModalData,
}: {
  data: Log;
  seekTo: number;
  addMarker: (mark: Marker) => void;
  openDialog: () => void;
  setModalData: (data: TranscriptSegment) => void;
}) {
  const [audio, setAudio] = useState<Audio.Sound>();
  const [isPaused, setIsPaused] = useState(true);
  const [wasPaused, setWasPaused] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [inDialMode, setInDialMode] = useState(false);
  const [seekAmount, setSeekAmount] = useState<number | undefined>();
  const [currentMeter, setCurrentMeter] = useState<Meter>();
  const [duration, setDuration] = useState(1);
  const [position, setPosition] = useState(0);

  const markers = useMemo(
    () =>
      [
        ...(data.markers ?? []),
        ...(data.transcript ?? []).map((t) => t.t1),
      ].sort((a, b) => a.time - b.time),
    [data.markers, data.transcript]
  );

  const metersSpread = useMemo(
    () => data.meters?.map((m) => m.value) ?? [],
    [data.meters]
  );

  async function loadAudio() {
    const { sound, status } = await Audio.Sound.createAsync(
      {
        uri: data.path!,
      },
      {},
      (status) => {}
    );
    setAudio(sound);
    if (status.isLoaded) {
      setDuration(status.durationMillis!);
    }
  }

  async function goToPosition(target: number | undefined) {
    if (audio == undefined || target == undefined) {
      return;
    }
    const { isLoaded } = await audio.setPositionAsync(target);
    if (isLoaded) {
      handlePositionChange(await audio.getStatusAsync());
    }
  }

  async function goToMarker(backward?: boolean) {
    if (markers.length == 0) {
      return;
    }
    let nextIndex;
    const len = markers.length;
    const tolerance = 500;
    for (let i = 0; i < len; i++) {
      const mark = markers[i];
      // Backward
      if (backward) {
        // Can go back more even after last marker
        if (i == len - 1 && mark.time > position - tolerance) {
          nextIndex = i - 1;
          break;
        }
        // Can go back even after last marker
        if (i == len - 1 && mark.time < position) {
          nextIndex = i;
          break;
        }
        // Can go back
        if (mark.time > position - tolerance) {
          nextIndex = i - 1;
          break;
        }
      }
      // Forward
      if (mark.time > position) {
        nextIndex = i;
        break;
      }
    }
    if (nextIndex == undefined || nextIndex < 0 || nextIndex > len - 1) {
      return;
    }
    goToPosition(markers[nextIndex].time);
  }

  function handlePositionChange(status: AVPlaybackStatus) {
    if (status.isLoaded) {
      if (position !== status.positionMillis) {
        setPosition(status.positionMillis);
      }
      if (status.positionMillis >= status.durationMillis!) {
        setIsPaused(true);
        setIsFinished(true);
      }
    }
  }

  async function playAudio() {
    try {
      isFinished ? await audio!.replayAsync() : await audio!.playAsync();
      if (isFinished) {
        setIsFinished(false);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function pauseAudio() {
    try {
      const status = await audio!.pauseAsync();
      if (status.isLoaded) {
        setPosition(status.positionMillis);
      }
    } catch (error) {
      console.log(error);
    }
  }

  function canSeek() {
    return (
      audio != undefined &&
      duration > 0 &&
      seekAmount != undefined &&
      position + seekAmount >= 0 &&
      position + seekAmount <= duration
    );
  }

  function canSeekSnap() {
    return seekAmount != undefined && position != 0 && position != duration;
  }

  // ! Runs every 100ms to update position and seek. Not very efficient.
  useInterval(() => {
    audio?.getStatusAsync().then((status) => {
      handlePositionChange(status);
    });
    if (canSeek()) {
      goToPosition(position + seekAmount!);
    } else if (canSeekSnap()) {
      goToPosition(position + seekAmount! < 0 ? 0 : duration);
    }
  }, 100);

  async function startSeeking(amount: number) {
    // is playing
    if (!isPaused) {
      await pauseAudio();
    }
    setSeekAmount(amount);
  }

  function stopSeeking() {
    setSeekAmount(undefined);
    // was playing before seeking (state does not change during seeking)
    if (!isPaused) {
      playAudio();
    }
  }

  const mark = useCallback(async () => {
    if (markers.some((m) => m.time === position && m.text == "")) {
      return;
    }
    addMarker({
      time: position,
      text: "",
    });
  }, [position, markers]);

  const markWithText = useCallback(async () => {
    if (markers.some((m) => m.time === position && m.text == "")) {
      return;
    }
    setModalData({
      t0: { time: position, text: "" },
      t1: { time: position, text: "" },
      text: "",
    });
    openDialog();
  }, [position, markers]);

  useEffect(() => {
    loadAudio();

    return () => {
      audio && audio.unloadAsync();
    };
  }, []);

  useEffect(() => {
    goToPosition(seekTo);
  }, [seekTo]);

  useEffect(() => {
    const temp = data.meters?.filter((meter) => meter.time <= position);
    if (temp == undefined) {
      return;
    }
    setCurrentMeter(temp[temp.length - 1] ?? { time: 0, value: -160 });
  }, [position]);

  useEffect(() => {
    if (inDialMode) {
      setWasPaused(isPaused);
      if (!isPaused) {
        pauseAudio();
        setIsPaused(true);
      }
    } else {
      if (!wasPaused) {
        playAudio();
        setIsPaused(false);
      }
    }
  }, [inDialMode]);

  return (
    <View style={style.recorderContainer}>
      <View style={{ width: "100%", paddingHorizontal: 24 }}>
        <Info
          isPaused={isPaused}
          isSeeking={seekAmount != undefined}
          replayEnabled={true}
          meterItem={currentMeter}
          meterMax={Math.max(...metersSpread)}
          meterMin={Math.min(...metersSpread)}
          ms={position}
          duration={duration}
          goToPosition={goToPosition}
          setInDialMode={setInDialMode}
        />
      </View>
      <Buttons>
        {inDialMode ? (
          <RingButton
            onPress={() => markWithText()}
            icon={
              <TextCursor
                size={20}
                strokeWidth={2.5}
                color={style.text1.color}
              />
            }
          />
        ) : (
          <RingButton
            style={{ paddingRight: 2 }}
            onPress={() => goToMarker(true)}
            onLongPress={() => startSeeking(-250)}
            onPressOut={() => stopSeeking()}
            icon={
              <Rewind
                size={20}
                color={style.text1.color}
                fill={style.text1.color}
              />
            }
          />
        )}
        <RingButton
          size={160}
          ringWidth={5}
          icon={
            isPaused ? (
              <Play
                style={{ marginLeft: 4 }}
                size={36}
                color={style.text1.color}
                fill={style.text1.color}
              />
            ) : (
              <Pause size={42} color={"transparent"} fill={style.text1.color} />
            )
          }
          onPress={async () => {
            if (isPaused) {
              playAudio();
            } else {
              pauseAudio();
            }
            setIsPaused(!isPaused);
          }}
        />
        {inDialMode ? (
          <RingButton
            onPress={() => mark()}
            icon={
              <Diamond
                size={20}
                color={style.text1.color}
                fill={style.text1.color}
              />
            }
          />
        ) : (
          <RingButton
            style={{ paddingLeft: 4 }}
            onPress={() => goToMarker()}
            onLongPress={() => startSeeking(250)}
            onPressOut={() => stopSeeking()}
            icon={
              <FastForward
                size={20}
                color={style.text1.color}
                fill={style.text1.color}
              />
            }
          />
        )}
      </Buttons>
    </View>
  );
}
