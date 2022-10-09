import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, Keypair, PublicKey, Transaction  } from "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, setAuthority, transfer } from "@solana/spl-token";
import { generateMnemonic, mnemonicToSeed } from "bip39-light";
// import { Metaplex, keypairIdentity, bundlrStorage } from "@metaplex-foundation/js";
import { derivePath } from "ed25519-hd-key";
import * as bs58 from "bs58";

const NETWORK = "devnet";

/// summary
/// 1. create a new wallet
/// 2. create a new token (NFT)
/// 3. mint a new token to the wallet
/// 4. transfer the token to another wallet
/// 5. set the authority of the token to another wallet

/**
 *  Create a new wallet
 * 
 * @param mnemonic  - the seed phrase of the wallet
 * @returns         - the wallet object
 */
export const getOrCreateWallet = (mnemonic: string) => {
    mnemonic = mnemonic || generateMnemonic();
    const seed = mnemonicToSeed(mnemonic);
    console.log('Seed phrase', mnemonic);
    const { key } = derivePath(`m/44'/501'/0'/0'`, seed.toString('hex'));
    return Keypair.fromSeed(key)
};

/**
 * Create a new token (NFT)
 * 
 * @param walletSeedPhrase     - the seed phrase of the wallet that will mint the token
 * @param amount               - the amount of tokens to mint - 1 for NFT
 * @param tokenName            - the name of the token
 * @param tokenSymbol          - the symbol of the token
 * @param tokenImageURI        - the URI of the token image
 * @param tokenFileURI         - the URI of the token file
 * @returns                    - the address of the token
 */
export const createAndMintNFT = async (walletSeedPhrase: string,
    amount: number,
    tokenName: string,
    tokenSymbol: string,
    tokenImageURI: string,
    tokenFileURI: string) => {
    // Connect to cluster
    const connection = new Connection(clusterApiUrl(NETWORK), "confirmed");

    const wallet = getOrCreateWallet(walletSeedPhrase);

    const fromAirdropSignature = await connection.requestAirdrop(
        wallet.publicKey,
        LAMPORTS_PER_SOL
    );
    console.log("Wallet publicKey", wallet.publicKey.toBase58());

    // Wait for airdrop confirmation
    await connection.confirmTransaction(fromAirdropSignature);

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
        amount                      // Amount to mint 
    );
    console.log("Minting transaction", transaction);

    // Amount 1 for NFT, remove the authority of the token
    if(amount == 1)
        await removeTokenAuthority(connection, wallet, mint);

    // console.log("Connecting to Metaplex");
    // const metaplex = Metaplex.make(connection)
    // .use(keypairIdentity(wallet))
    // .use(bundlrStorage());

    // console.log("Finding the token metadata account");
    // const nft = await metaplex.nfts().findByToken({ token: tokenAccount.address }).run();

    // console.log("Updating the token metadata");
    // const { uri, metadata } = await metaplex
    // .nfts()
    // .uploadMetadata({
    //     name: tokenName,
    //     symbol: tokenSymbol,
    //     creators: [{ address: wallet.publicKey.toBase58(), verified: true, share: 100 }],
    //     sellerFeeBasisPoints: 100,
    //     image: tokenImageURI,
    //     properties: {
    //         files: [
    //             {
    //                 uri: tokenFileURI,
    //                 type: "model/gltf-binary",
    //             },
    //         ],
    //         category: "3d",
    //         creators: [{ address: wallet.publicKey.toBase58(), verified: true, share: 100 }],
    //     }
    // })
    // .run();
    // console.log("Token metadata URI", uri);

    // console.log("Updating the token metadata account");
    // await metaplex
    //     .nfts()
    //     .update({ 
    //         nftOrSft: nft,
    //         uri: uri
    //     })
    //     .run();

    //const updatedNft = await metaplex.nfts().refresh(nft).run();

    return mint.toBase58();
};

/**
 * Transfer a token to another wallet
 * 
 * @param fromWalletSeedPhrase   - the seed phrase of the wallet that will transfer the token
 * @param toWalletAddress      - the public key of the wallet that will receive the token
 * @param tokenAddress           - the address of the token
 * @param amount                 - the amount of tokens to transfer
 * @returns                      - the transaction object
 */
