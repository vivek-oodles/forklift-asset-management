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
  deleteProtected,
  getProtected,
  patchProtected,
} from "../../../../network/ApiService";
import { objectToQueryParams } from "../../../../utils/commonHelper";
import { toast } from "react-toastify";
import CreateAssetModal from "../../../../components/common/CreateAssetModal";
import EditAssetModal from "../../../../components/common/AssetUpdateModal";
import AssetUpdateModal from "../../../../components/common/AssetUpdateModal";

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

  // Handle asset deletion
  const handleDeleteAsset = async (asset) => {

    if (!window.confirm("Are you sure you want to delete this asset?")) {
      return;
    }
    try {
      const url = `${API_END_POINTS.assets}${asset.id}/`
      const response = await deleteProtected(url);
    if (response){
      setAssets((prevAssets) => prevAssets.filter((a) => a.id !== asset.id)); // Renamed `asset` to `a`
      alert("Asset deleted successfully!");
    } 
  }catch (e) {
      console.log(e);
      const message = e?.response?.data?.messages;
      if (message && message?.[0]?.message) {
        toast.error(message[0].message);
      }
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
       <div>
      {/* Button to open the edit modal */}
      {/* <button onClick={() => setShowEditModal(true)}>Edit Asset</button> */}

      {/* Asset Update Modal */}
      <AssetUpdateModal
        selectedAsset={selectedAsset}
        setSelectedAsset={setSelectedAsset}
        setShowEditModal={setShowEditModal}
        showEditModal={showEditModal}
        setAssets={setAssets}
      />
    </div>

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
        <CreateAssetModal
          show={showModal}
          onClose={setShowModal}
        />

    </div>
  );
};

export default AssetManagerDashboard;
