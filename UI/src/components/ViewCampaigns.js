import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import CampaignCard from './CampaignCard';
import { Container, Row, Col, Spinner, Button, Pagination } from 'react-bootstrap';


const ViewCampaigns = ({ campaigns, loading, onDonate, isConnected }) => {
    

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [campaignsPerPage] = useState(8);

    // Pagination logic
    const indexOfLastCampaign = currentPage * campaignsPerPage;
    const indexOfFirstCampaign = indexOfLastCampaign - campaignsPerPage;
    const currentCampaigns = campaigns.slice(indexOfFirstCampaign, indexOfLastCampaign);
    const totalPages = Math.ceil(campaigns.length / campaignsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Display the loading spinner only while loading
    if (loading) return
     <Spinner animation="border" />;

    // If wallet is not connected, prompt the user to connect their wallet
    if (!isConnected) {
        return (
            <Container className="text-center mt-4">
                <p>Please connect your wallet to access the donation platform.</p>
            </Container>
        );
    }

    return (
        <Container className="campaign-list mt-4">

{!isConnected ? (
                <div>
                    <p>Please connect your wallet to Access the Donation Platform.</p>
                  
                </div>
            ) :
            loading ? (
                <p>Loading campaigns...</p>
            ) : (
            <Row>
                {currentCampaigns.map(campaign => (
                    <Col key={campaign.id} md={3}> {/* 4 cards in a row (12/3 = 4) */}
                        <CampaignCard campaign={campaign} onDonate={onDonate} />
                    </Col>
                ))}

            </Row>
 )}
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
