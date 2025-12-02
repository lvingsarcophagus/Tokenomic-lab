/**
 * React hook for handling x402 payment protocol
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { createRoot } from 'react-dom/client';
import { PaymentConfirmationModal } from '@/components/payment-confirmation-modal';
import { TransactionLoadingModal } from '@/components/transaction-loading-modal';

interface PaymentInfo {
  price: string;
  asset: string;
  chain: string;
  address: string;
  nonce: string;
}

interface X402Response {
  error: string;
  message: string;
  payment: PaymentInfo;
}

export function useX402Payment() {
  const [isPaying, setIsPaying] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);

  /**
   * Make API request with automatic x402 payment handling
   */
  const fetchWithPayment = useCallback(
    async <T,>(url: string, options?: RequestInit): Promise<T> => {
      try {
        // Initial request
        const response = await fetch(url, options);

        // Check for 402 Payment Required
        if (response.status === 402) {
          const data: X402Response = await response.json();
          setPaymentInfo(data.payment);

          // Prompt user to pay
          const paymentResult = await promptPayment(data.payment);
          if (!paymentResult.confirmed) {
            throw new Error('Payment cancelled by user');
          }

          // Execute payment with selected asset and show loading modal
          setIsPaying(true);
          const txHash = await executePaymentWithLoading(data.payment, paymentResult.selectedAsset);
          setIsPaying(false);

          // Retry request with payment proof
          const retryHeaders = new Headers(options?.headers);
          retryHeaders.set('X-Payment-TxHash', txHash);
          retryHeaders.set('X-Payment-Nonce', data.payment.nonce);

          console.log('[x402] Retrying request with payment proof:', {
            txHash,
            nonce: data.payment.nonce,
            url
          });

          const retryResponse = await fetch(url, {
            ...options,
            headers: retryHeaders,
          });

          console.log('[x402] Retry response status:', retryResponse.status);

          if (!retryResponse.ok) {
            const errorText = await retryResponse.text();
            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch {
              errorData = { error: errorText };
            }
            
            const errorMsg = errorData.error || errorData.message || 'Request failed after payment';
            console.error('[x402] Payment verification failed:', {
              status: retryResponse.status,
              statusText: retryResponse.statusText,
              errorData,
              errorText,
              txHash,
              nonce: data.payment.nonce
            });
            
            // Show user-friendly error
            toast.error(`Payment verification failed: ${errorMsg}`);
            throw new Error(errorMsg);
          }

          return retryResponse.json();
        }

        if (!response.ok) {
          throw new Error(`Request failed: ${response.statusText}`);
        }

        return response.json();
      } catch (error) {
        console.error('x402 fetch error:', error);
        throw error;
      }
    },
    []
  );

  return {
    fetchWithPayment,
    isPaying,
    paymentInfo,
  };
}

/**
 * Check wallet balances for both SOL and USDC
 */
async function checkBalances(payment: PaymentInfo): Promise<{ solBalance: number; usdcBalance: number }> {
  if (payment.chain !== 'solana') {
    return { solBalance: 0, usdcBalance: 0 };
  }

  const { solana } = window as any;
  if (!solana?.isPhantom) {
    return { solBalance: 0, usdcBalance: 0 };
  }

  // Check if wallet is connected and has publicKey
  if (!solana.publicKey) {
    console.log('[Balance Check] Wallet not connected, attempting to connect...');
    try {
      const response = await solana.connect({ onlyIfTrusted: false });
      console.log('[Balance Check] Wallet connected:', response);
    } catch (error: any) {
      console.error('[Balance Check] Failed to connect wallet:', error);
      // If user rejected, return zeros instead of throwing
      if (error.code === 4001 || error.message?.includes('User rejected')) {
        console.log('[Balance Check] User rejected connection');
        return { solBalance: 0, usdcBalance: 0 };
      }
      return { solBalance: 0, usdcBalance: 0 };
    }
  }

  // Verify publicKey exists after connection attempt
  if (!solana.publicKey) {
    console.error('[Balance Check] No publicKey available after connection');
    return { solBalance: 0, usdcBalance: 0 };
  }

  try {
    const { Connection, PublicKey, LAMPORTS_PER_SOL } = await import('@solana/web3.js');
    
    // Check testnet mode from backend settings (public endpoint)
    let isTestnet = false;
    try {
      const settingsResponse = await fetch('/api/payment-config');
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        isTestnet = settingsData.useTestnet || false;
        console.log('[Balance Check] Backend testnet mode:', isTestnet);
      }
    } catch (error) {
      console.log('[Balance Check] Could not fetch settings, defaulting to mainnet');
    }
    
    const rpcUrl = isTestnet
      ? 'https://api.devnet.solana.com'
      : 'https://mainnet.helius-rpc.com/?api-key=33b8214f-6f46-4927-bd29-e54801f23c20';
    
    console.log('[Balance Check] Using', isTestnet ? 'DEVNET' : 'MAINNET', 'RPC');
    console.log('[Balance Check] Wallet address:', solana.publicKey.toString());
    const connection = new Connection(rpcUrl);

    // Check SOL balance
    let solBalance = 0;
    try {
      const balance = await connection.getBalance(solana.publicKey);
      solBalance = balance / LAMPORTS_PER_SOL;
      console.log('[Balance Check] SOL balance:', solBalance);
    } catch (error) {
      console.error('SOL balance check error:', error);
    }

    // Check USDC balance (only on mainnet, devnet doesn't have real USDC)
    let usdcBalance = 0;
    if (!isTestnet) {
      try {
        const { getAssociatedTokenAddress, getAccount } = await import('@solana/spl-token');
        const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
        const tokenAccount = await getAssociatedTokenAddress(USDC_MINT, solana.publicKey);
        const accountInfo = await getAccount(connection, tokenAccount);
        usdcBalance = Number(accountInfo.amount) / 1e6;
        console.log('[Balance Check] USDC balance:', usdcBalance);
      } catch (error) {
        console.log('[Balance Check] No USDC account found (this is normal on devnet)');
      }
    } else {
      console.log('[Balance Check] Skipping USDC check on devnet');
    }

    return { solBalance, usdcBalance };
  } catch (error) {
    console.error('Balance check error:', error);
    return { solBalance: 0, usdcBalance: 0 };
  }
}

