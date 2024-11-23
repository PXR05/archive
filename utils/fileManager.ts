import * as fs from "expo-file-system";
import { validateLogData } from "./functions";
import { DB, LogSchema } from "./db";

export const trashFolder = "trashed/";

export const mGetNewId = async () => {
  const list = await mGetFiles();
  const max = Math.max(...list.map((e) => e.id));

  return max === -Infinity ? 1 : max + 1;
};

export const mGetFiles = async (dirPrefix: string = "") => {
  const audioDir = fs.documentDirectory + dirPrefix + "audio/";

  if (!(await fs.getInfoAsync(audioDir)).exists) {
    await fs.makeDirectoryAsync(audioDir, { intermediates: true });
  }

  const metadata = (await DB.get(
    `SELECT * FROM logs WHERE trashed = ${dirPrefix === trashFolder ? 1 : 0};`
  )) as LogSchema[];

  const tempLog: Log[] = metadata.map((meta) => {
    return {
      id: meta.id,
      title: meta.title,
      path: meta.path,
      date: meta.date,
      duration: meta.duration,
      meters: JSON.parse(meta.meters),
      markers: JSON.parse(meta.markers),
      transcript: JSON.parse(meta.transcript),
      isTranscribed: meta.isTranscribed === 1,
    };
  });
  tempLog.sort((b, a) => a.date - b.date);

  return tempLog;
};

export const mSaveLog = async (
  item: Log,
  audioBase64?: string,
  dirPrefix: string = ""
) => {
  if (item.path == null) {
    return;
  }

  const audioFilename = `${item.id}_${item.title.replaceAll(" ", "_")}.m4a`;
  const audioDir = fs.documentDirectory + dirPrefix + "audio/";

  if (!(await fs.getInfoAsync(audioDir)).exists) {
    await fs.makeDirectoryAsync(audioDir, { intermediates: true });
  }

  const base64 =
    audioBase64 ??
    (await fs.readAsStringAsync(item.path, {
      encoding: "base64",
    }));

  item.path = audioDir + audioFilename;
  await fs.writeAsStringAsync(item.path, base64, {
    encoding: "base64",
  });

  await DB.query(
    `
    INSERT INTO logs (id, title, path, date, duration, meters, markers, transcript, isTranscribed, trashed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (id) DO UPDATE SET 
        title = excluded.title, 
        path = excluded.path, 
        date = excluded.date, 
        duration = excluded.duration, 
        meters = excluded.meters, 
        markers = excluded.markers, 
        transcript = excluded.transcript,
        isTranscribed = excluded.isTranscribed,
        trashed = excluded.trashed;`,
    [
      item.id,
      item.title,
      item.path,
      item.date,
      item.duration,
      JSON.stringify(item.meters),
      JSON.stringify(item.markers),
      JSON.stringify(item.transcript),
      item.isTranscribed ? 1 : 0,
      dirPrefix === trashFolder ? 1 : 0,
    ]
  ).catch((error) => console.log(error));

  return item;
};

export const mDeleteLog = async (
  data: Log | undefined,
  logs: Log[],
  audioOnly = true
) => {
  if (!validateLogData(data)) {
    return logs;
  }

  const { id, path } = data!;

  try {
    if (!audioOnly) {
      await DB.query(`DELETE FROM logs WHERE id = ?;`, [id]);
    }
    await fs.deleteAsync(path!);
  } catch (error) {
    console.log(error);
    return logs;
  }
  const temp = logs.filter((e) => e.id != id);
  return temp;
};

export const mMoveToTrash = async (data: Log | undefined, logs: Log[]) => {
  if (!validateLogData(data)) {
    return logs;
  }

  const tempPath = data!.path!;

  const saved = await mSaveLog(data!, undefined, trashFolder);
  if (saved === undefined) {
    return logs;
  }

  data!.path = tempPath;
  const temp = await mDeleteLog(data!, logs);
  return temp;
};

export const mRestoreLog = async (data: Log | undefined, logs: Log[]) => {
  if (!validateLogData(data)) {
    return logs;
  }

  const tempPath = data!.path!;

  data!.path = data!.path!.replace(trashFolder, "");
  const base64 = await fs.readAsStringAsync(tempPath, {
    encoding: "base64",
  });
  const saved = await mSaveLog(data!, base64);
  if (saved === undefined) {
    return logs;
  }

  data!.path = tempPath;
  const temp = await mDeleteLog(data!, logs);
  return temp;
};

export const mUpdateMetadata = async (newdata: Log) => {
  await DB.query(
    `
    UPDATE logs
    SET title = ?, path = ?, date = ?, duration = ?, meters = ?, markers = ?, transcript = ?, isTranscribed = ?
    WHERE id = ?;`,
    [
      newdata.title,
      newdata.path,
      newdata.date,
      newdata.duration,
      JSON.stringify(newdata.meters),
      JSON.stringify(newdata.markers),
      JSON.stringify(newdata.transcript),
      newdata.isTranscribed ? 1 : 0,
      newdata.id,
    ]
  );
};

export const mRenameLog = (data?: Log, newName?: string) => {
  if (!validateLogData(data) || newName == undefined) {
    return false;
  }
  if (newName == data!.title) {
    return false;
  }

  mUpdateMetadata({ ...data!, title: newName });

  return true;
};
