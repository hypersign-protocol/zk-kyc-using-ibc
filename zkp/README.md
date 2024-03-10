# ZKP Non-Contract Demo

## Prequisite

- Make sure to build the hid-node from [this](https://github.com/hypersign-protocol/hid-node/tree/babyjubjub-signature-support) branch
- Once the chain is up and running locally, we need to fund issuer's and user's wallet address so that they can register DIDs
    - Fund Issuer Wallet
    ```
    hid-noded tx bank send node1 hid1zam6rpuv6ea3whv0knswrcmwvuaxnrqu6un5y0 1234567uhid --keyring-backend test --chain-id hidnode --broadcast-mode block
    ```

    - Fund User Wallet
    ```
    hid-noded tx bank send node1 hid1nalna28qlad820084cgcmltd43fzawjw9gjdzg 1234567uhid --keyring-backend test --chain-id hidnode --broadcast-mode block
    ```

## Steps to run

`nvm use 14.21`

`npm install`

`sh run.sh `

`node src/index.js`