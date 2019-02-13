import React from 'react'
import Paywall from '../src/hooks/components/Paywall'
import BrowserOnly from '../src/components/helpers/BrowserOnly'
import { ConfigContext } from '../src/hooks/utils/useConfig'
import configure from '../src/config'
import ErrorHandler from '../src/hooks/components/ErrorHandler'
import Web3 from '../src/hooks/components/Web3'
import Wallet from '../src/hooks/components/Wallet'

const config = configure()

export default function NextPaywall() {
  const { isServer } = config
  const { Provider: ConfigProvider } = ConfigContext
  const win = isServer ? { location: { pathname: '/paywall' } } : window
  return (
    <BrowserOnly>
      <ConfigProvider value={config}>
        <ErrorHandler window={win}>
          <Web3>
            <Wallet>
              <Paywall window={win} />
            </Wallet>
          </Web3>
        </ErrorHandler>
      </ConfigProvider>
    </BrowserOnly>
  )
}
