import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers'; // Ensure you have ethers.js installed
import CampaignCard from './CampaignCard';
import { Container, Row, Col, Spinner, Button, Pagination } from 'react-bootstrap'; // Import Bootstrap components
import { DONATION_Contract_ABI, DonationcontractAddress } from '../abi/contractabi'; // Import your contract details

const ViewCampaigns = ({ onDonate }) => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [campaignsPerPage] = useState(5); 

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const contract = new ethers.Contract(DonationcontractAddress, DONATION_Contract_ABI, provider);

                const causeCount = await contract.causeCount(); // Get the no.of campaigns
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
                setError('Please Connect wallet to Access Donation Platform.'); // Set error message
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns(); 
    }, []);

    // Get current campaigns based on the current page
    const indexOfLastCampaign = currentPage * campaignsPerPage; // Last index of current page
    const indexOfFirstCampaign = indexOfLastCampaign - campaignsPerPage; // First index of current page
    const currentCampaigns = campaigns.slice(indexOfFirstCampaign, indexOfLastCampaign); // Get current campaigns

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const totalPages = Math.ceil(campaigns.length / campaignsPerPage); // Calculate total pages

    if (loading) return <Spinner animation="border" />; // Show loading spinner
    if (error) return <p>{error}</p>; // Show error message

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
