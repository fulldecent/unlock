import LockContract from '../../artifacts/contracts/PublicLock.json'

export default function makeRetrieveKeys({ web3, lock, account, setKey }) {
  const retrieveKeys = async () => {
    const lockContract = new web3.eth.Contract(LockContract.abi, lock.address)

    const getKeyExpirationPromise = lockContract.methods
      .keyExpirationTimestampFor(account)
      .call()
    const getKeyDataPromise = lockContract.methods.keyDataFor(account).call()
    let expiration, data
    try {
      const results = await Promise.all([
        getKeyExpirationPromise,
        getKeyDataPromise,
      ])
      expiration = parseInt(results[0], 10)
      data = results[1]
    } catch (e) {
      expiration = 0
      data = null
    }
    if (expiration > new Date().getTime() / 1000) {
      // only set non-expired keys
      setKey({
        lock: lock.address,
        owner: account,
        expiration,
        data,
      })
    }
  }
  return retrieveKeys
}
