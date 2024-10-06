import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { DONATION_Contract_ABI, DonationcontractAddress } from '../abi/contractabi';
import Container from 'react-bootstrap/Container';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ActivityCard from './ActivityCard'; 
import Pagination from 'react-bootstrap/Pagination'; 

const MyActivity = ({ isConnected }) => {
    const [createdCampaigns, setCreatedCampaigns] = useState([]);
    const [donatedCampaigns, setDonatedCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const { ethereum } = window; // Ensure MetaMask is installed
    const [account, setAccount] = useState('');

    // Pagination states
    const [currentPageCreated, setCurrentPageCreated] = useState(1);
    const [currentPageDonated, setCurrentPageDonated] = useState(1);
    const [campaignsPerPage] = useState(4);

    const fetchCampaigns = async () => {
        if (!ethereum) {
            toast.error('Please install MetaMask!');
            return;
        }
    
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(DonationcontractAddress, DONATION_Contract_ABI, signer);
    
        const userAddress = await signer.getAddress();
        setAccount(userAddress); // Set the current user's address
    
        try {
            // Get the total number of causes
            const totalCauses = await contract.causeCount();
            console.log('Total Causes:', totalCauses.toString()); // Debugging line
    
            const created = [];
            const donated = [];
    
            // Fetch created campaigns by the user
            for (let i = 1; i <= totalCauses; i++) {
                const cause = await contract.causes(i);
                console.log('Cause check:', cause);
    
                if (cause.creator.toLowerCase() === userAddress.toLowerCase()) {
                    created.push({ id: i, ...cause });
                }
    
                // Check donations
                const donationAmount = await contract.donations(i, userAddress);
                console.log('Donation Amount for Cause ID', i, ':', donationAmount.toString());
    
                if (donationAmount > 0) {
                    donated.push({ id: i, ...cause, donationAmount: ethers.utils.formatEther(donationAmount) });
                }
            }
    
            setCreatedCampaigns(created);
            setDonatedCampaigns(donated);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            toast.error('Error fetching campaigns. Please try again.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const handleWithdraw = async (causeId) => {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(DonationcontractAddress, DONATION_Contract_ABI, signer);
        try {
            const tx = await contract.withdrawFunds(causeId);
            await tx.wait(); 
            console.log(`Withdrawn funds for cause ID: ${causeId}`);
           
        } catch (error) {
            console.error("Error withdrawing funds:", error);
        }
    };

    // Get current created campaigns based on the current page
    const indexOfLastCreated = currentPageCreated * campaignsPerPage; // Last index of current page
    const indexOfFirstCreated = indexOfLastCreated - campaignsPerPage; // First index of current page
    const currentCreatedCampaigns = createdCampaigns.slice(indexOfFirstCreated, indexOfLastCreated); // Get current created campaigns

    // Get current donated campaigns based on the current page
    const indexOfLastDonated = currentPageDonated * campaignsPerPage; // Last index of current page
    const indexOfFirstDonated = indexOfLastDonated - campaignsPerPage; // First index of current page
    const currentDonatedCampaigns = donatedCampaigns.slice(indexOfFirstDonated, indexOfLastDonated); // Get current donated campaigns

    // Change page for created campaigns
    const paginateCreated = (pageNumber) => setCurrentPageCreated(pageNumber);

    // Change page for donated campaigns
    const paginateDonated = (pageNumber) => setCurrentPageDonated(pageNumber);

    const totalPagesCreated = Math.ceil(createdCampaigns.length / campaignsPerPage); // Calculate total pages for created campaigns
    const totalPagesDonated = Math.ceil(donatedCampaigns.length / campaignsPerPage); // Calculate total pages for donated campaigns

    return (
        <Container className="mt-5">
            <h2>My Activity</h2>
            {!isConnected ? (
                <div>
                    <p>Please connect your wallet to view your activity.</p>
                    {/* <button onClick={connectWallet} className="btn btn-primary">Connect Wallet</button> */}
                </div>
            ) :
            loading ? (
                <p>Loading campaigns...</p>
            ) : (
                <>
                    <h4>Created Campaigns</h4>
                    <div className="d-flex flex-wrap">
                        {currentCreatedCampaigns.length === 0 ? (
                            <p>No campaigns created yet.</p>
                        ) : (
                            currentCreatedCampaigns.map((campaign) => (
                                <ActivityCard key={campaign.id} campaign={campaign} onWithdraw={handleWithdraw} />
                            ))
                        )}
                    </div>
                    {/* Pagination Controls for Created Campaigns */}
                    <Pagination>
                        <Pagination.Prev onClick={() => currentPageCreated > 1 && paginateCreated(currentPageCreated - 1)} />
                        {Array.from({ length: totalPagesCreated }, (_, index) => (
                            <Pagination.Item key={index + 1} active={index + 1 === currentPageCreated} onClick={() => paginateCreated(index + 1)}>
                                {index + 1}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next onClick={() => currentPageCreated < totalPagesCreated && paginateCreated(currentPageCreated + 1)} />
                    </Pagination>

                    <h4>Donated Campaigns</h4>
                    <div className="d-flex flex-wrap">
                        {currentDonatedCampaigns.length === 0 ? (
                            <p>No donations made yet.</p>
                        ) : (
                            currentDonatedCampaigns.map((campaign) => (
                                <ActivityCard key={campaign.id} campaign={campaign} />
                            ))
                        )}
                    </div>
                    {/* Pagination Controls for Donated Campaigns */}
                    <Pagination>
                        <Pagination.Prev onClick={() => currentPageDonated > 1 && paginateDonated(currentPageDonated - 1)} />
                        {Array.from({ length: totalPagesDonated }, (_, index) => (
                            <Pagination.Item key={index + 1} active={index + 1 === currentPageDonated} onClick={() => paginateDonated(index + 1)}>
                                {index + 1}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next onClick={() => currentPageDonated < totalPagesDonated && paginateDonated(currentPageDonated + 1)} />
                    </Pagination>
                </>
            )}
            <ToastContainer />
        </Container>
    );
};

export default MyActivity;
