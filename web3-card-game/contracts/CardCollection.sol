// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CardCollection is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;
    uint256 public constant MAX_OWNED_CARDS = 4;
    uint256 private constant TRADE_COOLDOWN = 5 minutes;
    uint256 private _tokenIdCounter;

    struct Card {
        string level;
        string ipfsHash;
        uint256 mintedAt;
        uint256 lastTradedAt;
        address[] previousOwners;
        bool forSale;
    }

    mapping(uint256 => Card) private _cards;
    mapping(address => uint256) public cooldowns;
    mapping(uint256 => bool) private _forSale;

    constructor() ERC721("CardCollection", "CARD") Ownable(msg.sender) {}

    function mintCard(string memory tokenURI, string memory level, string memory ipfsHash) external {
        require(balanceOf(msg.sender) < MAX_OWNED_CARDS, "Ownership limit reached");

        uint256 tokenId = nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        _cards[tokenId] = Card({
            level: level,
            ipfsHash: ipfsHash,
            mintedAt: block.timestamp,
            lastTradedAt: block.timestamp,
            previousOwners: new address[](0),
            forSale: false
        });
        _tokenIdCounter++;
    }

    function tradeCard(uint256 tokenId) external payable {
        address owner = ownerOf(tokenId);
        require(owner != msg.sender, "You cannot buy your own card");
        require(msg.value == 0.01 ether, "Incorrect price");

        payable(owner).transfer(msg.value);
        _transfer(owner, msg.sender, tokenId);
    }


    function getPreviousOwners(uint256 tokenId) external view returns (address[] memory) {
        return _cards[tokenId].previousOwners;
    }

    function getLevel(uint256 tokenId) public view returns (string memory) {
        return _cards[tokenId].level;
    }

    function getIpfsHash(uint256 tokenId) public view returns (string memory) {
        return _cards[tokenId].ipfsHash;
    }

    function getCardInfo(uint256 tokenId) external view returns (
        string memory level,
        string memory ipfsHash,
        uint256 mintedAt,
        uint256 lastTradedAt,
        address[] memory previousOwners
    ) {
        Card storage card = _cards[tokenId];
        return (card.level, card.ipfsHash, card.mintedAt, card.lastTradedAt, card.previousOwners);
    }

    function getAllTokens() public view returns (uint256[] memory) {
        uint256 totalSupply = _tokenIdCounter;
        uint256[] memory tokens = new uint256[](totalSupply);
        
        for (uint256 i = 0; i < totalSupply; i++) {
            tokens[i] = i;
        }
        
        return tokens;
    }

    function setForSale(uint256 tokenId, bool isForSale) public {
        require(ownerOf(tokenId) == msg.sender, "Only owner can change sale status");
        _forSale[tokenId] = isForSale;
    }

    function isForSale(uint256 tokenId) public view returns (bool) {
        return _forSale[tokenId];
    }

    function getAllForSaleCards() public view returns (uint256[] memory) {
        uint256 totalSupply = _tokenIdCounter;
        uint256 count = 0;

        for (uint256 i = 0; i < totalSupply; i++) {
            if (_forSale[i]) {
                count++;
            }
        }

        uint256[] memory forSaleCards = new uint256[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < totalSupply; i++) {
            if (_forSale[i]) {
                forSaleCards[index] = i;
                index++;
            }
        }

        return forSaleCards;
    }

}
