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


## Pushing packets manually

Hermes pushing packets to hypersign and receiving ack from hypersign and pushing it back to business chain

```bash 
hermes clear packets --chain wasmdnode --port wasm.wasm14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s0phg4d --channel channel-0
```

