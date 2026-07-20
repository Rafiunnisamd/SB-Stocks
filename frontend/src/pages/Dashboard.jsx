import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Briefcase,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Newspaper
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { fetchStart, fetchDashboardSuccess, fetchFailure } from '../store/slices/portfolioSlice.js';
import api from '../services/api.js';
import DashboardSkeleton from '../components/DashboardSkeleton.jsx';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.portfolio);

  const getDashboard = async () => {
    dispatch(fetchStart());
    try {
      const response = await api.get('/portfolio/dashboard');
      dispatch(fetchDashboardSuccess(response.data));
    } catch (err) {
      dispatch(fetchFailure(err.response?.data?.message || 'Failed to fetch dashboard data.'));
    }
  };

  useEffect(() => {
    getDashboard();
  }, [dispatch]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-dark-bg text-white">
        <div className="text-center space-y-4">
          <p className="text-bear-red font-medium">Error: {error || 'Failed to load data.'}</p>
          <button
            onClick={getDashboard}
            className="flex items-center gap-2 px-4 py-2 bg-dark-card border border-dark-border rounded-lg hover:border-white transition-colors mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  const {
    cashBalance,
    totalStockValue,
    portfolioValue,
    totalInvested,
    totalProfitLoss,
    totalProfitLossPercent,
    todayProfitLoss,
    todayProfitLossPercent,
    holdings,
    history,
  } = data;

  const isProfit = totalProfitLoss >= 0;
  const isTodayProfit = todayProfitLoss >= 0;

  // Format historical chart data
  const chartData = history.map((item) => ({
    date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    Value: item.value,
  }));

  // Mock Market News
  const mockNews = [
    {
      id: 1,
      headline: 'Tech sector surges as key inflation indexes cool off in Federal Reserve review',
      source: 'Market Watch',
      time: '1h ago',
    },
    {
      id: 2,
      headline: 'SB Stocks platform logs record paper trading volume with rising retail interest',
      source: 'Fintech Daily',
      time: '3h ago',
    },
    {
      id: 3,
      headline: 'US Treasury bond yields settle lower ahead of upcoming CPI data release next week',
      source: 'Bloomberg',
      time: '5h ago',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Upper Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Dashboard</h1>
          <p className="text-xs text-dark-text-muted mt-1">Real-time overview of your virtual investment assets</p>
        </div>
        <button
          onClick={getDashboard}
          className="flex items-center justify-center gap-2 text-xs font-semibold text-dark-text-muted hover:text-white px-3 py-2 rounded-lg bg-dark-card border border-dark-border hover:bg-dark-card-hover transition-all self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Portfolio Value */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-xl bg-dark-card border border-dark-border flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-dark-text-muted">
              <span className="text-xs font-bold uppercase tracking-wider">Portfolio Value</span>
              <Briefcase className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-extrabold text-white mt-3">
              ${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
          <div className={`flex items-center gap-1 text-xs font-semibold mt-4 ${isProfit ? 'text-bull-green' : 'text-bear-red'}`}>
            {isProfit ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            <span>
              ${Math.abs(totalProfitLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({totalProfitLossPercent.toFixed(2)}%)
            </span>
            <span className="text-dark-text-muted font-normal ml-1">all-time</span>
          </div>
        </motion.div>

        {/* Today's Profit/Loss */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-xl bg-dark-card border border-dark-border flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-dark-text-muted">
              <span className="text-xs font-bold uppercase tracking-wider">Today's Returns</span>
              {isTodayProfit ? <TrendingUp className="h-4 w-4 text-bull-green" /> : <TrendingDown className="h-4 w-4 text-bear-red" />}
            </div>
            <h2 className={`text-2xl font-extrabold mt-3 ${isTodayProfit ? 'text-bull-green' : 'text-bear-red'}`}>
              {isTodayProfit ? '+' : '-'}
              ${Math.abs(todayProfitLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
          <div className={`flex items-center gap-1 text-xs font-semibold mt-4 ${isTodayProfit ? 'text-bull-green' : 'text-bear-red'}`}>
            <span>{todayProfitLossPercent.toFixed(2)}%</span>
            <span className="text-dark-text-muted font-normal ml-1">since yesterday</span>
          </div>
        </motion.div>

        {/* Available Virtual Cash */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-xl bg-dark-card border border-dark-border flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-dark-text-muted">
              <span className="text-xs font-bold uppercase tracking-wider">Virtual Cash</span>
              <DollarSign className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-extrabold text-white mt-3">
              ${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
          <div className="text-xs text-dark-text-muted mt-4">
            Unused purchasing power
          </div>
        </motion.div>

        {/* Invested stock holdings */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-xl bg-dark-card border border-dark-border flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-dark-text-muted">
              <span className="text-xs font-bold uppercase tracking-wider">Stock Valuation</span>
              <Layers className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-extrabold text-white mt-3">
              ${totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
          <div className="text-xs text-dark-text-muted mt-4 flex items-center gap-1">
            <span>Invested in {holdings.length} stocks</span>
          </div>
        </motion.div>
      </div>

      {/* Main Grid: Charts & Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Line Chart */}
        <div className="lg:col-span-2 rounded-xl bg-dark-card border border-dark-border p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Portfolio Performance</h3>
            <span className="text-xs text-dark-text-muted">Last 30 Days</span>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00c805" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00c805" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#8a9fc2"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#8a9fc2"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => `$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#151a26',
                    borderColor: '#222b3e',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  itemStyle={{ color: '#00c805' }}
                  formatter={(value) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 'Portfolio Value']}
                />
                <Area
                  type="monotone"
                  dataKey="Value"
                  stroke="#00c805"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Watchlist & Market News */}
        <div className="rounded-xl bg-dark-card border border-dark-border p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6 border-b border-dark-border pb-3">
              <Newspaper className="h-5 w-5 text-bull-green" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Market Insights</h3>
            </div>
            
            <div className="space-y-4">
              {mockNews.map((news) => (
                <div key={news.id} className="space-y-1 group cursor-pointer">
                  <p className="text-xs font-semibold text-white group-hover:text-bull-green transition-colors leading-relaxed">
                    {news.headline}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-dark-text-muted">
                    <span>{news.source}</span>
                    <span>•</span>
                    <span>{news.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-dark-border text-center">
            <a
              href="/market"
              className="text-xs font-semibold text-bull-green hover:underline flex items-center justify-center gap-1"
            >
              <span>Explore all market news</span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Holdings Table Preview */}
      <div className="rounded-xl bg-dark-card border border-dark-border p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Holdings Preview</h3>
          <a href="/portfolio" className="text-xs font-semibold text-bull-green hover:underline">
            View full portfolio
          </a>
        </div>

        {holdings.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-dark-border rounded-lg bg-dark-bg/40">
            <p className="text-sm text-dark-text-muted">You do not own any stocks yet.</p>
            <a
              href="/market"
              className="inline-block mt-3 text-xs font-bold text-dark-bg bg-bull-green px-4 py-2 rounded-lg hover:bg-bull-green/90 transition-all"
            >
              Search & Trade Stocks
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-dark-text-muted border-b border-dark-border uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Symbol</th>
                  <th className="pb-3 font-semibold">Company</th>
                  <th className="pb-3 font-semibold text-right">Shares</th>
                  <th className="pb-3 font-semibold text-right font-medium">Avg Buy Price</th>
                  <th className="pb-3 font-semibold text-right">Current Price</th>
                  <th className="pb-3 font-semibold text-right">Market Value</th>
                  <th className="pb-3 font-semibold text-right">Profit / Loss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/40">
                {holdings.map((h) => {
                  const holdingProfit = h.profitLoss >= 0;
                  return (
                    <tr key={h.id} className="hover:bg-dark-bg/35 transition-colors">
                      <td className="py-3 font-bold text-white">{h.symbol}</td>
                      <td className="py-3 text-dark-text-muted">{h.companyName}</td>
                      <td className="py-3 text-right font-semibold">{h.shares}</td>
                      <td className="py-3 text-right text-dark-text-muted">${h.avgBuyPrice.toFixed(2)}</td>
                      <td className="py-3 text-right text-white">${h.currentPrice.toFixed(2)}</td>
                      <td className="py-3 text-right font-bold text-white">
                        ${h.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`py-3 text-right font-semibold ${holdingProfit ? 'text-bull-green' : 'text-bear-red'}`}>
                        {holdingProfit ? '+' : ''}
                        ${h.profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
