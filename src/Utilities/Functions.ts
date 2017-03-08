import { Buffer } from 'buffer';
import { KMS } from 'aws-sdk';

declare const process: any;

/**
 * Decrypts an encrypted variables from `process.env` and stores the decrypted value in a different variable.
 * @param  {string}        cipherVarName    Name of the variable in `process.env` containing the encypted text.
 * @param  {string}        decryptedVarName Name of the variable in `process.env` that will contain the decypted value.
 *                                          If not provided, the original `cipherVarName` will be overridden with the
 *                                          new value.
 * @param  {string}        encoding         Encoding used by cipherVarName. Defaults to base64.
 * @return {Promise<void>} Promise that will resolve once the decryption is done.
 */
export function decryptEnvVar(
    cipherVarName: string,
    decryptedVarName:string = '',
    encoding:string = ''
    ): Promise<void> {

    // Make sure our Encrypted variable exists.
    if (process.env[cipherVarName] == undefined) {
        throw new Error(cipherVarName + " is not a valid process variable.");
    }

    // If we don't specify a output variable name, then we'll just override the original value.
    if (!decryptedVarName) {
        decryptedVarName = decryptedVarName;
    }

    // If we don't specify an encdoging default to base 64.
    if (!encoding) {
        encoding = 'base64'
    }

    // Build the parameters for our KMS request.
    const params: KMS.DecryptRequest = {
        CiphertextBlob: new Buffer(process.env[cipherVarName], encoding)
    };

    // Do the decryption.
    const kms = new KMS();
    return kms.decrypt(params).promise().then((data: KMS.DecryptResponse) => {
        // Store the decrypted value.
        process.env[decryptedVarName] = data.Plaintext.toString();
        return Promise.resolve();
    });


};
