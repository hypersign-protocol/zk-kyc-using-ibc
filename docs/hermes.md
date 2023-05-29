# Hermes - An IBC relayer

[Hermes](https://hermes.informal.systems/) is Rust based relayer for IBC. It provides cli to relay packets between Cosmos SDK chains, exporse Prometheum metrics and offers REST APIs. 

> Note: An **IBC relayer** is an off-chain process responsible for relaying IBC datagrams between any two chains. The way it does so is by scanning chain states, building transactions based on these states, and submitting the transactions to the chains involved in the network.

## Install `hermes` binary

```bash
wget https://github.com/informalsystems/hermes/releases/download/v1.3.0/hermes-v1.3.0-x86_64-apple-darwin.tar.gz 
tar -xvzf hermes-v1.3.0-x86_64-apple-darwin.tar.gz
sudo mv hermes /usr/local/bin/
```

## Setup configuration
```bash
mv ./configs/hermes/config.toml ~/.hermes/config.toml
```

## Accounts setup for hermes

**Adding keys for Hypersign account**

```bash
cd config/hermes
hermes keys add --key-file ./hidnode.json --chain hidnode
```

**Adding keys for wasm account**

```bash
cd config/hermes
hermes keys add --key-file ./wasmdnode.json --chain wasmdnode
```

## Funding these wallets

**Fund Hermes' hypersign's account**

```bash
hid-noded tx bank send $(hid-noded keys show node1 -a --keyring-backend test) hid1j2e7r2ktl70e2jgy36g85prkwtr52rzdlasp04 1000000uhid --broadcast-mode block  --keyring-backend test --chain-id hidnode --yes --node tcp://localhost:36657

```

**Fund Hermes' wasm's account**
```bash
wasmd tx bank send $(wasmd keys show node1 -a --keyring-backend test) wasm1pgs6qw5dwaghrvkvu6fk42tfmft6vh79jdysfy 1000000uwasm --broadcast-mode block  --keyring-backend test --chain-id wasmdnode --yes 
```

## Creating connection between Hypersign and Wasm nodes

```bash
hermes create connection --a-chain wasmdnode --b-chain hidnode
```
Next we have to create the channel, but before that let's deploy our zk-verifier contract on hypersign and business  (whitelisting pool) contract on wasm blockchain.

## Creating channel between Hypersign and Wasm nodes

Now we will create channel but before that we need to know ports of these respective contracts: 

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

## Pushing packets manually

Hermes pushing packets to hypersign and receiving ack from hypersign and pushing it back to business chain

```bash 
hermes clear packets --chain wasmdnode --port wasm.wasm14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s0phg4d --channel channel-0
```


## Finally, start the hermes

```bash
hermes start
```
