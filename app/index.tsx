import { useState, useEffect, useCallback, useRef } from "react";
import { Edit, Share2, Trash } from "lucide-react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { View, StyleSheet } from "react-native";
import { usePathname } from "expo-router";
import * as Sharing from "expo-sharing";
import { style } from "../utils/styles";
import List from "../components/List";
import Recorder from "../components/Recorder";
import { ModalItem, ModalInput } from "../components/ModalItem";
import { Dialog, Sheet } from "../components/CustomModal";
import { showToast, validateLogData } from "../utils/functions";
import {
  mDeleteLog,
  mGetFiles,
  mMoveToTrash,
  mRenameLog,
  mSaveLog,
} from "../utils/fileManager";

export default function Main() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isNewLog, setIsNewLog] = useState(false);
  const [modalData, setModalData] = useState<Log>();
  const [showDialog, setShowDialog] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const sheetRef = useRef<BottomSheetModal>(null);
  const pathname = usePathname();

  const openModal = useCallback((data: Log) => {
    setModalData(data);
    if (data.id == modalData?.id) {
      resetModalData();
      sheetRef.current?.dismiss();
    } else {
      sheetRef.current?.present();
    }
  }, []);

  const resetModalData = useCallback(() => {
    sheetRef.current?.dismiss();
    if (!showDialog) {
      setModalData(undefined);
    }
  }, [showDialog]);

  const closeDialog = useCallback(() => {
    setShowDialog(false);
    setModalData(undefined);
    setIsNewLog(false);
  }, []);

  useEffect(() => {
    if (pathname === "/") {
      getFiles();
    }
  }, [pathname]);

  const getFiles = useCallback(async () => {
    setLogs(await mGetFiles());
  }, []);

  const saveLog = useCallback(
    async (item: Log, audioBase64?: string) => {
      const saved = await mSaveLog(item, audioBase64);
      if (saved) {
        setLogs([item, ...logs]);
        setModalData(item);
        setIsNewLog(true);
        setShowDialog(true);
      }
    },
    [logs]
  );

  const deleteLog = useCallback(
    async (data: Log | undefined) => {
      const newLogs = await mDeleteLog(data, logs, false);
      setLogs(newLogs);
      closeDialog();
      showToast("Log deleted");
    },
    [logs]
  );

  const moveToTrash = useCallback(
    async (
      data: Log | undefined,
      updateLogs: boolean = true
    ): Promise<boolean> => {
      const newLogs = await mMoveToTrash(data, logs);

      if (updateLogs) {
        setLogs(newLogs);
      }
      resetModalData();
      showToast("Log moved to trash");
      return true;
    },
    [logs]
  );

  const renameLog = useCallback(
    (data?: Log | Log[] | undefined, newName?: string) => {
      if (Array.isArray(data)) {
        return false;
      }
      if (!validateLogData(data) || newName == undefined) {
        return false;
      }

      if (mRenameLog(data, newName)) {
        getFiles();
        closeDialog();
        return true;
      }
      closeDialog();
      return false;
    },
    []
  );

  const shareLog = useCallback(
    async (data: Log | undefined): Promise<boolean> => {
      if (!validateLogData(data)) {
        return false;
      }
      await Sharing.shareAsync(data!.path!, {
        dialogTitle: "Share " + data!.title,
      });
      resetModalData();
      return true;
    },
    []
  );

  return (
    <>
      <View style={style.page}>
        <View style={style.top}>
          {isRecording && <View style={styles.overlay} />}
          <List data={logs} openModal={(data) => openModal(data)} />
        </View>
        <View style={styles.recorderContainer}>
          <Recorder
            setStatus={(status) => setIsRecording(status)}
            addData={saveLog}
          />
        </View>
      </View>
      <Sheet data={modalData} ref={sheetRef} resetData={resetModalData}>
        <ModalItem
          key={0}
          icon={<Edit color={style.text1.color} size={20} />}
          label="Rename"
          onPress={() => {
            setShowDialog(true);
            sheetRef.current?.dismiss();
          }}
        />
        <ModalItem
          key={1}
          icon={<Share2 color={style.text1.color} size={20} />}
          label="Share"
          onPress={shareLog}
        />
        <ModalItem
          key={2}
          icon={<Trash color={style.text1.color} size={20} />}
          label="Delete"
          onPress={moveToTrash}
        />
      </Sheet>
      <Dialog isVisible={showDialog} onDismiss={closeDialog}>
        <ModalInput
          defaultValue={modalData?.title}
          data={modalData}
          onConfirm={renameLog}
          onCancel={isNewLog ? () => deleteLog(modalData) : closeDialog}
          confirmLabel="Save"
          cancelLabel={isNewLog ? "Delete" : "Cancel"}
        />
      </Dialog>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    width: "100%",
    height: "200%",
    backgroundColor: "#0000007b",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  recorderContainer: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
});
