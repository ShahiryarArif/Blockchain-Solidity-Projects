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
    address public lender;
    address public inspector;
    address public nftAddress;
    address payable public seller;

    constructor(address _lender, address _inspector, address _nftAddress, address payable _seller) {
        lender = _lender;
        inspector = _inspector;
        nftAddress = _nftAddress;
        seller = _seller;
    }
    
}
