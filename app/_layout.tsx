import { SplashScreen, Stack } from "expo-router";
import {
  useFonts,
  JetBrainsMono_400Regular,
} from "@expo-google-fonts/jetbrains-mono";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { style } from "../utils/styles";
import { useState } from "react";
import { PageDataContext } from "../utils/contexts";

export default function Layout() {
  const [loaded] = useFonts({ JetBrainsMono_400Regular });
  const [pageData, setPageData] = useState<Log>({
    id: 0,
    title: "",
    path: "",
    date: 0,
    duration: 0,
    markers: [],
    meters: [],
    transcript: [],
  });

  async function hideSplash() {
    await SplashScreen.hideAsync();
  }

  if (!loaded) {
    return null;
  }
  hideSplash();

  return (
    <PageDataContext.Provider value={{ pageData, setPageData }}>
      <GestureHandlerRootView
        style={{ flex: 1, backgroundColor: style.bg.color }}
      >
        <BottomSheetModalProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "fade_from_bottom",
              statusBarColor: "black",
            }}
          />
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </PageDataContext.Provider>
  );
}
