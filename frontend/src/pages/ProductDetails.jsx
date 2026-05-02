import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductById } from "../services/productService";
import { getBidsByProduct } from "../services/bidService";
import { getProductReviews, getProductRating, addReview } from "../services/reviewService";
import BidModal from "../components/BidModal";
import CountdownTimer from "../components/CountdownTimer";
import LiveAuctionRoom from "../components/LiveAuctionRoom";
import SimilarProducts from "../components/SimilarProducts";
import AuctionChat from "../components/AuctionChat";
import useAuth from "../hooks/useAuth";
import { useCart } from "../context/CartContext";
import { formatPrice, formatDate } from "../utils/helpers";

const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [bids, setBids] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState({ average: 0, count: 0 });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showBid, setShowBid] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    Promise.all([
      getProductById(id),
      getBidsByProduct(id).catch(() => []),
      getProductReviews(id).catch(() => []),
      getProductRating(id).catch(() => ({ average: 0, count: 0 })),
    ]).then(([prod, bidList, reviewList, ratingData]) => {
      setProduct(prod);
      setBids(bidList);
      setReviews(reviewList);
      setRating(ratingData);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    try {
      setReviewLoading(true);
      const newReview = await addReview(id, user.id, reviewForm.rating, reviewForm.comment);
      setReviews(prev => [newReview, ...prev]);
      const newRating = await getProductRating(id);
      setRating(newRating);
      setReviewForm({ rating: 5, comment: "" });
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <p className="text-5xl mb-4">😕</p>
      <p className="text-gray-600 font-semibold">Product not found</p>
      <Link to="/" className="mt-4 text-indigo-600 text-sm font-medium hover:underline">← Back to Home</Link>
    </div>
  );

  const isSold = product.status === "SOLD";

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4 sm:mb-6">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-600 font-medium truncate max-w-[200px]">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">

          {/* ── IMAGE ── */}
          <div className="space-y-3">
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 aspect-square">
              <img
                src={product.imageUrl || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=600&fit=crop"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.isAuction && !isSold && (
                <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  LIVE AUCTION
                </div>
              )}
              {isSold && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-white text-gray-800 font-black text-2xl px-8 py-3 rounded-2xl shadow-xl rotate-[-8deg]">SOLD OUT</span>
                </div>
              )}
              {product.category && (
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                  {product.category}
                </div>
              )}
            </div>
          </div>

          {/* ── DETAILS ── */}
          <div className="flex flex-col gap-5">

            <div>
              <h1 className="text-3xl font-black text-gray-900 leading-tight">{product.name}</h1>
              <p className="text-gray-500 mt-3 leading-relaxed">{product.description}</p>
            </div>

            {/* Price block */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                    {product.isAuction ? "Starting Price" : "Price"}
                  </p>
                  <p className="text-3xl font-black text-indigo-600">{formatPrice(product.price)}</p>
                </div>
                {product.currentHighestBid && (
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Highest Bid</p>
                    <p className="text-3xl font-black text-emerald-600">{formatPrice(product.currentHighestBid)}</p>
                  </div>
                )}
              </div>

              {/* Countdown */}
              {product.isAuction && product.auctionEndTime && !isSold && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Auction Ends In</p>
                  <div className="text-base font-bold text-red-500">
                    <CountdownTimer endTime={product.auctionEndTime} />
                  </div>
                </div>
              )}
            </div>

            {/* Live Auction Room for auction products */}
            {product.isAuction && !isSold && (
              <LiveAuctionRoom
                product={{ ...product, currentHighestBid: product.currentHighestBid }}
                onBidPlaced={(data) => {
                  setProduct(prev => ({ ...prev, currentHighestBid: data.amount }));
                }}
              />
            )}

            {/* Auction Chat */}
            {product.isAuction && (
              <AuctionChat productId={product.id} />
            )}

            {/* Bid history mini for non-live */}
            {bids.length > 0 && (!product.isAuction || isSold) && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm font-bold text-gray-700 mb-3">Recent Bids ({bids.length})</p>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {[...bids].reverse().slice(0, 5).map((bid, i) => (
                    <div key={bid.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${i === 0 ? "bg-gradient-to-br from-yellow-400 to-orange-400" : "bg-gray-300"}`}>
                          {i === 0 ? "👑" : bid.user?.fullName?.charAt(0) || "U"}
                        </div>
                        <span className="text-gray-500">{formatDate(bid.bidTime)}</span>
                      </div>
                      <span className={`font-bold ${i === 0 ? "text-emerald-600" : "text-gray-600"}`}>{formatPrice(bid.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {!isSold ? (
              <div className="flex gap-3">
                {product.isAuction && user && (
                  <button onClick={() => setShowBid(true)}
                    className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:opacity-90 hover:shadow-lg hover:shadow-indigo-200 transition-all text-sm">
                    🔨 Place Bid
                  </button>
                )}
                {product.isAuction && !user && (
                  <Link to="/login" className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:opacity-90 transition-all text-sm text-center">
                    Login to Bid
                  </Link>
                )}
                {!product.isAuction && (
                  <button onClick={handleAddToCart}
                    className={`flex-1 py-4 font-bold rounded-2xl transition-all text-sm ${addedToCart ? "bg-emerald-500 text-white" : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 hover:shadow-lg hover:shadow-indigo-200"}`}>
                    {addedToCart ? "✓ Added to Cart!" : "🛒 Add to Cart"}
                  </button>
                )}
                <Link to="/" className="w-12 h-14 bg-white border border-gray-200 rounded-2xl flex items-center justify-center hover:bg-gray-50 transition-all shadow-sm">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </Link>
              </div>
            ) : (
              <div className="py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl text-center text-sm">
                This item has been sold
              </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "🔒", text: "Secure Payment" },
                { icon: "🚚", text: "Fast Delivery" },
                { icon: "↩️", text: "Easy Returns" },
              ].map(b => (
                <div key={b.text} className="flex flex-col items-center gap-1 bg-white rounded-xl p-3 border border-gray-100 text-center">
                  <span className="text-lg">{b.icon}</span>
                  <span className="text-xs text-gray-500 font-medium">{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showBid && <BidModal product={product} onClose={() => setShowBid(false)} />}

      {/* Similar Products */}
      <SimilarProducts productId={product?.id} />

      {/* ── REVIEWS SECTION ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pb-10">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Rating Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center h-fit">
            <p className="text-6xl font-black text-gray-900">{rating.average || 0}</p>
            <div className="flex justify-center gap-1 my-2">
              {[1,2,3,4,5].map(s => (
                <span key={s} className={`text-xl ${s <= Math.round(rating.average) ? "text-yellow-400" : "text-gray-200"}`}>★</span>
              ))}
            </div>
            <p className="text-gray-400 text-sm">{rating.count} review{rating.count !== 1 ? "s" : ""}</p>
          </div>

          {/* Reviews List + Form */}
          <div className="lg:col-span-2 space-y-5">
            <h2 className="text-xl font-black text-gray-900">Customer Reviews</h2>

            {/* Write Review */}
            {user && (
              <form onSubmit={handleReviewSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="font-bold text-gray-800 mb-3 text-sm">Write a Review</p>
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: s }))}
                      className={`text-2xl transition-transform hover:scale-110 ${s <= reviewForm.rating ? "text-yellow-400" : "text-gray-200"}`}>
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Share your experience..."
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-3"
                />
                <button type="submit" disabled={reviewLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl text-sm hover:opacity-90 transition-all disabled:opacity-60">
                  {reviewLoading ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}

            {/* Reviews */}
            {reviews.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                <p className="text-gray-400 text-sm">No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {review.user?.fullName?.charAt(0) || "U"}
                      </div>
                      <span className="font-semibold text-gray-800 text-sm">{review.user?.fullName || "User"}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className={`text-sm ${s <= review.rating ? "text-yellow-400" : "text-gray-200"}`}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                  <p className="text-xs text-gray-400 mt-2">{formatDate(review.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
