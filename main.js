//@ts-check
const { clusterApiUrl, Connection, LAMPORTS_PER_SOL, Keypair, PublicKey, Transaction  } = require("@solana/web3.js");
const { Metaplex, keypairIdentity, bundlrStorage } = require("@metaplex-foundation/js");
const { getWallet } = require("./getWallet");
const { metaplexMint } = require("./metaplexMint");
const { transferNft } = require("./transferToken");

const NETWORK = "devnet";
const bundlrUrl = 'https://devnet.bundlr.network';
const bundlrProviderUrl = 'https://api.devnet.solana.com';

/// summary
/// 1. create a new NFT (create and mint)
/// 2. transfer the token to another wallet

(async () => {

    const connection = new Connection(clusterApiUrl(NETWORK), "confirmed");

    const wallet = getWallet("arena cycle dragon bridge pony spell learn fringe ladder practice knife cattle");

    const fromAirdropSignature = await connection.requestAirdrop(
        wallet.publicKey,
        LAMPORTS_PER_SOL
    );
    
    // Wait for airdrop confirmation
    await connection.confirmTransaction(fromAirdropSignature);
    console.log("Airdrop succeeded");
    const { Metaplex, keypairIdentity, bundlrStorage } = require("@metaplex-foundation/js");

    const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(wallet))
    .use(bundlrStorage({
        address: bundlrUrl,
        providerUrl: bundlrProviderUrl,
        timeout: 60000,
    }));

    // Create a new NFT
    const nft = await metaplexMint(metaplex,
        "Test NFT",
        "NFT",
        "https://bafkreic3eevu2k2xto2cam6pusgr5ud3gxdg2cterxkwj6dv6bazqlcq2m.ipfs.nftstorage.link/",        
        "orem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, ",
        500 // seller fee = 5%
        );

    console.log("NFT minted: ", nft.address.toString());

    // List all the NFTs owned by the wallet

    // const metaplex = Metaplex.make(connection)
    //     .use(keypairIdentity(wallet))
    //     .use(bundlrStorage());

    // const nfts = await metaplex
    //     .nfts()
    //     .findAllByOwner({ owner: metaplex.identity().publicKey })
    //     .run();

    // console.log("NFTs", nfts);


    // Transfer the token to another wallet

    const toWallet = getWallet("weapon world tilt liar task clay alley badge benefit hawk smooth hen");
    
    await transferNft(connection, wallet, toWallet.publicKey, nft.address);

})().catch(console.error);
