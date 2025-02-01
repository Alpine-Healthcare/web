import Module from "../Module";
import { Core } from "../../Core";

import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { LIT_NETWORK } from "@lit-protocol/constants";
import { ALPINE_HEALTHCARE } from "../auth/Auth";

import { encryptString, decryptToString } from "@lit-protocol/encryption"

import { LIT_ABILITY } from "@lit-protocol/constants";
import {
  LitAccessControlConditionResource,
  createSiweMessageWithRecaps,
  generateAuthSig,
} from "@lit-protocol/auth-helpers";

const userAccessControlConditions  = (address: string) => [
  {
    contractAddress: ALPINE_HEALTHCARE,
    standardContractType: "",
    chain: "baseSepolia",
    method: "hasUserAccess",
    parameters: [address],
    returnValueTest: {
      comparator: "=",
      value: "true",
    },
  },
];

export interface EncryptionConfig {}

export default class Encryption extends Module {
  private litNodeClient: LitJsSdk.LitNodeClient | undefined

  constructor(core : Core, private config : EncryptionConfig) {
    super(core);
  }

  protected async start() {
    this.litNodeClient = new LitJsSdk.LitNodeClient({
        litNetwork: LIT_NETWORK.Datil,
      });
      
    await this.litNodeClient.connect();
  }

  public async encrypt(data: string) {
    if (!this.core.modules.auth?.publicKey || !this.litNodeClient) {
      return 
    }

    const { ciphertext, dataToEncryptHash } = await encryptString(
      {
        accessControlConditions: userAccessControlConditions(this.core.modules.auth?.publicKey) as any,
        dataToEncrypt: data,
      },
      this.litNodeClient,
    );

    // Return the ciphertext and dataToEncryptHash
    return {
      ciphertext,
      dataToEncryptHash,
    };

  }

  public async decrypt(ciphertext: string, dataToEncryptHash: string) {

    const sessionSigs = await this.getSessionSignatures();
    if (!this.core.modules.auth?.publicKey || !this.litNodeClient) {
      return 
    }

    // Decrypt the message
    const decryptedString = await decryptToString(
      {
        accessControlConditions: userAccessControlConditions(this.core.modules.auth?.publicKey) as any,
        chain: "baseSepolia",
        ciphertext,
        dataToEncryptHash,
        sessionSigs,
      },
      this.litNodeClient,
    );

    // Return the decrypted string
    return { decryptedString };

  }

  public async getSessionSignatures(){

    const signer = await this.core.modules.auth?.getSigner()

    if (!this.litNodeClient || !this.core.modules.auth?.publicKey || !signer) {
      return
    }
 
    // Get the latest blockhash
    const latestBlockhash = await this.litNodeClient.getLatestBlockhash();
 
    // Define the authNeededCallback function
    const authNeededCallback = async(params: any) => {
      if (!params.uri) {
        throw new Error("uri is required");
      }
      if (!params.expiration) {
        throw new Error("expiration is required");
      }
 
      if (!params.resourceAbilityRequests) {
        throw new Error("resourceAbilityRequests is required");
      }

      console.log("publick key: ", this.core.modules.auth?.publicKey!)
  
      // Create the SIWE message
      const toSign = await createSiweMessageWithRecaps({
        uri: params.uri,
        expiration: params.expiration,
        resources: params.resourceAbilityRequests,
        walletAddress: this.core.modules.auth?.publicKey!,
        nonce: latestBlockhash,
        litNodeClient: this.litNodeClient,
      });
 
      // Generate the authSig
      const authSig = await generateAuthSig({
        signer: signer,
        toSign,
      });
 
      return authSig;
    }
 
    // Define the Lit resource
    const litResource = new LitAccessControlConditionResource('*');

    // Get the session signatures
    const sessionSigs = await this.litNodeClient.getSessionSigs({
        chain: "ethereum",
        resourceAbilityRequests: [
            {
                resource: litResource,
                ability: LIT_ABILITY.AccessControlConditionDecryption,
            },
        ],
        authNeededCallback,
        capacityDelegationAuthSig: {
          sig: '0x30edb813312b5a56da56059cd12213aad6b194b77256bb9dadc07bc1b4056f260bcb3ed3189b857490274487eeba9c11c1110bfed5242984c8ae14643eeb5f8c1b',
          derivedVia: 'web3.eth.personal.sign',
          signedMessage: 'localhost wants you to sign in with your Ethereum account:\n' +
            '0xe4d172EE62f88Ba29D051D60620fEBB308B81F4E\n' +
            '\n' +
            "This is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Auth': 'Auth' for 'lit-ratelimitincrease://109217'.\n" +
            '\n' +
            'URI: lit:capability:delegation\n' +
            'Version: 1\n' +
            'Chain ID: 1\n' +
            'Nonce: 0x9e4cae9d33828e2f185d8290e6803bd28997e9d691d56ba5e645fbb35dd137f3\n' +
            'Issued At: 2025-02-01T01:06:47.421Z\n' +
            'Expiration Time: 2025-02-01T01:16:47.414Z\n' +
            'Resources:\n' +
            '- urn:recap:eyJhdHQiOnsibGl0LXJhdGVsaW1pdGluY3JlYXNlOi8vMTA5MjE3Ijp7IkF1dGgvQXV0aCI6W3siZGVsZWdhdGVfdG8iOlsiOTdiYjkzOTMzOTAwOGM5MjVEREUxQmYzRjBhRjk4M0NEQjQxN0U2RiJdLCJuZnRfaWQiOlsiMTA5MjE3Il0sInVzZXMiOiIxIn1dfX0sInByZiI6W119',
          address: '0xe4d172EE62f88Ba29D051D60620fEBB308B81F4E'
        },
    });
    return sessionSigs;
 }


}