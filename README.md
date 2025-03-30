# **Promise Keeper**

### Aloha! This is my capstone project for "Rustcamp Winter 2025" by the Ukrainian Rust Community.

### About:
Promise Keeper is a conceptual WEB3 project designed for creating and completing tasks with voting on their success
after completion.

Currently, it supports the following functionality:
- Connect a wallet ([Phantom](https://phantom.com/) is supported for now)
- Create a profile account (includes birthday, nickname, and avatar)
- Create a task
- Take a task
- Finish a task with applying proof image
- Vote on a task's completion

Planned features for the future include:
- Adding custom coins
- Minting custom coins for users upon successful task completion
- Improving the UI and adding task filters
- Implementing an economic model
- Deactivating task accounts
- Improving local development complexity by packing application services into docker containers

### Technical stack
- [Solana](https://solana.com/)
- [Anchor](https://www.anchor-lang.com/docs)
- [RectJS](https://react.dev/)
- [IPFS](https://ipfs.tech/)
- [TailwindCSS](https://tailwindcss.com/)

### Requirements
- [NodeJS](https://nodejs.org/uk)
- [PNPM](https://pnpm.io/uk/)
- [RUST](https://www.rust-lang.org/tools/install)
- [SOLANA-CLI](https://solana.com/ru/docs/intro/installation)
- [ANCHOR-CLI](https://www.anchor-lang.com/docs/installation)
- [IPFS](https://docs.ipfs.tech/install/ipfs-desktop/#ubuntu)

### Steps to run project local development environment
- Open projects directory in terminal
- Run **`solana-test-validator`** command
- Run **`pnpm build`** command
- Run **`init_tasks_counter.ts`** script
- Run **`ipfs daemon`** command
- Open **app** directory
- Run **`pnpm i`** command
- Run **`pnpm dev`** command
- Install [Phantom wallet](https://chromewebstore.google.com/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa?hl=uk&utm_source=ext_sidebar)
- Set up wallet for using localnet
- Run **`solana airdrop 10 <YOUR WALLET PUBLIC KEY>`**