/**
 * Prompt user to confirm payment with custom modal
 */
async function promptPayment(payment: PaymentInfo): Promise<{ confirmed: boolean; selectedAsset?: 'SOL' | 'USDC' }> {
  // Check both balances
  const { solBalance, usdcBalance } = await checkBalances(payment);
  
  return new Promise((resolve) => {
    // Create modal container
    const modalContainer = document.createElement('div');
    document.body.appendChild(modalContainer);
    const root = createRoot(modalContainer);

    const handleConfirm = (selectedAsset: 'SOL' | 'USDC') => {
      cleanup();
      resolve({ confirmed: true, selectedAsset });
    };

    const handleCancel = () => {
      cleanup();
      resolve({ confirmed: false });
    };

    const cleanup = () => {
      root.unmount();
      document.body.removeChild(modalContainer);
    };

    // Render modal
    root.render(
      <PaymentConfirmationModal
        isOpen={true}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        price={payment.price}
        asset={payment.asset}
        chain={payment.chain}
        solBalance={solBalance}
        usdcBalance={usdcBalance}
      />
    );
  });
}

/**
 * Execute payment with loading modal
 */
async function executePaymentWithLoading(payment: PaymentInfo, selectedAsset?: 'SOL' | 'USDC'): Promise<string> {
  // Create loading modal container
  const modalContainer = document.createElement('div');
  document.body.appendChild(modalContainer);
  const root = createRoot(modalContainer);

  let currentStatus: 'connecting' | 'signing' | 'confirming' | 'success' = 'connecting';

  const updateStatus = (status: typeof currentStatus) => {
    currentStatus = status;
    root.render(
      <TransactionLoadingModal
        isOpen={true}
        asset={selectedAsset || payment.asset}
        amount={payment.price}
        status={status}
      />
    );
  };

  try {
    // Show connecting status
    updateStatus('connecting');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Execute payment
    const paymentWithAsset = { ...payment, asset: selectedAsset || payment.asset };
    
    // Update to signing status
    updateStatus('signing');
    
    const txHash = await executePayment(paymentWithAsset, updateStatus);
    
    // Show success briefly
    updateStatus('success');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return txHash;
  } finally {
    // Cleanup
    root.unmount();
    document.body.removeChild(modalContainer);
  }
}

/**
 * Execute payment via connected wallet
 */
async function executePayment(payment: PaymentInfo, updateStatus?: (status: 'connecting' | 'signing' | 'confirming' | 'success') => void): Promise<string> {
  if (payment.chain === 'solana') {
    return executeSolanaPayment(payment, updateStatus);
  } else {
    return executeEvmPayment(payment);
  }
}

/**
 * Execute Solana payment via Phantom
 */
