import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Overlay from './lock/Overlay'
import ShowWhenLocked from '../../components/lock/ShowWhenLocked'
import ShowWhenUnlocked from '../../components/lock/ShowWhenUnlocked'
import { UnlockedFlag } from '../../components/lock/UnlockFlag'

import useKey from '../useKey'
import useLock from '../useLock'
import usePostmessage from '../browser/usePostMessage'
import useListenForPostmessage from '../browser/useListenForPostMessage'
import { getRouteFromWindow } from '../../utils/routes'
import useConfig from '../utils/useConfig'
import useNetwork from '../web3/useNetwork'
import { FATAL_WRONG_NETWORK } from '../../errors'

function isLocked(key, transaction, requiredConfirmations) {
  if (transaction.status === 'inactive') {
    return !key
  }
  if (transaction.status !== 'mined') {
    return true
  }
  if (transaction.confirmations < requiredConfirmations) {
    return true
  }
  if (!key) {
    return true
  }
  return false
}

export default function Paywall({ window }) {
  const { lockAddress, redirect, account } = getRouteFromWindow(window)
  const lock = useLock(lockAddress)
  const { isInIframe, requiredConfirmations, requiredNetworkId } = useConfig()
  const { postMessage } = usePostmessage(window)
  const { key, purchase, transaction, error } = useKey(window, lock)
  const currentNetworkId = useNetwork()
  const [locked, setLocked] = useState(
    isLocked(key, transaction, requiredConfirmations)
  )
  useEffect(() => {
    if (!locked) return
    if (transaction.status === 'inactive') {
      if (key) {
        setLocked(false)
      }
    }
  })
  const data = useListenForPostmessage(window)
  const scrollPosition = data ? data.scrollPosition : 0

  const redirectToContent = () => {
    window.location.href = redirect + '#' + account
  }

  if (!locked && !isInIframe && redirect) {
    redirectToContent()
  }

  if (requiredNetworkId !== currentNetworkId) {
    throw new Error(FATAL_WRONG_NETWORK)
  }
  if (error) throw error

  const showModal = () => {
    setLocked(true)
    postMessage('locked')
  }

  const hideModal = () => {
    if (redirect) {
      redirectToContent()
      return
    }
    setLocked(false)
    postMessage('unlocked')
  }

  return (
    <>
      <ShowWhenLocked locked={locked}>
        <Overlay
          lock={lock}
          lockKey={key}
          scrollPosition={scrollPosition}
          transaction={transaction}
          purchaseKey={purchase}
          showModal={showModal}
          hideModal={hideModal}
        />
      </ShowWhenLocked>
      <ShowWhenUnlocked locked={locked}>
        <UnlockedFlag />
      </ShowWhenUnlocked>
    </>
  )
}

Paywall.propTypes = {
  window: PropTypes.shape({
    location: PropTypes.object,
  }).isRequired,
}
