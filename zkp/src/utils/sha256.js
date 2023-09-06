const jsSHA = require("jssha");

const getSHA256Hash = (inp_uint8_arr) => {
    // format must be HEX, TEXT, B64, BYTES, ARRAYBUFFER, or UINT8ARRAY
    const hashObj = new jsSHA("SHA-256", "TEXT");
    hashObj.update(inp_uint8_arr)
    const hash = hashObj.getHash("HEX")
    return hash
  }

module.exports = {
    getSHA256Hash
}