import * as rtl from 'react-testing-library'
import React from 'react'

import useKeyPurchaseFromService, {
  handleTransactionUpdates,
} from '../../hooks/useKeyPurchaseFromService'
import { TRANSACTION_TYPES } from '../../constants'
import { wrapperMaker, expectError } from './helpers'
import { WalletServiceContext } from '../../hooks/components/WalletServiceProvider'
import { Web3ServiceContext } from '../../hooks/components/Web3ServiceProvider'
import useAccount from '../../hooks/web3/useAccountFromService'

jest.mock('../../hooks/web3/useAccountFromService')
jest.mock('../../services/web3Service')
jest.mock('../../services/walletService')

describe('useKeyPurchaseTransaction hook', () => {
  describe('handleTransactionUpdates reducer', () => {
    let transaction
    const newAction = {
      type: 'new',
      info: { lock: 'lock', account: 'account' },
    }
    const hashAction = {
      type: 'hash',
      info: { hash: 'hash', to: 'to', abi: 'abi' },
    }
    const submittedAction = {
      type: 'submitted',
    }
    const confirmingAction = {
      type: 'mined',
      info: {
        asOf: 5,
        confirmations: 2,
        requiredConfirmations: 3,
      },
    }
    const minedAction = {
      type: 'mined',
      info: {
        confirmations: 2,
        asOf: 5,
        requiredConfirmations: 2,
      },
    }
    const failedAction = {
      type: 'failed',
    }

    beforeEach(() => {
      transaction = {
        status: 'inactive',
      }
    })

    describe('individual reducers', () => {
      it('new', () => {
        expect(handleTransactionUpdates(transaction, newAction)).toEqual({
          lock: 'lock',
          account: 'account',
          status: 'pending',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          confirmations: 0,
          asOf: Number.MAX_SAFE_INTEGER,
        })
      })
      it('hash', () => {
        expect(handleTransactionUpdates(transaction, hashAction)).toEqual({
          status: 'inactive',
          hash: 'hash',
          to: 'to',
          abi: 'abi',
        })
      })
      it('submitted', () => {
        expect(handleTransactionUpdates(transaction, submittedAction)).toEqual({
          status: 'submitted',
          confirmations: 0,
        })
      })
      it('confirming', () => {
        transaction.asOf = 5
        expect(handleTransactionUpdates(transaction, confirmingAction)).toEqual(
          {
            status: 'confirming',
            asOf: 5,
            confirmations: 2,
          }
        )
      })
      it('mined', () => {
        transaction.asOf = 5
        expect(handleTransactionUpdates(transaction, minedAction)).toEqual({
          status: 'mined',
          asOf: 5,
          confirmations: 2,
        })
      })
      it('failed', () => {
        expect(handleTransactionUpdates(transaction, failedAction)).toEqual({
          status: 'failed',
        })
      })
    })
    it('transaction flow', () => {
      transaction = handleTransactionUpdates(transaction, newAction)
      expect(transaction).toEqual({
        lock: 'lock',
        account: 'account',
        status: 'pending',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
        confirmations: 0,
        asOf: Number.MAX_SAFE_INTEGER,
      })

      transaction = handleTransactionUpdates(transaction, hashAction)
      expect(transaction).toEqual({
        lock: 'lock',
        hash: 'hash',
        to: 'to',
        abi: 'abi',
        account: 'account',
        status: 'pending',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
        confirmations: 0,
        asOf: Number.MAX_SAFE_INTEGER,
      })

      transaction = handleTransactionUpdates(transaction, confirmingAction)
      expect(transaction).toEqual({
        lock: 'lock',
        to: 'to',
        abi: 'abi',
        asOf: 5,
        hash: 'hash',
        account: 'account',
        status: 'confirming',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
        confirmations: 2,
      })

      transaction = handleTransactionUpdates(transaction, minedAction)
      expect(transaction).toEqual({
        lock: 'lock',
        to: 'to',
        abi: 'abi',
        asOf: 5,
        hash: 'hash',
        account: 'account',
        status: 'mined',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
        confirmations: 2,
      })

      transaction = handleTransactionUpdates(transaction, failedAction)
      expect(transaction).toEqual({
        lock: 'lock',
        to: 'to',
        abi: 'abi',
        asOf: 5,
        hash: 'hash',
        account: 'account',
        status: 'failed',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
        confirmations: 2,
      })
    })
  })
  describe('useKeyPurchaseTransaction', () => {
    let config
    let fakeWindow
    let wallet
    let web3
    let InnerWrapper
    const lock = {
      address: 'lockaddress',
      keyPrice: '0.01',
    }

    // wrapper to use with rtl's testHook
    // allows us to pass in the mock wallet
    // the InnerWrapper is pulled from the test helpers file
    // and includes passing in mock config and testing for errors
    // thrown in hooks
    function wrapper(props) {
      return (
        <Web3ServiceContext.Provider value={web3}>
          <WalletServiceContext.Provider value={wallet}>
            <InnerWrapper {...props} />
          </WalletServiceContext.Provider>
        </Web3ServiceContext.Provider>
      )
    }

    beforeEach(() => {
      config = { blockTime: 5, requiredConfirmations: 5 }
      InnerWrapper = wrapperMaker(config)

      useAccount.mockImplementation(() => ({ account: 'account' }))
      wallet = {
        addEventListener: jest.fn(),
        purchaseKey: jest.fn(),
      }
      web3 = 'web3'
      fakeWindow = {
        location: {
          pathname: '',
          hash: '',
        },
      }
    })
    describe('purchaseKey', () => {
      it('does nothing if lock is not set', () => {
        const {
          result: {
            current: { purchaseKey },
          },
        } = rtl.testHook(
          () => useKeyPurchaseFromService(fakeWindow, undefined),
          {
            wrapper,
          }
        )

        rtl.act(() => {
          purchaseKey()
        })

        expect(wallet.purchaseKey).not.toHaveBeenCalled()
      })
      it('does nothing if account is not set', () => {
        useAccount.mockImplementation(() => ({ account: undefined }))

        const {
          result: {
            current: { purchaseKey },
          },
        } = rtl.testHook(() => useKeyPurchaseFromService(fakeWindow, lock), {
          wrapper,
        })

        rtl.act(() => {
          purchaseKey()
        })

        expect(wallet.purchaseKey).not.toHaveBeenCalled()
      })
      it('calls sendNewKeyPurchaseTransaction', () => {
        const {
          result: {
            current: { purchaseKey },
          },
        } = rtl.testHook(() => useKeyPurchaseFromService(fakeWindow, lock), {
          wrapper,
        })

        rtl.act(() => {
          purchaseKey()
        })

        expect(wallet.purchaseKey).toHaveBeenCalledWith(
          lock.address,
          'account',
          lock.keyPrice,
          'account'
        )
      })
    })
    describe('errors', () => {
      it('if an error occurs, it throws', () => {
        expectError(
          () =>
            rtl.act(() => {
              const {
                result: {
                  current: { purchaseKey },
                },
              } = rtl.testHook(
                () => useKeyPurchaseFromService(fakeWindow, lock),
                {
                  wrapper,
                }
              )
              purchaseKey()
              const onError = wallet.addEventListener.mock.calls[0][1]
              onError(new Error('nope'))
            }),
          'nope'
        )
      })
    })
  })
})
