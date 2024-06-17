import {
  ENTRYPOINT_ADDRESS_V07,
  SmartAccountClientConfig,
  isSmartAccountDeployed
} from 'permissionless'
import { SmartAccountLib } from './SmartAccountLib'
import { SmartAccount } from 'permissionless/accounts'
import { EntryPoint } from 'permissionless/types/entrypoint'
import {
  getSafe7579InitData,
  getSafe7579InitialValidators,
  signerToSafe7579SmartAccount
} from '@/utils/safe7579AccountUtils/signerToSafe7579SmartAccount'
import {
  Address,
  Hex,
  concatHex,
  encodeFunctionData,
  encodePacked,
  keccak256,
  zeroAddress
} from 'viem'
import { signMessage } from 'viem/accounts'
import {
  PERMISSION_VALIDATOR_ADDRESS,
  SAFE7579_USER_OPERATION_BUILDER_ADDRESS,
  SECP256K1_SIGNATURE_VALIDATOR_ADDRESS
} from '@/utils/permissionValidatorUtils/constants'
import {
  PermissionContext,
  SingleSignerPermission,
  getPermissionScopeData
} from '@/utils/permissionValidatorUtils'
import { setupSafeAbi } from '@/utils/safe7579AccountUtils/abis/Launchpad'
import { Execution } from '@/utils/safe7579AccountUtils/userop'
import { isModuleInstalledAbi } from '@/utils/safe7579AccountUtils/abis/Account'
import { ethers } from 'ethers'

export class SafeSmartAccountLib extends SmartAccountLib {
  async getClientConfig(): Promise<SmartAccountClientConfig<EntryPoint>> {
    this.type = 'Safe'
    const safeAccount = await signerToSafe7579SmartAccount(this.publicClient, {
      entryPoint: ENTRYPOINT_ADDRESS_V07,
      signer: this.signer
    })
    return {
      name: 'Safe7579SmartAccount',
      account: safeAccount as SmartAccount<EntryPoint>,
      entryPoint: ENTRYPOINT_ADDRESS_V07,
      chain: this.chain,
      bundlerTransport: this.bundlerUrl,
      middleware: {
        gasPrice: async () => (await this.bundlerClient.getUserOperationGasPrice()).fast, // use pimlico bundler to get gas prices
        sponsorUserOperation: this.sponsored ? this.paymasterClient.sponsorUserOperation : undefined
      }
    }
  }

  async sendTransaction({ to, value, data }: Execution) {
    if (!this.client?.account) {
      throw new Error('Client not initialized')
    }
    await this.setupSafe7579({ to, value, data })

    const txResult = await this.client.sendTransaction({
      to,
      value,
      data,
      account: this.client.account,
      chain: this.chain
    })

    return txResult
  }

  async sendBatchTransaction(calls: Execution[]) {
    if (!this.client?.account) {
      throw new Error('Client not initialized')
    }
    await this.setupSafe7579(calls)

    const userOp = await this.client.prepareUserOperationRequest({
      userOperation: {
        callData: await this.client.account.encodeCallData(calls)
      },
      account: this.client.account
    })

    const newSignature = await this.client.account.signUserOperation(userOp)
    userOp.signature = newSignature

    const userOpHash = await this.bundlerClient.sendUserOperation({
      userOperation: userOp
    })
    return userOpHash
  }

  async issuePermissionContext(
    targetAddress: Address,
    approvedPermissions: any
  ): Promise<PermissionContext> {
    if (!this.client?.account) {
      throw new Error('Client not initialized')
    }
    // setUpSafe account
    await this.setupSafe7579({
      data: '0x',
      to: zeroAddress,
      value: BigInt(0)
    })
    // check permissionvalidator module is installed or not
    const isInstalled = await this.isPermissionValidatorModuleInstalled()

    if (!isInstalled) {
      throw new Error(
        'isPermissionValidatorModuleInstalled == false \n Should not have happen, need to debug initCode to check safe setUp process'
      )
    }

    const { permissionsContext, permissions, permittedScopeData, permittedScopeSignature } =
      await this.getAllowedPermissionsAndData(targetAddress)

    return {
      accountType: 'Safe7579',
      accountAddress: this.client.account.address,
      permissionsContext: permissionsContext,
      userOperationBuilder: SAFE7579_USER_OPERATION_BUILDER_ADDRESS,
      //below are temporary additional values
      permissionValidatorAddress: PERMISSION_VALIDATOR_ADDRESS,
      permissions: permissions,
      permittedScopeData: permittedScopeData,
      permittedScopeSignature: permittedScopeSignature
    }
  }

