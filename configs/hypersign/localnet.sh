#!/bin/bash

# Set the binary name
BINARY=hid-noded
BINARY_LOCATION=.hid-node
CHAIN_ID=hidnode

# BINARY=hid-noded
# BINARY_LOCATION=.hid-node
# CHAIN_ID=hidnode

# Check if the binary is installed
${BINARY} &> /dev/null

RET_VAL=$?
if [ ${RET_VAL} -ne 0 ]; then
    echo "hidnode binary is not installed in your system."
    exit 1
fi

# Setting up config files
rm -rf $HOME/$BINARY_LOCATION/

# Make directories for hid-node config
mkdir $HOME/$BINARY_LOCATION

# Init node
$BINARY init --chain-id=$CHAIN_ID node1 --home=$HOME/$BINARY_LOCATION
$BINARY configure min-gas-prices 0uhid
# Create key for the node
$BINARY keys add node1 --keyring-backend=test --home=$HOME/$BINARY_LOCATION

# change staking denom to uhid
cat $HOME/$BINARY_LOCATION/config/genesis.json | jq '.app_state["staking"]["params"]["bond_denom"]="uhid"' > $HOME/$BINARY_LOCATION/config/tmp_genesis.json && mv $HOME/$BINARY_LOCATION/config/tmp_genesis.json $HOME/$BINARY_LOCATION/config/genesis.json

# update crisis variable to uhid
cat $HOME/$BINARY_LOCATION/config/genesis.json | jq '.app_state["crisis"]["constant_fee"]["denom"]="uhid"' > $HOME/$BINARY_LOCATION/config/tmp_genesis.json && mv $HOME/$BINARY_LOCATION/config/tmp_genesis.json $HOME/$BINARY_LOCATION/config/genesis.json

# update gov genesis
cat $HOME/$BINARY_LOCATION/config/genesis.json | jq '.app_state["gov"]["deposit_params"]["min_deposit"][0]["denom"]="uhid"' > $HOME/$BINARY_LOCATION/config/tmp_genesis.json && mv $HOME/$BINARY_LOCATION/config/tmp_genesis.json $HOME/$BINARY_LOCATION/config/genesis.json
cat $HOME/$BINARY_LOCATION/config/genesis.json | jq '.app_state["gov"]["voting_params"]["voting_period"]="50s"' > $HOME/$BINARY_LOCATION/config/tmp_genesis.json && mv $HOME/$BINARY_LOCATION/config/tmp_genesis.json $HOME/$BINARY_LOCATION/config/genesis.json

# update mint genesis
cat $HOME/$BINARY_LOCATION/config/genesis.json | jq '.app_state["mint"]["params"]["mint_denom"]="uhid"' > $HOME/$BINARY_LOCATION/config/tmp_genesis.json && mv $HOME/$BINARY_LOCATION/config/tmp_genesis.json $HOME/$BINARY_LOCATION/config/genesis.json

# create validator node with tokens
$BINARY add-genesis-account $($BINARY keys show node1 -a --keyring-backend=test --home=$HOME/$BINARY_LOCATION) 500000000000000000uhid --home=$HOME/$BINARY_LOCATION --keyring-backend test
$BINARY gentx node1 50000000000000000uhid --keyring-backend=test --home=$HOME/$BINARY_LOCATION --chain-id=$CHAIN_ID
$BINARY collect-gentxs --home=$HOME/$BINARY_LOCATION

# change app.toml values
sed -i -E '112s/enable = false/enable = true/' $HOME/$BINARY_LOCATION/config/app.toml
sed -i -E '115s/swagger = false/swagger = true/' $HOME/$BINARY_LOCATION/config/app.toml
sed -i -E '133s/enabled-unsafe-cors = false/enabled-unsafe-cors = true/' $HOME/$BINARY_LOCATION/config/app.toml
sed -i -E 's|tcp://0.0.0.0:1317|tcp://0.0.0.0:2317|g' $HOME/$BINARY_LOCATION/config/app.toml
sed -i -E 's|0.0.0.0:9090|0.0.0.0:9088|g' $HOME/$BINARY_LOCATION/config/app.toml
sed -i -E 's|0.0.0.0:9091|0.0.0.0:9089|g' $HOME/$BINARY_LOCATION/config/app.toml

# change config.toml values
sed -i -E 's|allow_duplicate_ip = false|allow_duplicate_ip = true|g' $HOME/$BINARY_LOCATION/config/config.toml
sed -i -E 's|addr_book_strict = true|addr_book_strict = false|g' $HOME/$BINARY_LOCATION/config/config.toml
sed -i -E 's|cors_allowed_origins = \[\]|cors_allowed_origins = \[\"\*\"\]|g' $HOME/$BINARY_LOCATION/config/config.toml
sed -i -E 's|tcp://127.0.0.1:26658|tcp://127.0.0.1:36658|g' $HOME/$BINARY_LOCATION/config/config.toml 
sed -i -E 's|tcp://127.0.0.1:26657|tcp://127.0.0.1:36657|g' $HOME/$BINARY_LOCATION/config/config.toml
sed -i -E 's|tcp://0.0.0.0:26656|tcp://0.0.0.0:36656|g' $HOME/$BINARY_LOCATION/config/config.toml

echo -e "\nConfiguration set up is done, you are ready to run $BINARY now!"

echo -e "\nPlease note the important chain configurations below:"

echo -e "\nRPC server address: http://localhost:36657"
echo -e "API server address: http://localhost:2317"
echo -e "DID Namespace: devnet"

echo -e "\nEnter the command 'hid-noded start' to start a single node blockchain."