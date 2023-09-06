const { MsgCreateDID, MsgRegisterCredentialStatus } = require("./generated/types/ssi/v1/tx");

const createDIDRpc = async (didDoc, signature, author, client) => {
    const msgSerialized = MsgCreateDID.fromPartial({
        didDocString: didDoc,
        signatures: [{
            verification_method_id: didDoc["verificationMethod"][0]["id"],
            signature: signature,
            clientSpec: undefined
        }],
        creator: author
    })

    const msg = [{
        typeUrl: "/hypersignprotocol.hidnode.ssi.MsgCreateDID",
        value: msgSerialized,
    }]

    const fee = {
        amount: [
          {
            denom: "uhid",
            amount: "4000",
          },
        ],
        gas: "200000",
      };

    const result = await client.signAndBroadcast(author, msg, fee);
    return result
}

const createCredStatusRpc = async (credDoc, credProof, author, client) => {
  const msgSerialized = MsgRegisterCredentialStatus.fromPartial({
    credentialStatus: credDoc,
    proof: credProof,
    clientSpec: undefined,
    creator: author
  })

  const msg = [{
      typeUrl: "/hypersignprotocol.hidnode.ssi.MsgRegisterCredentialStatus",
      value: msgSerialized,
  }]

  const fee = {
      amount: [
        {
          denom: "uhid",
          amount: "4000",
        },
      ],
      gas: "200000",
    };

  const result = await client.signAndBroadcast(author, msg, fee);
  return result
}

module.exports = {
    createDIDRpc,
    createCredStatusRpc
}