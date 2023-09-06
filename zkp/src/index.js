const { generateDidFromMnemonic, convertHextoMultibase } = require('./did')
const fs = require('fs')
const { generateCredential, generateTree, issueCredential, getVCStatusFromCredential } = require('./vc')
const { publicKeyMultibase2Point } = require("./utils/publicKeyPoint")
const snarkjs = require('snarkjs');
const { convertPublicKeyMultibase2Hex } = require('./utils')
const { generatePresentation } = require('./vp')

BigInt.prototype.toJSON = function () { return this.toString() }

// Blockchain
const { getWalletObjAndAddressFromMnemonic, createClient } = require("./hidnode/client")
const { signDidDocUsingBJJ, signCredStatusUsingBJJ } = require("./hidnode/signDoc")
const { createDIDRpc, createCredStatusRpc } = require("./hidnode/rpc")

// Fund the issuer and user wallets
// hid-noded tx bank send node1 hid1nalna28qlad820084cgcmltd43fzawjw9gjdzg 1234567uhid --keyring-backend test --chain-id hidnode --broadcast-mode block --yes && hid-noded tx bank send node1 hid1zam6rpuv6ea3whv0knswrcmwvuaxnrqu6un5y0 1234567uhid --keyring-backend test --chain-id hidnode --broadcast-mode block --yes
const issuerMnemonic = "liberty taste budget never right tent whip menu fog shine angle habit view between art perfect razor burger fence found scatter bounce laptop cruise"
const userMnemonic = "game baby fly entry grit divert great lady when egg park broccoli shell ice remain humor argue jeans empower nothing outer friend any sick"

