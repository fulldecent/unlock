import { TRANSACTION_TYPES } from '../../constants'

/**
 * The method sets the transaction's type, based on the data being sent.
 * @param {*} contract
 * @param {*} data
 */
export function getTransactionType(contract, data) {
  const method = contract.abi.find(binaryInterface => {
    return data.startsWith(binaryInterface.signature)
  })

  if (contract.contractName === 'Unlock' && method.name === 'createLock') {
    return TRANSACTION_TYPES.LOCK_CREATION
  }

  if (contract.contractName === 'PublicLock' && method.name === 'purchaseFor') {
    return TRANSACTION_TYPES.KEY_PURCHASE
  }

  if (contract.contractName === 'PublicLock' && method.name === 'withdraw') {
    return TRANSACTION_TYPES.WITHDRAWAL
  }

  if (
    contract.contractName === 'PublicLock' &&
    method.name === 'updateKeyPrice'
  ) {
    return TRANSACTION_TYPES.UPDATE_KEY_PRICE
  }

  // Unknown transaction
  return null
}

/**
 * Given a transaction receipt and the abi for a contract, parses and trigger the
 * corresponding events
 * @param {*} contract
 * @param {*} transactionReceipt
 */
export const parseTransactionLogsFromReceipt = ({
  web3,
  transactionHash,
  contract,
  transactionReceipt,
  eventsHandlers,
}) => {
  // Home made event handling since this is not handled correctly by web3 :/
  const abiEvents = contract.abi.filter(item => {
    return item.type === 'event'
  })

  transactionReceipt.logs.forEach(log => {
    // For each log, let's find which event it is
    abiEvents.forEach(event => {
      const encodedEvent = web3.eth.abi.encodeEventSignature(event)
      let topics = log.topics

      if (encodedEvent !== topics[0]) return

      const decoded = web3.eth.abi.decodeLog(
        event.inputs,
        log.data,
        log.topics.slice(1)
      )

      const args = event.inputs.reduce((args, input) => {
        args[input.name] = decoded[input.name]
        return args
      }, {})

      const handler = eventsHandlers[name]
      if (handler) {
        return handler(
          transactionHash,
          log.address,
          transactionReceipt.blockNumber,
          args
        )
      }
    })
  })
}
