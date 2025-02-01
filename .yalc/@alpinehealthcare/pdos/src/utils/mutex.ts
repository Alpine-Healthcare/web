import axios from "axios";
import pdos from "..";
    
interface MutexInfo {
  acquired: boolean,
  timestamp: string
}

export const getUserHashId = async (credential_id: string) => {
  const userRes = await axios.get(pdos().gatewayURL +"/pdos/users/" + credential_id)
  const user = userRes.data
  return user[1].hash_id
}

export const getUserMutex = async (credential_id: string): Promise<MutexInfo> => {
  const mutex = await axios.get(pdos().gatewayURL + "/pdos/mutex", {
    params: {
      credential_id: credential_id
    }
  })
  const mutexInfo = mutex.data
  return mutexInfo
}

export const releaseMutex = async (credential_id: string): Promise<boolean> => {
  try {
    const releaseResp = await axios.get(pdos().gatewayURL + "/pdos/mutex/release", { params: { credential_id: credential_id }})
    return releaseResp.data
  } catch (e) {
    console.log("error releasing mutex: ", e)
    return false
  }
}

export const acquireMutexForUser = async (credential_id: string): Promise<boolean> => {
  const mutexInfo = await getUserMutex(credential_id)

  if (!mutexInfo.acquired) {
    const timestamp = mutexInfo.timestamp
    const timestampEpoch = new Date(timestamp).getTime()
    const nowEpoch = new Date().getTime() 

    if (nowEpoch - timestampEpoch > 3000) {
      await releaseMutex(credential_id)
      const mutexInfo = await getUserMutex(credential_id)
      if (!mutexInfo.acquired) {
        return false
      } 

    } else {
      return false;
    }
  }

  return true
} 

export const cleanupMutexForUser = async (credential_id: string): Promise<boolean> => {
  return await releaseMutex(credential_id)
}