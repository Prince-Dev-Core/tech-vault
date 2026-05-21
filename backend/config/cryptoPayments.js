// Cryptocurrency Payment Configuration
// This file handles cryptocurrency payments for the TechVault e-commerce platform

const bitcoin = require('bitcoinjs-lib');
const { ethers } = require('ethers');
const axios = require('axios');
require('dotenv').config();

// Supported cryptocurrencies
const SUPPORTED_CRYPTOCURRENCIES = {
  BTC: { name: 'Bitcoin', symbol: 'BTC', decimals: 8 },
  ETH: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
  LTC: { name: 'Litecoin', symbol: 'LTC', decimals: 8 },
  BCH: { name: 'Bitcoin Cash', symbol: 'BCH', decimals: 8 },
  USDC: { name: 'USD Coin', symbol: 'USDC', decimals: 6 },
  USDT: { name: 'Tether', symbol: 'USDT', decimals: 6 }
};

// Wallet addresses (in production, these should come from environment variables or a secure vault)
const WALLET_ADDRESSES = {
  BTC: process.env.EXODUS_BTC_ADDRESS || 'bc1qcx5vruks2d5mn86cpwuw96xt9k4q56q6s0xpax',
  ETH: process.env.EXODUS_ETH_ADDRESS || '0x7BAd4Ea684C70240f2d78491F013cFf40E650d81',
  SOL: process.env.EXODUS_SOL_ADDRESS || '4Kxsezt1rZMfwN4wVDuknz7nsJEAzhnjjyZ2onVNPWcT'
};

// Cryptocurrency price feeds (using CoinGecko API for simplicity)
class PriceFeed {
  constructor() {
    this.prices = new Map();
    this.lastUpdated = 0;
    this.cacheDuration = 30000; // 30 seconds cache
  }

  async getPrice(symbol) {
    const now = Date.now();
    
    // Return cached price if still valid
    if (this.prices.has(symbol) && (now - this.lastUpdated) < this.cacheDuration) {
      return this.prices.get(symbol);
    }

    try {
      // Fetch prices from CoinGecko
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: this.getCoinGeckoIds([symbol]).join(','),
          vs_currencies: 'usd'
        }
      });

      const data = response.data;
      const updatedPrices = new Map();
      
      // Update prices for all requested symbols
      for (const [coinGeckoId, symbol] of Object.entries(this.getSymbolMap())) {
        if (data[coinGeckoId] && data[coinGeckoId].usd) {
          updatedPrices.set(symbol, data[coinGeckoId].usd);
        }
      }

      this.prices = updatedPrices;
      this.lastUpdated = now;
      
      return this.prices.get(symbol) || null;
    } catch (error) {
      console.error('Error fetching cryptocurrency prices:', error);
      // Return cached price if available, otherwise null
      return this.prices.get(symbol) || null;
    }
  }

  getCoinGeckoIds(symbols) {
    const mapping = {
      BTC: 'bitcoin',
      ETH: 'ethereum',
      LTC: 'litecoin',
      BCH: 'bitcoin-cash',
      USDC: 'usd-coin',
      USDT: 'tether'
    };
    
    return symbols.map(symbol => mapping[symbol]).filter(Boolean);
  }

  getSymbolMap() {
    return {
      bitcoin: 'BTC',
      ethereum: 'ETH',
      litecoin: 'LTC',
      'bitcoin-cash': 'BCH',
      'usd-coin': 'USDC',
      tether: 'USDT'
    };
  }
}

const priceFeed = new PriceFeed();

// Calculate cryptocurrency amount from USD amount
async function calculateCryptoAmount(usdAmount, currency) {
  try {
    const priceInUsd = await priceFeed.getPrice(currency);
    
    if (!priceInUsd || priceInUsd <= 0) {
      throw new Error(`Unable to get price for ${currency}`);
    }
    
    const cryptoAmount = usdAmount / priceInUsd;
    const currencyInfo = SUPPORTED_CRYPTOCURRENCIES[currency];
    
    if (!currencyInfo) {
      throw new Error(`Unsupported cryptocurrency: ${currency}`);
    }
    
    // Return amount with appropriate precision
    return Number(cryptoAmount.toFixed(currencyInfo.decimals));
  } catch (error) {
    console.error('Error calculating crypto amount:', error);
    throw error;
  }
}

// Generate payment instructions for a cryptocurrency
function generatePaymentInstructions(currency, amount, walletAddress) {
  const currencyInfo = SUPPORTED_CRYPTOCURRENCIES[currency];
  
  if (!currencyInfo) {
    throw new Error(`Unsupported cryptocurrency: ${currency}`);
  }
  
  return {
    currency: currencyInfo.name,
    symbol: currencyInfo.symbol,
    amount: amount,
    walletAddress: walletAddress,
    // In a real implementation, you would also generate QR codes here
    instructions: `Send exactly ${amount} ${currencyInfo.symbol} to the wallet address above to complete your payment.`
  };
}

// Validate a cryptocurrency transaction (simplified - in production you'd check the blockchain)
async function validateTransaction(currency, amount, address, txHash) {
  // This is a simplified validation - in production you would:
  // 1. Check that the transaction exists on the blockchain
  // 2. Verify it sends the correct amount to the correct address
  // 3. Confirm it has sufficient confirmations
  // 4. Check that it hasn't been spent already
  
  // For now, we'll just return true if we have a txHash
  return !!txHash;
}

module.exports = {
  SUPPORTED_CRYPTOCURRENCIES,
  WALLET_ADDRESSES,
  PriceFeed,
  priceFeed,
  calculateCryptoAmount,
  generatePaymentInstructions,
  validateTransaction
};