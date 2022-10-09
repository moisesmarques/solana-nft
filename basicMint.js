//@ts-check
const { createMint, getOrCreateAssociatedTokenAccount, mintTo, setAuthority, transfer } = require("@solana/spl-token");

const createAndMintNft = async (connection, wallet) => {

    // Create a new token 
    const mint = await createMint(
        connection, 
        wallet,                // Payer of the transaction
        wallet.publicKey,      // Account that will control the minting 
        null,                  // Account that will control the freezing of the token 
        0                      // Location of the decimal place 
    );
    console.log("Token address", mint.toBase58());

    // Get the token account of the fromWallet Solana address. If it does not exist, create it.
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        wallet,
        mint,
        wallet.publicKey
    );
    console.log('Token account', tokenAccount.address.toBase58());

    // Minting the new token to the "tokenAccount" account we just returned/created.
    let transaction = await mintTo(
        connection,
        wallet,                     // Payer of the transaction fees 
        mint,                       // Mint for the account 
        tokenAccount.address,       // Address of the account to mint to 
        wallet.publicKey,           // Minting authority
        1                           // Amount to mint 
    );
    console.log("Minting transaction", transaction);

    await removeTokenAuthority(connection, wallet, mint);

    return mint.toBase58();
};

const removeTokenAuthority = async (connection,
    wallet,
    mint) => {
    try {

        const setAuthorityTransaction = await setAuthority(
            connection,
            wallet,
            mint,
            wallet.publicKey,
            0,
            null // remove the authority
        );
        console.log("Removing authority transaction", setAuthorityTransaction);

    } catch (error) {
        console.log("Error Removing authority", error);
    }
}

module.exports = {
    createAndMintNft,
    removeTokenAuthority
}