export const transferNFT = async (fromWalletSeedPhrase: string,
    toWalletAddress: string,
    tokenAddress: string,
    amount: number ) => {

    // Connect to cluster
    const connection = new Connection(clusterApiUrl(NETWORK), "confirmed");

    const fromWallet = getOrCreateWallet(fromWalletSeedPhrase);
    console.log("Wallet publicKey", fromWallet.publicKey.toBase58());

    const fromAirdropSignature = await connection.requestAirdrop(
        fromWallet.publicKey,
        LAMPORTS_PER_SOL
    );

    // Wait for airdrop confirmation
    await connection.confirmTransaction(fromAirdropSignature);

    const mint = new PublicKey(tokenAddress);
    const toWalletPublicKey = new PublicKey(toWalletAddress);    

    await transferToken(connection, fromWallet, mint, toWalletPublicKey, amount);

    return tokenAddress;
};

/**
 * Set the authority of the token to another wallet
 * 
 * @param connection             - the connection to the cluster
 * @param fromWallet             - the wallet that will set the authority
 * @param mint                   - the address of the token
 * @param toWalletPublicKey      - the public key of the wallet that will receive the authority
 * @returns                      - the transaction object
 */
export const removeTokenAuthority = async (connection: Connection,
    fromWallet: Keypair,
    mint: PublicKey) => {
    try {

        const setAuthorityTransaction = await setAuthority(
            connection,
            fromWallet,
            mint,
            fromWallet.publicKey,
            0,
            null // remove the authority
        );
        console.log("Removing authority transaction", setAuthorityTransaction);

    } catch (error) {
        console.log("Error Removing authority", error);
    }
}

/**
 * Transfer a token to another wallet
 * 
 * @param connection             - the connection to the cluster
 * @param fromWallet             - the wallet that will transfer the token
 * @param mint                   - the address of the token
 * @param toWalletPublicKey      - the public key of the wallet that will receive the token
 * @param amount                 - the amount of tokens to transfer
 * @returns                      - the transaction object
 */
export const transferToken = async (connection: Connection,
    fromWallet: Keypair,
    mint: PublicKey,
    toWalletPublicKey: PublicKey,
    amount: number) => {
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromWallet,
        mint,
        fromWallet.publicKey
    );
    console.log("From token account", fromTokenAccount.address.toBase58());

    // Get the token account of the toWallet Solana address. If it does not exist, create it.
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromWallet,
        mint,
        toWalletPublicKey
    );
    console.log("To token account", toTokenAccount.address.toBase58());

    try {
        const transferTransaction = await transfer(
            connection,
            fromWallet,
            fromTokenAccount.address,
            toTokenAccount.address,
            fromWallet.publicKey,
            amount // Number of tokens to transfer 
        );
        console.log("Transfer transaction", transferTransaction);
    } catch (error) {
        console.log("Error transferring token", error);
    }
}

/// call from the command line
/// node index.js getOrCreateWalllet <walletSeedPhrase> - to create a new wallet or get an existing one from a seed phrase
/// node index.js createAndMintNFT <fromWalletSeedPhrase> <amount> - to create a new token and mint it to a wallet
/// node index.js transferNFT <fromWalletSeedPhrase> <toWalletPublicKey> <tokenAddress> - to transfer a token from one wallet to another
///
(async () => {
        
    const args = process.argv.slice(2);

    if(args[0] === "getOrCreateWallet") {
        console.log("Creating wallet and account...", args);
        const wallet = getOrCreateWallet(args[1]);
        console.log("Wallet publicKey", wallet.publicKey.toBase58(), "secretKey", bs58.encode(wallet.secretKey));

    } else if(args[0] === "createAndMintNFT") {
        console.log("Creating and minting a new token...", args);
        const token = await createAndMintNFT(args[1],
        parseInt(args[2] || '1'),
        args[3],
        args[4],
        args[5],
        args[6],);
        console.log("Token created and minted", token);

    } else if(args[0] === "transferNFT") {
        console.log("Transferring NFT...", args);
        const token = await transferNFT(args.slice(1)[0],
            args.slice(1)[1],
            args.slice(1)[2],
            parseInt(args.slice(1)[3] || '1'));   
        console.log("NFT transferred", token);

    };
})();

