import React from 'react'
import * as rtl from 'react-testing-library'

import { ReadOnlyContext } from '../../hooks/components/Web3'
import useAccount from '../../hooks/web3/useAccount'
import usePostmessage from '../../hooks/browser/usePostMessage'
import makeRetrieveKeys from '../../hooks/asyncActions/keys'
import useKeyPurchaseTransaction from '../../hooks/useKeyPurchaseTransaction'
import useKey from '../../hooks/useKey'
import { wrapperMaker } from './helpers'
import { FAILED_TO_PURCHASE_KEY } from '../../errors'

jest.mock('../../hooks/web3/useAccount')
jest.mock('../../hooks/browser/usePostMessage')
jest.mock('../../hooks/asyncActions/keys')
jest.mock('../../hooks/useKeyPurchaseTransaction')

describe('useKey hook', () => {
  let config
  let web3
  let InnerWrapper
  let account
  let localStorageAccount
  let postMessage
  let purchaseKey
  let retrieveKeys
  let lock
  const transaction = 'transaction'
  const fakeWindow = 'window'

  // wrapper to use with rtl's testHook
  // allows us to pass in the mock wallet
  // the InnerWrapper is pulled from the test helpers file
  // and includes passing in mock config and testing for errors
  // thrown in hooks
  function wrapper(props) {
    return (
      <ReadOnlyContext.Provider value={web3}>
        <InnerWrapper {...props} />
      </ReadOnlyContext.Provider>
    )
  }

  beforeEach(() => {
    web3 = 'web3'
    config = {
      isInIframe: true,
    }
    account = 'account'
    localStorageAccount = undefined
    lock = {
      address: 'lockaddress',
      keyPrice: '0.01',
      asOf: 1,
    }
    InnerWrapper = wrapperMaker(config)

    postMessage = jest.fn()
    purchaseKey = jest.fn()
    retrieveKeys = jest.fn()

    makeRetrieveKeys.mockImplementation(() => retrieveKeys)
    useAccount.mockImplementation(() => ({
      account,
      localStorageAccount,
    }))

    usePostmessage.mockImplementation(() => ({
      postMessage,
    }))

    useKeyPurchaseTransaction.mockImplementation(() => ({
      purchaseKey,
      transaction,
    }))
  })
  it('calls makeRetrieveKeys', () => {
    rtl.testHook(() => useKey(fakeWindow, lock), { wrapper })

    expect(makeRetrieveKeys).toHaveBeenCalledWith({
      web3,
      lock,
      account,
      setKey: expect.any(Function),
    })
  })
  it('calls retrieveKeys', () => {
    rtl.testHook(() => useKey(fakeWindow, lock), { wrapper })

    expect(retrieveKeys).toHaveBeenCalled()
  })
  it('ignores retrieveKeys if web3 is not set', () => {
    web3 = undefined
    rtl.testHook(() => useKey(fakeWindow, lock), { wrapper })

    expect(retrieveKeys).not.toHaveBeenCalled()
  })
  it('ignores retrieveKeys if account is not set', () => {
    account = undefined
    rtl.testHook(() => useKey(fakeWindow, lock), { wrapper })

    expect(retrieveKeys).not.toHaveBeenCalled()
  })
  it('ignores retrieveKeys if lock is not set', () => {
    lock = undefined
    rtl.testHook(() => useKey(fakeWindow, lock), { wrapper })

    expect(retrieveKeys).not.toHaveBeenCalled()
  })
  describe('purchase', () => {
    it('redirects if in the iframe and account was pulled from local storage', () => {
      localStorageAccount = account
      const { result } = rtl.testHook(() => useKey(fakeWindow, lock), {
        wrapper,
      })

      rtl.act(() => {
        result.current.purchase()
      })
      expect(postMessage).toHaveBeenCalledWith('redirect')
    })
    it('errors if the lock is not confirmed yet', () => {
      lock.asOf = null
      const { result } = rtl.testHook(() => useKey(fakeWindow, lock), {
        wrapper,
      })
      rtl.act(() => {
        result.current.purchase()
      })

      expect(result.current.error.message).toBe(FAILED_TO_PURCHASE_KEY)
    })
    it('calls purchaseKey', () => {
      const { result } = rtl.testHook(() => useKey(fakeWindow, lock), {
        wrapper,
      })

      rtl.act(() => {
        result.current.purchase()
      })

      expect(purchaseKey).toHaveBeenCalled()
    })
  })
})
