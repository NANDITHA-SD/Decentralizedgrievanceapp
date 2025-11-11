// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title BlockFix - Decentralized Grievance Redressal System
 * @dev A smart contract for managing complaints in colleges/hostels with DAO-style voting
 */
contract BlockFix {
    
    // Structs
    struct Complaint {
        uint256 id;
        address student;
        string title;
        string description;
        string location;
        string photoUrl;
        uint256 depositAmount;
        uint256 timestamp;
        ComplaintStatus status;
        address assignedVendor;
        string proofUrl;
        uint256 upvotes;
        bool fundsReleased;
    }
    
    enum ComplaintStatus {
        Pending,
        Assigned,
        Resolved,
        Confirmed
    }
    
    // State variables
    address public admin;
    uint256 public complaintCounter;
    uint256 public totalFundsPool;
    
    mapping(uint256 => Complaint) public complaints;
    mapping(address => bool) public isVendor;
    mapping(uint256 => mapping(address => bool)) public hasUpvoted;
    
    // Events
    event ComplaintRaised(
        uint256 indexed complaintId,
        address indexed student,
        string title,
        uint256 depositAmount,
        uint256 timestamp
    );
    
    event ComplaintUpvoted(
        uint256 indexed complaintId,
        address indexed voter,
        uint256 newUpvoteCount
    );
    
    event VendorAssigned(
        uint256 indexed complaintId,
        address indexed vendor,
        uint256 timestamp
    );
    
    event VendorAdded(
        address indexed vendor,
        uint256 timestamp
    );
    
    event ComplaintResolved(
        uint256 indexed complaintId,
        address indexed vendor,
        string proofUrl,
        uint256 timestamp
    );
    
    event ComplaintConfirmed(
        uint256 indexed complaintId,
        address indexed student,
        uint256 timestamp
    );
    
    event FundsReleased(
        uint256 indexed complaintId,
        address indexed vendor,
        uint256 amount,
        uint256 timestamp
    );
    
    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier onlyVendor() {
        require(isVendor[msg.sender], "Only registered vendors can perform this action");
        _;
    }
    
    modifier complaintExists(uint256 _complaintId) {
        require(_complaintId > 0 && _complaintId <= complaintCounter, "Complaint does not exist");
        _;
    }
    
    // Constructor
    constructor() {
        admin = msg.sender;
        complaintCounter = 0;
        totalFundsPool = 0;
    }
    
    /**
     * @dev Raise a new complaint with ETH deposit
     */
    function raiseComplaint(
        string memory _title,
        string memory _description,
        string memory _location,
        string memory _photoUrl
    ) external payable returns (uint256) {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        
        complaintCounter++;
        
        complaints[complaintCounter] = Complaint({
            id: complaintCounter,
            student: msg.sender,
            title: _title,
            description: _description,
            location: _location,
            photoUrl: _photoUrl,
            depositAmount: msg.value,
            timestamp: block.timestamp,
            status: ComplaintStatus.Pending,
            assignedVendor: address(0),
            proofUrl: "",
            upvotes: 0,
            fundsReleased: false
        });
        
        totalFundsPool += msg.value;
        
        emit ComplaintRaised(
            complaintCounter,
            msg.sender,
            _title,
            msg.value,
            block.timestamp
        );
        
        return complaintCounter;
    }
    
    /**
     * @dev Upvote a complaint (DAO-style voting)
     */
    function upvoteComplaint(uint256 _complaintId) 
        external 
        complaintExists(_complaintId) 
    {
        require(!hasUpvoted[_complaintId][msg.sender], "You have already upvoted this complaint");
        require(complaints[_complaintId].status != ComplaintStatus.Confirmed, "Cannot upvote confirmed complaints");
        
        hasUpvoted[_complaintId][msg.sender] = true;
        complaints[_complaintId].upvotes++;
        
        emit ComplaintUpvoted(
            _complaintId,
            msg.sender,
            complaints[_complaintId].upvotes
        );
    }
    
    /**
     * @dev Add a new vendor (admin only)
     */
    function addVendor(address _vendor) external onlyAdmin {
        require(_vendor != address(0), "Invalid vendor address");
        require(!isVendor[_vendor], "Vendor already registered");
        
        isVendor[_vendor] = true;
        
        emit VendorAdded(_vendor, block.timestamp);
    }
    
    /**
     * @dev Assign vendor to a complaint (admin only)
     */
    function assignVendor(uint256 _complaintId, address _vendor) 
        external 
        onlyAdmin 
        complaintExists(_complaintId) 
    {
        require(isVendor[_vendor], "Address is not a registered vendor");
        require(
            complaints[_complaintId].status == ComplaintStatus.Pending,
            "Complaint is not in pending status"
        );
        
        complaints[_complaintId].assignedVendor = _vendor;
        complaints[_complaintId].status = ComplaintStatus.Assigned;
        
        emit VendorAssigned(_complaintId, _vendor, block.timestamp);
    }
    
    /**
     * @dev Mark complaint as resolved with proof (vendor only)
     */
    function resolveComplaint(uint256 _complaintId, string memory _proofUrl) 
        external 
        onlyVendor 
        complaintExists(_complaintId) 
    {
        require(
            complaints[_complaintId].assignedVendor == msg.sender,
            "You are not assigned to this complaint"
        );
        require(
            complaints[_complaintId].status == ComplaintStatus.Assigned,
            "Complaint is not in assigned status"
        );
        require(bytes(_proofUrl).length > 0, "Proof URL cannot be empty");
        
        complaints[_complaintId].status = ComplaintStatus.Resolved;
        complaints[_complaintId].proofUrl = _proofUrl;
        
        emit ComplaintResolved(_complaintId, msg.sender, _proofUrl, block.timestamp);
    }
    
    /**
     * @dev Confirm resolution (student only)
     */
    function confirmResolution(uint256 _complaintId) 
        external 
        complaintExists(_complaintId) 
    {
        require(
            complaints[_complaintId].student == msg.sender,
            "Only the complaint owner can confirm resolution"
        );
        require(
            complaints[_complaintId].status == ComplaintStatus.Resolved,
            "Complaint is not in resolved status"
        );
        
        complaints[_complaintId].status = ComplaintStatus.Confirmed;
        
        emit ComplaintConfirmed(_complaintId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Release funds to vendor after confirmation (admin only)
     */
    function releaseFunds(uint256 _complaintId) 
        external 
        onlyAdmin 
        complaintExists(_complaintId) 
    {
        Complaint storage complaint = complaints[_complaintId];
        
        require(
            complaint.status == ComplaintStatus.Confirmed,
            "Complaint must be confirmed before releasing funds"
        );
        require(!complaint.fundsReleased, "Funds already released");
        require(complaint.assignedVendor != address(0), "No vendor assigned");
        
        complaint.fundsReleased = true;
        totalFundsPool -= complaint.depositAmount;
        
        (bool success, ) = payable(complaint.assignedVendor).call{value: complaint.depositAmount}("");
        require(success, "Fund transfer failed");
        
        emit FundsReleased(
            _complaintId,
            complaint.assignedVendor,
            complaint.depositAmount,
            block.timestamp
        );
    }
    
    /**
     * @dev Get all complaints
     */
    function getAllComplaints() external view returns (Complaint[] memory) {
        Complaint[] memory allComplaints = new Complaint[](complaintCounter);
        
        for (uint256 i = 1; i <= complaintCounter; i++) {
            allComplaints[i - 1] = complaints[i];
        }
        
        return allComplaints;
    }
    
    /**
     * @dev Get complaints for a specific student
     */
    function getMyComplaints(address _student) external view returns (Complaint[] memory) {
        uint256 count = 0;
        
        // Count student's complaints
        for (uint256 i = 1; i <= complaintCounter; i++) {
            if (complaints[i].student == _student) {
                count++;
            }
        }
        
        // Create array and populate
        Complaint[] memory myComplaints = new Complaint[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= complaintCounter; i++) {
            if (complaints[i].student == _student) {
                myComplaints[index] = complaints[i];
                index++;
            }
        }
        
        return myComplaints;
    }
    
    /**
     * @dev Get complaints assigned to a vendor
     */
    function getVendorComplaints(address _vendor) external view returns (Complaint[] memory) {
        uint256 count = 0;
        
        // Count vendor's complaints
        for (uint256 i = 1; i <= complaintCounter; i++) {
            if (complaints[i].assignedVendor == _vendor) {
                count++;
            }
        }
        
        // Create array and populate
        Complaint[] memory vendorComplaints = new Complaint[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= complaintCounter; i++) {
            if (complaints[i].assignedVendor == _vendor) {
                vendorComplaints[index] = complaints[i];
                index++;
            }
        }
        
        return vendorComplaints;
    }
    
    /**
     * @dev Check if user has upvoted a complaint
     */
    function hasUserUpvoted(uint256 _complaintId, address _user) 
        external 
        view 
        returns (bool) 
    {
        return hasUpvoted[_complaintId][_user];
    }
    
    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Check if address is admin
     */
    function isAdminAddress(address _address) external view returns (bool) {
        return _address == admin;
    }
    
    /**
     * @dev Check if address is vendor
     */
    function isVendorAddress(address _address) external view returns (bool) {
        return isVendor[_address];
    }
}
