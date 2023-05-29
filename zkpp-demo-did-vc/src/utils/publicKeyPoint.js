
const { Hex, PublicKey } = require('@iden3/js-crypto')

const multibase=require('multibase')
const publicKeyMultibase2Point = (publicKeyMultibase) => {
    const publicKeyHex = multibase.decode(publicKeyMultibase)
    const publicKey =Hex.encodeString(Hex.decodeString(Buffer.from(publicKeyHex).toString('hex')))
    const publicKeyObj =PublicKey.newFromHex(publicKey)
    return publicKeyObj.p


}


module.exports = {
        publicKeyMultibase2Point    
}