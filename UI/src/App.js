import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar'; // Ensure Navbar is imported
import ViewCampaigns from './components/ViewCampaigns';
import CreateCampaign from './components/CreateCampaign';
import DonationModal from './components/DonationModal';
import MyActivity from './components/MyActivity';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5/react';


const projectId = '74a3ececd2f143f9bab57f8d3f0204f4';

const metadata = {
  name: 'Calibraint Donation Task',
  description: 'Donation platform',
  url: 'https://calibrainttask.vercel.app',
  icons: ['https://frontend-ui-psi.vercel.app/static/media/logo-icon.c46ebc27e963e0e2213b1a9a5e6b7d1f.svg']
};

const testnet = {
  chainId: 84532,
  name: 'Base Sepolia Testnet',
  currency: 'ETH',
  explorerUrl: 'https://sepolia.basescan.org',
  rpcUrl: 'https://sepolia.base.org/'
};

// createWeb3Modal({
//   ethersConfig: defaultConfig({ 
//     metadata,
//     defaultChainId: 11155111,
//     enableEIP6963: true,
//     enableInjected: true,
//     enableCoinbase: true,
//     rpcUrl: 'https://eth-sepolia-public.unifra.io' // used for the Coinbase SDK
//   }),
//   chains: [testnet],
//   projectId
// });

createWeb3Modal({
  ethersConfig: defaultConfig({ 
    metadata,
    defaultChainId: testnet.chainId,  // Ensure this matches your testnet chainId
    enableEIP6963: true,
    enableInjected: true,
    enableCoinbase: true,
    rpcUrl: testnet.rpcUrl  // Ensure this is the correct RPC URL for Sepolia
  }),
  chains: [testnet],
  projectId // Ensure your project ID is correct
});


const App = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  
  const handleCloseModal = () => setShowModal(false);
  const handleDonate = (campaign) => {
    setSelectedCampaign(campaign);
    setShowModal(true);
  };

  return (
    <Router>
      {/* Navbar is added here, so it will show on all pages */}
      <Navbar />

      {/* Define your routes */}
      <Routes>
        <Route path="/" element={<ViewCampaigns onDonate={handleDonate} />} />
        <Route path="/create" element={<CreateCampaign />} />
        <Route path="/my-activity" element={<MyActivity />}/>
      </Routes>

      {/* Display the donation modal if a campaign is selected */}
      {selectedCampaign && (
        <DonationModal 
          show={showModal} 
          onHide={handleCloseModal} 
          campaign={selectedCampaign} 
          onDonate={(id, amount) => {/* donation logic */}} 
        />
      )}
    </Router>
  );
};

export default App;
