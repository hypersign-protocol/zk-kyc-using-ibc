"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.msgTypes = void 0;
const tx_1 = require("./types/ssi/v1/tx");
const tx_2 = require("./types/ssi/v1/tx");
const tx_3 = require("./types/ssi/v1/tx");
const tx_4 = require("./types/ssi/v1/tx");
const tx_5 = require("./types/ssi/v1/tx");
const msgTypes = [
    ["/hypersignprotocol.hidnode.ssi.MsgUpdateDID", tx_5.MsgUpdateDID],
    ["/hypersignprotocol.hidnode.ssi.MsgCreateSchema", tx_3.MsgCreateSchema],
    ["/hypersignprotocol.hidnode.ssi.MsgCreateDID", tx_2.MsgCreateDID],
    ["/hypersignprotocol.hidnode.ssi.MsgDeactivateDID", tx_1.MsgDeactivateDID],
    ["/hypersignprotocol.hidnode.ssi.MsgRegisterCredentialStatus", tx_4.MsgRegisterCredentialStatus],
];
exports.msgTypes = msgTypes;
