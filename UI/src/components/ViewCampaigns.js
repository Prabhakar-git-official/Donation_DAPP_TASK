import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import CampaignCard from './CampaignCard';
import { Container, Row, Col, Spinner, Button, Pagination } from 'react-bootstrap';
import { DONATION_Contract_ABI, DonationcontractAddress } from '../abi/contractabi';

const ViewCampaigns = ({ onDonate }) => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [walletConnected, setWalletConnected] = useState(false); // New state for wallet connection

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [campaignsPerPage] = useState(5);

    // Function to request wallet connection
    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                // Request account access
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                if (accounts.length > 0) {
                    setWalletConnected(true);
                }
            } catch (err) {
                console.error("User denied wallet connection:", err);
                setError('Failed to connect wallet. Please try again.');
            }
        } else {
            setError('MetaMask not detected. Please install MetaMask.');
        }
    };

    useEffect(() => {
        const checkWalletConnection = async () => {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    setWalletConnected(true);
                    setLoading(false); // Wallet is connected, stop loading
                } else {
                    setWalletConnected(false);
                    setLoading(false); // No wallet connected, stop loading
                }
            } else {
                setError('MetaMask not detected. Please install MetaMask.');
                setLoading(false); // MetaMask not installed, stop loading
            }
        };

        checkWalletConnection();
    }, []);

    useEffect(() => {
        const fetchCampaigns = async () => {
            if (!walletConnected) {
                setLoading(false); // Stop loading if wallet is not connected
                return;
            }

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
                        goal: ethers.utils.formatEther(campaign.goal), // Convert from Wei to Ether
                        raisedAmount: ethers.utils.formatEther(campaign.raisedAmount), // Convert from Wei to Ether
                        endDate: campaign.endDate.toNumber(), // Ensure endDate is a number
                        ipfsUrl: campaign.ipfsUrl,
                    });
                }

                setCampaigns(campaignsArray);
            } catch (error) {
                console.error("Error fetching campaigns:", error);
                setError('Failed to fetch campaigns. Please try again later.');
            } finally {
                setLoading(false); // Ensure loading is stopped after fetching campaigns
            }
        };

        if (walletConnected) {
            fetchCampaigns(); // Fetch campaigns if wallet is connected
        }
    }, [walletConnected]); // Re-run when walletConnected changes

    // Pagination logic
    const indexOfLastCampaign = currentPage * campaignsPerPage;
    const indexOfFirstCampaign = indexOfLastCampaign - campaignsPerPage;
    const currentCampaigns = campaigns.slice(indexOfFirstCampaign, indexOfLastCampaign);
    const totalPages = Math.ceil(campaigns.length / campaignsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Display the loading spinner only while loading
    if (loading) return <Spinner animation="border" />;

    // If wallet is not connected, prompt the user to connect their wallet
    if (!walletConnected) {
        return (
            <Container className="text-center mt-4">
                <p>Please connect your wallet to access the donation platform.</p>
                {/* <Button onClick={connectWallet}>Connect Wallet</Button> */}
            </Container>
        );
    }

    // If there's an error, show the error message
    if (error) return <p>{error}</p>;

    return (
        <Container className="campaign-list mt-4">
            <Row>
                {currentCampaigns.map(campaign => (
                    <Col key={campaign.id} md={3}> {/* 4 cards in a row (12/3 = 4) */}
                        <CampaignCard campaign={campaign} onDonate={onDonate} />
                    </Col>
                ))}
            </Row>

            {/* Pagination */}
            <Pagination>
                <Pagination.Prev onClick={() => currentPage > 1 && paginate(currentPage - 1)} />
                {Array.from({ length: totalPages }, (_, index) => (
                    <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => paginate(index + 1)}>
                        {index + 1}
                    </Pagination.Item>
                ))}
                <Pagination.Next onClick={() => currentPage < totalPages && paginate(currentPage + 1)} />
            </Pagination>
        </Container>
    );
};

export default ViewCampaigns;
