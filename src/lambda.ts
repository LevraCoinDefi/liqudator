import dotenv from 'dotenv';
import { liquidate, balance } from './index';

dotenv.config();

export async function handler(event: { action: string }) {
  console.log('Lambda handler started with event:', event);
  if (!event || !event.action) {
    throw new Error('Missing action in event');
  }

  switch (event.action) {
    case 'liquidate':
      console.log('Starting liquidate function');
      await liquidate();
      console.log('Finished liquidate function');
      break;
    case 'balance':
      console.log('Starting balance function');
      await balance();
      console.log('Finished balance function');
      break;
    default:
      throw new Error(`Unknown action: ${event.action}`);
  }
}

// CLI entrypoint for local testing
if (require.main === module) {
  const action = process.argv[2];
  if (!action) {
    console.error('No action provided. Usage: ts-node src/lambda.ts <liquidate|balance>');
    process.exit(1);
  }
  handler({ action })
    .then(() => {
      console.log('Lambda function completed successfully');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Lambda function error:', err);
      process.exit(1);
    });
}
