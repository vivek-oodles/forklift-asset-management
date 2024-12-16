import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaCubes, FaCalendarAlt , FaExclamationTriangle, FaShieldAlt , FaTimes, FaEdit, FaTrash, FaFile, FaDownload, FaPlus } from 'react-icons/fa';
import './AssetManagerDashboard.css';
import { API_END_POINTS } from '../../../network/apiEndPoint';

const AssetManagerDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [assetCount ,  setAssetCount] =  useState(0);
  const [overDueMaintenance, setOverDueMaintenance] = useState(0);
  const [currMonthCount, setCurrMonthCount] = useState(0);
  const [warranty ,  setWarranty] =  useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState({});
  const [showViewModal, setShowViewModal] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [showCreateAssetModal, setShowCreateAssetModal] = useState(false);
  const [assets, setAssets] = useState([]);
  const [showCreateAssetsModal, setShowCreateAssetsModal] = useState(false);

  const [newAsset, setNewAsset] = useState({
  "description": "",
  "brand": "",
  "model": "",
  "machine_category": 1,
  "year_of_manufacture": 2020,
  "lift_height": 5.5,
  "capacity": 2500,
  "mast": "Triple",
  "closed_height": 2.2,
  "purchase_date": "",
  "purchase_price": 25000.00,
  "battery": "4000 mah",
  "battery_description": "Lithium-ion battery",
  "battery_charge_due_date": "2023-12-01",
  "locations": [1],
  "status": "New",
  "condition": "New",
  "operating_hours": 0,
  "maintenance_schedule": "",
  "last_maintenance": "2023-09-01",
  "next_maintenance": "2023-12-01",
  "maintenance_costs": 500.00,
  "warranty": "1 year",
  "warranty_expiration_date": "",
  "operational_status": "Operational",
  "fuel_type": 2,
  "fuel_consumption": 3.5,
  "uvv_due_date": "2024-06-15",
  "notes": "Requires regular check-up",
  "depreciation_method": 1,
  "useful_life": 10,
  "residual_value": 5000.00,
  "lease_company": "Leasing Co.",
  "annual_depreciation_cost": 2000.00,
  "total_operating_costs": 3000.00,
  "assignment": 1,
  "serial_number": "SN0002",
  "owner": 9,
  "warehouse":1
  });

  // Retrieve user role from local storage or context
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const role = localStorage.getItem('userRole'); // Assuming role is stored in local storage
    setUserRole(role);
  }, []);

  // Fetch assigned assets
  useEffect(() => {  
    const token = localStorage.getItem('access');
    
    if (!token) {
      console.error('No access token found');
      setError('Authentication required');
      setShowLoader(false);
      return;
    }
    setShowLoader(false);
  
    setShowLoader(true);
    axios.get(API_END_POINTS.assets, {   
       headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "69420",}  
     })
     .then(response => { 
       console.log("data=>",response.data)
       const data = response.data.results
       setAssets(response.data.results);
       setAssetCount(response.data.count)
       setShowLoader(false);  
     })
     .catch(err => { 
       console.error('Error fetching assets:', err.response ? err.response.data : err.message); 
       setError('Failed to fetch assets'); 
       setShowLoader(false); 
       
     }); 
  }, []); 

  useEffect(() => {  
    const token = localStorage.getItem('access');
    
    if (!token) {
      console.error('No access token found');
      setError('Authentication required');
      setShowLoader(false);
      return;
    }
    setShowLoader(false);
  
    setShowLoader(true);
    axios.get(API_END_POINTS.assets, {   
       headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "69420", }  
     })
     .then(response => { 
       console.log("data2=>", response.data);
const data = response.data.results;

let overDueMaintenance = 0;
let currMonthCount = 0;

const today = new Date();
const currYear = today.getFullYear();
const currMonth = today.getMonth() + 1; // getMonth() is zero-based, so add 1
const currDate = today.getDate();

data?.forEach((ele) => {
  const nextMaintenance = ele.maintenance_due_date; // Example: "2023-12-01"
  if (nextMaintenance) {
    const [year, month, day] = nextMaintenance.split('-').map(Number); // Parse into integers

    if (year === currYear && month === currMonth) {
      if (currDate > day) {
        // Current date has passed the maintenance due date
        overDueMaintenance += 1;
      } else {
        // Maintenance is due later in the same month
        currMonthCount += 1;
      }
    } else if (year < currYear || (year === currYear && month < currMonth)) {
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
     .catch(err => { 
       console.error('Error fetching assets:', err.response ? err.response.data : err.message); 
       setError('Failed to fetch assets'); 
       setShowLoader(false); 
       
     }); 
  }, []); 

  // Handle asset update
  const handleUpdateAsset = async (AssetId, updatedData) => {
    const token = localStorage.getItem('access');
    try {
      // Ensure the status is in the correct format
      const formattedData = {
        ...updatedData,
        status: updatedData.status.toLowerCase()
      };

      console.log('Updating asset with data:', formattedData);

      const response = await axios.put(
        `http://127.0.0.1:8000/assets/${AssetId}/`,
        formattedData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Server response:', response.data);
      
      // Update the assets state with the new data
      setAssets(prevAssets => 
        prevAssets.map(asset => 
          asset.Asset_id === AssetId 
            ? { ...asset, ...response.data }
            : asset
        )
      );
      
      // Update selected asset if modal is open
      if (selectedAsset?.Asset_id === AssetId) {
        setSelectedAsset(response.data);
      }
      
      setShowEditModal(false);
      alert('asset updated successfully!');
    } catch (error) {
      console.error('Error updating asset:', error.response?.data || error.message);
      alert('Failed to update asset. Please try again.');
    }
  };

  // Handle asset deletion
  const handleDeleteAsset = async (asset) => {
    console.log('Deleting asset:', asset);  // Log the asset that is being deleted
  
    if (!window.confirm('Are you sure you want to delete this asset?')) {
      return;
    }
  
    const token = localStorage.getItem('access');
    try {
      // Corrected URL string interpolation and Authorization header
      console.log('Making DELETE request to:', `http://127.0.0.1:8000/api/assets/${asset.id}/`); // Log the URL for DELETE request
  
      await axios.delete(`http://127.0.0.1:8000/api/assets/${asset.id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      setAssets(prevAssets => prevAssets.filter(a => a.id !== asset.id)); // Renamed `asset` to `a`
      alert('Asset deleted successfully!');
  
    } catch (error) {
      console.error('Error deleting asset:', error);
      alert('Failed to delete asset. Please try again.');
    }
  };
  
  

  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [CurrentPage, setCurrentPage] = useState(1);
  const perPageData = 5;
  const total = assets?.length ? assets.length/perPageData : 0;

  const next = ()=>{
    if(CurrentPage<total){
      setCurrentPage((prev)=>prev+1)
    }
  }
  const prev = ()=>{
    if(CurrentPage>1){
      setCurrentPage((prev)=>prev-1)
    }
  }
 
  const filteredData = assets?.slice((CurrentPage - 1) * perPageData, CurrentPage * perPageData);

  const query = searchQuery.toLowerCase();
  assets?.filter(asset => {
    
     const matchesSearch = 
       asset.id.toString().toLowerCase().includes(query) ||
       asset.title.toLowerCase().includes(query);
      
     const matchesStatus = 
       filters.status === '' || asset.model === filters.status;
      
     const matchesPriority = 
       filters.priority === '' || asset.brand === filters.priority;
      
     const matchesCategory = 
       filters.category === '' || asset.name === filters.category;
      
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;;
  });

  const [dashboardStats, setDashboardStats] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    completed: 0
  });

  // useEffect(() => {
    // const response = await axios.get('/dashboard/kpi',{})
    // const assets = response.data
  //   const newStats = {
  //     total: assets.total,
  //     new: assets.new,
  //     inProgress: assets.filter(t => t.status.toLowerCase() === 'in_progress').length,
  //     completed: assets.filter(t => t.status.toLowerCase() === 'completed').length
  //   };
  //   setDashboardStats(newStats);
  // }, [assets]);



  // Add create asset handler
  // Function to handle asset creation
  
   const handleCreateAsset = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access');
    const managerName = localStorage.getItem('userName'); // Get manager's name from localStorage

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/assets/create/',
        {
          ...newAsset,
          customer_name: managerName
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Add new ticket to the list
      setAssets(prevTickets => [...prevTickets, response.data]);
      setShowCreateAssetsModal(false);
      setNewAsset({
       "description": "",
  "brand": "",
  "model": "",
  "machine_category": 1,
  "year_of_manufacture": 2020,
  "lift_height": 5.5,
  "capacity": 2500,
  "mast": "Triple",
  "closed_height": 2.2,
  "purchase_date": "",
  "purchase_price": 25000.00,
  "battery": "4000 mah",
  "battery_description": "Lithium-ion battery",
  "battery_charge_due_date": "2023-12-01",
  "locations": [1],
  "status": "New",
  "condition": "New",
  "operating_hours": 0,
  "maintenance_schedule": "",
  "last_maintenance": "2023-09-01",
  "next_maintenance": "2023-12-01",
  "maintenance_costs": 500.00,
  "warranty": "1 year",
  "warranty_expiration_date": "",
  "operational_status": "Operational",
  "fuel_type": 2,
  "fuel_consumption": 3.5,
  "uvv_due_date": "2024-06-15",
  "notes": "Requires regular check-up",
  "depreciation_method": 1,
  "useful_life": 10,
  "residual_value": 5000.00,
  "lease_company": "Leasing Co.",
  "annual_depreciation_cost": 2000.00,
  "total_operating_costs": 3000.00,
  "assignment": 1,
  "serial_number": "SN0002",
  "owner": 9,
  "warehouse":1
      });
      setShowCreateAssetModal(false);
    } catch (error) {
      console.error('Error creating asset:', error);
  
      if (error.response) {
        console.log("Backend Error Response:", error.response.data);
      }
  
      alert('Failed to create asset. Please try again.');
    }
  };

  //// view
  
  
  const handleViewAsset = async (asset) => {
    setShowViewModal(true);
    setIsViewLoading(true);
    
    const token = localStorage.getItem('access');
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/assets/${asset}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedAsset(response.data);
      console.log("hello this is daa", response.data);
    } catch (error) {
      console.error('Error fetching asset details:', error);
      alert('Failed to load asset details. Please try again.');
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
    <div className="dashboard-container" style={{height: "autio !important"}}>
      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <FaCubes />
          </div>
          <div className="stat-details">
            <span className="stat-value">{assetCount}</span>
            <span className="stat-label">Total Asset</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon new">
          <FaCalendarAlt />
          </div>
          <div className="stat-details">
            <span className="stat-value">{currMonthCount}</span>
            <span className="stat-label">Maintenance Deadlines</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon progress">
          <FaExclamationTriangle />
          </div>
          <div className="stat-details">
            <span className="stat-value">{overDueMaintenance}</span>
            <span className="stat-label">Maintenance overdue</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon completed">
          <FaShieldAlt />
          </div>
          <div className="stat-details">
            <span className="stat-value">{warranty}</span>
            <span className="stat-label">Warranty</span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="controls-section">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search by Asset ID or Title..." 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filters">
          <select 
            className="filter-select"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="">Status</option>
            <option value="new">New</option>
            <option value="active">Active</option>
          </select>

          <select 
            className="filter-select"
            value={filters.priority}
            onChange={(e) => setFilters({...filters, priority: e.target.value})}
          >
            <option value="">Priority</option>
            <option value="high">High</option>
            <option value="middle">Medium</option>
            <option value="low">Low</option>
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
      <tr>
        <th>Asset ID</th>
        <th>Description</th>
        <th>Status</th>
        <th>Brand</th>
        <th>Model</th>
        <th>Purchase Date</th>
        <th>Maintenance</th>
        <th>Operating Hour</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {filteredData?.map((asset) => (
        <tr key={asset.id}>
          <td>{asset.id}</td>
          <td style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis" }}>
          {asset.description}
          </td>
          <td>{asset.status}</td>
          <td>{asset.brand}</td>
          <td>{asset.model}</td>
          <td>{asset.purchase_date}</td>
          <td>{asset.maintenance_due_date}</td>
          <td>{asset.operating_hours}</td>
          <td>
            <div className="action-buttons">
              <button 
                className="btn-view" 
                onClick={() => handleViewAsset(asset.id)}
              >
                View
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
                onClick={() => handleDeleteAsset(asset)}  // Pass the full asset object
              >
              <FaTrash />
              </button>

            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
        <div style={{
          display: 'flex',
          width: '100%',
          justifyContent: 'space-around'
        }}>
          <button onClick={prev}>Previous</button>
          <button onClick={next}>Next</button>
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
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateAsset(selectedAsset.id, selectedAsset);
            }}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={selectedAsset.status}
                    onChange={(e) => {
                      setSelectedAsset(prev => ({
                        ...prev,
                        status: e.target.value
                      }));
                    }}
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="waiting_customer">Waiting on Customer</option>
                    <option value="rejected">Rejected</option>
                    <option value="resolved">Resolved</option>
                    <option value="reopened">Reopened</option>
                    <option value="escalated">Escalated</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={selectedAsset.internal_notes || ''}
                    onChange={(e) => setSelectedAsset({
                      ...selectedAsset,
                      internal_notes: e.target.value
                    })}
                    rows="4"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
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
                <p><strong>Brand:</strong> {selectedAsset.brand}</p>
                <p><strong>Description:</strong> {selectedAsset.description}</p>
                <p><strong>Condition:</strong> {selectedAsset.condition}</p>
                <p><strong>Capacity:</strong> {selectedAsset.capacity} kg</p>
                <p><strong>Closed Height:</strong> {selectedAsset.closed_height} m</p>
                <p><strong>Fuel Type:</strong> {selectedAsset.fuel_type === "1" ? "Diesel" : "Electric"}</p>
                <p><strong>Fuel Consumption:</strong> {selectedAsset.fuel_consumption} L/hour</p>
                <p><strong>Depreciation Method:</strong> {selectedAsset.depreciation_method}</p>
                <p><strong>Last Maintenance:</strong> {selectedAsset.last_maintenance}</p>
                <p><strong>Battery:</strong> {selectedAsset.battery} ({selectedAsset.battery_description})</p>
                <p><strong>Battery Charge Due Date:</strong> {selectedAsset.battery_charge_due_date}</p>
                <p><strong>Lease Company:</strong> {selectedAsset.lease_company}</p>
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
          {/* Brand */}
          <div className="form-group">
            <label>Brand *</label>
            <input
              type="text"
              value={newAsset.brand}
              onChange={(e) => setNewAsset({...newAsset, brand: e.target.value})}
              required
            />
          </div>

          {/* Model */}
          <div className="form-group">
            <label>Model *</label>
            <input
              type="text"
              value={newAsset.model}
              onChange={(e) => setNewAsset({...newAsset, model: e.target.value})}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={newAsset.description}
              onChange={(e) => setNewAsset({...newAsset, description: e.target.value})}
              required
              rows="4"
            />
          </div>

          {/* Purchase Date */}
          <div className="form-group">
            <label>Purchase Date *</label>
            <input
              type="date"
              value={newAsset.purchase_date}
              onChange={(e) => setNewAsset({...newAsset, purchase_date: e.target.value})}
              required
            />
          </div>

          {/* Operating Hours */}
          <div className="form-group">
            <label>Operating Hours *</label>
            <input
              type="number"
              value={newAsset.operating_hours}
              onChange={(e) => setNewAsset({...newAsset, operating_hours: e.target.value})}
              required
            />
          </div>

          {/* Maintenance Schedule */}
          <div className="form-group">
            <label>Maintenance Schedule *</label>
            <input
              type="text"
              value={newAsset.maintenance_schedule}
              onChange={(e) => setNewAsset({...newAsset, maintenance_schedule: e.target.value})}
              required
            />
          </div>

          {/* Warranty Expiration Date */}
          <div className="form-group">
            <label>Warranty Expiration Date *</label>
            <input
              type="date"
              value={newAsset.warranty_expiration_date}
              onChange={(e) => setNewAsset({...newAsset, warranty_expiration_date: e.target.value})}
              required
            />
          </div>

          {/* Additional Fields */}
          {/* You can add more fields as per the data provided */}
        </div>

        <div className="modal-footer">
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => setShowCreateAssetModal(false)}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary"
          >
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
