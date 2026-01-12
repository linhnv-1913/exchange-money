import React, { useState, useEffect, useMemo } from 'react';
import { Currency, ExchangeRates } from './types';
import { fetchCurrentRates } from './services/geminiService';
import { readMoney } from './utils/numberToVietnamese';
import { RefreshCw, ArrowRight, TrendingUp, Info, Coins, Banknote } from 'lucide-react';

const App: React.FC = () => {
  const [amount, setAmount] = useState<string>('1');
  const [currency, setCurrency] = useState<Currency>(Currency.USD);
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getRates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCurrentRates();
      setRates(data);
    } catch (err) {
      setError("Không thể lấy tỷ giá mới nhất. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRates();
  }, []);

  const result = useMemo(() => {
    if (!rates) return { numeric: 0, text: '' };
    
    // Remove dots (thousands separators) and replace comma with dot (decimal) for parsing
    const normalizedAmount = amount.replace(/\./g, '').replace(',', '.');
    const numericAmount = parseFloat(normalizedAmount);
    
    if (isNaN(numericAmount)) return { numeric: 0, text: 'Không đồng' };

    const rate = currency === Currency.USD ? rates.usd : rates.jpy;
    const totalVND = Math.floor(numericAmount * rate);

    return {
      numeric: totalVND,
      text: readMoney(totalVND)
    };
  }, [amount, currency, rates]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Remove dots (thousands separators)
    const cleanVal = value.replace(/\./g, '');
    
    // Allow digits and comma only
    const validVal = cleanVal.replace(/[^0-9,]/g, '');
    
    // Handle decimal parts
    const parts = validVal.split(',');
    
    // Only allow one comma
    if (parts.length > 2) return;

    let integerPart = parts[0];
    
    // Remove leading zeros (e.g., 01 -> 1), but keep single 0 if it's the only digit
    if (integerPart.length > 1 && integerPart.startsWith('0')) {
      integerPart = integerPart.replace(/^0+/, '');
    }

    // Format integer part with dots
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    // Reconstruct the value
    let finalValue = formattedInteger;
    
    // Add decimal part if comma exists
    if (parts.length > 1 || validVal.endsWith(',')) {
      finalValue += ',' + (parts[1] || '');
    }
    
    setAmount(finalValue);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center p-4">
      
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="bg-emerald-600 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Coins size={100} />
          </div>
          <h1 className="text-2xl font-bold flex items-center gap-2 relative z-10">
            <TrendingUp className="w-6 h-6" /> 
            Tỷ Giá VN
          </h1>
          <p className="text-emerald-100 text-sm mt-1 relative z-10">
            Cập nhật tự động từ Google
          </p>
        </div>

        {/* Loading State Overlay */}
        {loading && !rates && (
          <div className="p-12 flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            <p className="text-slate-500 font-medium">Đang cập nhật dữ liệu...</p>
          </div>
        )}

        {/* Main Content */}
        {rates && (
          <div className="p-6 space-y-8">
            
            {/* Input Section */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">Nhập số tiền cần đổi</label>
              
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={handleAmountChange}
                    className="block w-full rounded-xl border-slate-200 bg-slate-50 pl-4 pr-4 py-3 text-lg font-semibold text-slate-900 focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none border transition-all"
                    placeholder="1.000"
                  />
                </div>
                
                <div className="w-32">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="block w-full rounded-xl border-slate-200 bg-white py-3 pl-3 pr-8 text-base font-medium text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 border shadow-sm cursor-pointer"
                  >
                    <option value={Currency.USD}>USD ($)</option>
                    <option value={Currency.JPY}>JPY (¥)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Result Section */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center space-y-2 relative overflow-hidden group shadow-sm">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">Thành tiền (VND)</p>
              
              <div className="text-3xl sm:text-4xl font-bold text-slate-800 break-words font-mono tracking-tight">
                {formatNumber(result.numeric)} ₫
              </div>
              
              <div className="pt-2 border-t border-slate-200 mt-3">
                <p className="text-emerald-700 italic font-medium leading-relaxed text-sm">
                  "{result.text}"
                </p>
              </div>
            </div>

            {/* Gold Price Section */}
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-3 opacity-10">
                 <Coins className="text-amber-600" size={64} />
               </div>
               
               <h3 className="text-amber-800 font-bold flex items-center gap-2 mb-3 relative z-10">
                 <div className="bg-amber-100 p-1.5 rounded-lg">
                    <Banknote className="w-4 h-4 text-amber-600" />
                 </div>
                 Giá Vàng SJC (1 Lượng)
               </h3>

               <div className="grid grid-cols-2 gap-4 relative z-10">
                 <div className="bg-white/60 p-3 rounded-xl border border-amber-100/50">
                   <p className="text-xs text-amber-600 font-medium uppercase mb-1">Mua Vào</p>
                   <p className="text-lg font-bold text-slate-800 font-mono">
                     {formatNumber(rates.gold.buy)}
                   </p>
                 </div>
                 <div className="bg-white/60 p-3 rounded-xl border border-amber-100/50">
                   <p className="text-xs text-amber-600 font-medium uppercase mb-1">Bán Ra</p>
                   <p className="text-lg font-bold text-slate-800 font-mono">
                     {formatNumber(rates.gold.sell)}
                   </p>
                 </div>
               </div>
            </div>

            {/* Rate Info & Actions */}
            <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
               <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
               <div className="text-xs text-blue-800 space-y-1">
                  <p>
                    <span className="font-semibold">Tỷ giá ngoại tệ:</span> 
                    {' '}1 {currency} ≈ {formatNumber(currency === Currency.USD ? rates.usd : rates.jpy)} VND
                  </p>
                  <p className="opacity-80">
                    Cập nhật lúc: {rates.lastUpdated}
                  </p>
               </div>
            </div>

            <button
              onClick={getRates}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Đang cập nhật...' : 'Cập nhật dữ liệu mới nhất'}
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-slate-400 text-xs">
          Dữ liệu được cung cấp bởi Google Gemini & Search Grounding.
        </p>
      </div>

    </div>
  );
};

export default App;