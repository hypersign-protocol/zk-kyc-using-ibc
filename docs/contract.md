# On Hypersign Chain

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
# On Wasmd Chain


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

