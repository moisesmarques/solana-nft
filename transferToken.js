//@ts-check
const { getOrCreateAssociatedTokenAccount, transfer } = require("@solana/spl-token");

const transferNft = async (connection,
    fromWallet,
    toWalletAddress,
    tokenAddress) => {

    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromWallet,
        tokenAddress,
        fromWallet.publicKey
    );
    console.log("From token account", fromTokenAccount.address.toBase58());

    // Get the token account of the toWallet Solana address. If it does not exist, create it.
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromWallet,
        tokenAddress,
        toWalletAddress
    );
    console.log("To token account", toTokenAccount.address.toBase58());

    try {
        const transferTransaction = await transfer(
            connection,
            fromWallet,
            fromTokenAccount.address,
            toTokenAccount.address,
            fromWallet.publicKey,
            1                           // Number of tokens to transfer 
        );
        console.log("Transfer transaction", transferTransaction);
    } catch (error) {
        console.log("Error transferring token", error);
    }

    return tokenAddress;
};

module.exports = {
    transferNft
}