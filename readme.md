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

