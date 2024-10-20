//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _id
    ) external;
}

contract Escrow {
    address public nftAddress;
    address payable public seller;
    address public inspector;
    address public lender;

    modifier onlyBuyer(uint256 _nftID) {
        require(msg.sender == buyer[_nftID], "Only buyer can call this method");
        _;
    }

    modifier onlySeller() {
        require(msg.sender == seller, "Only seller can call this method");
        _;
    }

    modifier onlyInspector() {
        require(msg.sender == inspector, "Only inspector can call this method");
        _;
    }

    mapping(uint256 => bool) public isListed;
    mapping(uint256 => uint256) public purchasePrice;
    mapping(uint256 => uint256) public escrowAmount;
    mapping(uint256 => address) public buyer;
    mapping(uint256 => bool) public inspectionPassed;
    mapping(uint256 => mapping(address => bool)) public approval;

    constructor(
        address _nftAddress, 
        address payable _seller,
        address _inspector, 
        address _lender
        ) {
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
    }

    function list(
        uint256 _nftID, 
        address _buyer, 
        uint256 _purchasePrice, 
        uint256 _escrowAmount
        ) public payable onlySeller {
        // Transfer the NFT from the seller to the escrow contract
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftID);

        isListed[_nftID] = true;
        purchasePrice[_nftID] = _purchasePrice;
        escrowAmount[_nftID] = _escrowAmount;
        buyer[_nftID] = _buyer;
    }
    
    //Deposit earnest money into the contract
    function depositEarnest(uint256 _nftID) public payable onlyBuyer(_nftID) {
        require(msg.value >= escrowAmount[_nftID], "Incorrect earnest deposit");
    }

    function updateInspectionStatus(uint256 _nftID, bool _passed) 
        public 
        onlyInspector 
    {
        inspectionPassed[_nftID] = _passed;
    }

    //Approve Sale 
    function approveSale(uint256 _nftID) public {
        approval[_nftID][msg.sender] = true;
    }

    //Finalize Sale
    // --> Require inspection status (add more item here, like apprasial, etc)
    // --> Require sale to be autherized by all parties
    // --> Require funds to be correct amount
    // --> Transfer funds to seller
    // --> Transfer NFT to buyer
    function finalizeSale(uint256 _nftID) public {
        require(inspectionPassed[_nftID], "Inspection not passed");
        require(approval[_nftID][buyer[_nftID]], "Buyer has not approved");
        require(approval[_nftID][seller], "Seller has not approved");
        require(approval[_nftID][lender], "Lender has not approved");
        require(address(this).balance >= purchasePrice[_nftID], "Incorrect funds");

        isListed[_nftID] = false;

        (bool success, ) = payable(seller).call{value: address(this).balance}("");
        require(success, "Transfer failed");

        IERC721(nftAddress).transferFrom(address(this), buyer[_nftID], _nftID);
    }

    //Cancel Sale (handler earnest deposit)
    // --> if inspection status is not approved, then refund, otherwise send to seller
    function cancelSale(uint256 _nftID) public {
        require(msg.sender == buyer[_nftID], "Only buyer can call this method");
        if (inspectionPassed[_nftID] == false) {
            payable(buyer[_nftID]).transfer(address(this).balance);
        } else {
            payable(seller).transfer(address(this).balance);
        }
        isListed[_nftID] = false;
    }

    //This function is needed to receive the funds to increase balance like from lender
    receive() external payable {}

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}