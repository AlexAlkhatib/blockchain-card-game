import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import CardCollection from "./CardCollection.json";
import { create } from "ipfs-http-client";
import CardMetadataGenerator from "./CardMetadataGenerator"; 


const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const App = () => {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [packTokens, setPackTokens] = useState([]);
  const [marketplaceTokens, setMarketplaceTokens] = useState([]);
  const [activeTab, setActiveTab] = useState("pack");
  const ipfs = create({
    host: "localhost",
    port: "5001",
    protocol: "http"
  });


  useEffect(() => {
    const loadBlockchainData = async () => {
      if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
      }

      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);

      const signer = await web3Provider.getSigner();
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CardCollection.abi, signer);
      setContract(contractInstance);

      fetchTokens(contractInstance, signer);
    };

    loadBlockchainData();
  }, []);

  const fetchTokens = async (contractInstance, signer) => {
    try {
      const userAddress = await signer.getAddress();
      const tokenIds = await contractInstance.getAllTokens();
      const pack = [];
      const marketplace = [];

      for (const tokenId of tokenIds) {
        const owner = await contractInstance.ownerOf(tokenId);
        const isForSale = await contractInstance.isForSale(tokenId);

        const tokenURI = await contractInstance.tokenURI(tokenId);
        const metadata = await fetch(`https://ipfs.io/ipfs/${tokenURI.replace('ipfs://', '')}`)
          .then((res) => res.json())
          .catch((err) => console.error("Error fetching metadata:", err));

        const card = { tokenId: tokenId.toString(), forSale: isForSale, metadata };

        if (owner.toLowerCase() === userAddress.toLowerCase()) {
          pack.push(card);
        }
        if (isForSale) {
          marketplace.push(card);
        }
      }

      setPackTokens(pack);
      setMarketplaceTokens(marketplace);
    } catch (error) {
      console.error("Error fetching tokens:", error);
    }
  };






  const mintCard = async () => {
    if (!contract) return;

    try {
      const generator = new CardMetadataGenerator();
      const metadata = await generator.createTestCard();

      console.log("Random metadata is:", JSON.stringify(metadata));

      const added = await ipfs.add(JSON.stringify(metadata));
      const tokenURI = `ipfs://${added.path}`;

      console.log("Metadata uploaded! IPFS URI:", tokenURI);

      const tx = await contract.mintCard(tokenURI, "Legendary", added.path);
      await tx.wait();

      console.log("Card minted successfully!");

      fetchTokens(contract, await provider.getSigner());
    } catch (error) {
      console.error("Minting failed:", error);
    }
  };



  const buyCard = async (tokenId) => {
    if (!contract || !provider) return;

    try {
        const signer = await provider.getSigner();
        const contractWithSigner = contract.connect(signer);
        const price = ethers.parseEther("0.01"); 

        const tx = await contractWithSigner.tradeCard(tokenId, { value: price });
        await tx.wait();

        fetchTokens(contractWithSigner, signer);
    } catch (error) {
        console.error("Buying failed:", error);
    }
};



  const toggleForSale = async (tokenId, isForSale) => {
    if (!contract) return;

    try {
      const tx = await contract.setForSale(tokenId, isForSale);
      await tx.wait();

      setPackTokens((prevTokens) =>
        prevTokens.map((token) =>
          token.tokenId === tokenId ? { ...token, forSale: isForSale } : token
        )
      );
      window.location.reload();
    } catch (error) {
      console.error("Failed to update sale status:", error);
    }
  };

  const getCardColor = (rarity) => {
    switch (rarity) {
      case "Rare":
        return "rgb(184, 115, 51)";
      case "Mythical":
        return "gold";
      case "Legendary":
        return "#1BD7E0";
      default:
        return "";
    }
  };



  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <button 
          onClick={() => setActiveTab("pack")} 
          style={{ padding: "10px", cursor: "pointer", background: activeTab === "pack" ? "lightgray" : "grey" }}
        >
          My Pack ({packTokens.length})
        </button>
        <button 
          onClick={() => setActiveTab("marketplace")} 
          style={{ padding: "10px", cursor: "pointer", background: activeTab === "marketplace" ? "lightgray" : "grey" }}
        >
          Marketplace ({marketplaceTokens.length})
        </button>
      </div>
      {activeTab === "pack" && (
  <div>
    <h2>My Pack</h2>
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
      <button 
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          padding: "10px 20px",
          background: "blue",
          border: "none",
          cursor: "pointer"
        }} 
        onClick={mintCard}
      >
        Mint Card
      </button>
      {packTokens.length > 0 ? (
        packTokens.map(({ tokenId, forSale, metadata }) => (
          <div 
            key={tokenId} 
            style={{
              padding: "10px",
              border: "1px solid black",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: getCardColor(metadata?.value)
            }}
          >
            <p>Card #{tokenId}</p>
            <p>Name: {metadata?.name}</p>
            <p>Type: {metadata?.type}</p>
            <p>Value: {metadata?.value}</p>
            <label>
              <input
                type="checkbox"
                checked={forSale}
                onChange={(e) => toggleForSale(tokenId, e.target.checked)}
              />
              For Sale
            </label>
          </div>
        ))
      ) : (
        <p>No cards in your pack yet.</p>
      )}
    </div>
  </div>
)}

{/* Marketplace Section */}
{activeTab === "marketplace" && (
  <div>
    <h2>Marketplace</h2>
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
      {marketplaceTokens.length > 0 ? (
        marketplaceTokens.map(({ tokenId, metadata }) => (
          <div 
            key={tokenId} 
            style={{
              padding: "10px",
              border: "1px solid black",
              cursor: "pointer",
              background: getCardColor(metadata?.value)
            }}
            onClick={() => buyCard(tokenId)}
          >
            <p>Card #{tokenId}</p>
            <p>Name: {metadata?.name}</p>
            <p>Type: {metadata?.type}</p>
            <p>Value: {metadata?.value}</p>
            <p>Price: 0.01 ETH</p>
          </div>
        ))
      ) : (
        <p>No cards in the marketplace.</p>
      )}
    </div>
  </div>
)}

      
    </div>
  );
};

export default App;
