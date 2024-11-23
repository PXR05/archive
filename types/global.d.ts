import { Audio } from "expo-av";

export {};

declare global {
  type Log = {
    id: number;
    title: string;
    path: string | null;
    date: number;
    duration: number;
    meters: Meter[];
    audio?: Audio.Sound;
    markers?: Marker[];
    transcript?: TranscriptSegment[];
    isTranscribed?: boolean;
  };

  type Marker = {
    time: number;
    text: string;
  };

  type PageDataContextType = {
    pageData: Log;
    setPageData: React.Dispatch<React.SetStateAction<Log>>;
  };

  type TranscriptSegment = {
    text: string;
    t0: Marker;
    t1: Marker;
    meter?: Meter;
  };

  type Meter = {
    time: number;
    value: number;
  };
}
