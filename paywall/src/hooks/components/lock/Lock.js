import PropTypes from 'prop-types'
import React from 'react'
import UnlockPropTypes from '../../../propTypes'

import PendingKeyLock from '../../../components/lock/PendingKeyLock'
import ConfirmingKeyLock from '../../../components/lock/ConfirmingKeyLock'
import ConfirmedKeyLock from '../../../components/lock/ConfirmedKeyLock'
import NoKeyLock from '../../../components/lock/NoKeyLock'
import { UNLIMITED_KEYS_COUNT } from '../../../constants'

export default function Lock({
  account,
  lock,
  transaction,
  purchaseKey,
  hideModal,
}) {
  if (transaction.status === 'pending') {
    return <PendingKeyLock lock={lock} />
  } else if (transaction.status === 'confirming') {
    return <ConfirmingKeyLock lock={lock} transaction={transaction} />
  } else if (transaction.status === 'mined') {
    return <ConfirmedKeyLock lock={lock} hideModal={hideModal} />
  } else {
    const soldOut =
      lock.outstandingKeys >= lock.maxNumberOfKeys &&
      lock.maxNumberOfKeys !== UNLIMITED_KEYS_COUNT
    const tooExpensive =
      account && parseFloat(account.balance) <= parseFloat(lock.keyPrice)

    // When the lock is not disabled for other reasons (pending key on
    // other lock...), we need to ensure that the lock is disabled
    // when the lock is sold out or too expensive for the current account
    const disabled = soldOut || tooExpensive || !lock.asOf

    return (
      <NoKeyLock
        lock={lock}
        disabled={disabled}
        purchaseKey={purchaseKey}
        soldOut={soldOut}
        tooExpensive={tooExpensive}
      />
    )
  }
}

Lock.propTypes = {
  lockKey: UnlockPropTypes.key,
  lock: UnlockPropTypes.lock.isRequired,
  transaction: UnlockPropTypes.transaction.isRequired,
  purchaseKey: PropTypes.func.isRequired,
  hideModal: PropTypes.func.isRequired,
}

Lock.defaultProps = {
  lockKey: null,
}
