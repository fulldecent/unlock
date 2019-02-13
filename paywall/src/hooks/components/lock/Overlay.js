import React from 'react'
import PropTypes from 'prop-types'
import Lock from './Lock'
import UnlockPropTypes from '../../../propTypes'
import { LockedFlag } from '../../../components/lock/UnlockFlag'
import { FullPage, Banner, Headline, Locks } from './OverlayStyles'

const Overlay = ({
  hideModal,
  showModal,
  scrollPosition,
  lock,
  transaction,
  purchaseKey,
  lockKey,
}) => {
  return (
    <FullPage>
      <Banner scrollPosition={scrollPosition}>
        <Headline>
          You have reached your limit of free articles. Please purchase access
        </Headline>
        <Locks>
          <Lock
            lock={lock}
            lockKey={lockKey}
            hideModal={hideModal}
            showModal={showModal}
            purchaseKey={purchaseKey}
            transaction={transaction}
          />
        </Locks>
        <LockedFlag />
      </Banner>
    </FullPage>
  )
}

Overlay.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
  lockKey: UnlockPropTypes.key,
  hideModal: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
  scrollPosition: PropTypes.number.isRequired,
  purchaseKey: PropTypes.func.isRequired,
  transaction: PropTypes.shape({
    status: PropTypes.string,
    confirmations: PropTypes.number,
  }).isRequired,
}

Overlay.defaultProps = {
  lockKey: null,
}

export default Overlay
