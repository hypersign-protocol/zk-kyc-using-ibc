const { generateKeyPairFromMnemonic }=require('./utils')

const didStruct = {
    "context": [],
    "id": "did:example:123456789abcdefghi",
    "alsoKnownAs": ["https://example.com/1659872463"],
    "controller": ["did:example:123456789abcdefghi"],
    "verificationMethod": [{
        "id": "did:example:123456789abcdefghi#keys-1",
        "type": "EcdsaSecp256k1VerificationKey2019",
        "controller": "did:example:123456789abcdefghi",
        "publicKeyMultibase": "z3n6X3Z4Z",
        "blockchainAccountId": ""
    }],
    "authentication": [],
    "assertionMethod": ["did:example:123456789abcdefghi#key-1"],
    "capabilityDelegation": [],
    "capabilityInvocation": [],
    "keyAgreement": [],
    "service": []
}

const generateDid = async (publicKeyMultibase) => {
        didStruct.id="did:hid:devnet:"+publicKeyMultibase
        didStruct.controller[0]="did:hid:devnet:"+publicKeyMultibase,
        didStruct.verificationMethod[0].id="did:hid:devnet:"+publicKeyMultibase+"#key-1"
        didStruct.verificationMethod[0].controller="did:hid:devnet:"+publicKeyMultibase
        didStruct.verificationMethod[0].publicKeyMultibase=publicKeyMultibase
        didStruct.verificationMethod[0].type="BabyJubJubVerificationKey2023"
        didStruct.assertionMethod[0]="did:hid:devnet:"+publicKeyMultibase+"#key-1"
        didStruct.service=[]
        didStruct.alsoKnownAs[0]="did:hid:devnet:"+publicKeyMultibase

        return didStruct
}

const generateDidFromMnemonic = async (mnemonic) => {
    const keyPair = await generateKeyPairFromMnemonic(mnemonic)
    const publicKeyMultibase = keyPair.publicKeyMultibase
    return { 
        did: await generateDid(publicKeyMultibase), 
        privateKeyHex:keyPair.privateKeyHex, 
        publicKeyHex:keyPair.publicKeyHex
    }
}

const convertHextoMultibase=async (hex)=>{
    const multibase = require('multibase')
    const base58PublicKey = multibase.encode('base58btc', Buffer.from(hex, 'hex'))
    const publicKeyMultibase = Buffer.from(base58PublicKey).toString()
    return publicKeyMultibase
}

module.exports = {
    generateDidFromMnemonic,
    generateDid,
    convertHextoMultibase,
}