
import Module from "../Module";
import { Core } from "../..";
import axios from "axios";
import { ethers, Wallet } from "ethers";
import { makeObservable, observable } from "mobx";

import * as aes from "ethereum-cryptography/aes.js";
import { bytesToUtf8, hexToBytes, utf8ToBytes } from "ethereum-cryptography/utils.js";
import { getRandomBytes } from 'ethereum-cryptography/random';
import { base64ToUint8Array, importAddressAsHmacKey, importIvAsKey, publicKeyToHex, uint8ArrayToBase64, wrapIv } from "../../utils/crypto";

export enum AuthType {
  WALLET,
  PASSKEY
}

interface AuthInfo {
  isAuthenticated: boolean
  isActive: boolean
  pdosRoot: string | undefined
  computeNodeAddress: string | undefined
}

interface EncryptionScheme {
  iv: string,
  dataKey: string,
}

interface Config {
  eip1193Provider: any,
  jsonRpcProvider: ethers.JsonRpcProvider 
  privateKey: string
}

export const ALPINE_HEALTHCARE = "0x1e249431Df6ceeeF616d4d23d859A0F49A82aa32" 
export const ALPINE_HEALTHCARE_ABI = [{"inputs":[{"internalType":"address","name":"computeNode","type":"address"}],"name":"addComputeNodeAccessForUser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"checkIsActive","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getPDOSRoot","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserEncryptedDataKeys","outputs":[{"components":[{"internalType":"string","name":"dataKey","type":"string"},{"internalType":"string","name":"marketplaceKey","type":"string"}],"internalType":"struct AlpineHealthcare.EncryptedKeys","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUsersComputeNode","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"computeNode","type":"address"}],"name":"getUsersForComputeNode","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"hasUserAccess","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_pdosHash","type":"string"},{"internalType":"string","name":"_encryptedDataKey","type":"string"}],"name":"onboard","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"computeNode","type":"address"}],"name":"removeComputeNodeAccessForUser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"computeNode","type":"address"}],"name":"subscribeToMarketplaceItem","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"string","name":"_newHash","type":"string"}],"name":"updatePDOSRoot","outputs":[],"stateMutability":"nonpayable","type":"function"}] 
export default class Auth extends Module {

  public authType : AuthType | undefined;
  public info: AuthInfo = {
    isAuthenticated: false,
    isActive: false,
    pdosRoot: undefined,
    computeNodeAddress: undefined
  }

  public credentialId : string | undefined = undefined;
  public publicKey: string | undefined;


  private ethersProvider: ethers.BrowserProvider | undefined;
  private eip1193Provider: any;
  private wallet: ethers.Wallet | undefined

  constructor(core : Core, private config : Config){
    super(core);
    makeObservable(this, {
      info: observable,
      publicKey: observable,
    });

    if (config.eip1193Provider) {
      this.eip1193Provider = config.eip1193Provider
    }

    if (!this.core.isComputeNode) {
      this.ethersProvider = new ethers.BrowserProvider(config.eip1193Provider)
    }

  }

  public async initializeWalletUserWithPrivateKey() {
    this.authType = AuthType.WALLET
    const wallet = new ethers.Wallet(this.config.privateKey, this.config.jsonRpcProvider);
    this.wallet = wallet
    const address = wallet.address
    if (address) {
      this.publicKey = address
      console.log("address: ", address)
    }
  }

  public async initializeWalletUser() {
    this.authType = AuthType.WALLET
    let addresses: string[] = []
    await this.disconnectWalletUser()
    addresses = await this.eip1193Provider.request({ method: 'eth_requestAccounts' });
    if (addresses.length > 0) {
      this.publicKey = addresses[0]
      await this.initInfoForWalletUser()
    }
    return
  }

  public async disconnectWalletUser() {
    await this.eip1193Provider.disconnect()
    this.info = {
      isActive: false,
      isAuthenticated: false,
      pdosRoot: undefined,
      computeNodeAddress: undefined
    }
    this.publicKey = undefined
  }

  /** Wallet Support */

