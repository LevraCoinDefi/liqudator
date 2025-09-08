import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { networks, assets } from './config';

dotenv.config();

const VESSEL_MANAGER_ABI = [
  {
    inputs: [
      { name: '_asset', type: 'address' },
      { name: '_n', type: 'uint256' }
    ],
    name: 'liquidateVessels',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

const DEBT_TOKEN_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

export async function getProvider(network: keyof typeof networks): Promise<ethers.JsonRpcProvider> {
  const config = networks[network];
  return new ethers.JsonRpcProvider(config.rpc);
}

export async function getSigner(network: keyof typeof networks): Promise<ethers.Wallet> {
  const provider = await getProvider(network);
  const privateKey = process.env.LIQ_BOT_PRIVATE_KEY?.replace('0x', '');
  if (!privateKey) {
    throw new Error('LIQ_BOT_PRIVATE_KEY not provided in .env');
  }
  return new ethers.Wallet(privateKey, provider);
}

export function getVesselManagerContract(
  signerOrProvider: ethers.Signer | ethers.Provider,
  network: keyof typeof networks
): ethers.Contract {
  const config = networks[network];
  return new ethers.Contract(config.VesselManagerOperations, VESSEL_MANAGER_ABI, signerOrProvider);
}

export function getDebtTokenContract(
  signerOrProvider: ethers.Signer | ethers.Provider,
  network: keyof typeof networks
): ethers.Contract {
  const config = networks[network];
  return new ethers.Contract(config.DebtToken, DEBT_TOKEN_ABI, signerOrProvider);
}

export async function staticCallLiquidate(
  network: keyof typeof networks,
  assetName: string,
  n: number
): Promise<void> {
  const signer = await getSigner(network);
  const contract = getVesselManagerContract(signer, network);
  const assetAddress = assets[network][assetName as keyof typeof assets[typeof network]];
  await contract.liquidateVessels.staticCall(assetAddress, n);
}

export async function executeLiquidate(
  network: keyof typeof networks,
  assetName: string,
  n: number
): Promise<ethers.TransactionResponse> {
  const signer = await getSigner(network);
  const contract = getVesselManagerContract(signer, network);
  const assetAddress = assets[network][assetName as keyof typeof assets[typeof network]];
  const tx = await contract.liquidateVessels(assetAddress, n);
  return tx;
}

export async function getBalances(
  network: keyof typeof networks,
  botAddress: string
): Promise<{ nativeBalance: bigint; debtBalance: bigint }> {
  const provider = await getProvider(network);
  const debtContract = getDebtTokenContract(provider, network);
  const [nativeBalance, debtBalance] = await Promise.all([
    provider.getBalance(botAddress),
    debtContract.balanceOf(botAddress)
  ]);
  return { nativeBalance, debtBalance };
}
