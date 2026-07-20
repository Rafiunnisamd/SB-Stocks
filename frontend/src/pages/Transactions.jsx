import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, RefreshCw, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../services/api.js';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const getTransactions = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get(`/trade/transactions?page=${page}&limit=10`);
      setTransactions(response.data.transactions);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
      setTotalCount(response.data.totalTransactions);
    } catch (err) {
      console.error('Failed to get transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTransactions(currentPage);
  }, [currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Transactions</h1>
          <p className="text-xs text-dark-text-muted mt-1">Review the historical log of your virtual paper trades</p>
        </div>
        <button
          onClick={() => getTransactions(currentPage)}
          disabled={loading}
          className="flex items-center gap-2 text-xs font-semibold text-dark-text-muted hover:text-white px-3 py-2 rounded-lg bg-dark-card border border-dark-border"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-10 bg-dark-card border border-dark-border rounded-lg" />
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-14 bg-dark-card/60 border border-dark-border/40 rounded-lg" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-dark-border rounded-xl bg-dark-card/40 max-w-lg mx-auto">
          <History className="h-10 w-10 text-dark-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white">No Transactions Logged</h3>
          <p className="text-sm text-dark-text-muted mt-2 px-6">
            You haven't executed any stock purchases or sales yet. Visit the Market page to pick a stock and make your first trade!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Table Container */}
          <div className="rounded-xl border border-dark-border bg-dark-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs text-dark-text-muted border-b border-dark-border uppercase tracking-wider bg-dark-card-hover/20">
                    <th className="p-4 font-semibold">Date & Time</th>
                    <th className="p-4 font-semibold">Symbol</th>
                    <th className="p-4 font-semibold">Action</th>
                    <th className="p-4 font-semibold text-right">Shares</th>
                    <th className="p-4 font-semibold text-right">Execution Price</th>
                    <th className="p-4 font-semibold text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/30">
                  {transactions.map((tx) => {
                    const isBuy = tx.type === 'BUY';
                    const formattedDate = new Date(tx.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <tr key={tx._id} className="hover:bg-dark-bg/25 transition-colors">
                        <td className="p-4 text-xs text-dark-text-muted">{formattedDate}</td>
                        <td className="p-4 font-bold text-white uppercase">{tx.symbol}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                            isBuy 
                              ? 'bg-bull-green/10 text-bull-green' 
                              : 'bg-bear-red/10 text-bear-red'
                          }`}>
                            {isBuy ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            <span>{tx.type}</span>
                          </span>
                        </td>
                        <td className="p-4 text-right font-semibold text-white">{tx.shares}</td>
                        <td className="p-4 text-right text-dark-text-muted">${tx.price.toFixed(2)}</td>
                        <td className={`p-4 text-right font-extrabold ${isBuy ? 'text-bull-green' : 'text-bull-green'}`}>
                          ${tx.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-dark-border/50 pt-4">
              <span className="text-xs text-dark-text-muted">
                Showing Page <span className="text-white font-semibold">{currentPage}</span> of{' '}
                <span className="text-white font-semibold">{totalPages}</span> ({totalCount} total trades)
              </span>

              <div className="flex gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1 || loading}
                  className="flex items-center justify-center p-2 rounded-lg bg-dark-card border border-dark-border text-dark-text-muted hover:text-white disabled:opacity-40 disabled:hover:text-dark-text-muted transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || loading}
                  className="flex items-center justify-center p-2 rounded-lg bg-dark-card border border-dark-border text-dark-text-muted hover:text-white disabled:opacity-40 disabled:hover:text-dark-text-muted transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Transactions;
