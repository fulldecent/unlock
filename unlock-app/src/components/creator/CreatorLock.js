import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import UnlockPropTypes from '../../propTypes'
import LockIconBar from './lock/LockIconBar'
import Icon from '../lock/Icon'
import EmbedCodeSnippet from './lock/EmbedCodeSnippet'
import KeyList from './lock/KeyList'
import Duration from '../helpers/Duration'
import Balance from '../helpers/Balance'
import CreatorLockForm from './CreatorLockForm'
import { NoPhone, Phone } from '../../theme/media'

import {
  LockPanel,
  LockAddress,
  LockDivider,
  LockDuration,
  LockKeys,
  LockName,
  LockRow,
  DoubleHeightCell,
  BalanceContainer,
} from './LockStyles'
import { updateKeyPrice } from '../../actions/lock'

import { INFINITY } from '../../constants'

const LockKeysNumbers = ({ lock }) => (
  <LockKeys>
    {lock.outstandingKeys !== null &&
    lock.maxNumberOfKeys !== null &&
    typeof lock.outstandingKeys !== 'undefined' &&
    typeof lock.maxNumberOfKeys !== 'undefined'
      ? `${lock.outstandingKeys}/${
          lock.unlimitedKeys ? INFINITY : lock.maxNumberOfKeys
        }`
      : ' - '}
  </LockKeys>
)

LockKeysNumbers.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
}

export class CreatorLock extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      showEmbedCode: false,
      showKeys: false,
      editing: false,
    }
    this.toggleEmbedCode = this.toggleEmbedCode.bind(this)
    this.toggleKeys = this.toggleKeys.bind(this)
  }

  updateLock(lock) {
    const { updateKeyPrice } = this.props
    updateKeyPrice(lock.address, lock.keyPrice)
  }

  toggleEmbedCode() {
    this.setState(previousState => ({
      showEmbedCode: !previousState.showEmbedCode,
    }))
  }

  toggleKeys() {
    this.setState(previousState => ({
      showKeys: !previousState.showKeys,
    }))
  }

  render() {
    // TODO add all-time balance to lock

    const { lock } = this.props
    const { showEmbedCode, showKeys, editing } = this.state

    if (editing) {
      return (
        <CreatorLockForm
          {...lock}
          hideAction={() => this.setState({ editing: false })}
          createLock={lock => this.updateLock(lock)}
        />
      )
    }

    // Some sanitization of strings to display
    let name = lock.name || 'New Lock'
    return (
      <LockRow onClick={this.toggleKeys}>
        <DoubleHeightCell>
          <Icon lock={lock} />
        </DoubleHeightCell>
        <LockName>
          {name}
          <LockAddress>{!lock.pending && lock.address}</LockAddress>
        </LockName>
        <LockDuration>
          <Duration seconds={lock.expirationDuration} />
        </LockDuration>
        <LockKeysNumbers lock={lock} />
        <Balance amount={lock.keyPrice} />
        <BalanceContainer>
          <NoPhone>
            <Balance amount={lock.balance} />
          </NoPhone>
          <Phone>
            <Balance amount={lock.balance} convertCurrency={false} />
          </Phone>
        </BalanceContainer>
        <LockIconBar
          lock={lock}
          toggleCode={this.toggleEmbedCode}
          edit={() =>
            this.setState({
              editing: true,
              showEmbedCode: false,
              showKeys: false,
            })
          }
        />
        {showEmbedCode && (
          <LockPanel>
            <LockDivider />
            <EmbedCodeSnippet lock={lock} />
          </LockPanel>
        )}
        {!showEmbedCode && showKeys && (
          <LockPanel onClick={e => e.stopPropagation()}>
            <LockDivider />
            <KeyList lock={lock} />
          </LockPanel>
        )}
      </LockRow>
    )
  }
}

CreatorLock.propTypes = {
  updateKeyPrice: PropTypes.func.isRequired,
  lock: UnlockPropTypes.lock.isRequired,
}

const mapDispatchToProps = { updateKeyPrice }

export default connect(
  undefined,
  mapDispatchToProps
)(CreatorLock)
