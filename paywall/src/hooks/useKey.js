import { useState, useEffect } from 'react'

import useAccount from './web3/useAccount'
import useWeb3 from './web3/useWeb3'
import { FAILED_TO_PURCHASE_KEY } from '../errors'
import useKeyPurchaseTransaction from './useKeyPurchaseTransaction'
import useConfig from './utils/useConfig'
import usePostmessage from './browser/usePostMessage'
import makeRetrieveKeys from './asyncActions/keys'

export default function useKey(window, lock) {
  const { isInIframe } = useConfig()
  const { postMessage } = usePostmessage(window)
  const { account, localStorageAccount } = useAccount(window)
  const web3 = useWeb3()
  const [error, setError] = useState()
  const [key, setKey] = useState()
  const {
    purchaseKey,
    transaction,
    error: transactionError,
  } = useKeyPurchaseTransaction(window, lock)

  const retrieveKeys = makeRetrieveKeys({
    web3,
    lock,
    account,
    setKey,
  })
  useEffect(
    () => {
      if (!account || !lock || !web3) return
      retrieveKeys()
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
