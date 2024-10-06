import React from 'react';
import { Modal, Button, ProgressBar, Spinner } from 'react-bootstrap'; // Import Spinner for loader
import { ethers } from 'ethers';
import { DONATION_Contract_ABI, DonationcontractAddress } from '../abi/contractabi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DonationModal = ({ show, onHide, campaign, onDonate }) => {
    const [amount, setAmount] = React.useState("");
    const [loading, setLoading] = React.useState(false); // Loading state

    // Function to handle the donation process
    const handleDonate = async () => {
        // Validate the amount
        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Please enter a valid donation amount!');
            return;
        }

        try {
            setLoading(true); // Set loading to true when donation starts
            const { ethereum } = window;
            if (!ethereum) {
                toast.error('Please install MetaMask!');
                return;
            }

            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(DonationcontractAddress, DONATION_Contract_ABI, signer);

            // Convert donation amount to Wei (use parseUnits for decimal support)
            const amountInWei = ethers.utils.parseUnits(amount.toString(), 'ether');
            console.log("amount",amount,amountInWei);
            // Call the donateToCause function from the contract
            const transaction = await contract.donateToCause(campaign.id, {
                value: amountInWei, // Send the donation in Wei
            });

            await transaction.wait(); // Wait for the transaction to be confirmed

            toast.success('Donation successful!'); // Show success toast
            setAmount(""); // Clear the input field after successful donation
            await onDonate(); // Refresh campaign data after donation
        } catch (error) {
            console.error('Error donating:', error);
            toast.error('Donation failed! Please try again.'); // Show error toast
        } finally {
            setLoading(false); // Set loading to false when donation process is complete
        }
    };
    const handleClose = () => {
        onHide(); 
        window.location.reload(); // Refresh the page
        
    };

    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{campaign.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{campaign.description}</p>
                    <p>Goal: {campaign.goal} ETH</p>
                    <p>Raised: {campaign.raisedAmount} ETH</p>
                    <ProgressBar now={(campaign.raisedAmount / campaign.goal) * 100} />
                    <p>Ends on: {new Date(campaign.endDate * 1000).toLocaleDateString()}</p>
                    <input
                        type="number"
                        placeholder="Amount to donate"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        step="any" // Allow decimal values
                        min="0.0001" // Optionally set a minimum donation amount
                    />
                </Modal.Body>
                <Modal.Footer>
                    {/* <Button variant="secondary" onClick={onHide}>
                        Close
                    </Button> */}
                    <Button variant="primary" onClick={handleDonate} disabled={loading}>
                        {loading ? (
                            <>
                                <Spinner animation="border" size="sm" /> {/* Show spinner */}
                                &nbsp;Processing...
                            </>
                        ) : (
                            'Participate'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Toast container for displaying success/error messages */}
            <ToastContainer />
        </>
    );
};

export default DonationModal;
