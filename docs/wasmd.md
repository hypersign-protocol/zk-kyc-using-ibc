# Wasmd

## Install and Setup Wasm Blockchain Node

**Install `wasmd` binary** 
```bash
git clone https://github.com/CosmWasm/wasmd.git
cd wasmd && git checkout v0.30.0
make install
```
**Setup `wasmd` local blockchain network**

```bash
cd config/wasm
sh ./localnet.sh
```

**Run Wasm blockchain**

```bash
wasmd start
```

The Wasm blockchain will run on:  
- RPC port `:26657`
- REST port `:1317`
