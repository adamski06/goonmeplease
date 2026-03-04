export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  /** Approximate rate: 1 USD = X of this currency. Used as fallback. */
  approxRate: number;
  /** Whether symbol goes before the number (true) or after (false) */
  symbolBefore: boolean;
}

/**
 * Comprehensive world currency list sorted alphabetically by code.
 * Rates are approximate USD equivalents for placeholder calculations.
 */
export const CURRENCIES: CurrencyInfo[] = [
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', approxRate: 3.67, symbolBefore: false },
  { code: 'AFN', symbol: '؋', name: 'Afghan Afghani', approxRate: 70, symbolBefore: true },
  { code: 'ALL', symbol: 'L', name: 'Albanian Lek', approxRate: 95, symbolBefore: false },
  { code: 'AMD', symbol: '֏', name: 'Armenian Dram', approxRate: 390, symbolBefore: false },
  { code: 'ANG', symbol: 'ƒ', name: 'Netherlands Antillean Guilder', approxRate: 1.79, symbolBefore: true },
  { code: 'AOA', symbol: 'Kz', name: 'Angolan Kwanza', approxRate: 830, symbolBefore: false },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso', approxRate: 870, symbolBefore: true },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', approxRate: 1.55, symbolBefore: true },
  { code: 'AWG', symbol: 'ƒ', name: 'Aruban Florin', approxRate: 1.79, symbolBefore: true },
  { code: 'AZN', symbol: '₼', name: 'Azerbaijani Manat', approxRate: 1.70, symbolBefore: true },
  { code: 'BAM', symbol: 'KM', name: 'Bosnia-Herzegovina Mark', approxRate: 1.80, symbolBefore: false },
  { code: 'BBD', symbol: 'Bds$', name: 'Barbadian Dollar', approxRate: 2, symbolBefore: true },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', approxRate: 110, symbolBefore: true },
  { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev', approxRate: 1.80, symbolBefore: false },
  { code: 'BHD', symbol: '.د.ب', name: 'Bahraini Dinar', approxRate: 0.376, symbolBefore: false },
  { code: 'BIF', symbol: 'FBu', name: 'Burundian Franc', approxRate: 2870, symbolBefore: false },
  { code: 'BMD', symbol: '$', name: 'Bermudan Dollar', approxRate: 1, symbolBefore: true },
  { code: 'BND', symbol: 'B$', name: 'Brunei Dollar', approxRate: 1.34, symbolBefore: true },
  { code: 'BOB', symbol: 'Bs', name: 'Bolivian Boliviano', approxRate: 6.91, symbolBefore: true },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', approxRate: 5.0, symbolBefore: true },
  { code: 'BSD', symbol: '$', name: 'Bahamian Dollar', approxRate: 1, symbolBefore: true },
  { code: 'BTN', symbol: 'Nu', name: 'Bhutanese Ngultrum', approxRate: 83, symbolBefore: false },
  { code: 'BWP', symbol: 'P', name: 'Botswanan Pula', approxRate: 13.5, symbolBefore: true },
  { code: 'BYN', symbol: 'Br', name: 'Belarusian Ruble', approxRate: 3.27, symbolBefore: false },
  { code: 'BZD', symbol: 'BZ$', name: 'Belize Dollar', approxRate: 2, symbolBefore: true },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', approxRate: 1.36, symbolBefore: true },
  { code: 'CDF', symbol: 'FC', name: 'Congolese Franc', approxRate: 2750, symbolBefore: false },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', approxRate: 0.88, symbolBefore: true },
  { code: 'CLP', symbol: '$', name: 'Chilean Peso', approxRate: 950, symbolBefore: true },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', approxRate: 7.25, symbolBefore: true },
  { code: 'COP', symbol: '$', name: 'Colombian Peso', approxRate: 3950, symbolBefore: true },
  { code: 'CRC', symbol: '₡', name: 'Costa Rican Colón', approxRate: 520, symbolBefore: true },
  { code: 'CUP', symbol: '$', name: 'Cuban Peso', approxRate: 24, symbolBefore: true },
  { code: 'CVE', symbol: '$', name: 'Cape Verdean Escudo', approxRate: 101, symbolBefore: false },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', approxRate: 23, symbolBefore: false },
  { code: 'DJF', symbol: 'Fdj', name: 'Djiboutian Franc', approxRate: 177.7, symbolBefore: false },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', approxRate: 6.85, symbolBefore: false },
  { code: 'DOP', symbol: 'RD$', name: 'Dominican Peso', approxRate: 58, symbolBefore: true },
  { code: 'DZD', symbol: 'د.ج', name: 'Algerian Dinar', approxRate: 135, symbolBefore: false },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', approxRate: 31, symbolBefore: true },
  { code: 'ERN', symbol: 'Nfk', name: 'Eritrean Nakfa', approxRate: 15, symbolBefore: false },
  { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr', approxRate: 56, symbolBefore: false },
  { code: 'EUR', symbol: '€', name: 'Euro', approxRate: 0.92, symbolBefore: true },
  { code: 'FJD', symbol: 'FJ$', name: 'Fijian Dollar', approxRate: 2.25, symbolBefore: true },
  { code: 'FKP', symbol: '£', name: 'Falkland Islands Pound', approxRate: 0.79, symbolBefore: true },
  { code: 'GBP', symbol: '£', name: 'British Pound', approxRate: 0.79, symbolBefore: true },
  { code: 'GEL', symbol: '₾', name: 'Georgian Lari', approxRate: 2.70, symbolBefore: false },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', approxRate: 12.5, symbolBefore: true },
  { code: 'GIP', symbol: '£', name: 'Gibraltar Pound', approxRate: 0.79, symbolBefore: true },
  { code: 'GMD', symbol: 'D', name: 'Gambian Dalasi', approxRate: 67, symbolBefore: false },
  { code: 'GNF', symbol: 'FG', name: 'Guinean Franc', approxRate: 8600, symbolBefore: false },
  { code: 'GTQ', symbol: 'Q', name: 'Guatemalan Quetzal', approxRate: 7.80, symbolBefore: true },
  { code: 'GYD', symbol: 'G$', name: 'Guyanaese Dollar', approxRate: 209, symbolBefore: true },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', approxRate: 7.82, symbolBefore: true },
  { code: 'HNL', symbol: 'L', name: 'Honduran Lempira', approxRate: 24.7, symbolBefore: true },
  { code: 'HRK', symbol: 'kn', name: 'Croatian Kuna', approxRate: 6.95, symbolBefore: false },
  { code: 'HTG', symbol: 'G', name: 'Haitian Gourde', approxRate: 132, symbolBefore: false },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', approxRate: 360, symbolBefore: false },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', approxRate: 15700, symbolBefore: true },
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel', approxRate: 3.70, symbolBefore: true },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', approxRate: 83, symbolBefore: true },
  { code: 'IQD', symbol: 'ع.د', name: 'Iraqi Dinar', approxRate: 1310, symbolBefore: false },
  { code: 'IRR', symbol: '﷼', name: 'Iranian Rial', approxRate: 42000, symbolBefore: false },
  { code: 'ISK', symbol: 'kr', name: 'Icelandic Króna', approxRate: 137, symbolBefore: false },
  { code: 'JMD', symbol: 'J$', name: 'Jamaican Dollar', approxRate: 155, symbolBefore: true },
  { code: 'JOD', symbol: 'د.ا', name: 'Jordanian Dinar', approxRate: 0.709, symbolBefore: false },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', approxRate: 150, symbolBefore: true },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', approxRate: 153, symbolBefore: true },
  { code: 'KGS', symbol: 'сом', name: 'Kyrgystani Som', approxRate: 89, symbolBefore: false },
  { code: 'KHR', symbol: '៛', name: 'Cambodian Riel', approxRate: 4100, symbolBefore: false },
  { code: 'KMF', symbol: 'CF', name: 'Comorian Franc', approxRate: 452, symbolBefore: false },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', approxRate: 1330, symbolBefore: true },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar', approxRate: 0.307, symbolBefore: false },
  { code: 'KYD', symbol: 'CI$', name: 'Cayman Islands Dollar', approxRate: 0.83, symbolBefore: true },
  { code: 'KZT', symbol: '₸', name: 'Kazakhstani Tenge', approxRate: 460, symbolBefore: true },
  { code: 'LAK', symbol: '₭', name: 'Laotian Kip', approxRate: 20800, symbolBefore: true },
  { code: 'LBP', symbol: 'ل.ل', name: 'Lebanese Pound', approxRate: 89500, symbolBefore: false },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee', approxRate: 310, symbolBefore: true },
  { code: 'LRD', symbol: 'L$', name: 'Liberian Dollar', approxRate: 192, symbolBefore: true },
  { code: 'LSL', symbol: 'L', name: 'Lesotho Loti', approxRate: 18.5, symbolBefore: false },
  { code: 'LYD', symbol: 'ل.د', name: 'Libyan Dinar', approxRate: 4.85, symbolBefore: false },
  { code: 'MAD', symbol: 'د.م.', name: 'Moroccan Dirham', approxRate: 10, symbolBefore: false },
  { code: 'MDL', symbol: 'L', name: 'Moldovan Leu', approxRate: 17.7, symbolBefore: false },
  { code: 'MGA', symbol: 'Ar', name: 'Malagasy Ariary', approxRate: 4500, symbolBefore: true },
  { code: 'MKD', symbol: 'ден', name: 'Macedonian Denar', approxRate: 56.5, symbolBefore: false },
  { code: 'MMK', symbol: 'K', name: 'Myanmar Kyat', approxRate: 2100, symbolBefore: true },
  { code: 'MNT', symbol: '₮', name: 'Mongolian Tugrik', approxRate: 3450, symbolBefore: true },
  { code: 'MOP', symbol: 'MOP$', name: 'Macanese Pataca', approxRate: 8.06, symbolBefore: true },
  { code: 'MRU', symbol: 'UM', name: 'Mauritanian Ouguiya', approxRate: 39.5, symbolBefore: false },
  { code: 'MUR', symbol: '₨', name: 'Mauritian Rupee', approxRate: 45, symbolBefore: true },
  { code: 'MVR', symbol: 'Rf', name: 'Maldivian Rufiyaa', approxRate: 15.4, symbolBefore: true },
  { code: 'MWK', symbol: 'MK', name: 'Malawian Kwacha', approxRate: 1700, symbolBefore: true },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso', approxRate: 17.2, symbolBefore: true },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', approxRate: 4.70, symbolBefore: true },
  { code: 'MZN', symbol: 'MT', name: 'Mozambican Metical', approxRate: 63.5, symbolBefore: false },
  { code: 'NAD', symbol: 'N$', name: 'Namibian Dollar', approxRate: 18.5, symbolBefore: true },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', approxRate: 1550, symbolBefore: true },
  { code: 'NIO', symbol: 'C$', name: 'Nicaraguan Córdoba', approxRate: 36.6, symbolBefore: true },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', approxRate: 10.7, symbolBefore: false },
  { code: 'NPR', symbol: 'Rs', name: 'Nepalese Rupee', approxRate: 133, symbolBefore: true },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', approxRate: 1.68, symbolBefore: true },
  { code: 'OMR', symbol: 'ر.ع.', name: 'Omani Rial', approxRate: 0.385, symbolBefore: false },
  { code: 'PAB', symbol: 'B/.', name: 'Panamanian Balboa', approxRate: 1, symbolBefore: true },
  { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol', approxRate: 3.73, symbolBefore: true },
  { code: 'PGK', symbol: 'K', name: 'Papua New Guinean Kina', approxRate: 3.75, symbolBefore: true },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', approxRate: 56, symbolBefore: true },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', approxRate: 278, symbolBefore: true },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', approxRate: 4.0, symbolBefore: false },
  { code: 'PYG', symbol: '₲', name: 'Paraguayan Guarani', approxRate: 7350, symbolBefore: true },
  { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Rial', approxRate: 3.64, symbolBefore: false },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu', approxRate: 4.57, symbolBefore: false },
  { code: 'RSD', symbol: 'din', name: 'Serbian Dinar', approxRate: 108, symbolBefore: false },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', approxRate: 92, symbolBefore: false },
  { code: 'RWF', symbol: 'FRw', name: 'Rwandan Franc', approxRate: 1280, symbolBefore: false },
  { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal', approxRate: 3.75, symbolBefore: false },
  { code: 'SBD', symbol: 'SI$', name: 'Solomon Islands Dollar', approxRate: 8.45, symbolBefore: true },
  { code: 'SCR', symbol: '₨', name: 'Seychellois Rupee', approxRate: 13.2, symbolBefore: true },
  { code: 'SDG', symbol: 'ج.س.', name: 'Sudanese Pound', approxRate: 601, symbolBefore: false },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', approxRate: 10.5, symbolBefore: false },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', approxRate: 1.34, symbolBefore: true },
  { code: 'SHP', symbol: '£', name: 'Saint Helena Pound', approxRate: 0.79, symbolBefore: true },
  { code: 'SLE', symbol: 'Le', name: 'Sierra Leonean Leone', approxRate: 22.5, symbolBefore: true },
  { code: 'SOS', symbol: 'Sh', name: 'Somali Shilling', approxRate: 571, symbolBefore: false },
  { code: 'SRD', symbol: '$', name: 'Surinamese Dollar', approxRate: 36.2, symbolBefore: true },
  { code: 'SSP', symbol: '£', name: 'South Sudanese Pound', approxRate: 1300, symbolBefore: true },
  { code: 'STN', symbol: 'Db', name: 'São Tomé and Príncipe Dobra', approxRate: 22.5, symbolBefore: false },
  { code: 'SYP', symbol: '£S', name: 'Syrian Pound', approxRate: 13000, symbolBefore: true },
  { code: 'SZL', symbol: 'E', name: 'Swazi Lilangeni', approxRate: 18.5, symbolBefore: true },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', approxRate: 35.5, symbolBefore: true },
  { code: 'TJS', symbol: 'SM', name: 'Tajikistani Somoni', approxRate: 10.9, symbolBefore: false },
  { code: 'TMT', symbol: 'T', name: 'Turkmenistani Manat', approxRate: 3.50, symbolBefore: false },
  { code: 'TND', symbol: 'د.ت', name: 'Tunisian Dinar', approxRate: 3.11, symbolBefore: false },
  { code: 'TOP', symbol: 'T$', name: 'Tongan Paʻanga', approxRate: 2.36, symbolBefore: true },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', approxRate: 32, symbolBefore: true },
  { code: 'TTD', symbol: 'TT$', name: 'Trinidad & Tobago Dollar', approxRate: 6.78, symbolBefore: true },
  { code: 'TWD', symbol: 'NT$', name: 'New Taiwan Dollar', approxRate: 32, symbolBefore: true },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling', approxRate: 2520, symbolBefore: false },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia', approxRate: 41, symbolBefore: true },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling', approxRate: 3800, symbolBefore: false },
  { code: 'USD', symbol: '$', name: 'US Dollar', approxRate: 1, symbolBefore: true },
  { code: 'UYU', symbol: '$U', name: 'Uruguayan Peso', approxRate: 39, symbolBefore: true },
  { code: 'UZS', symbol: 'сўм', name: 'Uzbekistan Som', approxRate: 12500, symbolBefore: false },
  { code: 'VES', symbol: 'Bs.S', name: 'Venezuelan Bolívar', approxRate: 36.5, symbolBefore: true },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', approxRate: 24500, symbolBefore: false },
  { code: 'VUV', symbol: 'VT', name: 'Vanuatu Vatu', approxRate: 119, symbolBefore: false },
  { code: 'WST', symbol: 'WS$', name: 'Samoan Tala', approxRate: 2.75, symbolBefore: true },
  { code: 'XAF', symbol: 'FCFA', name: 'CFA Franc BEAC', approxRate: 603, symbolBefore: false },
  { code: 'XCD', symbol: 'EC$', name: 'East Caribbean Dollar', approxRate: 2.70, symbolBefore: true },
  { code: 'XOF', symbol: 'CFA', name: 'CFA Franc BCEAO', approxRate: 603, symbolBefore: false },
  { code: 'XPF', symbol: '₣', name: 'CFP Franc', approxRate: 110, symbolBefore: false },
  { code: 'YER', symbol: '﷼', name: 'Yemeni Rial', approxRate: 250, symbolBefore: false },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', approxRate: 18.5, symbolBefore: true },
  { code: 'ZMW', symbol: 'ZK', name: 'Zambian Kwacha', approxRate: 26, symbolBefore: false },
  { code: 'ZWL', symbol: 'Z$', name: 'Zimbabwean Dollar', approxRate: 14000, symbolBefore: true },
];

