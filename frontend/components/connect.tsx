'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Connect() {
  // return <w3m-button />
  return <ConnectButton
    accountStatus={'address'}
    chainStatus={'icon'}
  />
}