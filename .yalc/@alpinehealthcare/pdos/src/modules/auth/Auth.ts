
import Module from "../Module";
import { Core } from "../..";
import { ethers, } from "ethers";
import { makeObservable, observable } from "mobx";

export enum AuthType {
  WALLET,
  PASSKEY
}

export enum InitSteps {
  ADDING_TO_ALPINE = "Adding to alpine",
  GENERATING_ENCRYPTION_KEYS = "Generating encryption keys",
  INITIALIZING_PDOS = "Initializing PDOS",
  ONBOARDING = "Onboarding",
  COMPLETED = "Completed"
}

interface AuthInfo {
  isAuthenticated: boolean
  isActive: boolean
  pdosRoot: string | undefined
  computeNodeAddress: string | undefined
}

interface Config {
  eip1193Provider: any,
  jsonRpcProvider: ethers.JsonRpcProvider 
  privateKey: string
}

export const ALPINE_HEALTHCARE = "0xA690F14afBe9b9C9366088Ab32dC49451C4CBE50" 
export const ALPINE_HEALTHCARE_ABI = [{"inputs":[{"internalType":"address","name":"computeNode","type":"address"}],"name":"addComputeNodeAccessForUser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"checkIsActive","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getPDOSRoot","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserEncryptedDataKeys","outputs":[{"components":[{"internalType":"string","name":"dataKey","type":"string"},{"internalType":"string","name":"marketplaceKey","type":"string"}],"internalType":"struct AlpineHealthcare.EncryptedKeys","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUsersComputeNode","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"computeNode","type":"address"}],"name":"getUsersForComputeNode","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"hasUserAccess","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"offboardUser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_pdosHash","type":"string"},{"internalType":"string","name":"_encryptedDataKey","type":"string"}],"name":"onboard","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"computeNode","type":"address"}],"name":"removeComputeNodeAccessForUser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"computeNode","type":"address"}],"name":"subscribeToMarketplaceItem","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"string","name":"_newHash","type":"string"}],"name":"updatePDOSRoot","outputs":[],"stateMutability":"nonpayable","type":"function"}] 
export default class Auth extends Module {

  public authType : AuthType | undefined;
  public info: AuthInfo = {
    isAuthenticated: false,
    isActive: false,
    pdosRoot: undefined,
    computeNodeAddress: undefined
  }
  public initStep: InitSteps | undefined;

  public credentialId : string | undefined = undefined;
  public publicKey: string | undefined;


  private ethersProvider: ethers.BrowserProvider | undefined;
  private eip1193Provider: any;
  private wallet: ethers.Wallet | undefined

  private initStarted: boolean = false

  constructor(core : Core, private config : Config){
    super(core);
    makeObservable(this, {
      info: observable,
      publicKey: observable,
    });

    if (config.eip1193Provider) {
      this.eip1193Provider = config.eip1193Provider
    }
  }

  public async initializeWalletUserWithPrivateKey() {
    this.authType = AuthType.WALLET
    const wallet = new ethers.Wallet(this.config.privateKey, this.config.jsonRpcProvider);
    this.wallet = wallet
    const address = wallet.address
    if (address) {
      this.publicKey = address
    }
    await this.initInfoForWalletUser()
  }

  public async initializeWalletUser(eip1193Provider?: ethers.Eip1193Provider) {
    if (this.initStarted) {
      return
    }

    this.initStarted = true
    if (eip1193Provider) {
      this.eip1193Provider = eip1193Provider
      this.ethersProvider = new ethers.BrowserProvider(eip1193Provider)
    }
    this.authType = AuthType.WALLET
    let addresses: string[] = []
    addresses = await this.eip1193Provider.request({ method: 'eth_requestAccounts' });
    if (addresses.length > 0) {
      this.publicKey = addresses[0]
      await this.initInfoForWalletUser()
    }
  }

  public async disconnectWalletUser() {
    //await this.eip1193Provider.disconnect()
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

    try {
      this.info.isActive = await this.checkIsActive()
      this.info.pdosRoot= await this.getPDOSRoot()
    } catch (e) {
      this.info.isActive = false
    }

    let generatedAccessPackageEncrypted = undefined
    const isNewUser = !this.info.pdosRoot

    if (isNewUser) {
      this.initStep = InitSteps.ADDING_TO_ALPINE
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
        this.initStep = InitSteps.GENERATING_ENCRYPTION_KEYS
        generatedAccessPackageEncrypted = await this.core.modules.encryption?.generateAccessPackage()
      } catch (e) {
        throw new Error("Failed onboarding user")
      }
    } 

    if (isNewUser) {
      this.initStep = InitSteps.INITIALIZING_PDOS
    }
    await this.core.tree.root.init(this.info.pdosRoot)
    console.log("# pdos - initial root hash ", this.core.tree.root._hash)

    if (isNewUser) {
      await this.core.tree.root.addAccessPackage(generatedAccessPackageEncrypted)
      this.initStep = InitSteps.ONBOARDING
      await this.onboard(this.core.tree.root._hash, "")
      this.initStep = InitSteps.COMPLETED
    } else {
      await this.core.tree.root.syncLocalRootHash()
      await this.core.modules.encryption?.setAccessPackage(this.core.tree.root)
    }

    this.info.pdosRoot = this.core.tree.root._hash
    this.info.isAuthenticated = true
    this.info.computeNodeAddress = await this.getUserComputeNode()
    this.info.isActive = true
    this.initStep = InitSteps.COMPLETED
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

  public async offboard() {
    const signer = await this.getSigner();
    const contract = new ethers.Contract(ALPINE_HEALTHCARE, ALPINE_HEALTHCARE_ABI, signer);
    const tx = await contract.offboardUser(this.publicKey);
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