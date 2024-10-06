import React from 'react';
import { ProgressBar } from 'react-bootstrap'; 
import './styling/CampaignCard.css'; 

const CampaignCard = ({ campaign, onDonate }) => {
    // Check if the campaign is closed (either goal reached or time passed)
    const isClosed = campaign.raisedAmount >= campaign.goal || Date.now() >= campaign.endDate * 1000;

    return (
        <div className="campaign-card">
            <img src={campaign.ipfsUrl} alt={campaign.title} className="campaign-image" />
            <h2>{campaign.title}</h2>
            <p>{campaign.description}</p>
            <p>Goal: {campaign.goal} ETH</p>
            <p>Raised: {campaign.raisedAmount} ETH</p>
            <ProgressBar now={(campaign.raisedAmount / campaign.goal) * 100} label={`${(campaign.raisedAmount / campaign.goal) * 100}%`} />
            <p>Ends on: {new Date(campaign.endDate * 1000).toLocaleDateString()}</p>

            {isClosed ? (
                <p className="closed">Closed</p>
            ) : (
                <button onClick={() => onDonate(campaign)}>Donate</button>
            )}
        </div>
    );
};

export default CampaignCard;
