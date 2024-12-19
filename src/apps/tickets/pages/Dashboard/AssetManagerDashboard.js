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
import style from "./AssetManagerDashboard.module.css";

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
      const url = `${API_END_POINTS.assets}${asset.id}/`;
      const response = await deleteProtected(url);
      if (response) {
        setAssets((prevAssets) => prevAssets.filter((a) => a.id !== asset.id)); // Renamed `asset` to `a`
        alert("Asset deleted successfully!");
      }
    } catch (e) {
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
      <StatCard />

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

        <button className="btn-create" onClick={() => setShowModal(true)}>
          <FaPlus /> Create Asset
        </button>
      </div>

      {/* Assets Table */}
      <div className={style["assets-table-container"]}>
        <table className={style["assets-table"]}>
          <thead>
            <tr>
              <th>Asset ID</th>
              <th>Description</th>
              <th>Status</th>
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
                <td>{asset.description}</td>
                <td>
                  <div
                    className={`${style["status-badge"]} ${
                      style[
                        asset.status === "Miete"
                          ? "completed"
                          : asset.status === "Used"
                          ? "in_progress"
                          : "new"
                      ]
                    }`}
                    // style={{
                    //   width: "max-content",
                    //   padding: "2px 10px",
                    //   borderRadius: "50px",
                    //   backgroundColor: "rgb(191 223 251)",
                    //   color: "#0052cc",
                    // }}
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
                  <div className={style["action-buttons"]}>
                    <button
                      className={style["btn-view"]}
                      onClick={() => handleViewAsset(asset.id)}
                    >
                      <FaEye />
                    </button>
                    <button
                      className={style["btn-edit"]}
                      onClick={() => {
                        setSelectedAsset(asset);
                        setShowEditModal(true);
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className={style["btn-delete"]}
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
      <CreateAssetModal show={showModal} onClose={setShowModal} />
    </div>
  );
};

export default AssetManagerDashboard;

const formatKey = (key) => {
  return key
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
};
