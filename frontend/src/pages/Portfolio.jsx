import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Wallet, PieChart as PieIcon, RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../services/api.js';

// Color palette for the pie chart
const CHART_COLORS = [
  '#00c805', // Bull Green
  '#3b82f6', // Blue
  '#a855f7', // Purple
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#06b6d4', // Cyan
];

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getPortfolioData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/portfolio/holdings');
      setPortfolio(response.data);
    } catch (err) {
      console.error('Failed to get portfolio holdings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPortfolioData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-dark-border rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-28 bg-dark-card border border-dark-border rounded-xl" />
          <div className="h-28 bg-dark-card border border-dark-border rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[350px] bg-dark-card border border-dark-border rounded-xl" />
          <div className="h-[350px] bg-dark-card border border-dark-border rounded-xl" />
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="text-center py-20 bg-dark-bg text-white">
        <p className="text-bear-red">Failed to load portfolio details.</p>
        <button
          onClick={getPortfolioData}
          className="mt-4 px-4 py-2 bg-dark-card border border-dark-border rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  const { cashBalance, totalStockValue, portfolioValue, holdings } = portfolio;

  // Format allocation data for Pie Chart
  const pieData = holdings.map((h) => ({
    name: h.symbol,
    value: h.currentValue,
  }));

  // Append cash as a sector in the pie chart if it is positive
  if (cashBalance > 0) {
    pieData.push({
      name: 'Cash Balance',
      value: cashBalance,
    });
  }

  const hasHoldings = holdings.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Portfolio</h1>
          <p className="text-xs text-dark-text-muted mt-1">Review asset allocations and virtual holding performances</p>
        </div>
        <button
          onClick={getPortfolioData}
          className="flex items-center gap-2 text-xs font-semibold text-dark-text-muted hover:text-white px-3 py-2 rounded-lg bg-dark-card border border-dark-border"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-dark-card border border-dark-border flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-dark-text-muted uppercase tracking-wider block">Net Assets value</span>
            <span className="text-2xl font-extrabold text-white mt-1.5 block">
              ${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-bull-green/10 flex items-center justify-center text-bull-green">
            <Briefcase className="h-5 w-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-dark-card border border-dark-border flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-dark-text-muted uppercase tracking-wider block">Stock Valuation</span>
            <span className="text-2xl font-extrabold text-white mt-1.5 block">
              ${totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
            <PieIcon className="h-5 w-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-dark-card border border-dark-border flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-dark-text-muted uppercase tracking-wider block">Virtual Cash</span>
            <span className="text-2xl font-extrabold text-white mt-1.5 block">
              ${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
            <Wallet className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Allocations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocations Table */}
        <div className="lg:col-span-2 rounded-xl bg-dark-card border border-dark-border p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Current Holdings</h3>

          {!hasHoldings ? (
            <div className="text-center py-16 border border-dashed border-dark-border rounded-lg bg-dark-bg/20">
              <p className="text-sm text-dark-text-muted">You do not own any stocks yet.</p>
              <button
                onClick={() => navigate('/market')}
                className="mt-4 bg-bull-green text-dark-bg font-bold text-xs px-4 py-2 rounded-lg hover:bg-bull-green/90 transition-all"
              >
                Explore Stock Market
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs text-dark-text-muted border-b border-dark-border uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Symbol</th>
                    <th className="pb-3 font-semibold text-right">Shares</th>
                    <th className="pb-3 font-semibold text-right">Avg Price</th>
                    <th className="pb-3 font-semibold text-right">Current Price</th>
                    <th className="pb-3 font-semibold text-right">Total Cost</th>
                    <th className="pb-3 font-semibold text-right">Market Value</th>
                    <th className="pb-3 font-semibold text-right">Gain / Loss</th>
                    <th className="pb-3 font-semibold text-right">Allocation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/40">
                  {holdings.map((h) => {
                    const isProfit = h.profitLoss >= 0;
                    const totalCost = h.shares * h.avgBuyPrice;
                    return (
                      <tr
                        key={h.id}
                        onClick={() => navigate(`/stock/${h.symbol}`)}
                        className="hover:bg-dark-bg/25 cursor-pointer transition-colors"
                      >
                        <td className="py-3.5 font-bold text-white uppercase hover:text-bull-green transition-colors">
                          {h.symbol}
                        </td>
                        <td className="py-3.5 text-right font-semibold text-white">{h.shares}</td>
                        <td className="py-3.5 text-right text-dark-text-muted">${h.avgBuyPrice.toFixed(2)}</td>
                        <td className="py-3.5 text-right text-white">${h.currentPrice.toFixed(2)}</td>
                        <td className="py-3.5 text-right text-dark-text-muted">
                          ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 text-right font-bold text-white">
                          ${h.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className={`py-3.5 text-right font-bold ${isProfit ? 'text-bull-green' : 'text-bear-red'}`}>
                          <span className="flex items-center justify-end gap-0.5 text-xs">
                            {isProfit ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                            {isProfit ? '+' : ''}
                            {h.profitLossPercent.toFixed(2)}%
                          </span>
                          <span className="text-[10px] text-dark-text-muted font-normal block">
                            {isProfit ? '+' : ''}
                            ${h.profitLoss.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3.5 text-right font-semibold text-white">{h.allocation}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Allocation Pie Chart */}
        <div className="rounded-xl bg-dark-card border border-dark-border p-6 flex flex-col justify-between h-[400px]">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-dark-border pb-3">Asset Allocation</h3>
          </div>

          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#151a26',
                    borderColor: '#222b3e',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 'Value']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Legend */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 text-[10px] text-dark-text-muted">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                ></span>
                <span className="font-semibold text-white">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
