use anchor_client::solana_client::nonblocking::rpc_client::RpcClient;
use anchor_client::solana_sdk::commitment_config::CommitmentConfig;
use anchor_client::solana_sdk::native_token::LAMPORTS_PER_SOL;
use anchor_client::solana_sdk::signature::{Keypair, Signer};
use anchor_client::{Client, Cluster, Program};
use anchor_lang::declare_program;
use std::sync::Arc;
use tokio::sync::Mutex;

declare_program!(promise_keeper);

#[derive(Clone)]
pub(crate) struct TestContext {
    pub(crate) user: Arc<Keypair>,
    pub(crate) program: Arc<Program<Arc<Keypair>>>,
}

lazy_static::lazy_static! {
    static ref TEST_CONTEXT: Arc<Mutex<Option<TestContext>>> = Arc::new(Mutex::new(None));
}

pub(crate) async fn get_test_context_cached() -> Arc<TestContext> {
    let mut cached_context = TEST_CONTEXT.lock().await;

    if let Some(context) = cached_context.clone() {
        println!("RETURNED chached context");
        return Arc::new(context);
    }

    println!("START creating cached context");
    let context = get_test_context().await;

    println!("FINISH creating cached context");

    *cached_context = Some(context);
    Arc::new(cached_context.clone().unwrap())
}

pub(crate) async fn get_test_context() -> TestContext {
    let user = Keypair::new();
    let user_rc = Arc::new(user);
    let connection = RpcClient::new(Cluster::Localnet.url().to_string());

    let airdrop_signature = connection
        .request_airdrop(&user_rc.pubkey(), LAMPORTS_PER_SOL)
        .await
        .expect("Airdrop failed");

    while !connection
        .confirm_transaction(&airdrop_signature)
        .await
        .expect("Airdrop failed")
    {
        tokio::time::sleep(std::time::Duration::from_millis(100)).await;
    }

    let provider = Client::new_with_options(
        Cluster::Localnet,
        user_rc.clone(),
        CommitmentConfig::confirmed(),
    );
    let program = provider
        .program(promise_keeper::ID)
        .expect("Program creation failed");

    TestContext {
        user: user_rc,
        program: Arc::new(program),
    }
}
