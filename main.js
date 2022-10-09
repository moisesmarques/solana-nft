"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.transferToken = exports.removeTokenAuthority = exports.transferNFT = exports.createAndMintNFT = exports.getOrCreateWallet = void 0;
var web3_js_1 = require("@solana/web3.js");
var spl_token_1 = require("@solana/spl-token");
var bip39_light_1 = require("bip39-light");
// import { Metaplex, keypairIdentity, bundlrStorage } from "@metaplex-foundation/js";
var ed25519_hd_key_1 = require("ed25519-hd-key");
var bs58 = require("bs58");
var NETWORK = "devnet";
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
var getOrCreateWallet = function (mnemonic) {
    mnemonic = mnemonic || (0, bip39_light_1.generateMnemonic)();
    var seed = (0, bip39_light_1.mnemonicToSeed)(mnemonic);
    console.log('Seed phrase', mnemonic);
    var key = (0, ed25519_hd_key_1.derivePath)("m/44'/501'/0'/0'", seed.toString('hex')).key;
    return web3_js_1.Keypair.fromSeed(key);
};
exports.getOrCreateWallet = getOrCreateWallet;
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
var createAndMintNFT = function (walletSeedPhrase, amount, tokenName, tokenSymbol, tokenImageURI, tokenFileURI) { return __awaiter(void 0, void 0, void 0, function () {
    var connection, wallet, fromAirdropSignature, mint, tokenAccount, transaction;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                connection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)(NETWORK), "confirmed");
                wallet = (0, exports.getOrCreateWallet)(walletSeedPhrase);
                return [4 /*yield*/, connection.requestAirdrop(wallet.publicKey, web3_js_1.LAMPORTS_PER_SOL)];
            case 1:
                fromAirdropSignature = _a.sent();
                console.log("Wallet publicKey", wallet.publicKey.toBase58());
                // Wait for airdrop confirmation
                return [4 /*yield*/, connection.confirmTransaction(fromAirdropSignature)];
            case 2:
                // Wait for airdrop confirmation
                _a.sent();
                return [4 /*yield*/, (0, spl_token_1.createMint)(connection, wallet, // Payer of the transaction
                    wallet.publicKey, // Account that will control the minting 
                    null, // Account that will control the freezing of the token 
                    0 // Location of the decimal place 
                    )];
            case 3:
                mint = _a.sent();
                console.log("Token address", mint.toBase58());
                return [4 /*yield*/, (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, wallet, mint, wallet.publicKey)];
            case 4:
                tokenAccount = _a.sent();
                console.log('Token account', tokenAccount.address.toBase58());
                return [4 /*yield*/, (0, spl_token_1.mintTo)(connection, wallet, // Payer of the transaction fees 
                    mint, // Mint for the account 
                    tokenAccount.address, // Address of the account to mint to 
                    wallet.publicKey, // Minting authority
                    amount // Amount to mint 
                    )];
            case 5:
                transaction = _a.sent();
                console.log("Minting transaction", transaction);
                if (!(amount == 1)) return [3 /*break*/, 7];
                return [4 /*yield*/, (0, exports.removeTokenAuthority)(connection, wallet, mint)];
            case 6:
                _a.sent();
                _a.label = 7;
            case 7: 
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
            return [2 /*return*/, mint.toBase58()];
        }
    });
}); };
exports.createAndMintNFT = createAndMintNFT;
/**
 * Transfer a token to another wallet
 *
 * @param fromWalletSeedPhrase   - the seed phrase of the wallet that will transfer the token
 * @param toWalletAddress      - the public key of the wallet that will receive the token
 * @param tokenAddress           - the address of the token
 * @param amount                 - the amount of tokens to transfer
 * @returns                      - the transaction object
 */
