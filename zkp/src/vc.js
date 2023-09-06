const { JCS } = require('jcs')
const { newMemEmptyTrie } = require('circomlibjs');
const { convertPublicKeyMultibase2Hex } = require('./utils');
const { getSHA256Hash } = require("./utils/sha256");
const buildEddsa = require("circomlibjs").buildEddsa;
const buildBabyjub = require("circomlibjs").buildBabyjub;
JSON.canonify = JCS.cannonicalize
const verifableCredential = {
    "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://www.w3.org/2018/credentials/examples/v1"
    ],
    "id": "http://example.edu/credentials/3732",
    "type": ["VerifiableCredential", "KYC"],
    "issuer": "did:example:123456789abcdefghi",
    "issuanceDate": "",
    "credentialSubject": {
        "id": "did:example:123456789abcdefghi",
        "name": "Jayden Doe",
        "age": 18n,
        "country": "Singapore",
    },
}

const getVCStatusFromCredential = (credential, proof, merkleRootHash) => {
    let credStatusDoc = {
        "claim": {
            "id": "vc:hid:devnet:z8Fo8daHrZrQ4NtDZ9byYgrkEKqK43dkBNxorxpAEm3rj",
            "currentStatus": "Live",
            "statusReason": "Credential is Live"
        },
        "issuer": credential["issuer"],
        "issuanceDate": new Date(credential["issuanceDate"]).toISOString().split('.')[0] + "Z",
        "expirationDate": new Date(credential["issuanceDate"] + 31356000000).toISOString().split('.')[0] + "Z",
        "credentialHash": getSHA256Hash(merkleRootHash.toString())
    }

    let credStatusProof = {
        "type": proof["type"],
        "created": new Date(proof["created"]).toISOString().split('.')[0] + "Z",
        "updated": new Date(proof["created"]).toISOString().split('.')[0] + "Z",
        "verificationMethod": proof["verificationMethod"],
        "proofPurpose": proof["proofPurpose"],
        "proofValue": "",
    }

    return {
        credStatusDoc: credStatusDoc,
        credStatusProof: credStatusProof
    }
}

const generateCredential = async (issuerID, credentialSubject) => {
    verifableCredential.issuanceDate = Number(new Date())
    verifableCredential.issuer = issuerID
    verifableCredential.credentialSubject = credentialSubject
    return JSON.parse(JCS.cannonicalize(verifableCredential))
}

const generateTree = async (credential) => {
    const F = (await buildBabyjub()).F

    const credentialSubject = credential.credentialSubject

    Object.keys(credentialSubject).forEach(async (key) => {
        if (key == "id") {
            credentialSubject[key] = '0x' + await convertPublicKeyMultibase2Hex(credentialSubject[key].split(':')[3])

        } else {
            if (typeof (credentialSubject[key]) == 'number') {
                credentialSubject[key] = BigInt(credentialSubject[key])

            } else {
                credentialSubject[key] = '0x' + Buffer.from(credentialSubject[key]).toString('hex')
            }
        }
    })

    const tree = await newMemEmptyTrie()
    const arr = Object.values(credentialSubject)

    for (let i = 0; i < arr.length; i++) {
        await tree.insert(i, arr[i])
    }

    return { rootHash: tree.F.toObject(tree.root), credentialSubject, smt: tree }
}

const issueCredential = async (credentialHash, privateKey, verificationMethod) => {
    const babyJub = await buildBabyjub()
    const eddsa = await buildEddsa()
    const F = babyJub.F;
    const pvk = Buffer.from(privateKey, 'hex')
    const msg = F.e(credentialHash, 10)
    const signature = eddsa.signPoseidon(pvk, msg)
    const Proof = {
        type: 'BabyJubJubSignature2023',
        rootHash: credentialHash,
        created: Number(new Date()),
        verificationMethod,
        proofValue: {
            R8x: F.toObject(signature.R8[0]),
            R8y: F.toObject(signature.R8[1]),
            S: signature.S
        }
        , proofPurpose: "assertionMethod"
    }
    return Proof
}

module.exports = {
    generateCredential, generateTree, issueCredential,
    getVCStatusFromCredential
}