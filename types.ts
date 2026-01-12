export enum Currency {
  USD = 'USD',
  JPY = 'JPY'
}

export interface GoldRates {
  buy: number;
  sell: number;
}

export interface ExchangeRates {
  usd: number;
  jpy: number;
  gold: GoldRates;
  lastUpdated: string;
}

export interface ConversionResult {
  numeric: number;
  text: string;
}