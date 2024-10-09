"use client";

import "@rainbow-me/rainbowkit/styles.css";
import * as React from "react";
import { RainbowKitProvider, getDefaultConfig, lightTheme, darkTheme } from "@rainbow-me/rainbowkit";
import { useTheme } from "next-themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  WagmiProvider,
  cookieStorage,
  cookieToInitialState,
  createStorage,
} from "wagmi";
import { mainnet, base } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "RainbowKit demo",
  projectId: "1b8eaa85a996988993be008f82249011",
  chains: [mainnet, base],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});

const queryClient = new QueryClient();

export function Providers({
  children,
  cookie,
}: {
  cookie: string;
  children: React.ReactNode;
}) {
  const { theme } = useTheme()
  const rainbowTheme =
    theme === 'dark' ?
      darkTheme(
        {
          accentColor: "#8B00C2",
        }
      ) :
      lightTheme(
        {
          accentColor: "#8B00C2",
        }
      )
  const initialState = cookieToInitialState(config, cookie);
  return (
    <WagmiProvider config={config} {...(initialState ? { initialState } : {})}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={rainbowTheme}
          showRecentTransactions={true}
          coolMode={true}
        >{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}