"use client";

import { useState, useEffect } from "react";

interface Item {
  _id: string;
  title: string;
  description: string;
  priceStars: number;
  imageUrl?: string;
  stock: number;
  category: string;
}

export default function RewardsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchItems();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      setCurrentUser(data.user);
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/items/list");
      const data = await res.json();
      if (res.ok) {
        setItems(data.items || []);
      }
    } catch (err) {
      console.error("Failed to fetch items:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (itemId: string, priceStars: number) => {
    if (!currentUser) {
      alert("Please login to purchase items");
      return;
    }

    if (currentUser.stars < priceStars) {
      alert("Insufficient stars! You need " + priceStars + " stars.");
      return;
    }

    if (!confirm(`Purchase this item for ${priceStars} stars?`)) {
      return;
    }

    try {
      const res = await fetch("/api/items/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ itemId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Purchase failed");
        return;
      }

      alert("Purchase successful!");
      fetchCurrentUser(); // Refresh user stars
      fetchItems(); // Refresh items (stock may have changed)
    } catch (err) {
      console.error("Purchase error:", err);
      alert("Network error. Please try again.");
    }
  };

  const handleTopup = () => {
    // Simulate star topup
    alert("Star topup simulation: In a real app, this would integrate with a payment provider.");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Rewards (Sovrinlar)</h1>
        {currentUser && (
          <div className="flex items-center gap-4">
            <div className="text-lg">
              <span className="text-yellow-500">⭐</span> {currentUser.stars} stars
            </div>
            <button
              onClick={handleTopup}
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Buy Stars
            </button>
          </div>
        )}
      </div>

      {!currentUser && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm">
            Please <a href="/login" className="text-blue-500">login</a> to purchase items.
          </p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading items...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No items available.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item._id} className="border rounded-lg p-4 bg-white">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded mb-3"
                />
              )}
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-yellow-500">⭐ {item.priceStars}</span>
                  {item.stock !== -1 && (
                    <span className="text-sm text-gray-500 ml-2">
                      ({item.stock} left)
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handlePurchase(item._id, item.priceStars)}
                  disabled={item.stock === 0}
                  className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

