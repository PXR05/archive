import * as fs from "expo-file-system";
import { TranscribeFileOptions, WhisperContext, initWhisper } from "whisper.rn";
import { showToast } from "./functions";

export class Transcriber {
  whisper: WhisperContext | undefined;

  async init() {
    const modelName = "ggml-base.en-q5_1.bin";
    const modelDir = fs.documentDirectory + "models/" + modelName;

    if (!(await fs.getInfoAsync(modelDir)).exists) {
      await downloadModel(modelName);
    }

    return await initWhisper({
      filePath: modelDir,
    });
  }

  async transcribe(path: string, options: TranscribeFileOptions) {
    if (this.whisper === undefined) {
      this.whisper = await this.init();
    }
    return this.whisper.transcribe(path, options);
  }

  async transcribeRealtime(options: TranscribeFileOptions) {
    if (this.whisper === undefined) {
      return;
    }
    return this.whisper.transcribeRealtime(options);
  }
}

async function downloadModel(modelName: string) {
  const modelFolder = fs.documentDirectory + "models/";
  const modelPath = modelFolder + modelName;

  try {
    if (!(await fs.getInfoAsync(modelFolder)).exists) {
      await fs.makeDirectoryAsync(modelFolder);
    }

    showToast("Downloading transcription model");

    const downloadable = fs.createDownloadResumable(
      `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/${modelName}?download=true`,
      modelPath,
      {},
      (progress) => {
        const percent = Math.floor(
          (progress.totalBytesWritten / progress.totalBytesExpectedToWrite) *
            100
        );
        showToast(`Downloading model: ${percent}%`);
      }
    );

    const model = await downloadable.downloadAsync();
    if (model == undefined) {
      showToast("Error downloading transcription model");
      return;
    }

    const base64 = await fs.readAsStringAsync(model.uri, {
      encoding: "base64",
    });

    await fs.writeAsStringAsync(modelPath, base64, { encoding: "base64" });
  } catch (error) {
    showToast("Error downloading transcription model");
    console.log(error);
    return;
  }
}
