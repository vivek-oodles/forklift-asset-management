import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaSearch,
  FaEye,
  FaCubes,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaShieldAlt,
  FaTimes,
  FaEdit,
  FaTrash,
  FaFile,
  FaDownload,
  FaPlus,
} from "react-icons/fa";
import "./AssetManagerDashboard.css";
import { API_END_POINTS } from "../../../../network/apiEndPoint";
import Pagination from "../../../../SharedComponent/Pagination";
import useDebounce from "../../../../hooks/useDebounce";

const initialAssests = {
  description: "",
  brand: "",
  model: "",
  machine_category: 0,
  warehouse: 0,
  year_of_manufacture: 0,
  lift_height: 0,
  capacity: 0,
  mast: "Triple",
  closed_height: 0,
  purchase_date: "",
  purchase_price: 0,
  battery: "4000 mah",
  battery_description: "0",
  battery_charge_due_date: "",
  locations: [1],
  status: "",
  condition: "New",
  operating_hours: 0,
  maintenance_schedule: "",
  maintenance_costs: 0,
  warranty: "1 year",
  warranty_expiration_date: "",
  operational_status: "",
  fuel_type: 0,
  fuel_consumption: 0,
  uvv_due_date: "",
  notes: "",
  depreciation_method: 1,
  useful_life: 0,
  residual_value: 0,
  lease_company: "",
  annual_depreciation_cost: 0,
  total_operating_costs: 0,
  serial_number: "",
};

const limit = 5;

const AssetManagerDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [assetCount, setAssetCount] = useState(0);
  const [overDueMaintenance, setOverDueMaintenance] = useState(0);
  const [currMonthCount, setCurrMonthCount] = useState(0);
  const [warranty, setWarranty] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState({});
  const [showViewModal, setShowViewModal] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [showCreateAssetModal, setShowCreateAssetModal] = useState(false);
  const [assets, setAssets] = useState([]);
  const [showCreateAssetsModal, setShowCreateAssetsModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    category: "",
  });
  const [CurrentPage, setCurrentPage] = useState(1);
  const [newAsset, setNewAsset] = useState({ ...initialAssests });
  const [searchQuery, setSearchQuery] = useState("");
  const [dashboardData, setDashboardData] = useState({
    total_assets: 0,
    assets_under_maintenance: 0,
    used_status: 0,
    miete: 0,
  });

  // Retrieve user role from local storage or context
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole"); // Assuming role is stored in local storage
    setUserRole(role);
  }, []);

  // Fetch assigned assets
  const fetchAssets = async () => {
    const token = localStorage.getItem("access");
    let search = "";
    if (searchQuery !== undefined || searchQuery !== null) {
      if (!isNaN(parseInt(searchQuery?.[0]))) {
        search = `asset_id=${searchQuery}`;
      } else if (searchQuery?.length > 0) {
        search = `description=${searchQuery}`;
      }
    }
    if (!token) {
      console.error("No access token found");
      setError("Authentication required");
      setShowLoader(false);
      return;
    }

    setShowLoader(true);
    axios
      .get(
        API_END_POINTS.assets +
          `?${search}&page=${CurrentPage + 1}&page_size=${limit}${
            filters.status ? "&status=" + filters.status : ""
          }`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "69420",
          },
        }
      )
      .then((response) => {
        console.log("data=>", response.data);
        const data = response.data.results;
        setAssets(response.data.results);
        setAssetCount(response.data.count);
        setShowLoader(false);

        let overDueMaintenance = 0;
        let currMonthCount = 0;

        const today = new Date();
        const currYear = today.getFullYear();
        const currMonth = today.getMonth() + 1; // getMonth() is zero-based, so add 1
        const currDate = today.getDate();

        data?.forEach((ele) => {
          const nextMaintenance = ele.maintenance_due_date; // Example: "2023-12-01"
          if (nextMaintenance) {
            const [year, month, day] = nextMaintenance.split("-").map(Number); // Parse into integers

            if (year === currYear && month === currMonth) {
              if (currDate > day) {
                // Current date has passed the maintenance due date
                overDueMaintenance += 1;
              } else {
                // Maintenance is due later in the same month
                currMonthCount += 1;
              }
            } else if (
              year < currYear ||
              (year === currYear && month < currMonth)
            ) {
              // Handle overdue maintenance for previous months/years
              overDueMaintenance += 1;
            }
          }
        });

        console.log("Overdue Maintenance:", overDueMaintenance);
        console.log("Maintenance Due This Month:", currMonthCount);
        setOverDueMaintenance(overDueMaintenance);
        setCurrMonthCount(currMonthCount);
      })
      .catch((err) => {
        console.error(
          "Error fetching assets:",
          err.response ? err.response.data : err.message
        );
        setError("Failed to fetch assets");
        setShowLoader(false);
      });
  };

  useEffect(() => {
    fetchAssets();
  }, [CurrentPage, filters.status]);

  const debouncedQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (debouncedQuery !== undefined || debouncedQuery !== null) {
      setCurrentPage((pre) => 0);
      fetchAssets();
    }
  }, [debouncedQuery]);

  useEffect(() => {
    getDashboard();
  }, []);

  const getDashboard = async () => {
    const token = localStorage.getItem("access");

    if (!token) {
      setError("Authentication required");
      setShowLoader(false);
      return;
    }

    setShowLoader(true);
    axios
      .get(API_END_POINTS.dashboard, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "69420",
        },
      })
      .then((response) => {
        const data = response.data;
        if (data) {
          setDashboardData({
            total_assets: data?.total_assets,
            assets_under_maintenance: data?.assets_under_maintenance,
            used_status:
              data?.assets_by_status?.find((item) => item?.status === "Used")
                ?.count || 0,
            miete:
              data?.assets_by_status?.find((item) => item?.status === "Miete")
                ?.count || 0,
          });
        }
        setShowLoader(false);
      });
  };

  // Handle asset update
  const handleUpdateAsset = async (AssetId, updatedData) => {
    const token = localStorage.getItem("access");
    try {
      // Ensure the status is in the correct format
      const formattedData = {
        ...updatedData,
        status: updatedData.status,
      };

      // console.log("Updating asset with data:", formattedData);

      const response = await axios.patch(
        `${API_END_POINTS.assets}${AssetId}/`,
        formattedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Server response:", response.data);

      // Update the assets state with the new data
      setAssets((prevAssets) =>
        prevAssets.map((asset) =>
          asset.Asset_id === AssetId ? { ...asset, ...response.data } : asset
        )
      );

      // Update selected asset if modal is open
      if (selectedAsset?.Asset_id === AssetId) {
        setSelectedAsset(response.data);
      }

      setShowEditModal(false);
      alert("asset updated successfully!");
    } catch (error) {
      console.error(
        "Error updating asset:",
        error.response?.data || error.message
      );
      alert("Failed to update asset. Please try again.");
    }
  };

  // Handle asset deletion
  const handleDeleteAsset = async (asset) => {
    console.log("Deleting asset:", asset); // Log the asset that is being deleted

    if (!window.confirm("Are you sure you want to delete this asset?")) {
      return;
    }

    const token = localStorage.getItem("access");
    try {

      await axios.delete(`${API_END_POINTS.assets}${asset.id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAssets((prevAssets) => prevAssets.filter((a) => a.id !== asset.id)); // Renamed `asset` to `a`
      alert("Asset deleted successfully!");
    } catch (error) {
      console.error("Error deleting asset:", error);
      alert("Failed to delete asset. Please try again.");
    }
  };

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access");
    const managerName = localStorage.getItem("userName"); // Get manager's name from localStorage

    try {
      const payload = {
        ...newAsset,
        customer_name: managerName,
      };

      const formData = new FormData();
      Object.entries(payload).map(([key, value]) => {
        formData.append(key, value);
      });
      const response = await axios.post(API_END_POINTS.createAssets, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // "Content-Type": "application/json",
        },
      });

      // Add new ticket to the list
      setAssets((prevTickets) => [...prevTickets, response.data]);
      setShowCreateAssetsModal(false);
      setNewAsset({
        ...initialAssests,
      });
      setShowCreateAssetModal(false);
    } catch (error) {
      console.error("Error creating asset:", error);

      if (error.response) {
        console.log("Backend Error Response:", error.response.data);
      }

      alert("Failed to create asset. Please try again.");
    }
  };

  //// view

  const handleViewAsset = async (asset) => {
    setShowViewModal(true);
    setIsViewLoading(true);

    const token = localStorage.getItem("access");
    try {
      const response = await axios.get(`${API_END_POINTS.assets}${asset}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedAsset(response.data);
      console.log("hello this is daa", response.data);
    } catch (error) {
      console.error("Error fetching asset details:", error);
      alert("Failed to load asset details. Please try again.");
    } finally {
      setIsViewLoading(false);
    }
  };

  // Loader while assets are being fetched or created
  if (showLoader) {
    return (
      <div className="loader-overlay">
        <div className="loader-content">
          <div className="modern-loader"></div>
          <div className="loader-text">Loading assets...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{ height: "autio !important" }}>
      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <FaCubes />
          </div>
          <div className="stat-details">
            <span className="stat-value">{dashboardData.total_assets}</span>
            <span className="stat-label">Total Asset</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon new">
            <FaCalendarAlt />
          </div>
          <div className="stat-details">
            <span className="stat-value">
              {dashboardData.assets_under_maintenance}
            </span>
            <span className="stat-label" title="Under Maintenance">
              Under Maintenance
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon progress">
            <FaExclamationTriangle />
          </div>
          <div className="stat-details">
            <span className="stat-value">{dashboardData.used_status}</span>
            <span className="stat-label" title="Used assets">
              Used assets
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon completed">
            <FaShieldAlt />
          </div>
          <div className="stat-details">
            <span className="stat-value">{dashboardData.miete}</span>
            <span className="stat-label" title="Short Term Hired">
              Short Term Hired
            </span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="controls-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by Asset ID or Decription..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filters">
          <select
            className="filter-select"
            value={filters.status}
            onChange={(e) => {
              setCurrentPage(0);
              setFilters({ ...filters, status: e.target.value });
            }}
          >
            <option value="">Status</option>
            <option value="New">New</option>
            <option value="Used">Used</option>
            <option value="Miete">Short Term Hire</option>
          </select>
        </div>

        <button
          className="btn-create"
          onClick={() => setShowCreateAssetModal(true)}
        >
          <FaPlus /> Create Asset
        </button>
      </div>

      {/* Assets Table */}
      <div className="assets-table-container">
        <table className="assets-table">
          <thead>
            <tr style={{ position: "sticky", top: 0 }}>
              <th>Asset ID</th>
              <th>Description</th>
              <th style={{ width: "100px" }}>Status</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Warehouse</th>
              <th>Purchase Date</th>
              <th>Operating Hour</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets?.map((asset) => (
              <tr key={asset.id}>
                <td>{asset.id}</td>
                <td
                  style={{
                    maxWidth: "150px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {asset.description}
                </td>
                <td style={{ width: "100px" }}>
                  <div
                    style={{
                      width: "max-content",
                      padding: "2px 10px",
                      borderRadius: "50px",
                      backgroundColor: "rgb(191 223 251)",
                      color: "#0052cc",
                    }}
                  >
                    {asset.status === "Miete"? "Short Term Hired":asset.status}
                  </div>
                </td>
                <td>{asset.brand}</td>
                <td>{asset.model}</td>
                <td style={{ textAlign: "center" }}>{asset.warehouse}</td>
                <td>{asset.purchase_date}</td>
                <td>{asset.operating_hours}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-view"
                      onClick={() => handleViewAsset(asset.id)}
                    >
                      <FaEye />
                    </button>
                    <button
                      className="btn-edit"
                      onClick={() => {
                        setSelectedAsset(asset);
                        setShowEditModal(true);
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteAsset(asset)} // Pass the full asset object
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div
          style={{
            display: "flex",
            width: "100%",
            margin: "15px 0",
            justifyContent: "space-around",
          }}
        >
          <Pagination
            totalItems={assetCount}
            setItemOffset={setCurrentPage}
            itemOffset={CurrentPage}
            limit={limit}
          />
          {/* <button onClick={prev}>Previous</button>
          <button onClick={next}>Next</button> */}
        </div>
      </div>

      {/* Modal Components - Edit, View, Create */}
      {/* Edit Modal */}
      {showEditModal && selectedAsset && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Asset</h2>
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
                  onClick={() => setShowCreateAssetModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            {isViewLoading ? (
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
                    onClick={() => setShowViewModal(false)}
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="modal-body">
                  {/* Display asset details here */}
                  {selectedAsset && Object.values(selectedAsset)?.length > 0 ? (
                    <div>
                      <p>
                        <strong>Brand:</strong> {selectedAsset.brand}
                      </p>
                      <p>
                        <strong>Model:</strong> {selectedAsset.model}
                      </p>
                      <p>
                        <strong>Description:</strong>{" "}
                        {selectedAsset.description}
                      </p>
                      <p>
                        <strong>Warehouse:</strong> {selectedAsset.warehouse}
                      </p>
                      <p>
                        <strong>Year of Manufacture:</strong>{" "}
                        {selectedAsset.year_of_manufacture}
                      </p>
                      <p>
                        <strong>Purchase Date:</strong>{" "}
                        {selectedAsset.purchase_date}
                      </p>
                      <p>
                        <strong>Battery:</strong> {selectedAsset.battery}
                      </p>
                      <p>
                        <strong>Battery Charge Due Date:</strong>{" "}
                        {selectedAsset.battery_charge_due_date}
                      </p>
                      <p>
                        <strong>Capacity:</strong>{" "}
                        {selectedAsset.capacity
                          ? `${selectedAsset.capacity} kg`
                          : ""}
                      </p>
                      <p>
                        <strong>Operating Hours:</strong>{" "}
                        {selectedAsset.operating_hours}
                      </p>
                      <p>
                        <strong>Warranty Expiration:</strong>{" "}
                        {selectedAsset.warranty_expiration_date}
                      </p>
                      <p>
                        <strong>Fuel Consumption:</strong>{" "}
                        {selectedAsset.fuel_consumption}
                      </p>
                      <p>
                        <strong>Lease Company:</strong>{" "}
                        {selectedAsset.lease_company}
                      </p>
                      <p>
                        <strong>Machine Category:</strong>{" "}
                        {selectedAsset.machine_category}
                      </p>
                      <p>
                        <strong>Maintenance Costs:</strong>{" "}
                        {selectedAsset.maintenance_costs}
                      </p>
                      {/* <p>
                        <strong>Maintenance Schedule:</strong>{" "}
                        {selectedAsset.maintenance_schedule}
                      </p> */}
                      <p>
                        <strong>Operational Status:</strong>{" "}
                        {selectedAsset.operational_status}
                      </p>
                      <p>
                        <strong>Purchase Price:</strong>{" "}
                        {selectedAsset.purchase_price}
                      </p>
                      <p>
                        <strong>Residual Value:</strong>{" "}
                        {selectedAsset.residual_value}
                      </p>
                      <p>
                        <strong>Serial Number:</strong>{" "}
                        {selectedAsset.serial_number}
                      </p>
                      <p>
                        <strong>Status:</strong> {selectedAsset.status}
                      </p>
                      <p>
                        <strong>Total Operating Costs:</strong>{" "}
                        {selectedAsset.total_operating_costs}
                      </p>
                      <p>
                        <strong>UVV Due Date:</strong>{" "}
                        {selectedAsset.uvv_due_date}
                      </p>

                      {/* Fuel Type */}
                      <p>
                        <strong>Fuel Type:</strong>
                        {selectedAsset.fuel_type === 1
                          ? "Diesel"
                          : selectedAsset.fuel_type === 2
                          ? "Electric"
                          : selectedAsset.fuel_type === 3
                          ? "Hybrid"
                          : ""}
                      </p>

                      <p>
                        <strong>Notes:</strong> {selectedAsset.notes}
                      </p>
                    </div>
                  ) : (
                    <p>No details available for this asset.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Create Asset Modal */}
      {showCreateAssetModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Asset</h2>
              <button
                className="close-button"
                onClick={() => setShowCreateAssetModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreateAsset}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Brand *</label>
                  <input
                    type="text"
                    value={newAsset.brand}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, brand: e.target.value })
                    }
                    className="close-button"
                    required
                  />
                </div>

                {/* Model */}
                <div className="form-group">
                  <label>Model *</label>
                  <input
                    type="text"
                    value={newAsset.model}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, model: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Description */}
                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    value={newAsset.description}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, description: e.target.value })
                    }
                    rows="2"
                    required
                  />
                </div>

                {/* Purchase Date */}
                <div className="form-group">
                  <label>Purchase Date *</label>
                  <input
                    type="date"
                    value={newAsset.purchase_date}
                    onChange={(e) =>
                      setNewAsset({
                        ...newAsset,
                        purchase_date: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Warehouse</label>
                  <input
                    type="text"
                    value={newAsset.warehouse || ''}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, warehouse: e.target.value })
                    }
                  />
                </div>

                {/* Year of Manufacture */}
                <div className="form-group">
                  <label>Year of Manufacture *</label>
                  <input
                    type="number"
                    value={newAsset.year_of_manufacture}
                    onChange={(e) =>
                      setNewAsset({
                        ...newAsset,
                        year_of_manufacture: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>

                {/* Battery */}
                <div className="form-group">
                  <label>Battery *</label>
                  <input
                    type="number"
                    value={newAsset.battery}
                    onChange={(e) =>
                      setNewAsset({
                        ...newAsset,
                        battery: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>

                {/* Battery Charge Due Date */}
                <div className="form-group">
                  <label>Battery Charge Due Date</label>
                  <input
                    type="date"
                    value={newAsset.battery_charge_due_date}
                    onChange={(e) =>
                      setNewAsset({
                        ...newAsset,
                        battery_charge_due_date: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Capacity */}
                <div className="form-group">
                  <label>Capacity *</label>
                  <input
                    type="number"
                    value={newAsset.capacity}
                    onChange={(e) =>
                      setNewAsset({
                        ...newAsset,
                        capacity: parseFloat(e.target.value),
                      })
                    }
                    required
                  />
                </div>

                {/* Operating Hours */}
                <div className="form-group">
                  <label>Operating Hours *</label>
                  <input
                    type="number"
                    value={newAsset.operating_hours}
                    onChange={(e) =>
                      setNewAsset({
                        ...newAsset,
                        operating_hours: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>

                {/* Warranty Expiration */}
                <div className="form-group">
                  <label>Warranty Expiration Date</label>
                  <input
                    type="date"
                    value={newAsset.warranty_expiration_date}
                    onChange={(e) =>
                      setNewAsset({
                        ...newAsset,
                        warranty_expiration_date: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Fuel Type */}
                <div className="form-group">
                  <label>Fuel Type</label>
                  <select
                    value={newAsset.fuel_type}
                    onChange={(e) =>
                      setNewAsset({
                        ...newAsset,
                        fuel_type: parseInt(e.target.value),
                      })
                    }
                  >
                    <option value="0">Select</option>
                    <option value="1">Diesel</option>
                    <option value="2">Electric</option>
                    <option value="3">Hybrid</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={newAsset.notes}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, notes: e.target.value })
                    }
                    rows="3"
                  />
                </div>

                {/* Battery Description */}
                <div className="form-group">
                  <label>Battery Description</label>
                  <input
                    type="text"
                    value={newAsset.battery_description}
                    onChange={(e) =>
                      setNewAsset({
                        ...newAsset,
                        battery_description: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Fuel Consumption */}
                <div className="form-group">
                  <label>Fuel Consumption</label>
                  <input
                    type="number"
                    value={newAsset.fuel_consumption}
                    onChange={(e) =>
                      setNewAsset({
                        ...newAsset,
                        fuel_consumption: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Lease Company */}
                <div className="form-group">
                  <label>Lease Company</label>
                  <input
                    type="text"
                    value={newAsset.lease_company}
                    onChange={(e) =>
                      setNewAsset({
                        ...newAsset,
                        lease_company: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Machine Category */}
                <div className="form-group">
                  <label>Machine Category</label>
                  <input
                    type="number"
                    value={newAsset.machine_category}
                    onChange={(e) =>
                      setNewAsset({
                        ...newAsset,
                        machine_category: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Maintenance Costs */}
                <div className="form-group">
                  <label>Maintenance Costs</label>
                  <input
                    type="number"
                    value={newAsset.maintenance_costs}
                    onChange={(e) =>
                      setNewAsset({
                        ...newAsset,
                        maintenance_costs: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Maintenance Schedule
                <div className="form-group">
                  <label>Maintenance Schedule</label>
                  <input
                    type="text"
                    value={newAsset.maintenance_schedule}
                    onChange={(e) =>
                      setNewAsset({
                        ...newAsset,
                        maintenance_schedule: e.target.value,
                      })
                    }
                  />
                </div> */}

                {/* Operational Status */}
                <div className="form-group">
                  <label>Operational Status</label>
                  <input
                    type="text"
                    value={newAsset.operational_status}
                    onChange={(e) =>
                      setNewAsset({
                        ...newAsset,
                        operational_status: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Purchase Price */}
                <div className="form-group">
                  <label>Purchase Price</label>
                  <input
                    type="number"
                    value={newAsset.purchase_price}
                    onChange={(e) =>
                      setNewAsset({
                        ...newAsset,
                        purchase_price: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Residual Value */}
                <div className="form-group">
                  <label>Residual Value</label>
                  <input
                    type="number"
                    value={newAsset.residual_value}
                    onChange={(e) =>
                      setNewAsset({
                        ...newAsset,
                        residual_value: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Serial Number */}
                <div className="form-group">
                  <label>Serial Number</label>
                  <input
                    type="text"
                    value={newAsset.serial_number}
                    onChange={(e) =>
                      setNewAsset({
                        ...newAsset,
                        serial_number: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Status */}
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={newAsset.status}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, status: e.target.value })
                    }
                  >
                    <option value="">Status</option>
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                    <option value="Miete">Short Term Hire</option>
                  </select>
                </div>

                {/* Total Operating Costs */}
                <div className="form-group">
                  <label>Total Operating Costs</label>
                  <input
                    type="number"
                    value={newAsset.total_operating_costs}
                    onChange={(e) =>
                      setNewAsset({
                        ...newAsset,
                        total_operating_costs: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>UVV_Due_Date</label>
                  <input
                    type="date"
                    value={newAsset.uvv_due_date}
                    onChange={(e) =>
                      setNewAsset({
                        ...newAsset,
                        uvv_due_date: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={() => setShowCreateAssetModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetManagerDashboard;
