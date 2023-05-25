============ Setup Hidnode

1. git clone https://github.com/hypersign-protocol/hid-node.git
2. cd hid-node && git checkout cosmwasm-integration
3. make install (or -> make build && sudo mv ./build/hid-noded /usr/local/bin)
4. sh ./localnetsetup.sh  (It sets up hid-node config file)

============ Setup Wasm

1. git clone https://github.com/CosmWasm/wasmd.git
2. cd wasmd && git checkout v0.30.0
3. make install


============ Hermese

Hermes binary link: https://github.com/informalsystems/hermes/releases/download/v1.3.0/hermes-v1.3.0-x86_64-apple-darwin.tar.gz

tar -xvzf hermes-v1.3.0-x86_64-apple-darwin.tar.gz

sudo mv hermes /usr/local/bin/

setup config.toml 

mv ./configs/hermes/config.toml ~/.hermes/config.toml




## Accounts setup for hermes 
Hypersign side

hidnode.json
```json
{
    "name": "wallet1",
    "type": "local",
    "address": "hid1j2e7r2ktl70e2jgy36g85prkwtr52rzdlasp04",
    "pubkey": "{\"@type\":\"/cosmos.crypto.secp256k1.PubKey\",\"key\":\"A/iKWLEHCK0Fta6L73HDkAlGfRoeuFcaKf+owemsprF+\"}",
    "mnemonic": "soap ordinary know hollow volcano great sample slot gadget embark sure inspire medal neither identify endless debate later art list large spin work fashion"
}

```

wasmd.json
```

```
Add keys 

```bash
hermes keys add --key-file ./hidnode.json --chain hidnode
```

```bash
hermes keys add --key-file ./wasmdnode.json --chain wasmdnode
```


Fund these wallets

```bash
hid-noded tx bank send $(hid-noded keys show node1 -a --keyring-backend test) hid1j2e7r2ktl70e2jgy36g85prkwtr52rzdlasp04 1000000uhid --broadcast-mode block  --keyring-backend test --chain-id hidnode --yes

```

```bash
wasmd tx bank send $(wasmd keys show node1 -a --keyring-backend test) wasm1pgs6qw5dwaghrvkvu6fk42tfmft6vh79jdysfy 1000000uwasm --broadcast-mode block  --keyring-backend test --chain-id wasmdnode --yes --node tcp://localhost:36657
```


## connection /

```
--- Client 
    |
     -- Connections 
        |
         -- Channels [ports]
```

creating connection : 

```bash
hermes create connection --a-chain wasmdnode --b-chain hidnode
```

Channel creation between contracts deployed on both the cahins.  but before that respective contracts needs to be deployed on respective chains. 


### Building verifier contract on hypersign chain:

```bash
cd verifier-contract
docker run --rm -v "$(pwd)":/code --mount type=volume,source="$(basename "$(pwd)")_cache",target=/code/target --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry cosmwasm/rust-optimizer:0.12.6
```

### Upload verifier contract on hypersign chain:

```bash
hid-noded tx wasm store ./artifacts/verifier-contract.wasm --from node1 --keyring-backend test --broadcast-mode block --chain-id hidnode --gas 5628283
```

### Building business contract on hypersign chain:

```
cd business-contract
docker run --rm -v "$(pwd)":/code --mount type=volume,source="$(basename "$(pwd)")_cache",target=/code/target --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry cosmwasm/rust-optimizer:0.12.6
```

