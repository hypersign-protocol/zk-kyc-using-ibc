#[cfg(not(feature = "library"))]
use cosmwasm_std::entry_point;
use cosmwasm_std::{Binary, Deps, DepsMut, Env, MessageInfo, Response, StdResult, IbcMsg, IbcTimeout, to_binary};
use cw2::set_contract_version;

use crate::error::ContractError;
use crate::msg::{ExecuteMsg, InstantiateMsg, QueryMsg, IbcQueryMsg, HasKycedResponse};
use crate::state::{WHITELIST_MAP};

// version info for migration info
const CONTRACT_NAME: &str = "crates.io:business-contract";
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    _msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;

    Ok(Response::new())
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    deps: DepsMut,
    env: Env,
    _info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::Kyc { channel, proof, address, public_signal } => Ok(Response::new()
            .add_attribute("method", "execute_query")
            .add_attribute("channel", channel.clone())
            .add_message(IbcMsg::SendPacket { 
                channel_id: channel,
                data: to_binary(&IbcQueryMsg::Verify { proof, address, public_signal })?, 
                timeout: IbcTimeout::with_timestamp(env.block.time.plus_seconds(120)),
            })
        ),
        ExecuteMsg::IbcAcknowledgeKyc { is_valid, address } => execute_ibc_acknowledge_kyc(deps, is_valid, address)
    }
}

pub fn execute_ibc_acknowledge_kyc(deps: DepsMut, is_valid: bool, address: String) -> Result<Response, ContractError> {
    WHITELIST_MAP.save(deps.storage, address, &is_valid)?;
    Ok(Response::new().add_attribute("action", "do_kyc"))
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::HasKyced { address } => query_get_valid_address(deps, address)
    }
}

pub fn query_get_valid_address(deps: Deps, address: String) -> StdResult<Binary> {
    let is_address_present = WHITELIST_MAP.may_load(deps.storage, address)?.unwrap_or_else(|| false);

    if is_address_present {
        to_binary(&HasKycedResponse { result: "address is KYCed".to_string() })
    } else {
        to_binary(&HasKycedResponse { result: "address is NOT KYCed".to_string() })
    }
}

#[cfg(test)]
mod tests {}
