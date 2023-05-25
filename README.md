## How it works



![img](https://user-images.githubusercontent.com/15328561/236688594-9a0e5477-627b-46eb-81c0-1a57c63eb788.png)



![img](/assets/cross-chain-zk-kyc-addr-whitelisting-flow.png)


- [sequenceDiagram](https://sequencediagram.org/index.html#initialData=C4S2BsFMAIGECcD2BnZBaWALAhiAdtAFoDS0AggCYXySrQDqmYk4IyoeA5gFDfYDGwRPGgBVZJHjcADtnih+IWXmDQAapJAAzEJLiIV8AaoAUACQCe0ychCcCWXHgCU0AMQAjAJxbskAKwycgpK2CrQAEIArrZ4tMj6hsbQJvTYyAC2cDj4rp5eHhS+QfIgisqqADIRZInARoIpaZnZTnnehcW84npoAHzRsfF1DabNWY650ABccNjg4NAAVEvEAJqwK9AAyhnBI8kAogAekPxRwDAZkMCYiBS8HojH0PB2mKqIWpEx+MOwBnqyVS6QmORcsxW602SxSAB0CNBpEgvrNtvV8JwADQI6DQbBUGioNEYrhYvG4pFRDysfgAfVs9nmswAkiocYiQB56fwcHg4uASW8uAjnI9ntBEAA3PSDP50AFJRoglqTCF4lYsiKwaAABQEAGsbls2EiaLIaBRoLdsKp8PxwFEKLR8dBzuxEFl2PAooIojRlksNG8tBYtuKXtLZb84grAaMmqDWrlIUHNKGtgBvSkE6jxDl45GIL6U6TU2kMux4eYIgC+vDlsYSiqByvGyZc0H66nTuhELYT5isNirHecaMgeCtmu1esNxthEclMpEwe0fYOyss1ngjIc4PHeLxABFaJp5iAAF4wGc6-X8I3ALZhCiUo+QY6t1S3G9pkNh2FvV9YAlyjVdez0AdgW3Ed7DHWYj0QpCjwAJSiAgViLfh4jpIsvhMTCUS0IVMXJMsaTKSsmUFHZSU4FZnBWXEhGgFdtAsa1MBgQhJEQaBiDwRAAHcoAoTgYF1IiADpoBQm5-QwpZ6iiSATW+PDvlNKULwockWAkQNfHACQVlAlcexDDcoK3Ydd1HNVDyPSgrR-Vje34W0QAMV5aCicBgARfBON-LUdTIB9BJEyAxMga4VC2N9kK+YLA1CucHwXXhuDXHRIPjaDbL3McuwGGN-nytskwcicp2gDxDVS2d70fUzuCeSNzMbcqlTGKqDwQ5DUJuN5IBlNzLI80BvKJPyAoILQkCyW90papYAHIEkNSLRPEuLVDM6MhjjHrE1Vfq5gWVLuXCg1tui8TiAsfgtmuW57mtRBEsGo8hKYS5WHYFLcyJZAZIRbZsDG1zgeGILXOs4ANugdhbUgXhqlqBHTrBNoSq646v2x+CLsWFYzDIbY6WhQ5jy2XZ9ixgBFFT4A4gBZG47lfREkJY3kzgNaBtBS-Ay1UGG6FNX7mABy4HjaiUoC0T5vnx5sKt6s62lTcnKep2nYRMHNCXiEiRRcA6RDVzdNZxlNoEqYtBa0YQUpoABHFT2Gi-ETclgh4Y1pGUcuBsyoJwd2wckqMZtonqtk+T4EUgAiCWElNaFopTtTfbzVBKVNZEz3COGuJt4PgFRvTjMgRKaGABTAzTv2M4SAA5AB5AAVfiNmzlYgA)


![img](/assets/zk-kyc%20attribute-membership%20circuit.jpg)

## Setup 

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
hid-noded tx bank send $(hid-noded keys show node1 -a --keyring-backend test) hid1j2e7r2ktl70e2jgy36g85prkwtr52rzdlasp04 1000000uhid --broadcast-mode block  --keyring-backend test --chain-id hidnode --yes --node tcp://localhost:36657

```

```bash
wasmd tx bank send $(wasmd keys show node1 -a --keyring-backend test) wasm1pgs6qw5dwaghrvkvu6fk42tfmft6vh79jdysfy 1000000uwasm --broadcast-mode block  --keyring-backend test --chain-id wasmdnode --yes 
```

wasmd keys add asd

wasmd tx bank send $(wasmd keys show node1 -a --keyring-backend test) wasm1wn5727qmv3p0e0wf9tdhwlfcw9qvgl3phlf6ed 1000000uwasm --broadcast-mode block  --keyring-backend test --chain-id wasmdnode --yes  

wasmd q bank balances wasm1tgvec6zd0j5t7y4qtj902wtgxjkm6w96zt5da4 


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
cd verifier-contract
hid-noded tx wasm store ./artifacts/verifier_contract.wasm --from node1 --keyring-backend test --broadcast-mode block --chain-id hidnode --gas 5628283 --node tcp://localhost:36657
```

### Instantiate verifier contract on hypersign chain:

```bash
INIT_ARGS='{}'

hid-noded tx wasm instantiate 1 "$INIT_ARGS" --label "verifiercontract" --from node1 --keyring-backend test --broadcast-mode block --chain-id hidnode --no-admin --node tcp://localhost:36657
```

o/p

```bash
...
...
- key: _contract_address
      value: hid14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9skm6af7
...
...
```

### Building business contract on wasmd chain:

```bash
cd business-contract
docker run --rm -v "$(pwd)":/code --mount type=volume,source="$(basename "$(pwd)")_cache",target=/code/target --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry cosmwasm/rust-optimizer:0.12.6
```


### Upload business contract on wasmd chain:

```bash
cd business-contract
wasmd tx wasm store ./artifacts/business_contract.wasm --from node1 --keyring-backend test --broadcast-mode block --chain-id wasmdnode --gas 5628283 
```

### Instantiate business contract on wasmd chain:

```bash
cd business-contract
INIT_ARGS='{}'

wasmd tx wasm instantiate 1 "$INIT_ARGS" --label "somecontract1" --from node1 --keyring-backend test --broadcast-mode block --chain-id wasmdnode --no-admin 
```

o/p

```bash
...
...
- key: _contract_address
      value: wasm14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s0phg4d
...
...
```

Now we will create channel  but before that we need to know ports of these respective contracts: 

Port for hid14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9skm6af7

```bash
hid-noded q wasm contract hid14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9skm6af7
```
o/p:

```bash
address: hid14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9skm6af7
contract_info:
  admin: ""
  code_id: "1"
  created: null
  creator: hid10yv4f2ure3ygdeq6zeyrkf04hkjemncsfz77u5
  extension: null
  ibc_port_id: wasm.hid14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9skm6af7
  label: verifiercontract
```

Port for wasm14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s0phg4d

```bash
wasmd q wasm contract wasm14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s0phg4d --node tcp://localhost:36657
```
o/p: 

```bash
address: wasm14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s0phg4d
contract_info:
  admin: ""
  code_id: "1"
  created:
    block_height: "818"
    tx_index: "0"
  creator: wasm1d8n9csuuk8u3pgffw77sj7j8da8z7z54yn2svx
  extension: null
  ibc_port_id: wasm.wasm14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s0phg4d
  label: somecontract1
```

Now we are ready for creating channel using hermes between these two contracts:


```bash
hermes create channel \
	--a-chain wasmdnode \
	--a-connection connection-0 \
	--a-port wasm.wasm14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s0phg4d \
	--b-port wasm.hid14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9skm6af7 \
	--order ORDER_UNORDERED \
	--channel-version 'zk-1'
```

Now lets start the hermes

```bash
hermes start
```

--- 

# contract interaction 

## Lets's do the KYC on business contract

```bash
wasmd tx wasm execute wasm14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s0phg4d '{
   "kyc": {
      "channel": "channel-0",
      "proof": "{'pi_a':[10,5,115,176,203,123,226,16,212,251,108,11,209,221,96,236,231,133,190,9,247,252,78,235,109,41,252,41,96,255,195,187,77,86,113,82,18,175,207,172,175,39,55,153,208,167,34,98,11,24,88,199,201,223,7,216,164,201,206,144,90,179,171,21,22,183,2,252,67,188,128,102,105,167,73,53,5,79,91,74,127,63,159,115,1,222,5,139,79,87,240,92,71,118,13,21],'pi_b':[4,57,117,98,61,64,134,184,24,66,161,230,178,12,242,86,182,153,167,136,45,155,131,66,129,223,27,146,255,219,239,161,13,24,27,221,42,220,144,164,195,245,96,180,183,235,30,99,7,70,147,65,12,231,100,200,16,140,115,46,248,96,180,178,105,128,54,211,105,183,27,222,187,111,47,226,89,138,77,199,70,68,88,193,244,16,182,30,77,129,198,218,85,38,122,231,21,178,214,153,33,202,149,177,96,84,101,230,6,150,149,40,13,190,2,132,11,236,246,91,198,24,191,224,180,12,242,88,102,219,211,48,182,218,252,67,86,127,159,86,155,234,46,213,9,9,95,29,99,94,13,38,241,91,17,193,3,78,221,160,146,182,168,45,171,76,76,3,223,108,30,223,50,163,70,79,194,235,252,222,22,231,167,118,206,180,95,52,138,228,207,122],'pi_c':[8,137,240,71,171,138,189,183,180,54,123,8,143,165,133,199,14,166,97,41,125,246,77,240,151,48,42,100,85,182,198,191,22,240,246,151,110,70,193,239,238,54,122,114,149,114,48,199,5,88,162,102,181,174,181,13,105,4,255,178,174,56,110,139,69,38,212,59,38,80,245,177,179,133,4,179,73,224,208,102,179,196,84,179,155,3,48,105,46,44,170,105,71,196,242,4]}",
      "public_signal": 1,
      "address": "wasm19n3v8rx66hj2yqadmuuz48zxuhu5eu4nct6eg0"
   }
}' --from node1 --keyring-backend test --broadcast-mode async --chain-id wasmdnode --gas 5628283 

```

## Check if your wallet is whitelisted or not

```bash
wasmd q wasm contract-state smart wasm14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s0phg4d '{"has_kyced": {"address": "wasm19n3v8rx66hj2yqadmuuz48zxuhu5eu4nct6eg0"}}' --node tcp://localhost:36657
```

o/p 

```bash
data:
  result: address is NOT KYCed
```

Its not! reason being, hermes automatically not pushing the packets to hypersign (except for rare situation) so we need to manually ask hermes to push the packets to hypersign.

## hermes pushing packets to hypersign and receiving ack from hypersign and pushing it back to business chain

```bash 
hermes clear packets --chain wasmdnode --port wasm.wasm14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s0phg4d --channel channel-0
```


Now if we run the getter command again

```bash
wasmd q wasm contract-state smart wasm14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s0phg4d '{"has_kyced": {"address": "wasm19n3v8rx66hj2yqadmuuz48zxuhu5eu4nct6eg0"}}'
data:
  result: address is KYCed
```

it says verified

wasmd q wasm contract-state smart wasm14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s0phg4d '{"has_kyced": {"address": "wasm1tgvec6zd0j5t7y4qtj902wtgxjkm6w96zt5da4"}}'

wasm1tgvec6zd0j5t7y4qtj902wtgxjkm6w96zt5da4


