# Steps to install dependencies (IPFS, Hardhat, Chai, Node)
### Install IPFS
```bash
npm i -g ipfs
```
### Install Hardhat
```bash
npm install --save-dev hardhat --legacy-peer-deps
```
### Install Chai
```bash
npm install chai@4.3.7 --save-dev
```
### Install NodeJS for the Frontend
```bash
cd frontend
npm install
```

# Steps to deploy and run
## IPFS
### Run IPFS
```bash
ipfs init
```
```bash
ipfs daemon
```
## Run hardhat node
```bash
npx hardhat node
```
## Compile and deploy contract
```bash
npx hardhat run scripts/deploy.js --network localhost
```
## Run react frontend
```bash
npm install
```
```bash 
npm run dev
```
## Run hardhat tests
```bash
npx hardhat test
```

