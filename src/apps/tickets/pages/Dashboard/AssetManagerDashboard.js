import React, { useState, useEffect } from "react";
import { FaEye, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import "./AssetManagerDashboard.css";
import { API_END_POINTS } from "../../../../network/apiEndPoint";
import Pagination from "../../../../SharedComponent/Pagination";
import useDebounce from "../../../../hooks/useDebounce";
import StatCard from "../../../../SharedComponent/Dashboard/StatCard";
import { deleteProtected, getProtected } from "../../../../network/ApiService";
import { objectToQueryParams } from "../../../../utils/commonHelper";
import { toast } from "react-toastify";
import CreateAssetModal from "../../../../components/common/CreateAssetModal";
import AssetUpdateModal from "../../../../components/common/AssetUpdateModal";
import style from "./AssetManagerDashboard.module.css";
import ViewData from "../../../../components/common/ViewData";

const limit = 5;

const AssetManagerDashboard = () => {
  const [assetCount, setAssetCount] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState({});
  const [showLoader, setShowLoader] = useState(true);
  const [assets, setAssets] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    category: "",
  });
  const [CurrentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewAssetId, setViewAssetId] = useState(null);

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
                      onClick={() => setViewAssetId(asset.id)}
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
        </div>
      </div>

      <div>
        {/* Asset Update Modal */}
        <AssetUpdateModal
          selectedAsset={selectedAsset}
          setSelectedAsset={setSelectedAsset}
          setShowEditModal={setShowEditModal}
          showEditModal={showEditModal}
          setAssets={setAssets}
        />
      </div>
      <ViewData id={viewAssetId} setViewAssetId={setViewAssetId} />
      {/* Create Asset Modal */}
      <CreateAssetModal show={showModal} onClose={setShowModal} />
    </div>
  );
};

export default AssetManagerDashboard;
