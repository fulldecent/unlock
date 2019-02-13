import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { FullPage, Banner, Headline, Locks } from './lock/OverlayStyles'
import useConfig from '../utils/useConfig'
import useNetwork from '../useNetwork'
import {
  WrongNetwork as WrongNetworkComponent,
  DefaultError,
} from '../../components/creator/FatalError'
import { ETHEREUM_NETWORKS_NAMES } from '../../constants'
import {
  NON_DEPLOYED_CONTRACT,
  FATAL_WRONG_NETWORK,
  FAILED_TO_PURCHASE_KEY,
} from '../../errors'
import useListenForPostmessage from '../browser/useListenForPostMessage'
import { LockedFlag } from '../../components/lock/UnlockFlag'

export function WrongNetwork() {
  const { requiredNetworkId } = useConfig()
  const currentNetworkId = useNetwork({ noPoll: true })
  const networkName =
    (ETHEREUM_NETWORKS_NAMES[currentNetworkId] &&
      ETHEREUM_NETWORKS_NAMES[currentNetworkId][0]) ||
    'Unknown Network ' + currentNetworkId
  return (
    <WrongNetworkComponent
      currentNetwork={networkName}
      requiredNetworkId={requiredNetworkId}
    />
  )
}

const errorComponents = {
  [FATAL_WRONG_NETWORK]: <WrongNetwork />,
  [NON_DEPLOYED_CONTRACT]: (
    <DefaultError title="Contract Not Deployed">
      <p>Internal error: the Lock contract is not deployed on this network</p>
    </DefaultError>
  ),
  [FAILED_TO_PURCHASE_KEY]: (
    <DefaultError title="Lock is not ready">
      <p>
        Internal error: the content you are purchasing is not quite ready.
        Please refresh the page to try again.
      </p>
    </DefaultError>
  ),
}

export default function ErrorHandler({ window, children }) {
  const data = useListenForPostmessage(window)
  const scrollPosition = data ? data.scrollPosition : 0

  return <ErrorCatcher scrollPosition={scrollPosition}>{children}</ErrorCatcher>
}

ErrorHandler.propTypes = {
  children: PropTypes.node.isRequired,
  window: PropTypes.shape({ location: PropTypes.object }).isRequired,
}

export class ErrorCatcher extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    scrollPosition: PropTypes.number.isRequired,
  }

  state = {
    error: null,
  }

  static getDerivedStateFromError(error) {
    return { error: error.message }
  }

  render() {
    const { children, scrollPosition } = this.props
    const { error } = this.state

    if (error) {
      return (
        <FullPage>
          <Banner scrollPosition={scrollPosition}>
            <Headline>
              You have reached your limit of free articles. Please purchase
              access
            </Headline>
            <Locks>
              {errorComponents[error] || <DefaultError title="Error" />}
            </Locks>
            <LockedFlag />
          </Banner>
        </FullPage>
      )
    }
    return <>{children}</>
  }
}
