const buildEddsa = require("circomlibjs").buildEddsa;
const buildBabyjub = require("circomlibjs").buildBabyjub;
const vp = {
    "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://www.w3.org/2018/credentials/examples/v1"
    ],
    type: ["VerifiablePresentation"],
    "verifiableCredential": [],
    "proof": {
        "type": "BabyJubJubSignature2021",
        "created": "",
        "proofPurpose": "authentication",
        "verificationMethod": "",
        "challenge": "",
        proofValue: {
            R8x: "",
            R8y: "",
            S: ""
        }

    }
}

const generatePresentation = async (verifiableCredential, holderVmID, challenge, holderPrivateKey) => {
    vp.verifiableCredential.push(verifiableCredential)
    vp.proof.created = Number(new Date())
    vp.proof.verificationMethod = holderVmID
    vp.proof.challenge = challenge
    const babyJub = await buildBabyjub()
    const eddsa = await buildEddsa()
    const F = babyJub.F;
    const pvk = Buffer.from(holderPrivateKey, 'hex')
    const msg = F.e(challenge, 10)
    const signature = eddsa.signPoseidon(pvk, msg)
    vp.proof.proofValue.R8x = F.toObject(signature.R8[0])
    vp.proof.proofValue.R8y = F.toObject(signature.R8[1])
    vp.proof.proofValue.S = signature.S
    return vp
}

module.exports={
    generatePresentation
}