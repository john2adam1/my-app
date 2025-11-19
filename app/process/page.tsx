"use client";

import { useState, useEffect } from "react";

interface Process {
  _id: string;
  title: string;
  startDate: string;
  status: string;
  daysPassed: number;
}

export default function ProcessPage() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchProcesses();
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

  const fetchProcesses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/process/create", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setProcesses(data.processes || []);
      }
    } catch (err) {
      console.error("Failed to fetch processes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/process/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, startDate }),
      });

      if (!res.ok) throw new Error("Failed to create process");

      setTitle("");
      setStartDate("");
      setShowForm(false);
      fetchProcesses();
    } catch (err) {
      console.error("Create process error:", err);
      alert("Failed to create process");
    }
  };

  if (!currentUser) {
    return (
      <div className="text-center mt-8">
        <p>Please <a href="/login" className="text-blue-500">login</a> to view processes.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Process (Jarayon)</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {showForm ? "Cancel" : "Create Process"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 p-4 border rounded bg-white">
          <div className="mb-4">
            <label className="block mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Create
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8">Loading processes...</div>
      ) : processes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No processes yet. Create one to get started!</div>
      ) : (
        <div className="space-y-4">
          {processes.map((process) => (
            <div key={process._id} className="border rounded-lg p-4 bg-white">
              <h3 className="text-lg font-semibold mb-2">{process.title}</h3>
              <div className="text-sm text-gray-500">
                Started: {new Date(process.startDate).toLocaleDateString()}
              </div>
              <div className="mt-2">
                <span className="font-semibold">{process.daysPassed}</span> days passed
              </div>
              <div className="mt-2">
                <span className={`px-2 py-1 rounded text-sm ${
                  process.status === "active" ? "bg-green-100 text-green-800" :
                  process.status === "completed" ? "bg-blue-100 text-blue-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {process.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 border rounded bg-gray-50">
        <h2 className="font-semibold mb-2">Notifications (UI Stub)</h2>
        <p className="text-sm text-gray-600">
          Notification management UI would go here with title, image, description, and frequency/subscription controls.
        </p>
      </div>
    </div>
  );
}

