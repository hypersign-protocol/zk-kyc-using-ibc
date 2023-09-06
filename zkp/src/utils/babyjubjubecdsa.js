// Todo: Implement Babyjubjub ECDSA on your own for curve support (now only supports bn128)
const buildEddsa = require("circomlibjs").buildEddsa;
const buildBabyjub = require("circomlibjs").buildBabyjub;
const { Hex, PublicKey } = require('@iden3/js-crypto')
const utils_local = require("./mnemonic.js")
const multibase=require('multibase')

const generateKeyPairFromMnemonic = async (mnemonic) => {
    let seed = await utils_local.gnerateFromMnemonic(mnemonic)
    const babyJub = await buildBabyjub();
    const F = babyJub.F;
    const eddsa = await buildEddsa();
    const privateKey = Buffer.from(seed, "hex");
    const publicKey = eddsa.prv2pub(privateKey);

    // convert PublicKey to mutibalbe base58
    const publicKeyObj = new PublicKey([BigInt(F.toObject(publicKey[0])), BigInt(F.toObject(publicKey[1]))])
    const compressedPublicKey = publicKeyObj.compress()
    const publicKeyHex = Hex.encodeString(compressedPublicKey)
    
    const base58PublicKey = multibase.encode('base58btc', Buffer.from(publicKeyHex, 'hex'))
    const publicKeyMultibase = Buffer.from(base58PublicKey).toString()


    return {
        privateKeyHex: privateKey.toString("hex"),
        publicKey: publicKey,
        publicKeyHex: publicKeyHex,
        publicKeyMultibase: publicKeyMultibase,
        publicKeyXY:publicKeyObj.p
    }

}

const convertPublicKeyMultibase2Hex=async (publicKeyMultibase)=>{
    const publicKeyHex = multibase.decode(publicKeyMultibase)
    const publicKey =Hex.encodeString(Hex.decodeString(Buffer.from(publicKeyHex).toString('hex')))
    return publicKey
}

const generateKeyPair = async () => {
    const mnemonic = utils_local.generateMnemonic(24)
    let seed = await utils_local.gnerateFromMnemonic(mnemonic)
    const babyJub = await buildBabyjub();
    const F = babyJub.F;
    const eddsa = await buildEddsa();
    const privateKey = Buffer.from(seed, "hex");
    const publicKey = eddsa.prv2pub(privateKey);

    // convert PublicKey to mutibalbe base58
    const publicKeyObj = new PublicKey([BigInt(F.toObject(publicKey[0])), BigInt(F.toObject(publicKey[1]))])
    const compressedPublicKey = publicKeyObj.compress()
    const publicKeyHex = Hex.encodeString(compressedPublicKey)
    const base58PublicKey = multibase.encode('base58btc', Buffer.from(publicKeyHex, 'hex'))
    const publicKeyMultibase = Buffer.from(base58PublicKey).toString()


    return {
        mnemonic: mnemonic,
        privateKeyHex: privateKey.toString("hex"),
        publicKey: publicKey,
        publicKeyHex: publicKeyHex,
        publicKeyMultibase: publicKeyMultibase,
        publicKeyXY:publicKeyObj.p

    }
}

module.exports = {
    generateKeyPair, generateKeyPairFromMnemonic,convertPublicKeyMultibase2Hex
}