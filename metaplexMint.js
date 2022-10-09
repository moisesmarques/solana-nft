//@ts-check

const metaplexMint = async (metaplex, tokenName, tokenSymbol, tokenImageUrl, tokenDescription, sellerFee = 500) => {

    const { uri, metadata } = await metaplex
        .nfts()
        .uploadMetadata({
            name: tokenName,
            image: tokenImageUrl,
            symbol: tokenSymbol,
            description: tokenDescription,
            attributes: [
                {
                    trait_type: 'File',
                    value: tokenImageUrl,
                },
            ],
            properties: {
                files: [
                    {
                        type: "image/png",
                        uri: tokenImageUrl,
                    },
                ]
            }
        })
        .run();

    console.log("URI", uri);

    const { nft } = await metaplex
    .nfts()
    .create({
        uri: uri,
        name: tokenName,
        symbol: tokenSymbol,     
        sellerFeeBasisPoints: sellerFee,   
    })
    .run();

    return nft;
}

module.exports = {
    metaplexMint
}
