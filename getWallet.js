//@ts-check
const { generateMnemonic, mnemonicToSeed } = require("bip39-light");
const { Keypair } = require("@solana/web3.js");
// @ts-ignore
const { derivePath } = require("ed25519-hd-key");

const getWallet = (mnemonic) => {
    mnemonic = mnemonic || generateMnemonic();
    const seed = mnemonicToSeed(mnemonic);
    console.log('Seed phrase', mnemonic);
    const { key } = derivePath(`m/44'/501'/0'/0'`, seed.toString('hex'));
    return Keypair.fromSeed(key)
};

module.exports = {
    getWallet
}