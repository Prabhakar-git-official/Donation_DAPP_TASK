import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'; 
import { useWeb3ModalAccount, useWeb3ModalProvider, useWeb3Modal } from '@web3modal/ethers5/react';
import Navbar from './components/Navbar';
import ViewCampaigns from './components/ViewCampaigns';
import CreateCampaign from './components/CreateCampaign';
import DonationModal from './components/DonationModal';
import MyActivity from './components/MyActivity';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5/react';
import { ethers } from 'ethers';
import { DONATION_Contract_ABI, DonationcontractAddress } from './abi/contractabi'; // Ensure the path is correct

const config = {
  chainId: 84532, // Base Sepolia Testnet
  chainIdHex: '0x14a34',
  chainName: 'Base Sepolia Testnet',
  rpcUrl: 'https://sepolia.base.org/',
  explorerUrl: 'https://sepolia.basescan.org',
  nativeCurrency: {
    name: 'SepoliaETH',
    symbol: 'ETH',
    decimals: 18,
  },
};

const projectId = '74a3ececd2f143f9bab57f8d3f0204f4';

const metadata = {
  name: 'Calibraint Donation Task',
  description: 'Donation platform',
  url: 'https://calibrainttask.vercel.app',
  icons: ['https://frontend-ui-psi.vercel.app/static/media/logo-icon.c46ebc27e963e0e2213b1a9a5e6b7d1f.svg'],
};

const testnet = {
  chainId: 84532,
  name: 'Base Sepolia Testnet',
  currency: 'ETH',
  explorerUrl: 'https://sepolia.basescan.org',
  rpcUrl: 'https://sepolia.base.org/',
};

createWeb3Modal({
  ethersConfig: defaultConfig({
    metadata,
    defaultChainId: testnet.chainId,
    enableEIP6963: true,
    enableInjected: true,
    enableCoinbase: true,
    rpcUrl: testnet.rpcUrl,
  }),
  chains: [testnet],
  projectId,
});

const App = () => {
  const { isConnected, chainId } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const { open } = useWeb3Modal();
  const navigate = useNavigate();
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

  const handleCloseModal = () => setShowModal(false);
  const handleDonate = (campaign) => {
    setSelectedCampaign(campaign);
    setShowModal(true);
  };

  const connectWallet = async () => {
    if (isConnected) {
     
      console.log("Wallet is already connected. Opening wallet modal...");
  }
  await open(); // Open the wallet modal regardless
  };

  const changeNetwork = async () => {
    try {
      await walletProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: config.chainIdHex }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        // Chain not added
        try {
          await walletProvider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: config.chainIdHex,
                chainName: config.chainName,
                rpcUrls: [config.rpcUrl],
                blockExplorerUrls: [config.explorerUrl],
                nativeCurrency: config.nativeCurrency,
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add chain:', addError);
        }
      } else {
        console.error('Failed to switch network:', switchError);
      }
    }
  };

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (isConnected) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const contract = new ethers.Contract(DonationcontractAddress, DONATION_Contract_ABI, provider);

          const causeCount = await contract.causeCount(); // Get the number of campaigns
          const campaignsArray = [];

          for (let i = 1; i <= causeCount; i++) {
            const campaign = await contract.causes(i); // Fetch each campaign
            campaignsArray.push({
              id: i,
              title: campaign.title,
              description: campaign.description,
              goal: ethers.utils.formatEther(campaign.goal),
              raisedAmount: ethers.utils.formatEther(campaign.raisedAmount),
              endDate: campaign.endDate.toNumber(),
              ipfsUrl: campaign.ipfsUrl,
            });
          }

          setCampaigns(campaignsArray);
        } catch (error) {
          console.error("Error fetching campaigns:", error);
        } finally {
          setLoading(false); // Stop loading after fetching
        }
      }
    };

    fetchCampaigns();
  }, [isConnected]);

  useEffect(() => {
    if (isConnected) {
      setWrongNetwork(Number(walletProvider?.chainId) !== config.chainId);
      // if (!wrongNetwork) {
      //   navigate('/'); // Navigate to the root path when connected and on the correct network
      // }
    }
  }, [isConnected, walletProvider, wrongNetwork, navigate]);

  return (
    <>
   
      <Navbar
        connectWallet={connectWallet}
        isConnected={isConnected}
        wrongNetwork={wrongNetwork}
        changeNetwork={changeNetwork}
      />
       {isConnected ? (
      <Routes>
        <Route 
          path="/" 
          element={<ViewCampaigns campaigns={campaigns} loading={loading} onDonate={handleDonate} isConnected={isConnected} />} 
        />
        <Route path="/create" element={<CreateCampaign />} />
        <Route path="/my-activity" element={<MyActivity isConnected={isConnected}/>} />
      </Routes>
       ) : (
        <div className="text-center mt-4">
          <p>Please connect your wallet to access the Donation Platform.</p>
          
        </div>
      )}

      {selectedCampaign && (
        <DonationModal
          show={showModal}
          onHide={handleCloseModal}
          campaign={selectedCampaign}
          onDonate={(id, amount) => {/* donation logic */}}
        />
      )}

      
    </>
  );
};

export default App;
