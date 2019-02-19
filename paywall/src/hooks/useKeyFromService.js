import { useEffect, useState } from 'react'
import { lockRoute } from '../utils/routes'
import useConfig from './utils/useConfig'
import useAccount from './web3/useAccountFromService'
import useWeb3 from './web3/useWeb3Service'
import useKeyPurchase from './useKeyPurchaseFromService'
import useLock from './useLockFromService'
import { FAILED_TO_PURCHASE_KEY } from '../errors'

export default function useKeyFromService(window) {
  const { isInIframe } = useConfig()
  const { lockAddress } = lockRoute(window.location.pathname)
  const lock = useLock(lockAddress)
  const { account, localStorageAccount } = useAccount(window)
  const web3 = useWeb3()
  const [error, setError] = useState()
  const [key, setKey] = useState()
  const { purchaseKey, transaction, error: transactionError } = useKeyPurchase(
    window,
    lock
  )
  function updateKey(id, newKey) {
    setKey(newKey)
  }
  useEffect(
    () => {
      if (!account || !lock || !web3) return
      web3.addEventListener('key.updated', updateKey)
      web3.getKeyByLockForOwner(lockAddress, account)
      return () => web3.removeEventListener('key.updated', updateKey)
    },
    [lock, account, web3]
  )

  const purchase = () => {
    if (isInIframe && localStorageAccount) {
      postMessage('redirect')
      return
    }
    if (!lock.asOf) setError(new Error(FAILED_TO_PURCHASE_KEY))
    purchaseKey()
  }
  return { key, purchase, transaction, error: error || transactionError }
}
