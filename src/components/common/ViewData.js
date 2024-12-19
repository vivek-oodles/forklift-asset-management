import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { getProtected } from "../../network/ApiService";
import { API_END_POINTS } from "../../network/apiEndPoint";

const ViewData = (props) => {
  const { id, setViewAssetId } = props;
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [loading, setLoading] = useState(null);
  const [showModal, setShowModal] = useState(null);

  useEffect(() => {
    if (id) {
      handleViewAsset(id);
    }
  }, [id]);

  const handleViewAsset = async (id) => {
    setShowModal(true);
    setLoading(true);

    try {
      const response = await getProtected(`${API_END_POINTS.assets}${id}/`);
      if (response) {
        console.log("this is data", response);
        setSelectedAsset(response);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching asset details:", error);
      alert("Failed to load asset details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return showModal ? (
    <div className="modal-backdrop">
      <div className="modal-content">
        {loading ? (
          <div className="modal-loader">
            <div className="loader-spinner"></div>
            <p>Loading asset details...</p>
          </div>
        ) : (
          <div>
            <div className="modal-header">
              <h2>Asset Details</h2>
              <button
                className="close-button"
                onClick={() => {
                  setShowModal(false);
                  setViewAssetId(null);
                }}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              {/* Display asset details here */}
              {selectedAsset ? (
                Object.entries(selectedAsset).map(([key, value]) => {
                  if (
                    key === "created_at" ||
                    key === "updated_at" ||
                    key === "id" ||
                    key === "attachments"
                  ) {
                    return null;
                  }
                  return (
                    <p key={key}>
                      <strong>{formatKey(key)}:</strong> {value}
                    </p>
                  );
                })
              ) : (
                <p>No details available for this asset.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;
};

export default ViewData;

const formatKey = (key) => {
  return key
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
};
