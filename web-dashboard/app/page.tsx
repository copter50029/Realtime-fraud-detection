"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import PieChart03 from "@/components/Piechart";

interface Transaction {
  id: number;
  trans_num: string;
  amount: number;
  merchant: string;
  category: string;
  customer: string;
  city: string;
  state: string;
  is_fraud: boolean;
  timestamp: string;
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalTransactions, setTotalTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<string>("Disconnected");
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/kafka");
      const result = await response.json();

      if (result.success) {
        setTransactions(result.data);
        setTotalTransactions(result.data);
      } else {
        setError(result.error || "Failed to fetch data");
      }
    } catch (err) {
      setError("Network error occurred");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const startStreaming = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setStreaming(true);
    setConnectionStatus("Connecting...");

    const eventSource = new EventSource("/api/kafka/stream");
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setConnectionStatus("Connected");
      console.log("SSE connection opened");
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "connection") {
          setConnectionStatus("Connected");
          console.log("Connection established:", data.message);
        } else if (data.type === "transaction") {
          // Add to recent transactions (limited to 50 for table display)
          setTransactions((prev) => [data.data, ...prev.slice(0, 5)]);
          // Add to total transactions (unlimited for analytics)
          setTotalTransactions((prev) => [data.data, ...prev]);
        }
      } catch (err) {
        console.error("Error parsing SSE data:", err);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      setConnectionStatus("Connection Error");
      setStreaming(false);
    };
  };

  const stopStreaming = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setStreaming(false);
    setConnectionStatus("Disconnected");
  };

  const clearAllData = () => {
    setTransactions([]);
    setTotalTransactions([]);
  };

  useEffect(() => {
    fetchTransactions();

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const fraudCount = totalTransactions.filter((t) => t.is_fraud).length;
  const totalAmount = totalTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Transaction Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Real-time transaction monitoring system
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-gray-500">Status:</span>
            <span
              className={`text-sm font-medium ${
                connectionStatus === "Connected"
                  ? "text-green-600"
                  : connectionStatus === "Connecting..."
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {connectionStatus}
            </span>
          </div>
        </div>

        <div className="mb-6 flex gap-4">
          <Button
            onClick={fetchTransactions}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Loading..." : "Refresh Data"}
          </Button>

          {!streaming ? (
            <Button
              onClick={startStreaming}
              className="bg-green-600 hover:bg-green-700"
            >
              Start Real-time Stream
            </Button>
          ) : (
            <Button onClick={stopStreaming} variant="destructive">
              Stop Stream
            </Button>
          )}

          <Button
            onClick={clearAllData}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            Clear All Data
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Total Transactions
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {totalTransactions.length}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Fraud Detected
            </h3>
            <p className="text-3xl font-bold text-red-600">{fraudCount}</p>
            <p className="text-sm text-gray-500">
              {totalTransactions.length > 0
                ? `${((fraudCount / totalTransactions.length) * 100).toFixed(
                    1
                  )}% fraud rate`
                : "0% fraud rate"}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Fraud vs Valid Transactions
            </h3>
            <PieChart03 transactions={totalTransactions} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Live Transactions
            </h2>
            {streaming && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600">Live</span>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Merchant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      {loading
                        ? "Loading transactions..."
                        : 'No transactions available. Click "Start Real-time Stream" to begin.'}
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction, index) => (
                    <tr
                      key={transaction.id}
                      className={`hover:bg-gray-50 ${
                        index === 0 && streaming ? "bg-green-50" : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {transaction.trans_num.substring(0, 12)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.customer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        ${transaction.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.merchant}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.city}, {transaction.state}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {transaction.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            transaction.is_fraud
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {transaction.is_fraud ? "🚨 Fraud" : "✅ Valid"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
