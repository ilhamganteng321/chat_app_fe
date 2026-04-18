import { useEffect, useState } from "react";
import { axiosInstance } from "../utiils/axios";

export const RequestPopup = ({ isOpen, onClose, onRequestProcessed }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const getContactRequests = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/contacts");
      const data = res.data.data;

      const normalized = Array.isArray(data) ? data : [data];

      const pendingRequests = normalized.filter(
        (req) => req.status === "Pending",
      );
      setRequests(pendingRequests);
      console.log(requests);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setProcessingId(requestId);
    console.log(requestId);
    try {
      const res = await axiosInstance.post(`/api/accep-contacts`, {
        status: "Accepted",
        requestId: requestId,
      });

      if (res.status === 200) {
        // Hapus dari list atau update status
        setRequests((prev) => prev.filter((req) => req._id !== requestId));
        if (onRequestProcessed) onRequestProcessed();
        alert("berhasil Menerima");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      alert("Failed to accept request");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRequest = async (requestId) => {
    setProcessingId(requestId);
    try {
      const res = await axiosInstance.post(`/api/accep-contacts`, {
        status: "Accepted",
        requestId,
      });

      if (res.status === 200) {
        setRequests((prev) => prev.filter((req) => req._id !== requestId));
        if (onRequestProcessed) onRequestProcessed();
        alert("berhasil reject");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Failed to reject request");
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      getContactRequests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 max-w-md p-6 relative animate-fadeIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Contact Requests
        </h2>

        {/* Content */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-500">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className="w-16 h-16 mx-auto text-gray-300 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-gray-500">No pending requests</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {requests.map((request) => (
              <div
                key={request._id}
                className="border rounded-lg p-3 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      {request.from?.name || "Unknown User"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {request.from?.email || "No email"}
                    </p>
                    <span className="inline-block mt-1 text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                      {request.status}
                    </span>
                  </div>
                  <div className="flex gap-2 ml-3">
                    <button
                      onClick={() => handleAcceptRequest(request._id)}
                      disabled={processingId === request._id}
                      className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition disabled:opacity-50 text-sm"
                    >
                      {processingId === request._id ? "..." : "Accept"}
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request._id)}
                      disabled={processingId === request._id}
                      className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition disabled:opacity-50 text-sm"
                    >
                      {processingId === request._id ? "..." : "Reject"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
