import Module from "../Module";
import { Core } from "../../Core";

import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { LIT_NETWORK } from "@lit-protocol/constants";
import { ALPINE_HEALTHCARE } from "../auth/Auth";

import { encryptString, decryptToString } from "@lit-protocol/encryption"
import { getRandomBytesSync } from "ethereum-cryptography/random.js";
import { hexToBytes, bytesToHex, bytesToUtf8, utf8ToBytes } from "ethereum-cryptography/utils.js";


import { LIT_ABILITY } from "@lit-protocol/constants";
import {
  LitAccessControlConditionResource,
  createSiweMessage,
  createSiweMessageWithRecaps,
  generateAuthSig,
} from "@lit-protocol/auth-helpers";
import * as aes from "ethereum-cryptography/aes.js";
import PDFSNode from "../../store/PDFSNode";


const accessCondition = (address: string) => ([{
  chain: "baseSepolia",  // e.g. "ethereum", "polygon", "mumbai", etc.
  contractAddress: ALPINE_HEALTHCARE,
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

const PDOS_ACCESS_PACKAGE = "pdos-accessPackage"

export interface AccessPackage {
  iv: string,
  datakey: string,
}

export interface AccessPackageEncrypted {
  ciphertext: string,
  dataToEncryptHash: string
}

export default class Encryption extends Module {
  private litNodeClient: LitJsSdk.LitNodeClient | undefined
  private accessPackage: AccessPackage | undefined
  private accessPackageEncrypted: AccessPackageEncrypted | undefined

  constructor(core : Core, private config : null) {
    super(core);
  }

  protected async start() {
    this.litNodeClient = new LitJsSdk.LitNodeClient({
        litNetwork: LIT_NETWORK.DatilTest,
      });
      
    await this.litNodeClient.connect();
  }

  public async generateAccessPackage(): Promise<AccessPackageEncrypted | undefined> {

    const iv = getRandomBytesSync(16);
    const datakey = getRandomBytesSync(32);

    const accessPackage: AccessPackage = {
      iv: bytesToHex(iv),
      datakey: bytesToHex(datakey),
    }

    const accessPackageEncrypted = await this.encryptWithLit(JSON.stringify(accessPackage));

    if (!accessPackageEncrypted) {
      throw new Error("Failed to encrypt access package with Lit")
    }


    this.accessPackage = accessPackage;
    await this.core.modules.storage?.addItem(PDOS_ACCESS_PACKAGE, JSON.stringify(accessPackage))

    return accessPackageEncrypted
  }

  public async setAccessPackage(root: PDFSNode) {
    this.accessPackageEncrypted = root._rawNode.access_package

    if (!this.accessPackageEncrypted) {
      throw new Error("Access package not found, abandoning!")
    }

    const savedAccessPackage = await this.core.modules.storage?.getItem(PDOS_ACCESS_PACKAGE)

    if (savedAccessPackage) {
      this.accessPackage = JSON.parse(savedAccessPackage)
      return
    }

    const decryptedAccessPackage = await this.decryptWithLit(this.accessPackageEncrypted?.ciphertext, this.accessPackageEncrypted?.dataToEncryptHash)

    if (!decryptedAccessPackage) {
      throw new Error("Failed to decrypt access package with Lit")
    }

    this.accessPackage = JSON.parse(decryptedAccessPackage)
  }

  public async encryptNode(data: string | object) {

    const dataParsed = typeof data === "string" ? data : JSON.stringify(data)

    if (!this.accessPackage) {
      throw new Error("Access package not found, abandoning!")
    }

    return bytesToHex(aes.encrypt(
      utf8ToBytes(dataParsed),
      hexToBytes(this.accessPackage.datakey),
      hexToBytes(this.accessPackage.iv),
      "aes-256-ctr"
    ))
  }
  
  public async decryptNode(encryptedData: string) {
    if (!this.accessPackage) {
      return
    }

    return JSON.parse(bytesToUtf8(aes.decrypt(
      hexToBytes(encryptedData),
      hexToBytes(this.accessPackage.datakey),
      hexToBytes(this.accessPackage.iv),
      "aes-256-ctr"
    )))
  }

  public async encryptWithLit(data: string): Promise<AccessPackageEncrypted | undefined> {
    if (!this.core.modules.auth?.publicKey || !this.litNodeClient) {
      throw new Error("Missing publickey or litNodeClient")
    }

    const { ciphertext, dataToEncryptHash } = await encryptString(
      {
        evmContractConditions: accessCondition(this.core.modules.auth?.publicKey) as any,
        dataToEncrypt: data,
      },
      this.litNodeClient,
    );

    return {
      ciphertext,
      dataToEncryptHash,
    };
  }

  public async decryptWithLit(ciphertext: string, dataToEncryptHash: string) {
    const sessionSigs = await this.getSessionSignatures();
    if (!this.core.modules.auth?.publicKey || !this.litNodeClient || !sessionSigs) {
      throw new Error("Missing publickey, litNodeClient, or sessionSigs")
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
    return decryptedString;

  }

  public async getSessionSignatures(){

    const signer = await this.core.modules.auth?.getSigner()

    if (!this.litNodeClient || !this.core.modules.auth?.publicKey || !signer) {
      throw new Error("Missing litNodeClient, publickey, or signer")
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

      // Create the SIWE message
      const toSign = await createSiweMessageWithRecaps({
        uri: params.uri,
        expiration: params.expiration,
        resources: params.resourceAbilityRequests,
        walletAddress: await signer.getAddress(),
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