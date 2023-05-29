
// create a Issuer 
const { JCS } = require('jcs')
const { generateDidFromMnemonic, resolveDid, signReady, convertHextoMultibase } = require('./did')
const fs = require('fs')
const { generateCredential, generateTree, issueCredential } = require('./vc')
const { Hex, PublicKey } = require('@iden3/js-crypto')
const ffjavascript = require('ffjavascript')
const createIssuer = async () => {
    

    const { did, privateKeyHex } = await generateDidFromMnemonic("liberty taste budget never right tent whip menu fog shine angle habit view between art perfect razor burger fence found scatter bounce laptop cruise")
    const resolveDidDocument = await resolveDid(did)

    fs.writeFileSync('./build/issuer/issuer.json', JSON.stringify(resolveDidDocument, null, 2))
    fs.writeFileSync('./build/issuer/issuerPrivateKeyHex.json', JSON.stringify(privateKeyHex, null, 2))
}

const createUser = async () => {
    const { did, privateKeyHex, publicKeyHex } = await generateDidFromMnemonic("game baby fly entry grit divert great lady when egg park broccoli shell ice remain humor argue jeans empower nothing outer friend any sick")
    const resolveDidDocument = await resolveDid(did)
    fs.writeFileSync('./build/user/user.json', JSON.stringify(resolveDidDocument, null, 2))
    fs.writeFileSync('./build/user/userPrivateKeyHex.json', JSON.stringify(privateKeyHex, null, 2))

}
BigInt.prototype.toJSON = function () { return this.toString() }

const snarkjs = require('snarkjs');
const { buildBabyjub } = require('circomlibjs')
const { convertPublicKeyMultibase2Hex } = require('./utils')
const { generatePresentation } = require('./vp')


const main = async () => {
    fs.mkdirSync('./build/issuer', { recursive: true })
    fs.mkdirSync('./build/user', { recursive: true })
    const F = (await buildBabyjub()).F
    await createIssuer()
    await createUser()

    const issuer = JSON.parse(fs.readFileSync('./build/issuer/issuer.json'))

    const user = JSON.parse(fs.readFileSync('./build/user/user.json'))

    const credentialSubject = {
        "id": user.id,
        "name": "Pratap Mridha",
        "age": 25,
        "country": "Usa",

    }
    const issuerPrivateKeyHex = JSON.parse(fs.readFileSync('./build/issuer/issuerPrivateKeyHex.json'))
    let credentialBeforeSigning = await generateCredential(issuer.id, credentialSubject)
    fs.writeFileSync('./build/issuer/credentialBeforeSigning.json', JSON.stringify(credentialBeforeSigning, null, 2))
    const data = await generateTree(credentialBeforeSigning)
    console.log(data.credentialSubject);
    credentialBeforeSigning = await generateCredential(issuer.id, data.credentialSubject)
    const Proof = await issueCredential(data.rootHash, issuerPrivateKeyHex, issuer.id + '#key-1')
    credentialBeforeSigning.proof = Proof
    fs.writeFileSync('./build/user/IssuedCredential.json', JSON.stringify(credentialBeforeSigning, null, 2))

    const sub = credentialBeforeSigning.credentialSubject
    const issuer_pk = [issuer.verificationMethod[0].publicKey[0], issuer.verificationMethod[0].publicKey[1]]
    const holder_pk= [user.verificationMethod[0].publicKey[0], user.verificationMethod[0].publicKey[1]]
    const smt = data.smt;
    let childs = await smt.find(1)
    let siblings = childs.siblings
    for (let i = 0; i < siblings.length; i++) siblings[i] = smt.F.toObject(siblings[i]);
    while (siblings.length < 10) siblings.push(0);
    const set = [
        '0x' + Buffer.from("India", 'utf-8').toString('hex'),
        '0x' + Buffer.from("Usa", 'utf-8').toString('hex'),
        '0x' + Buffer.from("China", 'utf-8').toString('hex'),
        '0x' + Buffer.from("Russia", 'utf-8').toString('hex'),
        '0x' + Buffer.from("Japan", 'utf-8').toString('hex'),
    ]





// Generate Verifiable Presentation
const userPrivateKeyHex = JSON.parse(fs.readFileSync('./build/user/userPrivateKeyHex.json'))

const verifiablePresentation=await generatePresentation(credentialBeforeSigning,user.id+'#key-1','123456',userPrivateKeyHex)
fs.writeFileSync('./build/user/verifiablePresentation.json', JSON.stringify(verifiablePresentation, null, 2))    


const {
    proof, publicSignals
} = await snarkjs.groth16.fullProve(
    {
        key: 1,
        set,
        siblings: siblings,
        attributes: [sub.age, sub.country, sub.id, sub.name],
        issuer_signature: [Proof.proofValue.R8x, Proof.proofValue.R8y, Proof.proofValue.S],
        issuer_pk,
        holder_pk,
        challenge: '123456',
        holder_signature: [verifiablePresentation.proof.proofValue.R8x, verifiablePresentation.proof.proofValue.R8y, verifiablePresentation.proof.proofValue.S],
        issuer_id: '0x' + await convertPublicKeyMultibase2Hex(issuer.id.split(':')[3]),
        credential_lemma: data.rootHash,
    }
    , './outputs/vp_js/vp.wasm', './setup/country_0001.zkey');

fs.writeFileSync('./build/user/proof.json', JSON.stringify(proof, null, 2))
fs.writeFileSync('./build/user/publicSignals.json', JSON.stringify(publicSignals, null, 2))

let id = publicSignals[2]


console.log("================================Verification==============================");
let pub = BigInt(id).toString(16)
const did = 'did:hid:testnet:' + await convertHextoMultibase(pub)
console.log("User DID : ", did);
const issuerID = publicSignals[4]
const issuerPub = BigInt(issuerID).toString(16)
const issuerDid = 'did:hid:testnet:' + await convertHextoMultibase(issuerPub)
console.log("Issuer DID : ", issuerDid);
const vKey = JSON.parse(fs.readFileSync("./setup/verification_key.json"));

const verification = await snarkjs.groth16.verify(
    vKey,
    publicSignals,
    proof
)
console.log("Verification : ", verification);




}


main().then(() => {
    process.exit(0)
})
