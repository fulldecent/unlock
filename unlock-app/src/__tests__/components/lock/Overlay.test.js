import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'

import { SHOW_MODAL, HIDE_MODAL } from '../../../actions/modal'

import Overlay, {
  mapDispatchToProps,
  mapStateToProps,
  displayError,
} from '../../../components/lock/Overlay'
import { GlobalErrorContext } from '../../../utils/GlobalErrorProvider'
import { FATAL_NO_USER_ACCOUNT, FATAL_MISSING_PROVIDER } from '../../../errors'
import createUnlockStore from '../../../createUnlockStore'
import { ConfigContext } from '../../../utils/withConfig'

const ErrorProvider = GlobalErrorContext.Provider
const ConfigProvider = ConfigContext.Provider

describe('Overlay', () => {
  describe('mapDispatchToProps', () => {
    it('should yield a prop function which dispatches hideModal with the right value', () => {
      expect.assertions(2)
      const locks = [{ address: '0x123' }, { address: '0x456' }]
      const dispatch = jest.fn()
      const props = mapDispatchToProps(dispatch, { locks })
      props.hideModal()
      expect(dispatch).toHaveBeenCalledWith({
        modal: '0x123-0x456',
        type: HIDE_MODAL,
      })
      props.showModal()
      expect(dispatch).toHaveBeenCalledWith({
        modal: '0x123-0x456',
        type: SHOW_MODAL,
      })
    })
  })
  describe('mapStateToProps', () => {
    it('should set openInNewWindow based on the value of account', () => {
      expect.assertions(3)

      const state1 = {
        account: null,
      }
      const state2 = {
        account: {
          address: 'account',
        },
      }
      const state3 = {
        account: {
          address: 'account',
          fromLocalStorage: true,
        },
      }

      expect(mapStateToProps(state1)).toEqual({
        openInNewWindow: true,
      })

      expect(mapStateToProps(state2)).toEqual({
        openInNewWindow: undefined,
      })

      expect(mapStateToProps(state3)).toEqual({
        openInNewWindow: true,
      })
    })
  })
  describe('displayError', () => {
    it('should display children if there is no error', () => {
      expect.assertions(1)
      const wrapper = rtl.render(
        displayError(true /* isMainWindow */)(false, {}, <div>children</div>)
      )

      expect(wrapper.getByText('children')).not.toBeNull()
    })

    it('should display error if present', () => {
      expect.assertions(1)
      const wrapper = rtl.render(
        displayError(true /* isMainWindow */)(
          FATAL_MISSING_PROVIDER,
          {},
          <div>children</div>
        )
      )

      expect(wrapper.getByText('Wallet missing')).not.toBeNull()
    })

    it('should display children if account is missing and in the iframe', () => {
      expect.assertions(1)
      const wrapper = rtl.render(
        displayError(false /* iframe */)(
          FATAL_NO_USER_ACCOUNT,
          {},
          <div>children</div>
        )
      )

      expect(wrapper.queryByText('error')).toBeNull()
    })

    it('should display error if account is missing and in the main window', () => {
      expect.assertions(1)
      const wrapper = rtl.render(
        displayError(true /* isMainWindow */)(
          FATAL_NO_USER_ACCOUNT,
          {},
          <div>children</div>
        )
      )

      expect(wrapper.getByText('Need account')).not.toBeNull()
    })
  })

  describe('error replacement', () => {
    const lock = {
      name: 'Monthly',
      address: '0xdeadbeef',
      keyPrice: '100000',
      expirationDuration: 123456789,
    }
    let store
    beforeEach(() => (store = createUnlockStore()))
    it('displays lock when there is no error', () => {
      expect.assertions(3)
      const wrapper = rtl.render(
        <Provider store={store}>
          <ConfigProvider
            value={{ requiredConfirmations: 12, isInIframe: true }}
          >
            <ErrorProvider value={{ error: false, errorMetadata: {} }}>
              <Overlay
                scrollPosition={0}
                hideModal={() => {}}
                showModal={() => {}}
                locks={[lock]}
              />
            </ErrorProvider>
          </ConfigProvider>
        </Provider>
      )

      expect(wrapper.queryByText('100000.00 Eth')).not.toBeNull()
      expect(wrapper.queryByText('Powered by Unlock')).not.toBeNull()
      expect(
        wrapper.queryByText(
          'You have reached your limit of free articles. Please purchase access'
        )
      ).not.toBeNull()
    })

    it('displays error, headline, and flag when there is an error', () => {
      expect.assertions(3)
      const wrapper = rtl.render(
        <Provider store={store}>
          <ConfigProvider
            value={{ requiredConfirmations: 12, isInIframe: true }}
          >
            <ErrorProvider
              value={{ error: FATAL_MISSING_PROVIDER, errorMetadata: {} }}
            >
              <Overlay
                scrollPosition={0}
                hideModal={() => {}}
                showModal={() => {}}
                locks={[lock]}
              />
            </ErrorProvider>
          </ConfigProvider>
        </Provider>
      )

      expect(wrapper.queryByText('100000.00 Eth')).toBeNull()
      expect(wrapper.queryByText('Powered by Unlock')).not.toBeNull()
      expect(
        wrapper.queryByText(
          'You have reached your limit of free articles. Please purchase access'
        )
      ).not.toBeNull()
    })

    it('displays lock when the error is missing account', () => {
      expect.assertions(3)
      const wrapper = rtl.render(
        <Provider store={store}>
          <ErrorProvider
            value={{ error: FATAL_NO_USER_ACCOUNT, errorMetadata: {} }}
          >
            <ConfigProvider
              value={{ requiredConfirmations: 12, isInIframe: true }}
            >
              <Overlay
                scrollPosition={0}
                hideModal={() => {}}
                showModal={() => {}}
                locks={[lock]}
                openInNewWindow={false}
              />
            </ConfigProvider>
          </ErrorProvider>
        </Provider>
      )

      expect(wrapper.queryByText('100000.00 Eth')).not.toBeNull()
      expect(wrapper.queryByText('Powered by Unlock')).not.toBeNull()
      expect(
        wrapper.queryByText(
          'You have reached your limit of free articles. Please purchase access'
        )
      ).not.toBeNull()
    })
  })
})
