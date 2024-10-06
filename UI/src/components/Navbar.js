import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import { useWeb3ModalAccount, useWeb3ModalProvider, useWeb3Modal } from '@web3modal/ethers5/react';
import { ethers } from 'ethers';
import './styling/Navbar.css'; 

const config = {
    chainId: 84532, // Base Sepolia Testnet
    chainIdHex: '0x14a34', // Hexadecimal representation of Base Sepolia's Chain ID
    chainName: ' Base Sepolia Testnet',
    rpcUrl: 'https://sepolia.base.org/',
    explorerUrl: 'https://sepolia.basescan.org'
  };
  
  const CustomNavbar = () => {
    const { isConnected, chainId } = useWeb3ModalAccount();
    const { walletProvider } = useWeb3ModalProvider();
    const { open } = useWeb3Modal();
    const [wrongNetwork, setWrongNetwork] = useState(false);
  
    const connectWallet = async () => {
      await open();
    };
  
    const changeNetwork = async () => {
      try {
        await walletProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: config.chainIdHex }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) { // Code for "Chain not added"
          try {
            await walletProvider.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: config.chainIdHex,
                  chainName: config.chainName,
                  rpcUrls: [config.rpcUrl],
                  blockExplorerUrls: [config.explorerUrl],
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
      setWrongNetwork(chainId !== config.chainId);
    }, [chainId]);
    return (
      <Navbar bg="primary" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">
            Calibraint Donation Task
          </Navbar.Brand>
  
          {/*Nav items */}
          <Nav className="mx-auto">
            <Nav.Link className="navbar-link" as={Link} to="/">View Campaigns</Nav.Link>
            <Nav.Link className="navbar-link" as={Link} to="/create">Create Campaign</Nav.Link>
            <Nav.Link className="navbar-link" as={Link} to="/my-activity">My Activity</Nav.Link>
        </Nav>
  
          {/* Connect Wallet button */}
          <Nav className="ml-auto">
            {!isConnected ? (
              <Button variant="outline-light" onClick={connectWallet}>
                Connect Wallet
              </Button>
            ) : wrongNetwork ? (
              <Button variant="warning" onClick={changeNetwork}>
                Switch to Base Sepolia Network
              </Button>
            ) : (
              <Button variant="success" onClick={connectWallet}>
                Wallet Connected
              </Button>
            )}
          </Nav>
        </Container>
      </Navbar>
    );
  };
  
  export default CustomNavbar;