async function executeSolanaPayment(payment: PaymentInfo, updateStatus?: (status: 'connecting' | 'signing' | 'confirming' | 'success') => void): Promise<string> {
  const { solana } = window as any;

  if (!solana?.isPhantom) {
    throw new Error('Phantom wallet not found. Please install Phantom wallet extension.');
  }

  // Validate recipient address
  if (!payment.address || payment.address === '') {
    throw new Error('Payment recipient address not configured. Please contact support.');
  }

  try {
    // Connect if not already connected
    if (!solana.isConnected) {
      await solana.connect();
    }

    const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } =
      await import('@solana/web3.js');

    // Check testnet mode from backend settings
    let isTestnet = false;
    try {
      const settingsResponse = await fetch('/api/payment-config');
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        isTestnet = settingsData.useTestnet || false;
      }
    } catch (error) {
      console.log('[x402] Could not fetch settings, defaulting to mainnet');
    }
    
    const rpcUrl = isTestnet
      ? 'https://api.devnet.solana.com'
      : 'https://mainnet.helius-rpc.com/?api-key=33b8214f-6f46-4927-bd29-e54801f23c20';
    
    const connection = new Connection(rpcUrl);
    console.log(`[x402] Using ${isTestnet ? 'DEVNET' : 'MAINNET'} for payment`);
    console.log(`[x402] Payment asset: ${payment.asset}`);
    
    // Validate and create recipient public key
    let recipient: any;
    try {
      recipient = new PublicKey(payment.address);
    } catch (err) {
      throw new Error(`Invalid recipient address: ${payment.address}`);
    }
    
    const amount = parseFloat(payment.price);

    // For USDC (mainnet), use token transfer
    if (payment.asset === 'USDC') {
      const { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID, getAccount } =
        await import('@solana/spl-token');
      
      // USDC mint address on Solana mainnet
      const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
      
      // Get token accounts
      const fromTokenAccount = await getAssociatedTokenAddress(
        USDC_MINT,
        solana.publicKey
      );
      
      // Check if user has USDC token account and balance
      try {
        const accountInfo = await getAccount(connection, fromTokenAccount);
        const balance = Number(accountInfo.amount) / 1e6; // USDC has 6 decimals
        
        if (balance < amount) {
          throw new Error(`Insufficient USDC balance. You have ${balance.toFixed(2)} USDC but need ${amount} USDC. Please add USDC to your wallet first.`);
        }
      } catch (err: any) {
        if (err.message?.includes('Insufficient USDC')) {
          throw err;
        }
        throw new Error(`USDC token account not found. Please add USDC to your wallet first. You can get USDC from exchanges like Coinbase or Binance.`);
      }
      
      const toTokenAccount = await getAssociatedTokenAddress(
        USDC_MINT,
        recipient
      );
      
      // Create token transfer instruction (USDC has 6 decimals)
      const transaction = new Transaction().add(
        createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          solana.publicKey,
          amount * 1e6, // USDC has 6 decimals
          [],
          TOKEN_PROGRAM_ID
        )
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = solana.publicKey;

      // Sign and send
      updateStatus?.('signing');
      const signed = await solana.signTransaction(transaction);
      
      updateStatus?.('confirming');
      const signature = await connection.sendRawTransaction(signed.serialize());

      // Wait for confirmation with proper method
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight
      });

      if (confirmation.value.err) {
        throw new Error('Transaction failed to confirm');
      }

      toast.success('USDC payment confirmed!');
      return signature;
    }

    // For SOL (testnet), use native transfer
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: solana.publicKey,
        toPubkey: recipient,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = solana.publicKey;

    // Sign and send
    updateStatus?.('signing');
    const signed = await solana.signTransaction(transaction);
    
    updateStatus?.('confirming');
    const signature = await connection.sendRawTransaction(signed.serialize());

    // Wait for confirmation with proper method
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    });

    if (confirmation.value.err) {
      throw new Error('Transaction failed to confirm');
    }

    toast.success('Payment confirmed!');
    return signature;
  } catch (error) {
    console.error('Solana payment error:', error);
    toast.error('Payment failed');
    throw error;
  }
}

/**
 * Execute EVM payment via MetaMask/injected provider
 */
async function executeEvmPayment(payment: PaymentInfo): Promise<string> {
  const { ethereum } = window as any;

  if (!ethereum) {
    throw new Error('Web3 wallet not found');
  }

  try {
    // Request account access
    await ethereum.request({ method: 'eth_requestAccounts' });

    const amount = parseFloat(payment.price);
    const amountWei = `0x${(amount * 1e18).toString(16)}`;

    // Send transaction
    const txHash = await ethereum.request({
      method: 'eth_sendTransaction',
      params: [
        {
          to: payment.address,
          from: ethereum.selectedAddress,
          value: amountWei,
        },
      ],
    });

    toast.success('Payment confirmed!');
    return txHash;
  } catch (error) {
    console.error('EVM payment error:', error);
    toast.error('Payment failed');
    throw error;
  }
}
