//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract RealEstate is ERC721URIStorage {
    // We are using the Counters library to keep track of the token IDs
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // We are using the constructor to set the name and symbol for our NFT
    constructor() ERC721("RealEstate", "REAL") {}

    // Function to mint a new NFT
    // It increments the token ID counter, creates a new token ID, mints the NFT to the recipient, sets the token URI, and returns the token ID
    function mint(string memory tokenURI) public returns (uint256) {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }

}