var transferNFT = function (fromWalletSeedPhrase, toWalletAddress, tokenAddress, amount) { return __awaiter(void 0, void 0, void 0, function () {
    var connection, fromWallet, fromAirdropSignature, mint, toWalletPublicKey;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                connection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)(NETWORK), "confirmed");
                fromWallet = (0, exports.getOrCreateWallet)(fromWalletSeedPhrase);
                console.log("Wallet publicKey", fromWallet.publicKey.toBase58());
                return [4 /*yield*/, connection.requestAirdrop(fromWallet.publicKey, web3_js_1.LAMPORTS_PER_SOL)];
            case 1:
                fromAirdropSignature = _a.sent();
                // Wait for airdrop confirmation
                return [4 /*yield*/, connection.confirmTransaction(fromAirdropSignature)];
            case 2:
                // Wait for airdrop confirmation
                _a.sent();
                mint = new web3_js_1.PublicKey(tokenAddress);
                toWalletPublicKey = new web3_js_1.PublicKey(toWalletAddress);
                return [4 /*yield*/, (0, exports.transferToken)(connection, fromWallet, mint, toWalletPublicKey, amount)];
            case 3:
                _a.sent();
                return [2 /*return*/, tokenAddress];
        }
    });
}); };
exports.transferNFT = transferNFT;
/**
 * Set the authority of the token to another wallet
 *
 * @param connection             - the connection to the cluster
 * @param fromWallet             - the wallet that will set the authority
 * @param mint                   - the address of the token
 * @param toWalletPublicKey      - the public key of the wallet that will receive the authority
 * @returns                      - the transaction object
 */
var removeTokenAuthority = function (connection, fromWallet, mint) { return __awaiter(void 0, void 0, void 0, function () {
    var setAuthorityTransaction, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, spl_token_1.setAuthority)(connection, fromWallet, mint, fromWallet.publicKey, 0, null // remove the authority
                    )];
            case 1:
                setAuthorityTransaction = _a.sent();
                console.log("Removing authority transaction", setAuthorityTransaction);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.log("Error Removing authority", error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.removeTokenAuthority = removeTokenAuthority;
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
var transferToken = function (connection, fromWallet, mint, toWalletPublicKey, amount) { return __awaiter(void 0, void 0, void 0, function () {
    var fromTokenAccount, toTokenAccount, transferTransaction, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, fromWallet, mint, fromWallet.publicKey)];
            case 1:
                fromTokenAccount = _a.sent();
                console.log("From token account", fromTokenAccount.address.toBase58());
                return [4 /*yield*/, (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, fromWallet, mint, toWalletPublicKey)];
            case 2:
                toTokenAccount = _a.sent();
                console.log("To token account", toTokenAccount.address.toBase58());
                _a.label = 3;
            case 3:
                _a.trys.push([3, 5, , 6]);
                return [4 /*yield*/, (0, spl_token_1.transfer)(connection, fromWallet, fromTokenAccount.address, toTokenAccount.address, fromWallet.publicKey, amount // Number of tokens to transfer 
                    )];
            case 4:
                transferTransaction = _a.sent();
                console.log("Transfer transaction", transferTransaction);
                return [3 /*break*/, 6];
            case 5:
                error_2 = _a.sent();
                console.log("Error transferring token", error_2);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.transferToken = transferToken;
/// call from the command line
/// node index.js getOrCreateWalllet <walletSeedPhrase> - to create a new wallet or get an existing one from a seed phrase
/// node index.js createAndMintNFT <fromWalletSeedPhrase> <amount> - to create a new token and mint it to a wallet
/// node index.js transferNFT <fromWalletSeedPhrase> <toWalletPublicKey> <tokenAddress> - to transfer a token from one wallet to another
///
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var args, wallet, token, token;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                args = process.argv.slice(2);
                if (!(args[0] === "getOrCreateWallet")) return [3 /*break*/, 1];
                console.log("Creating wallet and account...", args);
                wallet = (0, exports.getOrCreateWallet)(args[1]);
                console.log("Wallet publicKey", wallet.publicKey.toBase58(), "secretKey", bs58.encode(wallet.secretKey));
                return [3 /*break*/, 5];
            case 1:
                if (!(args[0] === "createAndMintNFT")) return [3 /*break*/, 3];
                console.log("Creating and minting a new token...", args);
                return [4 /*yield*/, (0, exports.createAndMintNFT)(args[1], parseInt(args[2] || '1'), args[3], args[4], args[5], args[6])];
            case 2:
                token = _a.sent();
                console.log("Token created and minted", token);
                return [3 /*break*/, 5];
            case 3:
                if (!(args[0] === "transferNFT")) return [3 /*break*/, 5];
                console.log("Transferring NFT...", args);
                return [4 /*yield*/, (0, exports.transferNFT)(args.slice(1)[0], args.slice(1)[1], args.slice(1)[2], parseInt(args.slice(1)[3] || '1'))];
            case 4:
                token = _a.sent();
                console.log("NFT transferred", token);
                _a.label = 5;
            case 5:
                ;
                return [2 /*return*/];
        }
    });
}); })();
