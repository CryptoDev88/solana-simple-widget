import { useState, useCallback, useEffect } from "react";
import "./pages.css";
import axios from "axios";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as web3 from '@solana/web3.js'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import * as splToken from "@solana/spl-token";
import { AIRDROP_AUTHORITY, TOKEN_DECIMAL, TOKEN_PUBKEY } from "../constants";
import useAirdrop from "../hooks/useAirdrop.js";
import { Divider } from "@mui/material";
import { numberWithCommas } from "../utils";
import { Icon, IconType } from "../components/icons";
import { toast } from "react-toastify";
import { Wallet } from "@project-serum/anchor";

// import { publicKey } from "@project-serum/anchor/dist/cjs/utils/index.js";
const devMode = false
const tokenAddress = 'FZzFpbBmFkoCGabqRj6hssTxbVxdeoEVT8RoKnXfdwGx'

const Claim = () => {
  const { publicKey, connected, sendTransaction, wallet } = useWallet();
  const [sendAddress, setSendAddress] = useState(undefined);
  const [amount, setAmount] = useState(0);
  const [priceSOL, setPriceSOL] = useState(0);

  const handleChange = (evt) => {
    const { value } = evt.target;
    setSendAddress(value);
  };

  //const { createAirdrop, depositToken, withdrawToken, claimToken, getClaimedAmount, getDepositAmount, claimedAmount, depositedAmount, transactionPending } = useAirdrop();

  async function sendTransactions(
    connection,
    wallet,
    transaction
  ) {
    try {
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      transaction.feePayer =wallet.adapter.publicKey 
      const signedTransaction = await wallet.adapter.signTransaction?.(
        transaction
      );
      const rawTransaction = signedTransaction.serialize();

      if (rawTransaction) {
        const txid= await connection.sendRawTransaction(
          rawTransaction,
          {
            skipPreflight: true,
            preflightCommitment: "processed",
          }
        );
        return txid;
      } else {
        console.log("error!");
      }
    } catch (e) {
      console.log("tx e = ", e);
      return null;
    }
  }


  const sendSol = async () => {
    if (!connected || !publicKey) { return }
    const connection = new web3.Connection('https://mainnet.helius-rpc.com/?api-key=0c725f8d-210e-4311-bb75-5d3026e4f704');

    const transaction = new web3.Transaction()
    const recipientPubKey = new web3.PublicKey(sendAddress)

    const solAmount = Math.floor(LAMPORTS_PER_SOL * 1 / priceSOL)

    console.log(solAmount, recipientPubKey)

    const sendSolInstruction = web3.SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: recipientPubKey,
      lamports: solAmount
    })

    transaction.add(sendSolInstruction);
    // web3.sendAndConfirmTransaction(connection, transaction, []);
    const txHash = await sendTransactions(connection, wallet, transaction)
    if (txHash != null) {
      toast.success("Confirming Transaction ...")
      let res = await connection.confirmTransaction(txHash);
      console.log(txHash);
    } else {
      toast.error("Transaction failed.")
    }
  }

  const purchase = async () => {
    if (!sendAddress) {
      toast.error("Please input address to send")
      return
    }

    await getTokenAccounts()
    if (amount >= 100000) {
      await sendSol()

      toast.success("successfully purchased")
    }
    else
      toast.error("This wallet does not meet the minimum amount of X tokens to purchase")
  };

  const url = 'https://mainnet.helius-rpc.com/?api-key=0c725f8d-210e-4311-bb75-5d3026e4f704'

  const getTokenAccounts = async () => {
    setAmount(0);
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "getTokenAccounts",
        id: "helius-test",
        params: {
          page: 1,
          limit: 100,
          "displayOptions": {
            "showZeroBalance": false,
          },
          owner: publicKey,
        },
      }),
    });
    const data = await response.json();

    if (!data.result) {
      console.error("No result in the response", data);
      return;
    }

    const tokenAccounts = data.result?.token_accounts
    tokenAccounts.forEach(element => {
      if (element?.address !== tokenAddress) {
        const amount = Number((element?.amount) / 10 ** 6);
        setAmount(amount);
        return;
      }
    });
  };

  // const getTokenBalance = async (walletAddress) => {
  //   // Connection to the Solana RPC server

  //   try {
  //     // The public key for the wallet you're checking
  //     const walletPublicKey = new web3.PublicKey(walletAddress);

  //     // token mint address on Solana Mainnet Beta
  //     const tokenMintAddress = new web3.PublicKey(tokenAddress); // Replace with actual mint address

  //     const connection = new web3.Connection(devMode ? "https://api.devnet.solana.com" : "https://api.mainnet-beta.solana.com");
  //     // Get the associated token accounts for the wallet
  //     const tokenAccounts = await connection.getTokenAccountsByOwner(walletPublicKey, {
  //       mint: tokenMintAddress
  //     });

  //     console.log(tokenAccounts)

  //     if (tokenAccounts.value.length === 0) {
  //       console.log("No account found for this wallet.");
  //       return 0;
  //     }

  //     // Assuming the first account is the account (might have multiple token accounts)
  //     const accountInfo = await connection.getTokenAccountBalance(tokenAccounts.value[0].pubkey);

  //     console.log(`Token Balance: ${accountInfo.value.amount}`);
  //     return Number(accountInfo.value.amount);
  //   } catch (error) {
  //     console.error("Failed to fetch balance", error);
  //     return 0;
  //   }
  // }

  // useEffect(() => {

  // }, [publicKey]);

  useEffect(() => {
    getPricesInUSD();
    const intVal = setInterval(() => {
      getPricesInUSD();
    }, 1 * 60 * 1000); // 5 mins
    return () => clearInterval(intVal);
  }, [connected]);

  const getPricesInUSD = async () => {
    if (!connected) {
      setPriceSOL(0)
      return;
    }
    try {
      const options = {
        method: 'GET',
        url: 'https://api.diadata.org/v1/assetQuotation/Solana/0x0000000000000000000000000000000000000000',
        headers: { 'Content-Type': 'application/json' }
      };

      axios.request(options).then(function (response) {
        const data = response.data
        const price = data?.Price?.toFixed(2)
        setPriceSOL(price)
        console.log(price)
      }).catch(function (error) {
        console.error(error);
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="w-full flex flex-col items-center mt-[100px]">
      <div className="w-full md:w-[503px] flex flex-col">
        <div className="font-normal text-[32px] md:text-[52px] leading-[62.4px] tracking-tight">
          <img src="Ton.png" width={300} height={300} />
        </div>
      </div>
      <div className="w-full md:w-[550px] border border-solid border-cyan-400 p-6 rounded-3xl flex flex-col mt-6">
        <div className="font-normal text-[32px] md:text-[52px] leading-[62.4px] tracking-tight">
          <span className="text-cyan-400">1 SOL = {priceSOL}$</span>
        </div>
        <label htmlFor="address">Address to send:</label>
        <input id="address" value={sendAddress} onChange={handleChange} className="bg-black" />
        <button className="h-[80px] rounded-2xl bg-cyan-400 text-3xl font-extrabold mt-6" onClick={purchase} disabled={!connected}>
          Purchase
        </button>
      </div>
    </div >
  );
};

export default Claim;
