import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { ChevronLeft, Undo2, Trash2 } from "lucide-react-native";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";
import { router } from "expo-router";
import { style } from "../../utils/styles";
import { mDeleteLog, mGetFiles, mRestoreLog } from "../../utils/fileManager";
import TrashList from "../../components/TrashList";
import { Dialog } from "../../components/CustomModal";
import { ModalAlert } from "../../components/ModalItem";
import { showToast } from "../../utils/functions";

export default function TrashPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [selected, setSelected] = useState<Log[]>([]);
  const [single, setSingle] = useState<Log | undefined>();

  const actionsOpacity = useSharedValue(0);

  useEffect(() => {
    if (selected.length > 0) {
      actionsOpacity.value = withTiming(1, { duration: 100 });
    } else {
      actionsOpacity.value = withTiming(0, { duration: 100 });
    }
  }, [selected]);

  useEffect(() => {
    getFiles();
  }, []);

  const getFiles = useCallback(async () => {
    setLogs(await mGetFiles("trashed/"));
  }, []);

  const [showDialog, setShowDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState<string | undefined>();

  const restoreMultiple = async () => {
    if (selected.length > 0) {
      selected.forEach(async (log) => {
        await mRestoreLog(log, logs);
      });
      setLogs(logs.filter((log) => !selected.includes(log)));
      setSelected([]);
      showToast("Logs restored");
    } else if (single) {
      setLogs(await mRestoreLog(single, logs));
      setSingle(undefined);
      showToast("Log restored");
    }

    setShowDialog(false);
  };

  const deleteMultiple = async () => {
    if (selected.length > 0) {
      selected.forEach(async (log) => {
        await mDeleteLog(log, logs, false);
      });
      setLogs(logs.filter((log) => !selected.includes(log)));
      setSelected([]);
      showToast("Logs deleted");
    } else if (single) {
      setLogs(await mDeleteLog(single, logs, false));
      setSingle(undefined);
      showToast("Log deleted");
    }

    setShowDialog(false);
  };

  const deleteClicked = (e?: any, data?: Log) => {
    if (data) {
      setSingle(data);
    }
    setDialogAction("delete");
    setShowDialog(true);
  };

  const restoreClicked = (e?: any, data?: Log) => {
    if (data) {
      setSingle(data);
    }
    setDialogAction("restore");
    setShowDialog(true);
  };

  const closeDialog = () => {
    if (single) {
      setSingle(undefined);
    }
    setShowDialog(false);
  };

  return (
    <>
      <View style={[style.page]}>
        <View
          style={[
            styles.headerContainer,
            {
              marginTop: 8,
              paddingLeft: 8,
              paddingRight: 12,
            },
          ]}
        >
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
            <Text style={[style.text, { fontSize: 32 }]}>Trash</Text>
          </View>
          <Animated.View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              opacity: actionsOpacity,
              pointerEvents: selected.length > 0 ? "auto" : "none",
            }}
          >
            <TouchableOpacity activeOpacity={0.75} onPress={restoreClicked}>
              <Undo2 color={style.text2.color} size={24} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.75} onPress={deleteClicked}>
              <Trash2 color={style.text2.color} size={24} />
            </TouchableOpacity>
          </Animated.View>
        </View>
        <View style={styles.listContainer}>
          <TrashList
            data={logs}
            selected={selected}
            setSelected={(data) => setSelected(data)}
            onDeleteClick={(data) => deleteClicked(undefined, data)}
            onRestoreClick={(data) => restoreClicked(undefined, data)}
          />
        </View>
      </View>
      <Dialog isVisible={showDialog} onDismiss={closeDialog}>
        <ModalAlert
          data={selected}
          label={
            dialogAction &&
            (dialogAction === "restore"
              ? "Are you sure you want to restore "
              : "Are you sure you want to delete ") +
              (selected.length > 1
                ? "the selected logs?"
                : selected.length > 0
                ? selected[0].title
                : single?.title + "?")
          }
          onConfirm={
            dialogAction && dialogAction === "restore"
              ? restoreMultiple
              : deleteMultiple
          }
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
  },
  listContainer: {
    paddingLeft: 12,
  },
});
