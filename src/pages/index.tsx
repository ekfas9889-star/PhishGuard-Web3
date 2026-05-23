import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const SEPOLIA_RPC = 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY';

export default function Home() {
  const [account, setAccount] = useState('');
  const [scamAddress, setScamAddress] = useState('');
  const [category, setCategory] = useState('phishing');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        setAccount(accounts[0]);
      } catch (error) {
        console.error('Wallet connection failed:', error);
      }
    }
  };

  const checkAddress = async () => {
    if (!scamAddress) {
      alert('Please enter an address');
      return;
    }

    setIsChecking(true);
    try {
      const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
      
      // Check balance (simple phishing indicator)
      const code = await provider.getCode(scamAddress);
      const balance = await provider.getBalance(scamAddress);
      
      setResult({
        address: scamAddress,
        isContract: code !== '0x',
        balance: ethers.formatEther(balance),
        timestamp: new Date().toLocaleString(),
      });
    } catch (error) {
      console.error('Check failed:', error);
      alert('Error checking address');
    } finally {
      setIsChecking(false);
    }
  };

  const reportScam = async () => {
    if (!account || !scamAddress) {
      alert('Connect wallet and enter address');
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // TODO: Replace with actual contract address
      const contractAddress = '0x...';
      const abi = ['function reportScam(address _scamAddress, string memory _category) external'];
      const contract = new ethers.Contract(contractAddress, abi, signer);
      
      const tx = await contract.reportScam(scamAddress, category);
      await tx.wait();
      
      alert('Scam reported successfully!');
      setScamAddress('');
    } catch (error) {
      console.error('Report failed:', error);
      alert('Failed to report scam');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', fontFamily: 'Arial' }}>
      <h1>🛡️ PhishGuard Web3</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <p>Connected: {account || 'Not connected'}</p>
        {!account && <button onClick={connectWallet}>Connect Wallet</button>}
      </div>

      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
        <h2>Check Address</h2>
        <input
          type="text"
          placeholder="0x..."
          value={scamAddress}
          onChange={(e) => setScamAddress(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        
        <button onClick={checkAddress} disabled={isChecking} style={{ padding: '10px 20px', marginRight: '10px' }}>
          {isChecking ? 'Checking...' : 'Check Address'}
        </button>

        {result && (
          <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
            <p><strong>Address:</strong> {result.address}</p>
            <p><strong>Is Contract:</strong> {result.isContract ? 'Yes' : 'No'}</p>
            <p><strong>Balance:</strong> {result.balance} ETH</p>
            <p><strong>Checked:</strong> {result.timestamp}</p>
          </div>
        )}
      </div>

      <div style={{ border: '1px solid #ccc', padding: '20px', marginTop: '20px', borderRadius: '8px' }}>
        <h2>Report Scam</h2>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        >
          <option value="phishing">Phishing</option>
          <option value="drainer">Wallet Drainer</option>
          <option value="fake-token">Fake Token</option>
        </select>
        
        <button onClick={reportScam} style={{ padding: '10px 20px', backgroundColor: '#ff4444', color: 'white' }}>
          Report to Registry
        </button>
      </div>
    </div>
  );
}
