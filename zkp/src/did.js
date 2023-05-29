const didStruct = {
    "@context": "https://www.w3.org/ns/did/v1",
    "id": "did:example:123456789abcdefghi",
    "controller": "did:example:123456789abcdefghi",
    "verificationMethod": [{
        "id": "did:example:123456789abcdefghi#keys-1",
        "type": "EcdsaSecp256k1VerificationKey2019",
        "controller": "did:example:123456789abcdefghi",
        "publicKeyMultibase": "z3n6X3Z4Z"
    }],
    "authentication": ["did:example:123456789abcdefghi#keys-1"],
    "assertionMethod": ["did:example:123456789abcdefghi#keys-1"],
    "capabilityDelegation": ["did:example:123456789abcdefghi#keys-1"],
    "capabilityInvocation": ["did:example:123456789abcdefghi#keys-1"],
    "keyAgreement": ['did:example:123456789abcdefghi#keys-1'],
    "service": [],

    "alsoKnownAs": "https://example.com/1659872463",


}
const buildBabyjub = require("circomlibjs").buildBabyjub;


const {generateKeyPairFromMnemonic, convertPublicKeyMultibase2Hex, generateMnemonic, publicKeyMultibase2Point}=require('./utils')
const ffjavascript = require('ffjavascript')


const generateDid = async (publicKeyMultibase) => {
     didStruct["@context"]="https://www.w3.org/ns/did/v1"
        didStruct.id="did:hid:testnet:"+publicKeyMultibase
        didStruct.controller="did:hid:testnet:"+publicKeyMultibase,
        didStruct.verificationMethod[0].id="did:hid:testnet:"+publicKeyMultibase+"#keys-1"
        didStruct.verificationMethod[0].controller="did:hid:testnet:"+publicKeyMultibase
        didStruct.verificationMethod[0].publicKeyMultibase=publicKeyMultibase
        didStruct.verificationMethod[0].type="BabyJubJubVerificationKey2021"
        didStruct.authentication[0]="did:hid:testnet:"+publicKeyMultibase+"#keys-1"
        didStruct.assertionMethod[0]="did:hid:testnet:"+publicKeyMultibase+"#keys-1"
        didStruct.capabilityDelegation[0]="did:hid:testnet:"+publicKeyMultibase+"#keys-1"
        didStruct.capabilityInvocation[0]="did:hid:testnet:"+publicKeyMultibase+"#keys-1"
        didStruct.keyAgreement[0]="did:hid:testnet:"+publicKeyMultibase+"#keys-1"
        didStruct.service=[]
        didStruct.alsoKnownAs="did:hid:testnet:"+publicKeyMultibase

        return didStruct

}


const generateDidFromMnemonic = async (mnemonic) => {
    const keyPair = await generateKeyPairFromMnemonic(mnemonic)
    const publicKeyMultibase = keyPair.publicKeyMultibase
    return { did:await generateDid(publicKeyMultibase) ,privateKeyHex:keyPair.privateKeyHex,publicKeyHex:keyPair.publicKeyHex}

}
const createDid = async () => {
    const keyPair = await generateKeyPairFromMnemonic(generateMnemonic(24))
    const publicKeyMultibase = keyPair.publicKeyMultibase
    return generateDid(publicKeyMultibase)

}


const resolveDid = async (did) => {
    let verificationMethod=did.verificationMethod
    
    verificationMethod.forEach(element => {
        if(element.type==="BabyJubJubVerificationKey2021"){
        const publicKey=publicKeyMultibase2Point(element.publicKeyMultibase)
        element["publicKey"]=publicKey

    }
    })
    return did
}


const signReady=async (did)=>{
  const b=  await buildBabyjub()
    did.id='0x'+ await convertPublicKeyMultibase2Hex(did.id.split(':')[3])
    return did

}

const convertHextoMultibase=async (hex)=>{
    const multibase = require('multibase')
    const base58PublicKey = multibase.encode('base58btc', Buffer.from(hex, 'hex'))
    const publicKeyMultibase = Buffer.from(base58PublicKey).toString()
    return publicKeyMultibase
}
// async function main() {


//     const did = await generateDidFromMnemonic("liberty taste budget never right tent whip menu fog shine angle habit view between art perfect razor burger fence found scatter bounce laptop cruise")
//     console.log(await resolveDid(did))
// }
// main()
module.exports = {
    generateDidFromMnemonic,
    generateDid,
    resolveDid,
    convertHextoMultibase,
    signReady
}