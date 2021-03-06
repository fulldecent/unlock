const shouldFail = require('../helpers/shouldFail')
const Unlock = artifacts.require('../Unlock.sol')
const Web3Abi = require('web3-eth-abi')
const abi = new Web3Abi.AbiCoder()

let unlock

contract('Unlock', accounts => {
  before(async () => {
    unlock = await Unlock.deployed()
  })

  describe('noFallback', () => {
    it('cannot call the fallback function directly', async () => {
      await shouldFail(unlock.sendTransaction(), 'NO_FALLBACK')
    })

    it('does not accept ETH directly', async () => {
      await shouldFail(unlock.send(1))
    })

    it('can call a function by name', async () => {
      await unlock.sendTransaction({ data: abi.encodeFunctionSignature('totalDiscountGranted()') })
    })

    it('cannot call a function which does not exist', async () => {
      await shouldFail(unlock.sendTransaction({ data: abi.encodeFunctionSignature('dne()') }), 'NO_FALLBACK')
    })
  })
})