  private async setupSafe7579(calls: Execution | Execution[]) {
    if (!this.client?.account) {
      throw new Error('Client not initialized')
    }
    const accountDeployed = await isSmartAccountDeployed(
      this.publicClient,
      this.client.account.address
    )
    if (!accountDeployed) {
      const initialValidators = getSafe7579InitialValidators()
      const initData = getSafe7579InitData(this.signer.address, initialValidators, calls)
      const setUpSafe7579Calldata = encodeFunctionData({
        abi: setupSafeAbi,
        functionName: 'setupSafe',
        args: [initData]
      })
      const setUpUserOp = await this.client.prepareUserOperationRequest({
        userOperation: {
          callData: setUpSafe7579Calldata
        },
        account: this.client.account
      })
      const newSignature = await this.client.account.signUserOperation(setUpUserOp)

      setUpUserOp.signature = newSignature

      const setUpAndExecuteUserOpHash = await this.bundlerClient.sendUserOperation({
        userOperation: setUpUserOp
      })
      const userOpReceipt = await this.bundlerClient.waitForUserOperationReceipt({
        hash: setUpAndExecuteUserOpHash
      })
      console.log({ setupSafetxHash: userOpReceipt.receipt.transactionHash })
    }
  }

  private async isPermissionValidatorModuleInstalled() {
    if (!this.client?.account) {
      throw new Error('Client not initialized')
    }
    return await this.publicClient.readContract({
      address: this.client.account.address,
      abi: isModuleInstalledAbi,
      functionName: 'isModuleInstalled',
      args: [
        BigInt(1), // ModuleType
        PERMISSION_VALIDATOR_ADDRESS, // Module Address
        '0x' // Additional Context
      ]
    })
  }

  private async getAllowedPermissionsAndData(signer: Address) {
    // if installed then based on the approvedPermissions build the PermissionsContext value
    // permissionsContext = [PERMISSION_VALIDATOR_ADDRESS][ENCODED_PERMISSION_SCOPE & SIGNATURE_DATA]

    // this permission have dummy policy set to zeroAddress for now,
    // bc current version of PermissionValidator_v1 module don't consider checking policy
    const permissions: SingleSignerPermission[] = [
      {
        validUntil: 0,
        validAfter: 0,
        signatureValidationAlgorithm: SECP256K1_SIGNATURE_VALIDATOR_ADDRESS,
        signer: signer,
        policy: zeroAddress,
        policyData: '0x'
      }
    ]
    console.log(`computing permission scope data...`)
    const permittedScopeData = getPermissionScopeData(permissions, this.chain)
    console.log(`user account signing over computed permission scope data and reguested signer...`)
    // the smart account sign over the permittedScope and targetAddress
    const permittedScopeSignature: Hex = await signMessage({
      privateKey: this.getPrivateKey() as `0x${string}`,
      message: { raw: concatHex([keccak256(permittedScopeData), signer]) }
    })

    const _permissionIndex = BigInt(0)

    const encodedData = ethers.utils.defaultAbiCoder.encode(
      ['uint256', 'tuple(uint48,uint48,address,bytes,address,bytes)', 'bytes', 'bytes'],
      [
        _permissionIndex,
        [
          permissions[0].validAfter,
          permissions[0].validUntil,
          permissions[0].signatureValidationAlgorithm,
          permissions[0].signer,
          permissions[0].policy,
          permissions[0].policyData
        ],
        permittedScopeData,
        permittedScopeSignature
      ]
    ) as `0x${string}`
    console.log(`encoding permissionsContext bytes data...`)
    const permissionsContext = concatHex([
      PERMISSION_VALIDATOR_ADDRESS,
      encodePacked(['uint8', 'bytes'], [1, encodedData])
    ])
    return {
      permissionsContext,
      permittedScopeSignature,
      permittedScopeData,
      permissions
    }
  }
}
