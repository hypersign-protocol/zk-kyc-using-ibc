const bip39 = require('bip39')
const crypto = require('crypto')



const generateMnemonic = (size) => {
    let s = {
        12: 128,
        24: 256
    }
    return bip39.generateMnemonic(s[size] ? s[size] : s[12], crypto.randomBytes)
}

const gnerateFromMnemonic = async (mnemonic) => {
    return await bip39.mnemonicToEntropy(mnemonic)
}




module.exports = {
    generateMnemonic, gnerateFromMnemonic
}