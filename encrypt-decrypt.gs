const { encryptSecretKey, encryptSecretIV } = getConstants();
const rawSecret = encryptSecretKey;
const rawIV = encryptSecretIV;
const key = CryptoJS.enc.Utf8.parse(rawSecret);
const iv = CryptoJS.enc.Utf8.parse(rawIV);

// Encrypting
function encrypt(rawMessage) {
    const encrypted = CryptoJS.AES.encrypt(rawMessage, key, { iv }).toString();
    return encrypted;
}

// Decrypting
function decrypt(encryptedMsg) {
    const decrypted = CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(encryptedMsg, key, { iv }));
    return decrypted;
}
