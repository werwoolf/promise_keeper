use anchor_client::solana_client::client_error::ClientErrorKind::RpcError;
use anchor_client::solana_client::rpc_request::RpcError::RpcResponseError;
use anchor_client::solana_client::rpc_request::RpcResponseErrorData::SendTransactionPreflightFailure;
use anchor_client::solana_sdk::instruction::InstructionError::Custom;
use anchor_client::solana_sdk::signature::Signature;
use anchor_client::solana_sdk::transaction::TransactionError::InstructionError;
use anchor_client::ClientError;

pub fn assert_custom_error_code(res: Result<Signature, ClientError>, expected_code: u32) {
    let err = match res {
        Err(ClientError::SolanaClientError(err)) => err,
        _ => panic!("Request should fail"),
    };

    let error_data = match err.kind {
        RpcError(RpcResponseError { data, .. }) => data,
        e => panic!("Unexpected error kind: {:?}", e),
    };

    let err = match error_data {
        SendTransactionPreflightFailure(e) => e.err,
        _ => panic!("Unexpected error data"),
    };
    let error_code = match err {
        Some(InstructionError(_, Custom(code))) => code,
        _ => panic!("Unexpected error type"),
    };

    assert_eq!(error_code, expected_code);
}
