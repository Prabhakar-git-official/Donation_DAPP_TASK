import React from 'react';
import Card from 'react-bootstrap/Card';
import { ethers } from 'ethers';
import './styling/CampaignCard.css';
import { ProgressBar } from 'react-bootstrap'; 
const ActivityCard = ({ campaign,onWithdraw,walletAddress }) => {
    // Check if the campaign is closed based on the end date
    const isClosed = new Date(campaign.endDate * 1000) < new Date();
    const isCreator = campaign.creator === walletAddress; 
   
    // const canWithdraw = campaign.active === false; 
    console.log("active status", campaign.active)
    return (
        <Card className="campaign-card m-2" style={{ width: '18rem' }}>
            <img src={campaign.ipfsUrl} alt={campaign.title} className="campaign-image" />
            <Card.Body>
                <Card.Title>{campaign.title}</Card.Title>
                <Card.Text>
                    <p>{campaign.description}</p>
                    <p>Goal: {ethers.utils.formatEther(campaign.goal)} ETH</p> 
                    <p>Raised: {ethers.utils.formatEther(campaign.raisedAmount)} ETH</p> 
                  
                    <ProgressBar now={(parseFloat(ethers.utils.formatEther(campaign.raisedAmount)) / parseFloat(ethers.utils.formatEther(campaign.goal))) * 100} label={`${(parseFloat(ethers.utils.formatEther(campaign.raisedAmount)) / parseFloat(ethers.utils.formatEther(campaign.goal))) * 100}%`} />
                    <p>Ends on: {new Date(campaign.endDate * 1000).toLocaleDateString()}</p>
                    
                
                     {isCreator && isClosed && (
                        <button onClick={() => onWithdraw(campaign.id)}>Withdraw</button>
                    )}
                </Card.Text>
            </Card.Body>
        </Card>
    );
};

export default ActivityCard;