const main = async () => {
    fs.mkdirSync('./build/issuer', { recursive: true })
    fs.mkdirSync('./build/user', { recursive: true })
    
    console.log("=== 1. DID Registration for Issuer and User ===\n")

    const issuer = await createIssuer()
    const issuerPublicKey = issuer.verificationMethod[0]["publicKeyMultibase"]
    const issuerId = issuer.id

    const user = await createUser()
    const userPublicKey = user.verificationMethod[0]["publicKeyMultibase"]
    const userId = user.id

    console.log("=================================================== \n")

    console.log("=== 2. Credential Issuance to User =============== ")

    const credentialSubject = {
        "id": user.id,
        "name": "Pratap Mridha",
        "age": 25,
        "country": "Usa",

    }

    // Form the credential before it is signed by issuer
    let credentialBeforeSigning = await generateCredential(issuerId, credentialSubject)
    console.log("Credential Before Signing:\n", credentialBeforeSigning)
    fs.writeFileSync('./build/issuer/credentialBeforeSigning.json', JSON.stringify(credentialBeforeSigning, null, 2))
    
    // Form the merkle tree of Credential by essentially choosing fields of credential subject as leaf nodes
    const data = await generateTree(credentialBeforeSigning)
    credentialBeforeSigning = await generateCredential(issuerId, data.credentialSubject)
    
    // Sign the credential
    const issuerPrivateKeyHex = JSON.parse(fs.readFileSync('./build/issuer/issuerPrivateKeyHex.json'))
    const Proof = await issueCredential(data.rootHash, issuerPrivateKeyHex, issuerId + '#key-1')
    credentialBeforeSigning.proof = Proof
    fs.writeFileSync('./build/user/IssuedCredential.json', JSON.stringify(credentialBeforeSigning, null, 2))
    const credSubjectHexified = credentialBeforeSigning.credentialSubject

    // Register Status of Credential
    console.log("\nRegistering Credential Status")
    await registerCredentialStatus(credentialBeforeSigning, data.rootHash, issuerMnemonic)

    console.log("=================================================== \n")

    console.log("=== 3. Generate Presentation for Issued Credential ===")

    const userPrivateKeyHex = JSON.parse(fs.readFileSync('./build/user/userPrivateKeyHex.json'))
    const verifiablePresentation = await generatePresentation(credentialBeforeSigning, userId + '#key-1', '123456', userPrivateKeyHex)
    console.log("Verifiable Presentation Generated: \n")
    console.log(verifiablePresentation)
    fs.writeFileSync('./build/user/verifiablePresentation.json', JSON.stringify(verifiablePresentation, null, 2))

    console.log("=================================================== \n")

    console.log("=== 4. Generating Proof and Public Signal ===")
    
    console.log("Preparing data for fullProve() method of snarkjs....")
    const issuer_pk = publicKeyMultibase2Point(issuerPublicKey) // Need for fullProve() method as it accepts in Point format
    const holder_pk = publicKeyMultibase2Point(userPublicKey) // Need for fullProve() method as it accepts in Point format

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
    
    const {
        proof, publicSignals
    } = await snarkjs.groth16.fullProve(
        {
            key: 1,
            set,
            siblings: siblings,
            attributes: [credSubjectHexified.age, credSubjectHexified.country, credSubjectHexified.id, credSubjectHexified.name],
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
    console.log("Proofs and Public Signal are generated")
    console.log("=================================================== \n")
    
    console.log("=== 5. Verifying Proof ===")
    
    let id = publicSignals[2]
    let pub = BigInt(id).toString(16)
    const did = 'did:hid:devnet:' + await convertHextoMultibase(pub)
    console.log("User DID : ", did);
    const issuerID = publicSignals[4]
    const issuerPub = BigInt(issuerID).toString(16)
    const issuerDid = 'did:hid:devnet:' + await convertHextoMultibase(issuerPub)
    console.log("Issuer DID : ", issuerDid);
    const vKey = JSON.parse(fs.readFileSync("./setup/verification_key.json"));

    const verification = await snarkjs.groth16.verify(
        vKey,
        publicSignals,
        proof
    )
    console.log("Verification : ", verification);

    console.log("=================================================== \n")
}

const createIssuer = async () => {
    const { did, privateKeyHex } = await generateDidFromMnemonic(issuerMnemonic)
    console.log("Registering DID Document of Issuer: ", did["id"])

    // Create Wallet Object
    const { wallet: walletObj, address: txAuthorAddress } = await getWalletObjAndAddressFromMnemonic(issuerMnemonic)

    // Get Client
    const client = await createClient(walletObj)

    // Sign DidDoc
    const didSignature = await signDidDocUsingBJJ(did, privateKeyHex)

    // Register DidDoc
    const result = await createDIDRpc(did, didSignature, txAuthorAddress, client)
    if (result.code != 0) {
        console.log(result.rawLog)
        throw new Error("tx failed")
    } else {
        console.log("Issuer DID Created: ", did["id"], "\n")
    }

    // There's won't need to store issuer.json since DID is stored on Hypersign
    // issuerPrivateKeyHex.json needs to be kept in a file still
    fs.writeFileSync('./build/issuer/issuerDID.json', JSON.stringify(did, null, 2))
    fs.writeFileSync('./build/issuer/issuerPrivateKeyHex.json', JSON.stringify(privateKeyHex, null, 2))

    return did
}

const createUser = async () => {
    const { did, privateKeyHex } = await generateDidFromMnemonic(userMnemonic)
    console.log("Registering DID Document of User: ", did["id"])

    // Create Wallet Object
    const { wallet: walletObj, address: txAuthorAddress } = await getWalletObjAndAddressFromMnemonic(userMnemonic)

    // Get Client
    const client = await createClient(walletObj)

    // Sign DidDoc
    const didSignature = await signDidDocUsingBJJ(did, privateKeyHex)

    // Register DidDoc
    const result = await createDIDRpc(did, didSignature, txAuthorAddress, client)
    if (result.code != 0) {
        console.log(result.rawLog)
        throw new Error("tx failed")
    } else {
        console.log("User DID Created: ", did["id"], "\n")
    }

    // There's won't need to store user.json since DID is stored on Hypersign
    // userPrivateKeyHex.json needs to be kept in a file still
    fs.writeFileSync('./build/user/userDID.json', JSON.stringify(did, null, 2))
    fs.writeFileSync('./build/user/userPrivateKeyHex.json', JSON.stringify(privateKeyHex, null, 2))

    return did

}

const registerCredentialStatus = async (credential, credHash, mnemonic) => {
    const { privateKeyHex } = await generateDidFromMnemonic(mnemonic)

    // Create Wallet Object
    const { wallet: walletObj, address: txAuthorAddress } = await getWalletObjAndAddressFromMnemonic(mnemonic)

    // Get Client
    const client = await createClient(walletObj)

    // Get Status Docs from Credential
    let cred = getVCStatusFromCredential(
        credential,
        credential.proof,
        credHash
    )

    // Sign CredStatus
    const credStatusSignature = await signCredStatusUsingBJJ(cred["credStatusDoc"], privateKeyHex)
    cred["credStatusProof"]["proofValue"] = credStatusSignature

    // Register CredStatus
    const resultCredStatus = await createCredStatusRpc(cred["credStatusDoc"], cred["credStatusProof"], txAuthorAddress, client)
    if (resultCredStatus.code != 0) {
        console.log(resultCredStatus.rawLog)
        throw new Error("tx failed")
    } else {
        console.log("Cred Status Registered with ID: ", cred["credStatusDoc"]["claim"]["id"])
    }
}

main().then(() => {
    process.exit(0)
})
