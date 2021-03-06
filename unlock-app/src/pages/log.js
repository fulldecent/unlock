import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import UnlockPropTypes from '../propTypes'
import Layout from '../components/interface/Layout'
import CreatorAccount from '../components/creator/CreatorAccount'
import BrowserOnly from '../components/helpers/BrowserOnly'
import GlobalErrorConsumer from '../components/interface/GlobalErrorConsumer'
import GlobalErrorProvider from '../utils/GlobalErrorProvider'
import { pageTitle } from '../constants'
import withConfig from '../utils/withConfig'

export const humanize = type => {
  if (!type) return ''
  let parts = type.split('_')
  return parts.map(part => part[0] + part.slice(1).toLowerCase()).join(' ')
}

export const Log = ({ account, network, transactionFeed }) => {
  return (
    <GlobalErrorProvider>
      <GlobalErrorConsumer>
        <Layout title="Creator Log">
          <Head>
            <title>{pageTitle('Log')}</title>
          </Head>
          <BrowserOnly>
            <CreatorAccount network={network} account={account} />
            <Content>
              <LogHeader>Block Number</LogHeader>
              <LogHeader>Lock Name/Address</LogHeader>
              <LogHeader>Type</LogHeader>
              {transactionFeed.map(tx => (
                <React.Fragment key={tx.hash}>
                  <LogElement>{tx.blockNumber}</LogElement>
                  <Address href={tx.href} target="_blank">
                    {tx.lock}
                  </Address>
                  <Type type={tx.type}>{tx.readableName}</Type>
                </React.Fragment>
              ))}
            </Content>
          </BrowserOnly>
        </Layout>
      </GlobalErrorConsumer>
    </GlobalErrorProvider>
  )
}

Log.displayName = 'Log'

Log.propTypes = {
  account: UnlockPropTypes.account.isRequired,
  network: UnlockPropTypes.network.isRequired,
  transactionFeed: PropTypes.arrayOf(UnlockPropTypes.transaction).isRequired,
}

const Content = styled.div`
  display: grid;
  grid-template-columns: min-content min-content min-content;
  grid-auto-rows: 20px;
  grid-column-gap: 20px;
`

const LogHeader = styled.div`
  font-size: 8px;
  font-weight: normal;
  text-transform: uppercase;
  color: var(--grey);
  white-space: nowrap;
`

const LogElement = styled.div`
  font-size: 11px;
  font-weight: 300;
  font-family: 'IBM Plex Mono', Courier, monospace;
`

// TODO: determine which transaction types get which color
const typeColors = {
  LOCK_CREATION: 'green',
}

const Type = styled(LogElement)`
  color: ${props => 'var(--' + typeColors[props.type] || 'darkgrey'});
  white-space: nowrap;
`

const Address = styled.a`
  font-size: 11px;
  font-weight: 300;
  font-family: 'IBM Plex Mono', Courier, monospace;
`

export const mapStateToProps = (
  { account, network, transactions },
  { config: { chainExplorerUrlBuilders } }
) => {
  const transactionFeed = Object.values(transactions).sort(
    (a, b) => b.blockNumber - a.blockNumber
  )

  transactionFeed.forEach((tx, i) => {
    transactionFeed[i].href =
      chainExplorerUrlBuilders.etherScan(tx.lock) || undefined
    transactionFeed[i].readableName = humanize(tx.type)
  })

  return {
    account,
    network,
    transactionFeed,
  }
}

export default withConfig(connect(mapStateToProps)(Log))
