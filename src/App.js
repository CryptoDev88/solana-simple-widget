import React, { useMemo, useState } from "react";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { WalletProvider } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletConnectProvider } from "./providers/WalletConnectProvider";

import Navbar from "./layouts/navbar";
import Claim from "./pages/claim";
import SolTransfer from "./pages/solTransfer"
import ThemeContext from "./context/themeContext";

import "./App.css";
import SOL from "./assets/img/sol.svg";
import USDC from "./assets/img/usdc.svg";
import USDT from "./assets/img/usdt.png";
import JUP from "./assets/img/jup.svg";
import Copyright from "./pages/copyright";

function App() {
  const [priceSOL, setPriceSOL] = useState(0)
  const [sendAddress, setSendAddress] = useState(undefined)
  const tokens = [
    { ft: "SOL", icon: SOL },
    { ft: "JUP", icon: JUP },
    { ft: "USDC", icon: USDC },
    { ft: "USDT", icon: USDT },
  ];
  return (
    <div className="App bg-[#071619] bg-center bg-cover min-h-screen" style={{ backgroundImage: "url('/assets/img/pattern.png')" }}>
      <ThemeContext.Provider value={tokens} priceSOL={priceSOL} sendAddress={sendAddress}>
        <WalletConnectProvider>
          <Navbar></Navbar>
          <div className="px-5 md:px-10 lg:px-0 pt-6">
            <SolTransfer priceSOL={priceSOL} setPriceSOL={setPriceSOL} sendAddress={sendAddress} setSendAddress={setSendAddress}/>
          </div>
          <div className="px-5 md:px-10 lg:px-0 pt-6 md:pt-[100px] pb-[160px] grid gap-x-8 gap-y-4 grid-cols-4">
            <Claim priceSOL={priceSOL} sendAddress={sendAddress} productName='Product1' />
            <Claim priceSOL={priceSOL} sendAddress={sendAddress} productName='Product2' />
            <Claim priceSOL={priceSOL} sendAddress={sendAddress} productName='Product3' />
            <Claim priceSOL={priceSOL} sendAddress={sendAddress} productName='Product4' />
            <Claim priceSOL={priceSOL} sendAddress={sendAddress} productName='Product5' />
            <Claim priceSOL={priceSOL} sendAddress={sendAddress} productName='Product6' />
            <Claim priceSOL={priceSOL} sendAddress={sendAddress} productName='Product7' />
            <Claim priceSOL={priceSOL} sendAddress={sendAddress} productName='Product8' />
          </div>
          <ToastContainer autoClose={3000} draggableDirection="x" toastStyle={{ backgroundColor: "#05bfc4", color: "white" }} />
        </WalletConnectProvider>
      </ThemeContext.Provider>
    </div>
  );
}

export default App;
