import { useState, useEffect, useReducer } from 'react'

import useLock from './useLockFromService'
import { lockRoute } from '../utils/routes'
import useAccount from './web3/useAccountFromService'
import useWeb3 from './web3/useWeb3Service'
import useWallet from './web3/useWalletService'
import { TRANSACTION_TYPES } from '../constants'
import useConfig from './utils/useConfig'

export function handleTransactionUpdates(transaction, update) {
  const { type, info } = update
  // triggered on key purchase, prior to sending the transaction, after retrieving the hash
  if (type === 'new') {
    const { lock, account } = info
    return {
      ...transaction,
      lock,
      account,
      status: 'pending',
      type: TRANSACTION_TYPES.KEY_PURCHASE,
      confirmations: 0,
      asOf: Number.MAX_SAFE_INTEGER, // Assign the largest block number for sorting purposes
    }
  }
  // triggered when we get the transaction hash before the transaction is sent to the miners
  if (type === 'hash') {
    const { hash, abi, to } = info
    return { ...transaction, hash, abi, to }
  }
  // triggered when the transaction has been sent and we are waiting for miners to put it into blocks
  if (type === 'submitted') {
    return { ...transaction, status: 'submitted', confirmations: 0 }
  }
  // transaction has been mined, is on the chain, and a new block has been mined
  if (type === 'mined') {
    const { confirmations, requiredConfirmations, asOf } = info
    return {
      ...transaction,
      status: confirmations < requiredConfirmations ? 'confirming' : 'mined',
      confirmations,
      asOf,
    }
  }
  // transaction receipt showed the transaction was not propagated for some error
  if (type === 'failed') {
    return { ...transaction, status: 'failed' }
  }
  return transaction
}

export default function useKeyPurchaseFromService(window) {
  const { lockAddress } = lockRoute(window.location.path)
  const lock = useLock(lockAddress)
  const { account } = useAccount(window)
  const [error, setError] = useState()
  const [defaults, setDefaults] = useState()
  const [transaction, updateTransaction] = useReducer(
    handleTransactionUpdates,
    { status: 'inactive', confirmations: 0 }
  )
  const web3 = useWeb3()
  const { wallet } = useWallet()
  const { requiredConfirmations } = useConfig()
  useEffect(
    () => {
      if (
        !web3 ||
        !['pending'].includes(transaction.status) ||
        !transaction.hash
      ) {
        return
      }
      web3.getTransaction(transaction.hash, defaults)
      web3.addEventListener('transaction.updated', listenForTransactionUpdates)
      return () =>
        web3.removeEventListener(
          'transaction.updated',
          listenForTransactionUpdates
        )
    },
    [transaction.hash]
  )
  function listenForTransactionUpdates(hash, update) {
    if (hash !== transaction.hash) return
    if (['failed', 'submitted'].includes(update.status)) {
      updateTransaction({ type: update.status })
      return
    }
    if (update.status === 'mined') {
      const { confirmations, blockNumber: asOf } = update
      updateTransaction({
        type: 'mined',
        info: { confirmations, requiredConfirmations, asOf },
      })
    }
  }

  function unlistenToWalletEvents() {
    if (!wallet) return
    wallet.removeEventListener('error', listenForWalletEvents)
    wallet.removeEventListener('transaction.pending', listenForWalletEvents)
    wallet.removeEventListener('transaction.new', listenForWalletEvents)
  }
  function listenForWalletEvents(type, ...args) {
    if (!wallet || error) return
    if (type === 'error') {
      const [err] = args
      unlistenToWalletEvents()
      setError(err)
      updateTransaction({
        type: 'failed',
      })
      return
    }
    if (type === 'transaction.pending') {
      updateTransaction({ type: 'new', info: { lock, account } })
      return
    }
    if (type === 'transaction.new') {
      const [hash, from, to, input] = args
      setDefaults({ from, to, input })
      updateTransaction({
        type: 'hash',
        info: { hash, to, abi: input },
      })
      // now we can move over to the web3Service for the rest
      unlistenToWalletEvents()
      return
    }
  }
  const purchaseKey = () => {
    if (!account || !lock || !wallet || error) return
    wallet.addEventListener('error', listenForWalletEvents)
    wallet.addEventListener('transaction.pending', listenForWalletEvents)
    wallet.addEventListener('transaction.new', listenForWalletEvents)
    wallet.purchaseKey(lockAddress, account, lock.keyPrice, account)
  }
  return { purchaseKey, transaction, error, updateTransaction }
}
