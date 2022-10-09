//@ts-check
const { Metaplex, keypairIdentity, bundlrStorage } = require("@metaplex-foundation/js");

const metaplexMint = async (connection, wallet, tokenName, tokenSymbol, tokenImageUrl, tokenFileUrl) => {

    const metaplex = Metaplex.make(connection)
        .use(keypairIdentity(wallet))
        .use(bundlrStorage({
            address: 'https://devnet.bundlr.network',
            providerUrl: 'https://api.devnet.solana.com',
            timeout: 60000,
        }));

    const { uri, metadata } = await metaplex
        .nfts()
        .uploadMetadata({
            name: tokenName,
            image: tokenImageUrl,
            properties: {
                files: [
                    {
                        type: "model/gltf-binary",
                        uri: tokenFileUrl,
                    },
                ]
            }
        })
        .run();

    console.log("URI", uri);

    const { nft } = await metaplex
    .nfts()
    .create({
        uri: "https://bafkreic3eevu2k2xto2cam6pusgr5ud3gxdg2cterxkwj6dv6bazqlcq2m.ipfs.nftstorage.link/",
        name: tokenName,
        symbol: tokenSymbol,     
        sellerFeeBasisPoints: 0,   
    })
    .run();

    return nft;
}

module.exports = {
    metaplexMint
}
