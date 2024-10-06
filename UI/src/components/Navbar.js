import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import './styling/Navbar.css';

const CustomNavbar = ({ connectWallet, isConnected, wrongNetwork, changeNetwork }) => {
  const navigate = useNavigate(); 
  
  

  return (
    <Navbar bg="primary" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Calibraint Donation Task
        </Navbar.Brand>

        {/* Nav items */}
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
