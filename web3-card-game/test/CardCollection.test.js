const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CardCollection", function () {
    let CardCollection, cardCollection, owner, addr1, addr2;

    beforeEach(async function () {
        CardCollection = await ethers.getContractFactory("CardCollection");
        [owner, addr1, addr2, addr3] = await ethers.getSigners();
        cardCollection = await CardCollection.deploy();
        await cardCollection.waitForDeployment();
    });

    it("Should mint a new card successfully", async function () {
        const tokenURI = "ipfs://0x5FbDB2315678afecb367f032d93F642f64180aa3";
        const level = "Legendary";
        const ipfsHash = "QmRFyKNgBpTXc29VeGbN2w8P4rPiN8vdRSKRQ5WDZ3JyR6";

        const tx = await cardCollection.mintCard(tokenURI, level, ipfsHash);
        await tx.wait();

        expect(await cardCollection.ownerOf(0)).to.equal(owner.address);

        expect(await cardCollection.tokenURI(0)).to.equal(tokenURI);

        expect(await cardCollection.getLevel(0)).to.equal(level);
        expect(await cardCollection.getIpfsHash(0)).to.equal(ipfsHash);
    });

    it("should allow a user to buy a card for 0.01 ether", async function () {
        const tokenURI = "ipfs://0x5FbDB2315678afecb367f032d93F642f64180aa3";
        const level = "Rare";
        const ipfsHash = "12D3KooWKxzFxu51SiNMAX1TjjR6szBZRu4eJGroKXPJVieFKoBU";

        await cardCollection.connect(addr1).mintCard(tokenURI, level, ipfsHash);
        
        expect(await cardCollection.ownerOf(0)).to.equal(addr1.address);

        await cardCollection.connect(addr2).tradeCard(0, { value: ethers.parseEther("0.01") });

        expect(await cardCollection.ownerOf(0)).to.equal(addr2.address);
    });



    it("Should fail if minting exceeds ownership limit", async function () {
        const tokenURI = "ipfs://0x5FbDB2315678afecb367f032d93F642f64180aa3";
        const level = "Rare";
        const ipfsHash = "12D3KooWKxzFxu51SiNMAX1TjjR6szBZRu4eJGroKXPJVieFKoBU";

        for (let i = 0; i < 4; i++) {
            await cardCollection.mintCard(tokenURI, level, ipfsHash);
        }

        await expect(
            cardCollection.mintCard(tokenURI, level, ipfsHash)
        ).to.be.revertedWith("Ownership limit reached");
    });
});
