const { DirectSecp256k1HdWallet, Registry } = require("@cosmjs/proto-signing");
const { SigningStargateClient } = require("@cosmjs/stargate");
const { msgTypes } = require('./generated/registry');

// Creates a Tendermint Client for an input wallet object
const createClient = async (wallet) => {
    const nwRegistry = new Registry()
    // Register SSI typeUrls
    msgTypes.forEach(([typeUrl, genTypes]) => {
        nwRegistry.register(
            typeUrl,
            genTypes
        )
    })
    
    const client = await SigningStargateClient.connectWithSigner(
        "http://localhost:26657", 
        wallet, 
        { registry: nwRegistry }
    )

    return client
}

// Get offline signer and blockchain address
const getWalletObjAndAddressFromMnemonic = async (mnemonic) => {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: "hid" })
    const accounts = await wallet.getAccounts()
    const address = accounts[0].address
    return {
        wallet,
        address
    }
}

module.exports = {
    createClient,
    getWalletObjAndAddressFromMnemonic
}