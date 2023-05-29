# Hypersign 

## Install and Setup Hypersign Blockchain Node

**Install `hid-noded` binary** 

```bash
git clone https://github.com/hypersign-protocol/hid-node.git

cd hid-node && git checkout cosmwasm-integration

make install (or -> make build && sudo mv ./build/hid-noded /usr/local/bin)
```

**Setup `hid-noded` local blockchain network**

```bash
cd config/hypersign
sh ./localnet.sh
```

**Run Hypersign blockchain**

```bash
hid-noded start
```

The Hypersign blockchain will run on:  
- RPC port `:36657`
- REST port `:2317`