"use client"
import { PeraWalletConnect } from "@perawallet/connect";
import { useEffect, useState } from "react";
import { FaShoppingCart, FaWallet, FaSearch, FaUser, FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import algosdk from 'algosdk';
import { NetworkId, useWallet } from '@txnlab/use-wallet-react';
import React from "react";
import CartSummary from './components/CartSummary';
import Image from 'next/image';

const peraWallet = new PeraWalletConnect();

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  author: string;
  rating: number;
}

export default function Home() {
  const {
    algodClient,
    activeAddress,
    setActiveNetwork,
    transactionSigner,
    wallets
  } = useWallet();
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const isConnectedToPeraWallet = !!accountAddress;
  const [products] = useState<Product[]>([
    { id: 1, name: "Blockchain Basics", price: 0.015, image: "https://salmon-raw-harrier-526.mypinata.cloud/ipfs/QmaHkcURZHoGJ6rqJ27bacMpzVGNUZmc4Gn2cvw1ngSLov", description: "Introduction to blockchain technology", author: "Satoshi Nakamoto", rating: 4.5 },
    { id: 2, name: "Smart Contract Programming", price: 0.02, image: "https://salmon-raw-harrier-526.mypinata.cloud/ipfs/QmbY1hbAJk963rw113KB7avrbWNmhdrxy2NiZCh6kirGAB", description: "Guide to writing smart contracts on Ethereum", author: "Vitalik Buterin", rating: 4.8 },
    { id: 3, name: "DeFi and the Future of Finance", price: 0.018, image: "https://salmon-raw-harrier-526.mypinata.cloud/ipfs/QmStT712gEa4mKEPPbo7txR5ePvNePhHH3w26cVk8vkA6g", description: "Exploring the decentralized finance world", author: "Andre Cronje", rating: 4.2 },
    { id: 4, name: "NFT School for Artists", price: 0.012, image: "https://salmon-raw-harrier-526.mypinata.cloud/ipfs/Qmf4aNyGkqBCjcKgi3osgqWAEBpnTSsoh6vBNN7HAQLmXN", description: "Understanding NFTs and their application in art", author: "Beeple", rating: 4.0 },
    { id: 5, name: "Algorand: The Green Blockchain", price: 0.025, image: "https://salmon-raw-harrier-526.mypinata.cloud/ipfs/QmeE5FLVZBQdJotJF1jCVJzLWqxfsMLozAutu6tY6oYYaZ", description: "Introduction to the Algorand platform", author: "Silvio Micali", rating: 4.7 },
    { id: 6, name: "Metaverse and Web3", price: 0.022, image: "https://salmon-raw-harrier-526.mypinata.cloud/ipfs/Qmdmq42YdZfCVUavWhyvKRfBSJHLmvqfSLDRb2VBCmLNVq", description: "Exploring the future of the internet", author: "Mark Zuckerberg", rating: 4.3 },
  ]);
  const [cart, setCart] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    peraWallet
      .reconnectSession()
      .then((accounts: string[]) => {
        peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);
        if (accounts.length) {
          setAccountAddress(accounts[0]);
        }
      })
      .catch((e: Error) => console.log(e));
  }, [handleDisconnectWalletClick]);

  function handleConnectWalletClick() {
    wallets[0]
      .connect()
      .then((newAccounts) => {
        peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);
        setAccountAddress(newAccounts[0].address);
        setActiveNetwork(NetworkId.TESTNET);
        wallets[0].setActiveAccount(newAccounts[0].address)
      })
      .catch((error) => {
        if (error?.data?.type !== "CONNECT_MODAL_CLOSED") {
          console.log(error);
        }
      });
  }

  function handleDisconnectWalletClick() {
    wallets[0].disconnect();
    setAccountAddress(null);
  }

  function addToCart(product: Product) {
    setCart((prevCart) => [...prevCart, product]);
  }

  async function handlePurchase() {
    if (!accountAddress || !activeAddress) {
      alert('Please connect your wallet before making a payment.');
      return;
    }

    const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

    try {
      const atc = new algosdk.AtomicTransactionComposer()
      const suggestedParams = await algodClient.getTransactionParams().do()
      const transaction = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        suggestedParams: suggestedParams,
        from: accountAddress,
        to: "DTUA424DKCJYPHF5MLO6CL4R2BWOTH2GLOUQA257K5I7G65ENHSDJ4TTTE",
        amount: totalAmount * 1000000,
      });
      
      atc.addTransaction({ txn: transaction, signer: transactionSigner })

      const result = await atc.execute(algodClient, 2)
      console.info(`Transaction successful!`, {
        confirmedRound: result.confirmedRound,
        txIDs: result.txIDs
      })
      alert('Payment successful!')
      setCart([]);
    } catch (error) {
      console.error('Error during transaction:', error)
      alert('An error occurred during payment. Please try again.')
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">AlgoBooks</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for books..."
                className="py-2 px-4 pr-10 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute right-3 top-3 text-gray-400" />
            </div>
            <button
              className="bg-white text-blue-600 px-4 py-2 rounded-full flex items-center hover:bg-blue-100 transition duration-300"
              onClick={isConnectedToPeraWallet ? handleDisconnectWalletClick : handleConnectWalletClick}
            >
              <FaWallet className="mr-2" />
              {isConnectedToPeraWallet ? "Disconnect wallet" : "Connect Pera wallet"}
            </button>
            <FaUser className="text-2xl cursor-pointer" />
            <div className="relative">
              <FaShoppingCart className="text-2xl cursor-pointer" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cart.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-8">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">Best-selling blockchain books</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <Image 
                src={product.image} 
                alt={product.name} 
                width={200} 
                height={300} 
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 text-blue-600">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.author}</p>
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-yellow-400 ${i < Math.floor(product.rating) ? 'fill-current' : 'stroke-current'}`}>★</span>
                  ))}
                  <span className="ml-1 text-sm text-gray-600">({product.rating})</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-blue-500">{product.price} Algo</span>
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition duration-300 flex items-center"
                    onClick={() => addToCart(product)}
                  >
                    <FaShoppingCart className="mr-2" />
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <CartSummary cart={cart} />

        <div className="flex justify-center mt-8">
          <button
            className="bg-green-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-green-600 transition duration-300 shadow-lg"
            onClick={handlePurchase}
          >
            Checkout
          </button>
        </div>
      </main>

      <footer className="bg-gray-800 text-white p-8 mt-12">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About AlgoBooks</h3>
            <ul className="space-y-2">
              <li>Introduction</li>
              <li>Jobs</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Support</h3>
            <ul className="space-y-2">
              <li>Help Center</li>
              <li>Buying Guide</li>
              <li>Payment Methods</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Partnerships and Affiliates</h3>
            <ul className="space-y-2">
              <li>Terms of Service</li>
              <li>Sell with AlgoBooks</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect with Us</h3>
            <div className="flex space-x-4">
              <FaFacebook className="text-2xl" />
              <FaTwitter className="text-2xl" />
              <FaInstagram className="text-2xl" />
              <FaYoutube className="text-2xl" />
            </div>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p>&copy; 2024 AlgoBooks. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
