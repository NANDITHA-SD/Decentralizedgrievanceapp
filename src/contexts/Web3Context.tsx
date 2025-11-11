import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Web3 from 'web3';
import { toast } from 'sonner@2.0.3';

// Contract ABI - Update this after deploying your contract
const CONTRACT_ABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "complaintId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "student",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "ComplaintConfirmed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "complaintId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "student",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "depositAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "ComplaintRaised",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "complaintId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "vendor",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "proofUrl",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "ComplaintResolved",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "complaintId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "voter",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newUpvoteCount",
				"type": "uint256"
			}
		],
		"name": "ComplaintUpvoted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "complaintId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "vendor",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "FundsReleased",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "vendor",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "VendorAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "complaintId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "vendor",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "VendorAssigned",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_vendor",
				"type": "address"
			}
		],
		"name": "addVendor",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "admin",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_complaintId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_vendor",
				"type": "address"
			}
		],
		"name": "assignVendor",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "complaints",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "student",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "location",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "photoUrl",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "depositAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "enum BlockFix.ComplaintStatus",
				"name": "status",
				"type": "uint8"
			},
			{
				"internalType": "address",
				"name": "assignedVendor",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "proofUrl",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "upvotes",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "fundsReleased",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "complaintCounter",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_complaintId",
				"type": "uint256"
			}
		],
		"name": "confirmResolution",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllComplaints",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "student",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "title",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "location",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "photoUrl",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "depositAmount",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					},
					{
						"internalType": "enum BlockFix.ComplaintStatus",
						"name": "status",
						"type": "uint8"
					},
					{
						"internalType": "address",
						"name": "assignedVendor",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "proofUrl",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "upvotes",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "fundsReleased",
						"type": "bool"
					}
				],
				"internalType": "struct BlockFix.Complaint[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getContractBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_student",
				"type": "address"
			}
		],
		"name": "getMyComplaints",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "student",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "title",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "location",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "photoUrl",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "depositAmount",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					},
					{
						"internalType": "enum BlockFix.ComplaintStatus",
						"name": "status",
						"type": "uint8"
					},
					{
						"internalType": "address",
						"name": "assignedVendor",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "proofUrl",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "upvotes",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "fundsReleased",
						"type": "bool"
					}
				],
				"internalType": "struct BlockFix.Complaint[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_vendor",
				"type": "address"
			}
		],
		"name": "getVendorComplaints",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "student",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "title",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "location",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "photoUrl",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "depositAmount",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					},
					{
						"internalType": "enum BlockFix.ComplaintStatus",
						"name": "status",
						"type": "uint8"
					},
					{
						"internalType": "address",
						"name": "assignedVendor",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "proofUrl",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "upvotes",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "fundsReleased",
						"type": "bool"
					}
				],
				"internalType": "struct BlockFix.Complaint[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_complaintId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "hasUserUpvoted",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "hasUpvoted",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_address",
				"type": "address"
			}
		],
		"name": "isAdminAddress",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "isVendor",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_address",
				"type": "address"
			}
		],
		"name": "isVendorAddress",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_location",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_photoUrl",
				"type": "string"
			}
		],
		"name": "raiseComplaint",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_complaintId",
				"type": "uint256"
			}
		],
		"name": "releaseFunds",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_complaintId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_proofUrl",
				"type": "string"
			}
		],
		"name": "resolveComplaint",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalFundsPool",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_complaintId",
				"type": "uint256"
			}
		],
		"name": "upvoteComplaint",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

// Update this with your deployed contract address
const CONTRACT_ADDRESS = '0xYourContractAddressHere';

interface Complaint {
  id: string;
  student: string;
  title: string;
  description: string;
  location: string;
  photoUrl: string;
  depositAmount: string;
  timestamp: string;
  status: number;
  assignedVendor: string;
  proofUrl: string;
  upvotes: string;
  fundsReleased: boolean;
}

