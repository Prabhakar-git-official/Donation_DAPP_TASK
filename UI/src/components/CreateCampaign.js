import React, { useState } from 'react';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { DONATION_Contract_ABI, DonationcontractAddress } from '../abi/contractabi'; 
import { ethers } from 'ethers'; 
// import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import { ToastContainer, toast } from 'react-toastify'; // Prompt Messages
import 'react-toastify/dist/ReactToastify.css';
import Compress from "react-image-file-resizer";
import { Link, useNavigate } from 'react-router-dom'; 
const axios = require('axios');
const CreateCampaign = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [goal, setGoal] = useState(0); // Keep this as a number
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [image, setImage] = useState('');
    // const { profileImage,setProfileImage  } = useContext(ProfileContext);
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const navigate = useNavigate(); 
    
    const captureFile =async(event) => {
        event.stopPropagation()
        event.preventDefault()
        const file = event.target.files[0]
        setImage(file.name)
        setImageFile(file)
        const MIN_FILE_SIZE = 1024 // 1KB
        const MAX_FILE_SIZE = 500120 // 500KB
        let fileSizeKiloBytes = file.size 
        let c=0;
        if(fileSizeKiloBytes < MIN_FILE_SIZE){
          toast.dismiss();
          toast.error("File size is less than minimum limit");          
          c=c+1;
        //   handleHideLoad()                               
          await sleep(4000);
          window.location.reload(false)
        }
        if(fileSizeKiloBytes > MAX_FILE_SIZE){
          toast.dismiss();
          toast.error("File size is greater than maximum limit");      
          c=c+1;
        //   handleHideLoad()  
          await sleep(4000);                             
          window.location.reload(false)
        }        
        if(c===0){
        let reader = new window.FileReader()
        try{
        Compress.imageFileResizer(file, 500, 500, 'JPEG', 200, 0,
        uri => {          
            setImage(uri)          
        },
        'base64'
        );
        reader.readAsArrayBuffer(file)        
        }catch (err) {      
        }
        }else{
          toast.dismiss();
          toast.error("Support file size: 1 kb to 500 kb ",{autoClose:3000});                
        //   handleHideLoad()                               
          await sleep(4000);
          window.location.reload(false)
          
        }
        
    }; 
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setLoading(true); 
        try {
            // Check if the goal amount is less than 1 Ether
            if (goal < 1) {
                toast.error('Goal amount must be greater than or equal to 1 ETH!');
                setLoading(false); 
                return; 
            }
    
            
            if (!imageFile){
                toast.error('No file selected for upload.');
                setLoading(false);
                return;
            }
                    // Create a FormData object to handle the file upload
                    const formData = new FormData();
                    formData.append("file", imageFile);
    
                    // Upload the file to Pinata
                    const resFile = await axios({
                        method: "post",
                        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                        data: formData,
                        headers: {
                            'pinata_api_key': "ac80f885cc28e36befab", 
                            'pinata_secret_api_key': '2ed45db352283a76286d31269731ac2fe9b366b7033a1ed5a32558e4acbca7dc',/** This is hardcoded for demonstration purposes. It's better to use a .env file or a configuration file instead. */
                            "Content-Type": "multipart/form-data"
                        },
                      
                    });
    
                    const ipfsurl = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
                    console.log("Pinata updated", ipfsurl);
    
                    // Convert dates to timestamps
                    const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
                    const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);
    
                    // Initialize the contract
                    const { ethereum } = window; // Ensure MetaMask is installed
                    if (!ethereum) {
                        toast.error('Please install MetaMask!');
                        setLoading(false);
                        return;
                    }
    
                    const provider = new ethers.providers.Web3Provider(ethereum);
                    const signer = provider.getSigner();
                    const contract = new ethers.Contract(DonationcontractAddress, DONATION_Contract_ABI, signer);
    
                    // Convert goal to Wei
                    const goalInWei = ethers.utils.parseUnits(goal.toString(), 'ether'); // Convert goal to wei
    
                    // Calling the createCause function
                    const transaction = await contract.createCause(
                        title,
                        description,
                        goalInWei.toString(),
                        startTimestamp,
                        endTimestamp,
                        ipfsurl
                    );
    
                    // Wait for the transaction to be confirmed
                    await transaction.wait();
    
                    // Show success toast
                    toast.success('Campaign created successfully!');
                    setLoading(false); 

                    setTimeout(() => {
                        navigate('/'); // Replace with the correct path to the view campaign page
                    }, 3000);
            
        } catch (error) {
            console.error('Error creating campaign:', error);
            toast.error('Error creating campaign. Please try again.');
            setLoading(false);
        }
    };
    
    
    

    return (
        <Container className="mt-5">
            <h2>Create Campaign</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="form-control" required />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="form-control" required />
                </div>
                <div className="form-group">
                    <label>Goal Amount (in ETH)</label>
                    {/* <input
                    type="number"
                    value={goal}
                    onChange={(e) => setGoal(Number(e.target.value))} // Ensure it's a number
                    className="form-control"
                    required
                    step="any" // Allow decimal values
                    min="0.0001" // Set a minimum goal amount if needed
                /> */}
                            <input
                    type="number"
                    value={goal || ''} // Set it to empty string if goal is 0 or undefined
                    onChange={(e) => setGoal(e.target.value ? Number(e.target.value) : '')} // Update the goal value
                    className="form-control"
                    required
                    step="any" // Allow decimal values
                    min="0.0001" // Set a minimum goal amount if needed
                />
                </div>
                <div className="form-group">
                    <label>Start Date</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-control" required />
                </div>
                <div className="form-group">
                    <label>End Date</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-control" required />
                </div>
                <div className="form-group">
                    <label>Image</label>
                    {/* <input type="file" onChange={(e) => setImage(e.target.files[0])} className="form-control" required /> */}
                    {/* <input type="file" onChange= {handleImageUpload} className="form-control" required /> */}
                    {/* <button type="submit" className="btn btn-primary" onClick={handleImageUpload}>upload</button> */}
                    <input type="file" onChange= {captureFile} className="form-control" required />
                </div>
                
                <button type="submit" className="btn btn-primary" style={{ marginTop: '20px' }} disabled={loading}>
                {loading ? 'Creating...' : 'Create Campaign'}
            </button>
            </form>
            <ToastContainer />
        </Container>
    );
};

export default CreateCampaign;
