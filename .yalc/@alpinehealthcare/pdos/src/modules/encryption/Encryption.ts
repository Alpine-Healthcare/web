import Module from "../Module";
import { Core } from "../../Core";

import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { LIT_NETWORK } from "@lit-protocol/constants";
import { ALPINE_HEALTHCARE } from "../auth/Auth";

import { encryptString, decryptToString } from "@lit-protocol/encryption"

import { LIT_ABILITY } from "@lit-protocol/constants";
import {
  LitAccessControlConditionResource,
  createSiweMessage,
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

const accessCondition = (address: string) => ([{
  chain: "baseSepolia",  // e.g. "ethereum", "polygon", "mumbai", etc.
  contractAddress: "0x1e249431Df6ceeeF616d4d23d859A0F49A82aa32",
  functionName: "hasUserAccess",
  functionParams: [address],  // Lit will replace :userAddress with the requesting user's address
  functionAbi: {
    name: "hasUserAccess",
    inputs: [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],  // ensure output type is bool
    stateMutability: "view",
    type: "function"
  },
  returnValueTest: {
    key: "",              // empty because the function returns a single value
    comparator: "=",
    value: "true"         // expecting the function to return true for access
  }
}]);

export interface EncryptionConfig {}

const capacityDelegationAuthSig ={
  sig: '0xdb0162a72aec0dc53c7634d4de77fba9e6700e186e151233b665ba0fa44ccf3e15759143d4d9983581d0eb56807372c145b349df59c06b43fa492707d40dbfbe1b',
  derivedVia: 'web3.eth.personal.sign',
  signedMessage: 'localhost wants you to sign in with your Ethereum account:\n' +
    '0xe4d172EE62f88Ba29D051D60620fEBB308B81F4E\n' +
    '\n' +
    "This is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Auth': 'Auth' for 'lit-ratelimitincrease://110585'.\n" +
    '\n' +
    'URI: lit:capability:delegation\n' +
    'Version: 1\n' +
    'Chain ID: 1\n' +
    'Nonce: 0x08f5fcf83b8ed917cfc2773c80afe99a03b6ecc42a90de3f4c8ecda0226258e4\n' +
    'Issued At: 2025-02-03T15:27:22.808Z\n' +
    'Expiration Time: 2025-02-10T14:07:22.805Z\n' +
    'Resources:\n' +
    '- urn:recap:eyJhdHQiOnsibGl0LXJhdGVsaW1pdGluY3JlYXNlOi8vMTEwNTg1Ijp7IkF1dGgvQXV0aCI6W3siZGVsZWdhdGVfdG8iOlsiY2JjMTFlNTM0MDc3YTE4MTQ3NmM3YTVjNTExYTVmZmI0YzE3ZGI2NSJdLCJuZnRfaWQiOlsiMTEwNTg1Il0sInVzZXMiOiIxMDAwIn1dfX0sInByZiI6W119',
  address: '0xe4d172EE62f88Ba29D051D60620fEBB308B81F4E'
} 

export default class Encryption extends Module {
  private litNodeClient: LitJsSdk.LitNodeClient | undefined

  constructor(core : Core, private config : EncryptionConfig) {
    super(core);
  }

  protected async start() {
    this.litNodeClient = new LitJsSdk.LitNodeClient({
        litNetwork: LIT_NETWORK.DatilTest,
      });
      
    await this.litNodeClient.connect();
  }

  public async encrypt(data: string) {
    if (!this.core.modules.auth?.publicKey || !this.litNodeClient) {
      return 
    }

    const { ciphertext, dataToEncryptHash } = await encryptString(
      {
        evmContractConditions: accessCondition(this.core.modules.auth?.publicKey) as any,
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
    if (!this.core.modules.auth?.publicKey || !this.litNodeClient || !sessionSigs) {
      return 
    }

    // Decrypt the message
    const decryptedString = await decryptToString(
      {
        evmContractConditions: accessCondition(this.core.modules.auth?.publicKey) as any,
        chain: "ethereum",
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
    console.log("latest blockhash: ", latestBlockhash)
 
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
      console.log("latest blockhash: ", latestBlockhash)
      console.log("params: ", params)
  
      // Create the SIWE message
      const toSign = await createSiweMessageWithRecaps({
        uri: params.uri,
        expiration: params.expiration,
        resources: params.resourceAbilityRequests,
        walletAddress: await signer.getAddress(),
        nonce: latestBlockhash,
        litNodeClient: this.litNodeClient,
      });

      console.log("toSign: ", toSign)

      console.log("signer: ", signer)

      const testSign = await signer.signMessage("testSign");
      console.log("testSign: ", testSign)

      const sig = await signer.signMessage(toSign);
      console.log("sig",sig)
 
      // Generate the authSig
      const authSig = await generateAuthSig({
        signer: signer,
        toSign,
      });

      console.log("authSig: ", authSig)
 
      return authSig;
    }
 
    // Define the Lit resource
    const litResource = new LitAccessControlConditionResource('*');

    // Get the session signatures
    const sessionSigs = await this.litNodeClient.getSessionSigs({
      expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
        chain: "ethereum",
        resourceAbilityRequests: [
            {
                resource: litResource,
                ability: LIT_ABILITY.AccessControlConditionDecryption,
            },
        ],
        authNeededCallback,
        capacityDelegationAuthSig, 
    });
    return sessionSigs;
 }


}