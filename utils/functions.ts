import { ToastAndroid } from "react-native";

export function getTimestamp(ms: number, showMs = false): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = Math.round(ms % 1000);

  return (
    (seconds === 60
      ? `${(minutes + 1).toString().padStart(2, "0")}:00` // 60 seconds = 1 minute
      : `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`) +
    (showMs ? `.${milliseconds.toString().padStart(3, "0")}` : "")
  );
}

export function removeExtension(string: string): string {
  const newString = string.split(".");
  newString.pop();
  return newString.join(".");
}

export function validateLogData(data: Log | undefined): boolean {
  if (data == undefined) {
    console.log("data undefined");
    return false;
  }

  const { path, title } = data;
  if (path == undefined || title == undefined) {
    console.log("path undefined");
    return false;
  }

  return true;
}

export function normalizeMeter(
  n?: number,
  arrMax?: number,
  arrMin?: number
): number {
  if (n == undefined) {
    return 0;
  }
  const max = arrMax ?? 0;
  const min = arrMin ?? -160;
  const floor = (max - min) / 2;
  const normal =
    Math.round(
      ((Math.max(n - floor < min ? n - floor / 2 : n, min) - min) /
        Math.max(max - min, 1)) *
        1000
    ) / 1000;
  return normal;
}

export function showToast(msg: number | string) {
  ToastAndroid.show(msg.toString(), ToastAndroid.SHORT);
}
