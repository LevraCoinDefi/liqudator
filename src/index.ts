import dotenv from 'dotenv';
import { MAX_VESSELS_TO_CHECK, MAX_VESSELS_TO_LIQUIDATE, assets, networks } from './config';
import { sendMessage } from './telegram';
import {
  getProvider,
  getSigner,
  getDebtTokenContract,
  staticCallLiquidate,
  executeLiquidate,
} from './contracts';
import { ethers } from 'ethers';

dotenv.config();

const WARNING_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

let lastWarningTimestamp = 0;

export async function checkNetwork(network: keyof typeof networks) {
  console.log(`\nStarting check cycle for network: ${String(network)}`);
  const config = networks[network];
  const provider = await getProvider(network);
  const signer = await getSigner(network);
  const botAddress = await signer.getAddress();

  try {
    const nativeBalance = await provider.getBalance(botAddress);
    console.log(`Native balance for ${String(network)}: ${ethers.formatEther(nativeBalance)} ${config.networkToken}`);

    if (nativeBalance < BigInt(config.tokenMinimum)) {
      const now = Date.now();
      if (now - lastWarningTimestamp > WARNING_INTERVAL_MS) {
        await sendMessage(`⚠️ Warning: Low native balance on ${String(network)} for bot address ${botAddress}: ${ethers.formatEther(nativeBalance)} ${config.networkToken}`);
        lastWarningTimestamp = now;
      }
    }
  } catch (err: any) {
    await sendMessage(`⚠️ Error checking native balance for network ${String(network)}: ${err.message || err}`);
    console.error(`Error checking native balance for network ${String(network)}:`, err);
  }
}

export async function liquidate() {
  for (const network of Object.keys(networks) as (keyof typeof networks)[]) {
    console.log(`\nStarting liquidation cycle for network: ${String(network)}`);
    const provider = await getProvider(network);
    const signer = await getSigner(network);
    const botAddress = await signer.getAddress();

    for (const [assetName, assetAddress] of Object.entries(assets[network])) {
      console.log(`Checking asset ${assetName} (${assetAddress}) on ${String(network)}`);

      try {
        await staticCallLiquidate(network, assetName, MAX_VESSELS_TO_CHECK);
        console.log(`Static call succeeded for asset ${assetName} on ${String(network)}`);
      } catch (e: any) {
        console.log(`Static call reverted for asset ${assetName} on ${String(network)}, no liquidation needed.`);
        continue;
      }

      try {
        const tx = await executeLiquidate(network, assetName, MAX_VESSELS_TO_LIQUIDATE);
        await sendMessage(`🚀 Liquidation transaction sent for asset ${assetName} on ${String(network)}. Tx hash: ${tx.hash}`);
        console.log(`Transaction sent: ${tx.hash}`);

        const receipt = await tx.wait();
        if (receipt && receipt.status === 1) {
          await sendMessage(`✅ Liquidation succeeded for asset ${assetName} on ${String(network)}. Tx hash: ${tx.hash}`);
          console.log(`Liquidation succeeded for asset ${assetName} on ${String(network)}`);
        } else {
          await sendMessage(`❌ Liquidation failed for asset ${assetName} on ${String(network)}. Tx hash: ${tx.hash}`);
          console.log(`Liquidation failed for asset ${assetName} on ${String(network)}`);
        }
      } catch (error: any) {
        await sendMessage(`⚠️ Error during liquidation for asset ${assetName} on ${String(network)}: ${error.message || error}`);
        console.error(`Error during liquidation for asset ${assetName} on ${String(network)}:`, error);
      } finally {
        try {
          const debtContract = getDebtTokenContract(provider, network);
          const debtBalance = await debtContract.balanceOf(botAddress);
          const nativeBal = await provider.getBalance(botAddress);
          await sendMessage(`💰 Balances after liquidation for asset ${assetName} on ${String(network)}: DebtToken balance: ${ethers.formatEther(debtBalance)}, Native balance: ${ethers.formatEther(nativeBal)}`);
          console.log(`Balances after liquidation for asset ${assetName} on ${String(network)}: DebtToken balance: ${ethers.formatEther(debtBalance)}, Native balance: ${ethers.formatEther(nativeBal)}`);
        } catch (balanceError: any) {
          console.error(`Error fetching balances after liquidation for asset ${assetName} on ${String(network)}:`, balanceError);
        }
      }
    }
  }
}

export async function balance() {
  for (const network of Object.keys(networks) as (keyof typeof networks)[]) {
    console.log(`\nChecking balances for network: ${String(network)}`);
    const provider = await getProvider(network);
    const signer = await getSigner(network);
    const botAddress = await signer.getAddress();

    try {
      const debtContract = getDebtTokenContract(provider, network);
      const debtBalance = await debtContract.balanceOf(botAddress);
      const nativeBal = await provider.getBalance(botAddress);
      await sendMessage(`💰 Balances for network ${String(network)}: DebtToken balance: ${ethers.formatEther(debtBalance)}, Native balance: ${ethers.formatEther(nativeBal)}`);
      console.log(`Balances for network ${String(network)}: DebtToken balance: ${ethers.formatEther(debtBalance)}, Native balance: ${ethers.formatEther(nativeBal)}`);
    } catch (err: any) {
      await sendMessage(`⚠️ Error checking balances for network ${String(network)}: ${err.message || err}`);
      console.error(`Error checking balances for network ${String(network)}:`, err);
    }
  }
}

async function main() {
  await sendMessage('Liquidation bot started');
  console.log('Liquidation bot started');

  process.on('uncaughtException', async (err) => {
    console.error('Uncaught Exception:', err);
    await sendMessage(`Liquidation bot crashed with error: ${err.message || err}`);
    process.exit(1);
  });

  process.on('unhandledRejection', async (reason) => {
    console.error('Unhandled Rejection:', reason);
    await sendMessage(`Liquidation bot unhandled rejection: ${reason}`);
  });

  process.on('SIGINT', async () => {
    console.log('Liquidation bot shutting down (SIGINT)');
    await sendMessage('Liquidation bot shutting down (SIGINT)');
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('Liquidation bot shutting down (SIGTERM)');
    await sendMessage('Liquidation bot shutting down (SIGTERM)');
    process.exit(0);
  });

  const CHECK_INTERVAL_MINUTES = Number(process.env.CHECK_INTERVAL_MINUTES) || 1;

  setInterval(async () => {
    for (const network of Object.keys(networks) as (keyof typeof networks)[]) {
      await checkNetwork(network);
    }
  }, CHECK_INTERVAL_MINUTES * 60 * 1000);

  // Run immediately on start
  for (const network of Object.keys(networks) as (keyof typeof networks)[]) {
    await checkNetwork(network);
  }
}

if (require.main === module) {
  main().catch(async (err) => {
    console.error('Fatal error in main:', err);
    await sendMessage(`Liquidation bot fatal error: ${err.message || err}`);
    process.exit(1);
  });
}