  public async initInfoForWalletUser() {
    this.authType = AuthType.WALLET
    this.info.isActive = await this.checkIsActive()

    const pdosRoot = await this.getPDOSRoot()
    if (!pdosRoot) {
      try {
        const newUser = await fetch(this.core.gatewayURL+ "/auth/register-wallet-user", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            publicKey: this.publicKey,
          })
        })
        const newUserResponse = await newUser.json()
        const newPDOSRoot = (newUserResponse as any).hash_id
        this.info.pdosRoot = newPDOSRoot
        await this.onboard(newPDOSRoot, "hi")
      } catch (e) {
        throw new Error("Failed onboarding user")
      }
    } else {
      const pdosRoot = await this.getPDOSRoot()
      this.info.pdosRoot = pdosRoot
    }
   
    const root = await this.core.tree.root.init(this.info.pdosRoot)

    if (this.info.pdosRoot !== root) {
      await this.updatePDOSRoot(root)
      this.info.pdosRoot = root
    }

    this.info.isAuthenticated = true
    this.info.computeNodeAddress = await this.getUserComputeNode()
  }
  
  public async encryptionTest(){
    console.log("testing encryption!!!")
    const testData = "hi"
    const { ciphertext, dataToEncryptHash} = await this.core.modules.encryption?.encrypt(testData) as any

    const deciphered = await this.core.modules.encryption?.decrypt(ciphertext, dataToEncryptHash)
    console.log("descipered text: ", deciphered)
  }

  public async encrypt(data: object) {
    const dataParsed = JSON.stringify(data)
    if (!this.publicKey) {
      return
    }

    const encrypted = aes.encrypt(
      utf8ToBytes(dataParsed),
      hexToBytes("2b7e151628aed2a6abf7158809cf4f3c"),
      hexToBytes("f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff")
    )

    return uint8ArrayToBase64(encrypted)
  }
  
  public async decrypt(data: string) {
    if (!this.publicKey) {
      return
    }

    const decrypted = aes.decrypt(
      base64ToUint8Array(data),
      hexToBytes("2b7e151628aed2a6abf7158809cf4f3c"),
      hexToBytes("f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff")
    )

    return JSON.parse(bytesToUtf8(decrypted))
  }

  public async getSigner() {
    if (this.ethersProvider) {
      const signer = await this.ethersProvider.getSigner();
      return signer
    } else if (this.wallet) {
      const signer = this.wallet
      return signer
    } else {
      throw new Error("No signer available")
    }
  }

  public async checkIsActive() {
    const signer = await this.getSigner();
    const contract = new ethers.Contract(ALPINE_HEALTHCARE, ALPINE_HEALTHCARE_ABI, signer);
    const isActiveReturnValue = await contract.checkIsActive(this.publicKey);
    return isActiveReturnValue
  }

  public async onboard(pdosHashId: string, encryptedDataKey: string){
    const signer = await this.getSigner();
    const contract = new ethers.Contract(ALPINE_HEALTHCARE, ALPINE_HEALTHCARE_ABI, signer);
    const tx = await contract.onboard(
      pdosHashId,
      encryptedDataKey,
    );

    await tx.wait();
  }

  public async getPDOSRoot(address?: string) {
    const signer = await this.getSigner();
    const contract = new ethers.Contract(ALPINE_HEALTHCARE, ALPINE_HEALTHCARE_ABI, signer);
    const pdosRoot = await contract.getPDOSRoot(address ?? this.publicKey);
    return pdosRoot 
  }

  public async updatePDOSRoot(newHash: string, address?: string){ 
    const signer = await this.getSigner();
    const contract = new ethers.Contract(ALPINE_HEALTHCARE, ALPINE_HEALTHCARE_ABI, signer);
    const tx = await contract.updatePDOSRoot(address ?? this.publicKey, newHash);

    await tx.wait();

    this.info.pdosRoot = newHash
  }

  public async addComputeNodeAccessForUser(computeAddress: string){ 
    const signer = await this.getSigner();
    const contract = new ethers.Contract(ALPINE_HEALTHCARE, ALPINE_HEALTHCARE_ABI, signer);
    const tx = await contract.addComputeNodeAccessForUser(computeAddress);

    await tx.wait();

    this.info.computeNodeAddress = computeAddress
  }

  public async getUsersForComputeNode(computeAddress: string){ 
    const signer = await this.getSigner();
    const contract = new ethers.Contract(ALPINE_HEALTHCARE, ALPINE_HEALTHCARE_ABI, signer);
    return await contract.getUsersForComputeNode(computeAddress);
  }

  public async getUserComputeNode(){ 
    const signer = await this.getSigner();
    const contract = new ethers.Contract(ALPINE_HEALTHCARE, ALPINE_HEALTHCARE_ABI, signer);
    return await contract.getUsersComputeNode(this.publicKey);
  }

}