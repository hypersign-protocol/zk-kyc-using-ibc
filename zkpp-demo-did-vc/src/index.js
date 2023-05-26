
// create a Issuer 
const { JCS } = require('jcs')
const { generateDidFromMnemonic, resolveDid, signReady, convertHextoMultibase } = require('./did')
const fs = require('fs')
const { generateCredential, generateTree, issueCredential } = require('./vc')
const { Hex, PublicKey } = require('@iden3/js-crypto')
const ffjavascript=require('ffjavascript')
const createIssuer = async () => {

    const { did, privateKeyHex } = await generateDidFromMnemonic("liberty taste budget never right tent whip menu fog shine angle habit view between art perfect razor burger fence found scatter bounce laptop cruise")
    const resolveDidDocument = await resolveDid(did)

    fs.writeFileSync('issuer.json', JSON.stringify(resolveDidDocument, null, 2))
    fs.writeFileSync('issuerPrivateKeyHex.json', JSON.stringify(privateKeyHex, null, 2))
}

const createUser = async () => {
    const { did, privateKeyHex,publicKeyHex } = await generateDidFromMnemonic("game baby fly entry grit divert great lady when egg park broccoli shell ice remain humor argue jeans empower nothing outer friend any sick")
    console.log(publicKeyHex);
    const resolveDidDocument = await resolveDid(did)
    fs.writeFileSync('user.json', JSON.stringify(resolveDidDocument, null, 2))
    fs.writeFileSync('userPrivateKeyHex.json', JSON.stringify(privateKeyHex, null, 2))

}
BigInt.prototype.toJSON = function () { return this.toString() }

const snarkjs = require('snarkjs');
const { buildBabyjub } = require('circomlibjs')


const main = async () => {
    const F = (await buildBabyjub()).F
    await createIssuer()
    await createUser()

    const issuer = JSON.parse(fs.readFileSync('issuer.json'))
    const issuerSignReady = await signReady(issuer)
    fs.writeFileSync('issuerSignReady.json', JSON.stringify(issuerSignReady, null, 2))
    const user = JSON.parse(fs.readFileSync('user.json'))
    const userSignReady = await signReady(user)
    fs.writeFileSync('userSignReady.json', JSON.stringify(userSignReady, null, 2))
    const credentialSubject = {
        "id": userSignReady.id,
        "name": "Alice",
        "age": 25,
        "country": "Usa",

    }
    const issuerPrivateKeyHex = JSON.parse(fs.readFileSync('issuerPrivateKeyHex.json'))
    let credentialBeforeSigning = await generateCredential(issuerSignReady.id, credentialSubject)
    const data = await generateTree(credentialBeforeSigning)
    console.log(data.credentialSubject);
    credentialBeforeSigning = await generateCredential(issuerSignReady.id, data.credentialSubject)
    const Proof = await issueCredential(data.rootHash, issuerPrivateKeyHex)
    credentialBeforeSigning.proof = Proof
    fs.writeFileSync('IssuedCredential.json', JSON.stringify(credentialBeforeSigning, null, 2))

    const sub = credentialBeforeSigning.credentialSubject
    const issuer_pk = [issuerSignReady.verificationMethod[0].publicKey[0], issuerSignReady.verificationMethod[0].publicKey[1]]

    const smt = data.smt;
    let childs = await smt.find(1)
    let siblings = childs.siblings
    for (let i = 0; i < siblings.length; i++) siblings[i] = smt.F.toObject(siblings[i]);
    while (siblings.length < 10) siblings.push(0);
    const set=[
        '0x'+Buffer.from("India", 'utf-8').toString('hex'),
        '0x'+Buffer.from("Usa", 'utf-8').toString('hex'),
        '0x'+Buffer.from("China", 'utf-8').toString('hex'),
        '0x'+Buffer.from("Russia", 'utf-8').toString('hex'),
        '0x'+Buffer.from("Japan", 'utf-8').toString('hex'),
    ]
    const anotherproof = await snarkjs.groth16.fullProve(
        {
            key: 1,
            set,
            siblings: siblings,
            attributes: [sub.age, sub.country,sub.id, sub.name],
            issuer_signature: [Proof.R8x, Proof.R8y, Proof.S],
            issuer_pk,
            expose_index: [0, 0, 1, 0],
            credential_lemma: data.rootHash,
        }
        , './outputs/vp_js/vp.wasm', './setup/country_0001.zkey');

const publicSignals = anotherproof.publicSignals
const proof = anotherproof.proof
fs.writeFileSync('proof.json', JSON.stringify(proof, null, 2))
fs.writeFileSync('publicSignals.json', JSON.stringify(publicSignals, null, 2))

let id=publicSignals[2]

let pub= BigInt(id).toString(16)
console.log(pub);
let publicKey=PublicKey.newFromHex(pub)
const did='did:hid:testnet:'+await convertHextoMultibase(pub)
console.log(did);
}


main()