# Steps to deploy and run
## IPFS
### Run IPFS
```bash
ipfs init
```
```bash
ipfs daemon
```
### Add metadata
```bash
ipfs add {filename.json}
```
Will produce a ipfs hash, you must store this for later
## Compile and deploy contract
```bash
npx hardhat run scripts/deploy.js --network hardhat
```
Will produce a card collection address, you must store this for later
## Mint card
```js
const cardCollectionAddress = "{card collection address}"; 
const cardCollection = await CardCollection.attach(cardCollectionAddress);

const tokenURI = "ipfs://{ipfs hash}";
const level = "Legendary";
const  = "{ipfs hash}";
```
In `scripts/mint.js` you must replace the `cardCollectionAddress` with the card collection address retrieved earlier as well as the ipfs hash in the `tokenURI` and `ipfsHash
```bash 
npx hardhat run scripts/mint.js --network localhost
```