/** Popular currencies shown at top of selector */
export const POPULAR_CURRENCY_CODES = [
  'USD', 'EUR', 'GBP', 'SEK', 'NOK', 'DKK', 'CAD', 'AUD', 'JPY', 'CHF',
  'CNY', 'INR', 'BRL', 'MXN', 'KRW', 'SGD', 'HKD', 'NZD', 'ZAR', 'TRY',
];

export function getCurrencyInfo(code: string): CurrencyInfo {
  return CURRENCIES.find(c => c.code === code) || CURRENCIES.find(c => c.code === 'USD')!;
}

/** Format a value with correct symbol placement for a given currency */
export function formatCurrencyValue(val: number | null, code: string): string {
  if (val === null || val === 0) return '';
  const info = getCurrencyInfo(code);
  return info.symbolBefore ? `${info.symbol}${val}` : `${val} ${info.symbol}`;
}

/** Get a placeholder value equivalent to ~X USD in the given currency */
export function getPlaceholderValue(usdAmount: number, code: string, round = true): string {
  const info = getCurrencyInfo(code);
  let converted = usdAmount * info.approxRate;
  if (round) {
    // Round to nice numbers
    if (converted >= 1000) converted = Math.round(converted / 100) * 100;
    else if (converted >= 100) converted = Math.round(converted / 10) * 10;
    else if (converted >= 10) converted = Math.round(converted);
    else converted = Math.round(converted * 100) / 100;
  }
  return info.symbolBefore ? `${info.symbol}${converted}` : `${converted} ${info.symbol}`;
}
