import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import Player from "../../../components/Player";
import Transcript from "../../../components/Transcript";
import { style } from "../../../utils/styles";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { PageDataContext } from "../../../utils/contexts";
import { Dialog, Sheet } from "../../../components/CustomModal";
import { ModalInput, ModalItem } from "../../../components/ModalItem";
import { mUpdateMetadata } from "../../../utils/fileManager";
import {
  ChevronLeft,
  Copy,
  Edit,
  RotateCcw,
  XCircle,
} from "lucide-react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import * as Clipboard from "expo-clipboard";
import { showToast } from "../../../utils/functions";
import { Transcriber } from "../../../utils/transcriber";
import { router } from "expo-router";

export default function RecordView() {
  const { pageData, setPageData } = useContext(
    PageDataContext
  ) as PageDataContextType;
  const [position, setPosition] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [modalData, setModalData] = useState<TranscriptSegment>();
  const sheetRef = useRef<BottomSheetModal>(null);

  const openDialog = useCallback(() => {
    setShowDialog(true);
  }, []);

  const closeDialog = useCallback(() => {
    setShowDialog(false);
    setModalData(undefined);
  }, []);

  const openModal = useCallback((data: TranscriptSegment) => {
    setModalData(data);
    if (data === modalData) {
      closeModal();
    } else {
      sheetRef.current?.present();
    }
  }, []);

  const closeModal = useCallback(() => {
    sheetRef.current?.dismiss();
    if (!showDialog) {
      setModalData(undefined);
    }
  }, [showDialog]);

  const updateText = useCallback(
    (_: any, text: string | undefined) => {
      const updatedLog = pageData;
      if (modalData?.text === "|Mark|") {
        updatedLog.markers = updatedLog.markers?.filter(
          (marker) => marker.time != modalData?.t0.time
        );
      }

      const newSeg = {
        text: text ?? "",
        t0: modalData?.t0 ?? { time: 0, text: "" },
        t1: modalData?.t1 ?? { time: 0, text: "" },
        meter: modalData?.meter,
      };

      if (updatedLog.transcript === undefined) {
        updatedLog.transcript = [newSeg];
      } else {
        let found = false;
        updatedLog.transcript = updatedLog.transcript?.map((seg) => {
          if (seg === modalData) {
            found = true;
            return {
              ...seg,
              text: text ?? "",
            };
          }
          return seg;
        });
        if (!found) {
          updatedLog.transcript = updatedLog.transcript.concat(newSeg);
        }
      }

      mUpdateMetadata(updatedLog);
      setPageData(updatedLog);
      closeDialog();
    },
    [modalData, pageData]
  );

  const copyMarker = useCallback(async () => {
    const text =
      modalData?.text === "|Mark|" ? modalData.t0.text : modalData?.text;
    await Clipboard.setStringAsync(text ?? "");
    closeModal();
    showToast("Copied to clipboard");
  }, []);

  const removeMarker = useCallback(() => {
    const updatedLog = pageData;
    if (modalData?.text === "|Mark|") {
      updatedLog.markers = updatedLog.markers?.filter(
        (marker) => marker.time != modalData?.t0.time
      );
    } else {
      updatedLog.transcript = updatedLog.transcript?.filter(
        (seg) => seg.t0.time != modalData?.t0.time
      );
    }
    mUpdateMetadata(updatedLog);
    setPageData(updatedLog);
    closeModal();
    showToast("Marker removed");
  }, [modalData, pageData]);

  const addMarker = useCallback(
    async (mark: Marker) => {
      const updatedLog = pageData;
      updatedLog.markers = [...(updatedLog.markers ?? []), mark];
      mUpdateMetadata(updatedLog);
      setPageData(updatedLog);
      showToast("Marker added");
    },
    [pageData]
  );

  const processAudio = useCallback(async () => {
    showToast("Transcribing audio");
    const transcriber = new Transcriber();
    const res = await transcriber.transcribe(pageData.path!, {
      language: "en-US",
    });
    if (res) {
      const { promise } = res;
      const temp = pageData;
      temp.transcript = (temp.transcript ?? []).concat(
        (await promise).segments.map((seg) => {
          if (temp.transcript) {
            const item = temp.transcript.find(
              (item) => item.t0.time === seg.t0 && item.text === seg.text
            );
            if (item) {
              return item;
            }
          }
          return {
            text: seg.text,
            t0: {
              time: seg.t0,
              text: "",
            },
            t1: {
              time: seg.t1,
              text: "",
            },
            meter: {
              time: seg.t0,
              value: 0,
            },
          };
        })
      );
      temp.transcript.sort((a, b) => a.t0.time - b.t0.time);
      temp.isTranscribed = true;
      mUpdateMetadata(temp);
      setPageData(temp);
    }
  }, []);

  useEffect(() => {
    if (!pageData.isTranscribed) {
      processAudio();
    }
  }, []);

  return (
    <>
      <View style={style.page}>
        <View style={style.top}>
          <View style={styles.headerContainer}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => {
                  router.back();
                }}
              >
                <ChevronLeft color={style.text1.color} size={32} x={-4} />
              </TouchableOpacity>
              <Text style={[style.text, { fontSize: 32 }]}>
                {pageData.title}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => {
                processAudio();
              }}
              style={{
                marginRight: 4,
              }}
            >
              <RotateCcw color={style.text2.color} size={24} />
            </TouchableOpacity>
          </View>
          <Transcript
            data={pageData}
            modalData={modalData}
            onMarkerPress={(position) => setPosition(position)}
            onLongPress={(data) => openModal(data)}
          />
        </View>
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <Player
            addMarker={addMarker}
            openDialog={openDialog}
            setModalData={setModalData}
            data={pageData}
            seekTo={position}
          />
        </View>
      </View>
      <Sheet data={modalData} ref={sheetRef} resetData={closeModal}>
        <ModalItem
          key={0}
          icon={<Edit color={style.text1.color} size={20} />}
          label="Edit Text"
          onPress={() => openDialog()}
        />
        <ModalItem
          disabled={
            (modalData?.text === "|Mark|"
              ? modalData.t0.text
              : modalData?.text) === ""
          }
          key={1}
          icon={<Copy color={style.text1.color} size={20} />}
          label="Copy"
          onPress={() => copyMarker()}
        />
        <ModalItem
          key={2}
          icon={<XCircle color={style.text1.color} size={20} />}
          label="Remove"
          onPress={() => removeMarker()}
        />
      </Sheet>
      <Dialog isVisible={showDialog} onDismiss={closeDialog}>
        <ModalInput
          defaultValue={
            modalData?.text === "|Mark|" ? modalData.t0.text : modalData?.text
          }
          onConfirm={updateText}
          onCancel={closeDialog}
        />
      </Dialog>
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 8,
  },
});
