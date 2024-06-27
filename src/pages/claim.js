import { useState, useCallback, useEffect, useRef } from "react";
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
const arr_popperInput = [
  {
    input_name: 'price',
    id: 'price',
    placeholder: 'EMAIL ADDRESS'
  },
  {
    input_name: 'name',
    id: 'name',
    placeholder: 'NAME'
  },
  {
    input_name: 'street_no',
    id: 'street_no',
    placeholder: 'STREET NO.'
  },
  {
    input_name: 'street_name',
    id: 'street_name',
    placeholder: 'STREET NAME'
  },
  {
    input_name: 'city',
    id: 'city',
    placeholder: 'CITY'
  },
  {
    input_name: 'state',
    id: 'state',
    placeholder: 'STATE'
  },
  {
    input_name: 'zip',
    id: 'zip',
    placeholder: 'ZIP'
  },

]
const Claim = ({ priceSOL, sendAddress, productName }) => {
  const { publicKey, connected, sendTransaction, wallet } = useWallet();
  const [amount, setAmount] = useState(0);
  const [inputInformation, setInputInformation] = useState({})

  //const { createAirdrop, depositToken, withdrawToken, claimToken, getClaimedAmount, getDepositAmount, claimedAmount, depositedAmount, transactionPending } = useAirdrop();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupPosition, setPopupPosition] = useState('right');
  const claimRef = useRef()
  // const handleMouseEnter = () => {
  //   if (claimRef.current) {
  //     const rect = claimRef.current.getBoundingClientRect();
  //     const windowWidth = window.innerWidth;
  //     if (rect.right + 200 > windowWidth) {
  //       setPopupPosition('left');
  //     } else {
  //       setPopupPosition('right');
  //     }
  //   }
  //   setIsPopupVisible(true);
  // };
  const onChange = (e) => {
    setInputInformation({ ...inputInformation, [e.target.id]: e.target.value })
  }
  const handleMouseLeave = () => {
    setIsPopupVisible(false);
  };
  async function sendTransactions(
    connection,
    wallet,
    transaction
  ) {
    try {
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      transaction.feePayer = wallet.adapter.publicKey
      const signedTransaction = await wallet.adapter.signTransaction?.(
        transaction
      );
      const rawTransaction = signedTransaction.serialize();

      if (rawTransaction) {
        const txid = await connection.sendRawTransaction(
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
      setIsPopupVisible(true);
      toast.error("Please input address to send")
      return
    }
    setIsPopupVisible(true);
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
  }, [connected]);

  return (
    <div className="w-full flex flex-col items-center "
    >
      <div className="w-full md:w-[300px] border border-solid border-cyan-400 p-6 rounded-3xl flex flex-col mt-6 cursor-pointer"
        // onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={claimRef}
      >
        <div className="flex justify-center font-normal text-[32px] md:text-[52px] leading-[62.4px] tracking-tight "
        >
          <img src="Ton.png" width={200} height={200} />
        </div>
        <div>
          <p class="text-3xl font-medium text-cyan-400">{productName}</p>
        </div>
        <div>
          <span class="text-2xl font-medium text-gray-900 line-through text-white">$2</span>
          <span class="ms-3 text-2xl font-medium text-gray-900 text-white">$1</span>
        </div>
        <button className="h-[50px] rounded-2xl bg-cyan-400 text-2xl font-extrabold mt-6 transition duration-500  hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-400"
          onClick={purchase}
          disabled={!connected}

        >
          Purchase
        </button>
        {isPopupVisible && (
          <div className={`border-cyan-400 absolute mt-1 w-[250px] h-[500px] p-4 bg-white border border-black-300 rounded-lg shadow-lg 
          ${popupPosition === 'right' ? 'ml-[250px]' : 'ml-[-250px]'}
          
          `}>
            <div
              className={` transition-opacity duration-300 ease-in-out transform  absolute top-1/2 transform -translate-y-1/2 ${popupPosition === 'right' ? 'right-[245px]' : 'left-[245px]'
                }  ${isPopupVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            >
              <div
                className={`w-0 h-0 border-transparent border-solid ${popupPosition === 'right'
                  ? 'border-r-white border-[15px]'
                  : 'border-l-white border-[15px]'
                  }`}
              ></div>
            </div>
            <p className="text-black">SHIPPING ADDRESS INFO</p>
            <div>

              <div class="relative mt-2 rounded-md shadow-sm">
                {
                  arr_popperInput.length > 0 && arr_popperInput.map(element => {
                    return (
                      <PopperInput
                        input_name={element["input_name"]}
                        id={element["id"]}
                        placeholder={element["placeholder"]}
                        onChange={onChange}
                      />

                    )
                  }
                  )
                }
                <button className="h-[30px] w-[120px] bg-black  font-extrabold mt-6"
                  onClick={() => console.log(inputInformation)}
                >
                  submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div >
  );
};
const PopperInput = ({ input_name, id, placeholder, onChange }) => (
  <div class="relative mt-2 rounded-md shadow-sm">

    <input
      type="text"
      name={input_name}
      id={id}
      class="block w-full rounded-md border-0 py-1.5 pl-2 pr-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
      placeholder={placeholder}
      onChange={onChange} />

  </div>
)
export default Claim;
