import {
  ErrorType,
  MetamaskException,
  UnspecifiedErrorCode
} from '@injectivelabs/exceptions'
import { EthereumChainId } from '@injectivelabs/ts-types'
import detectEthereumProvider from '@metamask/detect-provider'
import { walletStrategy } from './wallet-strategy'
import { ETHEREUM_CHAIN_ID } from './../utils/constant'

export const isMetamaskInstalled = async (): Promise<boolean> => {
  const provider = await detectEthereumProvider()

  return !!provider
}

export const validateMetamask = async (address: string) => {
  const chainId = ETHEREUM_CHAIN_ID
  const addresses = await walletStrategy.getAddresses()
  const metamaskIsLocked = addresses.length === 0

  if (metamaskIsLocked) {
    throw new MetamaskException(
      new Error(
        'Your Metamask is currently locked. Please unlock your Metamask.'
      ),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }

  const [metamaskActiveAddress] = addresses
  const metamaskActiveAddressDoesntMatchTheActiveAddress =
    address && metamaskActiveAddress.toLowerCase() !== address.toLowerCase()

  if (metamaskActiveAddressDoesntMatchTheActiveAddress) {
    throw new MetamaskException(
      new Error(
        'You are connected to the wrong address. Please logout and connect to Metamask again'
      ),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }

  const metamaskChainId = parseInt(
    await walletStrategy.getEthereumChainId(),
    16
  )
  const metamaskChainIdDoesntMatchTheActiveChainId = chainId !== metamaskChainId

  if (metamaskChainIdDoesntMatchTheActiveChainId) {
    if (chainId === EthereumChainId.Kovan) {
      throw new MetamaskException(
        new Error('Please change your Metamask network to Kovan Test Network'),
        {
          code: UnspecifiedErrorCode,
          type: ErrorType.WalletError
        }
      )
    }
    if (chainId === EthereumChainId.Goerli) {
      throw new MetamaskException(
        new Error('Please change your Metamask network to Goerli Test Network'),
        {
          code: UnspecifiedErrorCode,
          type: ErrorType.WalletError
        }
      )
    }

    throw new MetamaskException(
      new Error('Please change your Metamask network to Ethereum Mainnet'),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }
}