interface Web3ContextType {
  web3: Web3 | null;
  account: string | null;
  contract: any;
  isAdmin: boolean;
  isVendor: boolean;
  connectWallet: () => Promise<void>;
  raiseComplaint: (title: string, description: string, location: string, photoUrl: string, deposit: string) => Promise<any>;
  upvoteComplaint: (complaintId: string) => Promise<any>;
  getMyComplaints: () => Promise<Complaint[]>;
  getAllComplaints: () => Promise<Complaint[]>;
  getVendorComplaints: () => Promise<Complaint[]>;
  assignVendor: (complaintId: string, vendorAddress: string) => Promise<any>;
  resolveComplaint: (complaintId: string, proofUrl: string) => Promise<any>;
  confirmResolution: (complaintId: string) => Promise<any>;
  releaseFunds: (complaintId: string) => Promise<any>;
  addVendor: (vendorAddress: string) => Promise<any>;
  hasUserUpvoted: (complaintId: string) => Promise<boolean>;
  getContractBalance: () => Promise<string>;
  loading: boolean;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVendor, setIsVendor] = useState(false);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    try {
      setLoading(true);
      
      if (typeof window.ethereum === 'undefined') {
        toast.error('Please install MetaMask to use this application');
        return;
      }

      const web3Instance = new Web3(window.ethereum);
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (accounts.length === 0) {
        toast.error('No accounts found. Please connect to MetaMask.');
        return;
      }

      const userAccount = accounts[0];
      const contractInstance = new web3Instance.eth.Contract(
        CONTRACT_ABI as any,
        CONTRACT_ADDRESS
      );

      setWeb3(web3Instance);
      setAccount(userAccount);
      setContract(contractInstance);

      // Check if user is admin
      const adminAddress = await contractInstance.methods.admin().call();
      setIsAdmin(adminAddress.toLowerCase() === userAccount.toLowerCase());

      // Check if user is vendor
      const vendorStatus = await contractInstance.methods.isVendor(userAccount).call();
      setIsVendor(vendorStatus);

      toast.success('Wallet connected successfully!');
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          setAccount(null);
          setIsAdmin(false);
          setIsVendor(false);
          toast.info('Wallet disconnected');
        } else {
          window.location.reload();
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const raiseComplaint = async (
    title: string, 
    description: string, 
    location: string, 
    photoUrl: string, 
    deposit: string
  ) => {
    try {
      if (!contract || !account) throw new Error('Wallet not connected');
      
      const depositWei = web3!.utils.toWei(deposit, 'ether');
      
      const tx = await contract.methods
        .raiseComplaint(title, description, location, photoUrl)
        .send({ from: account, value: depositWei });
      
      toast.success('Complaint raised successfully!');
      return tx;
    } catch (error: any) {
      console.error('Error raising complaint:', error);
      toast.error(error.message || 'Failed to raise complaint');
      throw error;
    }
  };

  const upvoteComplaint = async (complaintId: string) => {
    try {
      if (!contract || !account) throw new Error('Wallet not connected');
      
      const tx = await contract.methods
        .upvoteComplaint(complaintId)
        .send({ from: account });
      
      toast.success('Complaint upvoted!');
      return tx;
    } catch (error: any) {
      console.error('Error upvoting complaint:', error);
      toast.error(error.message || 'Failed to upvote complaint');
      throw error;
    }
  };

  const getMyComplaints = async (): Promise<Complaint[]> => {
    try {
      if (!contract || !account) return [];
      
      const complaints = await contract.methods.getMyComplaints(account).call();
      return complaints;
    } catch (error: any) {
      console.error('Error getting complaints:', error);
      return [];
    }
  };

  const getAllComplaints = async (): Promise<Complaint[]> => {
    try {
      if (!contract) return [];
      
      const complaints = await contract.methods.getAllComplaints().call();
      return complaints;
    } catch (error: any) {
      console.error('Error getting all complaints:', error);
      return [];
    }
  };

  const getVendorComplaints = async (): Promise<Complaint[]> => {
    try {
      if (!contract || !account) return [];
      
      const complaints = await contract.methods.getVendorComplaints(account).call();
      return complaints;
    } catch (error: any) {
      console.error('Error getting vendor complaints:', error);
      return [];
    }
  };

  const assignVendor = async (complaintId: string, vendorAddress: string) => {
    try {
      if (!contract || !account) throw new Error('Wallet not connected');
      
      const tx = await contract.methods
        .assignVendor(complaintId, vendorAddress)
        .send({ from: account });
      
      toast.success('Vendor assigned successfully!');
      return tx;
    } catch (error: any) {
      console.error('Error assigning vendor:', error);
      toast.error(error.message || 'Failed to assign vendor');
      throw error;
    }
  };

  const resolveComplaint = async (complaintId: string, proofUrl: string) => {
    try {
      if (!contract || !account) throw new Error('Wallet not connected');
      
      const tx = await contract.methods
        .resolveComplaint(complaintId, proofUrl)
        .send({ from: account });
      
      toast.success('Complaint marked as resolved!');
      return tx;
    } catch (error: any) {
      console.error('Error resolving complaint:', error);
      toast.error(error.message || 'Failed to resolve complaint');
      throw error;
    }
  };

  const confirmResolution = async (complaintId: string) => {
    try {
      if (!contract || !account) throw new Error('Wallet not connected');
      
      const tx = await contract.methods
        .confirmResolution(complaintId)
        .send({ from: account });
      
      toast.success('Resolution confirmed!');
      return tx;
    } catch (error: any) {
      console.error('Error confirming resolution:', error);
      toast.error(error.message || 'Failed to confirm resolution');
      throw error;
    }
  };

  const releaseFunds = async (complaintId: string) => {
    try {
      if (!contract || !account) throw new Error('Wallet not connected');
      
      const tx = await contract.methods
        .releaseFunds(complaintId)
        .send({ from: account });
      
      toast.success('Funds released successfully!');
      return tx;
    } catch (error: any) {
      console.error('Error releasing funds:', error);
      toast.error(error.message || 'Failed to release funds');
      throw error;
    }
  };

  const addVendor = async (vendorAddress: string) => {
    try {
      if (!contract || !account) throw new Error('Wallet not connected');
      
      const tx = await contract.methods
        .addVendor(vendorAddress)
        .send({ from: account });
      
      toast.success('Vendor added successfully!');
      return tx;
    } catch (error: any) {
      console.error('Error adding vendor:', error);
      toast.error(error.message || 'Failed to add vendor');
      throw error;
    }
  };

  const hasUserUpvoted = async (complaintId: string): Promise<boolean> => {
    try {
      if (!contract || !account) return false;
      
      const hasUpvoted = await contract.methods
        .hasUserUpvoted(complaintId, account)
        .call();
      
      return hasUpvoted;
    } catch (error: any) {
      console.error('Error checking upvote status:', error);
      return false;
    }
  };

  const getContractBalance = async (): Promise<string> => {
    try {
      if (!contract) return '0';
      
      const balance = await contract.methods.getContractBalance().call();
      return web3!.utils.fromWei(balance, 'ether');
    } catch (error: any) {
      console.error('Error getting contract balance:', error);
      return '0';
    }
  };

  const value: Web3ContextType = {
    web3,
    account,
    contract,
    isAdmin,
    isVendor,
    connectWallet,
    raiseComplaint,
    upvoteComplaint,
    getMyComplaints,
    getAllComplaints,
    getVendorComplaints,
    assignVendor,
    resolveComplaint,
    confirmResolution,
    releaseFunds,
    addVendor,
    hasUserUpvoted,
    getContractBalance,
    loading,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
