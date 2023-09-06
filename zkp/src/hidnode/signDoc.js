const { signBabyJubJub } = require("../signPackage/sign");
const { Did } = require('./generated/types/ssi/v1/did');
const  { CredentialStatus } = require('./generated/types/ssi/v1/credential')

const signDidDocUsingBJJ = async (didDoc, privKey) => {
    const didDocBytes = (await Did.encode(didDoc)).finish()
    const signature = signBabyJubJub(didDocBytes, privKey)
    return signature
}

const signCredStatusUsingBJJ = async (credStatus, privKey) => {
    const credDocBytes = (await CredentialStatus.encode(credStatus)).finish()
    const signature = signBabyJubJub(credDocBytes, privKey)
    return signature
}

module.exports = {
    signDidDocUsingBJJ,
    signCredStatusUsingBJJ
}