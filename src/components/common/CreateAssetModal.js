import PropTypes from "prop-types";
import { FaTimes } from "react-icons/fa";
import style from "./style.module.css";
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import InputField from "../../SharedComponent/Fields/InputField";
import TextareaField from "../../SharedComponent/Fields/TextareaField";
import SelectField from "../../SharedComponent/Fields/SelectField";
import Button from "../../SharedComponent/Button/Button";
import { API_END_POINTS } from "../../network/apiEndPoint";
import { postProtected } from "../../network/ApiService";

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

const CreateAssetModal = ({ show, onClose, onSubmit }) => {
  const [newAsset, setNewAsset] = useState({ ...initialAssests });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewAsset((pre) => ({ ...pre, [name]: value }));
  };
  const handleCreateAsset = async (e) => {
    e.preventDefault();
    const managerName = localStorage.getItem("userName");

    try {
      const payload = {
        ...newAsset,
        customer_name: managerName,
      };

      const formData = new FormData();
      Object.entries(payload).map(([key, value]) => {
        formData.append(key, value);
      });
      const url = API_END_POINTS.createAssets;
      const response = await postProtected(url, formData, { formData: true });
      // Add new asset to the list
      if (response) {
        setNewAsset({
          ...initialAssests,
        });
        onClose(false);
      }
    } catch (e) {
      console.log(e);
      const message = e?.response?.data?.messages;
      if (message && message?.[0]?.message) {
        toast.error(message[0].message);
      }
    }
  };

  if (!show) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create New Asset</h2>
          <button className="close-button" onClick={onClose}>
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
            <SelectField
              name="warehouse"
              value={newAsset.warehouse}
              onChange={handleChange}
              label="Warehouse"
              menus={[
                { value: "", option: "Select" },
                { value: "1", option: "Warehouse 1, NY" },
              ]}
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
            <Button variant="close" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Asset</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

CreateAssetModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CreateAssetModal;
