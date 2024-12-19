import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { patchProtected } from "../../network/ApiService";
import { API_END_POINTS } from "../../network/apiEndPoint";
import { toast } from "react-toastify";



const AssetUpdateModal = ({ selectedAsset, setShowEditModal, setSelectedAsset, setAssets, showEditModal }) => {
  const [loading, setLoading] = useState(false);

  const handleUpdateAsset = async (AssetId, updatedData) => {
    setLoading(true); // Set loading state to true while the update request is in progress

    try {
      // Ensure the status is in the correct format
      const formattedData = {
        ...updatedData,
        status: updatedData.status,
      };

      const response = patchProtected(
        `${API_END_POINTS.assets}${AssetId}/`,
        formattedData
      );

      setAssets((prevAssets) =>
        prevAssets.map((asset) =>
          asset.Asset_id === AssetId ? { ...asset, ...response } : asset
        )
      );

      if (selectedAsset?.Asset_id === AssetId) {
        setSelectedAsset(response);
      }

      setShowEditModal(false); // Close the modal after updating
      toast.success("Asset updated successfully!");
    } catch (error) {
      setLoading(false); // Ensure loading state is reset in case of error
      console.error("Error updating asset:", error.response?.data || error.message);
      toast.error("Failed to update asset. Please try again.");
    } finally {
      setLoading(false); // Reset loading state after the operation
    }
  };

  return (
    showEditModal && selectedAsset && (
      <div className="modal-backdrop">
        <div className="modal-content">
          <div className="modal-header">
            <button
              className="close-button"
              onClick={() => setShowEditModal(false)}
            >
              <FaTimes />
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateAsset(selectedAsset.id, selectedAsset);
            }}
          >
            <div className="modal-body">
              <div className="form-group">
                <label>Status</label>
                <select
                  value={selectedAsset.status}
                  onChange={(e) => {
                    setSelectedAsset((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }));
                  }}
                >
                  <option value="">Status</option>
                  <option value="New">New</option>
                  <option value="Used">Used</option>
                  <option value="Miete">Short Term Hire</option>
                </select>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={selectedAsset.internal_notes || ""}
                  onChange={(e) =>
                    setSelectedAsset({
                      ...selectedAsset,
                      internal_notes: e.target.value,
                    })
                  }
                  rows="4"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-cancel"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

export default AssetUpdateModal;
