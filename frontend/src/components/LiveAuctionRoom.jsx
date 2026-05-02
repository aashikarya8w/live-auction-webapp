import { useEffect, useState, useRef } from "react";
import { subscribeToProduct, unsubscribeFromProduct } from "../services/socketService";
import { formatPrice } from "../utils/helpers";

const LiveAuctionRoom = ({ product, onBidPlaced }) => {
  const [liveBids, setLiveBids] = useState([]);
  const [currentHighest, setCurrentHighest] = useState(product?.currentHighestBid || product?.price || 0);
  const [viewerCount, setViewerCount] = useState(Math.floor(Math.random() * 20) + 5);
  const [isConnected, setIsConnected] = useState(false);
  const [lastBidder, setLastBidder] = useState(null);
  const feedRef = useRef(null);

  useEffect(() => {
    if (!product?.id) return;

    // Simulate viewer count fluctuation
    const viewerInterval = setInterval(() => {
      setViewerCount(prev => Math.max(3, prev + Math.floor(Math.random() * 3) - 1));
    }, 8000);

    // Connect to WebSocket
    subscribeToProduct(product.id, (data) => {
      setIsConnected(true);
      setCurrentHighest(data.amount);
      setLastBidder(data.bidderName);
      setLiveBids(prev => [{
        id: Date.now(),
        bidderName: data.bidderName,
        amount: data.amount,
        time: new Date().toLocaleTimeString(),
        isNew: true,
      }, ...prev].slice(0, 20));

      if (onBidPlaced) onBidPlaced(data);
    });

    setIsConnected(true);

    return () => {
      clearInterval(viewerInterval);
      unsubscribeFromProduct(product.id);
    };
  }, [product?.id]);

  // Auto scroll feed
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = 0;
    }
  }, [liveBids]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-gray-400"}`} />
            <span className="text-white font-bold text-sm">
              {isConnected ? "LIVE" : "Connecting..."}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
              <span className="text-white text-xs">👁️</span>
              <span className="text-white text-xs font-bold">{viewerCount} watching</span>
            </div>
          </div>
        </div>

        {/* Current highest bid */}
        <div className="mt-3">
          <p className="text-white/60 text-xs font-medium">Current Highest Bid</p>
          <p className="text-white font-black text-3xl mt-0.5">{formatPrice(currentHighest)}</p>
          {lastBidder && (
            <p className="text-white/60 text-xs mt-1">by {lastBidder}</p>
          )}
        </div>
      </div>

      {/* Live Feed */}
      <div className="p-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
          Live Bid Feed
        </p>

        {liveBids.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <span className="text-3xl mb-2">🔨</span>
            <p className="text-gray-400 text-sm">Waiting for bids...</p>
            <p className="text-gray-300 text-xs mt-1">Be the first to bid!</p>
          </div>
        ) : (
          <div ref={feedRef} className="space-y-2 max-h-48 overflow-y-auto">
            {liveBids.map((bid, i) => (
              <div key={bid.id}
                className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                  i === 0
                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100"
                    : "bg-gray-50"
                }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    i === 0 ? "bg-gradient-to-br from-indigo-500 to-purple-500" : "bg-gray-300"
                  }`}>
                    {i === 0 ? "👑" : bid.bidderName?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">{bid.bidderName}</p>
                    <p className="text-[10px] text-gray-400">{bid.time}</p>
                  </div>
                </div>
                <p className={`font-black text-sm ${i === 0 ? "text-indigo-600" : "text-gray-600"}`}>
                  {formatPrice(bid.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveAuctionRoom;
