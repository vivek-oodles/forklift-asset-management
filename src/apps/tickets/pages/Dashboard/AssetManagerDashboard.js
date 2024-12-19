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
import InputField from "../../../../SharedComponent/Fields/InputField";
import TextareaField from "../../../../SharedComponent/Fields/TextareaField";
import SelectField from "../../../../SharedComponent/Fields/SelectField";
import Button from "../../../../SharedComponent/Button/Button";
import StatCard from "../../../../SharedComponent/Dashboard/StatCard";
import {
  getProtected,
  patchProtected,
} from "../../../../network/ApiService";
import { objectToQueryParams } from "../../../../utils/commonHelper";
import { toast } from "react-toastify";
import CreateAssetModal from "../../../../components/common/CreateAssetModal";

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
  const [showModal, setShowModal] = useState(false);

  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    category: "",
  });
  const [CurrentPage, setCurrentPage] = useState(0);
  const [newAsset, setNewAsset] = useState({ ...initialAssests });
  const [searchQuery, setSearchQuery] = useState("");
  const [dashboardData, setDashboardData] = useState({
    total_assets: 0,
    assets_under_maintenance: 0,
    used_status: 0,
    miete: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewAsset((pre) => ({ ...pre, [name]: value }));
  };

  // Retrieve user role from local storage or context
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole"); // Assuming role is stored in local storage
    setUserRole(role);
  }, []);

  // Fetch assigned assets
  const fetchAssets = async () => {
    try {
      setShowLoader(true);
      const query = {
        page: CurrentPage + 1,
        page_size: limit,
      };
      if (filters.status) query.status = filters.status;
      if (searchQuery !== undefined || searchQuery !== null) {
        if (!isNaN(parseInt(searchQuery?.[0]))) {
          query.asset_id = searchQuery;
        } else if (searchQuery?.length > 0) {
          query.description = searchQuery;
        }
      }
      const newQuery = objectToQueryParams(query);
      const url = `${API_END_POINTS.assets}?${newQuery}`;
      const response = await getProtected(url);
      if (response) {
        setAssets(response.results);
        setAssetCount(response.count);
        setShowLoader(false);
      }
    } catch (e) {
      const message = e?.response?.data?.messages;
      if (message && message?.[0]?.message) {
        toast.error(message[0].message);
      }
      setShowLoader(false);
    } finally {
      setShowLoader(false);
    }
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
    try {
      const url = API_END_POINTS.dashboard;
      const response = await getProtected(url);
      if (response) {
        setDashboardData({
          total_assets: response?.total_assets,
          assets_under_maintenance: response?.assets_under_maintenance,
          used_status:
            response?.assets_by_status?.find((item) => item?.status === "Used")
              ?.count || 0,
          miete:
            response?.assets_by_status?.find((item) => item?.status === "Miete")
              ?.count || 0,
        });
      }
    } catch (e) {
      console.log(e);
      const message = e?.response?.data?.messages;
      if (message && message?.[0]?.message) {
        toast.error(message[0].message);
      }
    }
  };

  // Handle asset update
  const handleUpdateAsset = async (AssetId, updatedData) => {
    try {
      // Ensure the status is in the correct format
      const formattedData = {
        ...updatedData,
        status: updatedData.status,
      };

      const response = await patchProtected(
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

      setShowEditModal(false);
      toast.success("asset updated successfully!");
    } catch (error) {
      console.error(
        "Error updating asset:",
        error.response?.data || error.message
      );
      toast.error("Failed to update asset. Please try again.");
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
      <div className="stats-grid" style={{width:"100%"}}>
          <StatCard
            icon={FaCubes}
            value={dashboardData.total_assets}
            label="Total Asset"
            iconClass={"total"}
          />
        
          <StatCard
            icon={FaCalendarAlt}
            value={dashboardData.assets_under_maintenance}
            label="Under Maintenance"
            iconClass={"new"}
          />
        
        
          <StatCard
            icon={FaExclamationTriangle}
            value={dashboardData.used_status}
            label="Used assets"
            iconClass={"progress"}
          />
        
        
          <StatCard
            icon={FaShieldAlt}
            value={dashboardData.miete}
            label="Short Term Hired"
            iconClass={"completed"}
          />
        
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
          onClick={() => setShowModal(true)}
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
              <th style={{ width: "160px" }}>Status</th>
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
                <td style={{ width: "160px" }}>
                  <div
                    style={{
                      width: "max-content",
                      padding: "2px 10px",
                      borderRadius: "50px",
                      backgroundColor: "rgb(191 223 251)",
                      color: "#0052cc",
                    }}
                  >
                    {asset.status === "Miete"
                      ? "Short Term Hired"
                      : asset.status}
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
      )}
      {/* Create Asset Modal */}
      {/* {showCreateAssetModal && (
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
                <InputField
                  name="brand"
                  value={newAsset.brand}
                  onChange={handleChange}
                  required
                  label="Brand"
                  placeholder="Enter Brand"
                />
                <InputField
                  name="model"
                  value={newAsset.model}
                  onChange={handleChange}
                  required
                  label="Model"
                  placeholder="Enter Model"
                />
                <TextareaField
                  name="description"
                  value={newAsset.description}
                  onChange={handleChange}
                  required
                  label="Description"
                  placeholder="Enter Description"
                />
                <InputField
                  type="date"
                  name="purchase_date"
                  value={newAsset.purchase_date}
                  onChange={handleChange}
                  required
                  label="Purchase Date"
                  placeholder="Enter Purchase Date"
                />
                <InputField
                  name="warehouse"
                  value={newAsset.warehouse}
                  onChange={handleChange}
                  label="Warehouse"
                  placeholder="Enter Warehouse"
                />
                <InputField
                  type="number"
                  name="year_of_manufacture"
                  value={newAsset.year_of_manufacture}
                  onChange={handleChange}
                  required
                  label="Year of Manufacture"
                  placeholder="Enter Year of Manufacture"
                />
                <InputField
                  type="number"
                  name="battery"
                  value={newAsset.battery}
                  onChange={handleChange}
                  required
                  label="Battery"
                  placeholder="Enter Battery"
                />
                <InputField
                  type="date"
                  name="battery_charge_due_date"
                  value={newAsset.battery_charge_due_date}
                  onChange={handleChange}
                  required
                  label="Battery Charge Due Date"
                  placeholder="Enter Battery Charge Due Date"
                />
                <InputField
                  type="number"
                  name="capacity"
                  value={newAsset.capacity}
                  onChange={handleChange}
                  required
                  label="Capacity"
                  placeholder="Enter Capacity"
                />
                <InputField
                  type="number"
                  name="operating_hours"
                  value={newAsset.operating_hours}
                  onChange={handleChange}
                  required
                  label="Operating Hours"
                  placeholder="Enter Operating Hours"
                />
                <InputField
                  type="date"
                  name="warranty_expiration_date"
                  value={newAsset.warranty_expiration_date}
                  onChange={handleChange}
                  label="Warranty Expiration Date"
                  placeholder="Enter Warranty Expiration Date"
                />
                <SelectField
                  name="fuel_type"
                  value={newAsset.fuel_type}
                  onChange={handleChange}
                  label="Fuel Type"
                  placeholder="Enter Fuel Type"
                  menus={[
                    { value: "", option: "Select" },
                    { value: "Diesel", option: "Diesel" },
                    { value: "Electric", option: "Electric" },
                    { value: "Hybrid", option: "Hybrid" },
                  ]}
                />
                <TextareaField
                  name="notes"
                  value={newAsset.notes}
                  onChange={handleChange}
                  label="Notes"
                  placeholder="Enter Notes"
                />
                <TextareaField
                  name="battery_description"
                  value={newAsset.battery_description}
                  onChange={handleChange}
                  label="Battery Description"
                  placeholder="Enter Battery Description"
                />
                <InputField
                  type="number"
                  name="fuel_consumption"
                  value={newAsset.fuel_consumption}
                  onChange={handleChange}
                  label="Fuel Consumption"
                  placeholder="Enter Fuel Consumption"
                />
                <InputField
                  name="lease_company"
                  value={newAsset.lease_company}
                  onChange={handleChange}
                  label="Lease Company"
                  placeholder="Enter Lease Company"
                />
                <InputField
                  type="number"
                  name="machine_category"
                  value={newAsset.machine_category}
                  onChange={handleChange}
                  label="Machine Category"
                  placeholder="Enter Machine Category"
                />
                <InputField
                  type="number"
                  name="maintenance_costs"
                  value={newAsset.maintenance_costs}
                  onChange={handleChange}
                  label="Maintenance Costs"
                  placeholder="Enter Maintenance Costs"
                />
                <InputField
                  name="operational_status"
                  value={newAsset.operational_status}
                  onChange={handleChange}
                  label="Operational Status"
                  placeholder="Enter Operational Status"
                />
                <InputField
                  type="number"
                  name="purchase_price"
                  value={newAsset.purchase_price}
                  onChange={handleChange}
                  label="Purchase Price"
                  placeholder="Enter Purchase Price"
                />
                <InputField
                  type="number"
                  name="residual_value"
                  value={newAsset.residual_value}
                  onChange={handleChange}
                  label="Residual Value"
                  placeholder="Enter Residual Value"
                />
                <InputField
                  name="serial_number"
                  value={newAsset.serial_number}
                  onChange={handleChange}
                  label="Serial Number"
                  placeholder="Enter Serial Number"
                />
                <SelectField
                  name="status"
                  value={newAsset.status}
                  onChange={handleChange}
                  label="Status"
                  placeholder="Enter Status"
                  menus={[
                    { value: "", option: "Select" },
                    { value: "New", option: "New" },
                    { value: "Used", option: "Used" },
                    { value: "Miete", option: "Short Term Hire" },
                  ]}
                />
                <InputField
                  type="number"
                  name="total_operating_costs"
                  value={newAsset.total_operating_costs}
                  onChange={handleChange}
                  label="Total Operating Costs"
                  placeholder="Enter Total Operating Costs"
                />
                <InputField
                  type="date"
                  name="uvv_due_date"
                  value={newAsset.uvv_due_date}
                  onChange={handleChange}
                  label="UVV_Due_Date"
                  placeholder="Enter UVV_Due_Date"
                />
              </div>

              <div className="modal-footer">
                <Button
                  variant="close"
                  onClick={() => setShowCreateAssetModal(false)}
                >Cancel</Button>
                <Button type="submit" >Create Asset</Button>
              </div>
            </form>
          </div>
        </div>
      )} */}
        <CreateAssetModal
          show={showModal}
          onClose={setShowModal}
        />

    </div>
  );
};

export default AssetManagerDashboard;

const formatKey = (key) => {
  return key
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
};
