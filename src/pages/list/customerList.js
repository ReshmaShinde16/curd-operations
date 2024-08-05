import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./customerList.css";

const CustomerList = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const storedCustomers = JSON.parse(localStorage.getItem("customers")) || [];
    console.log("Customers fetched from localStorage:", storedCustomers);
    setCustomers(storedCustomers);
  }, []);

  const handleEditForm = (index) => {
    navigate(`/customer-form/${index}`);
  };

  const handleDeleteForm = (index) => {
    const updatedCustomers = customers.filter((_, i) => i !== index);
    localStorage.setItem("customers", JSON.stringify(updatedCustomers));
    setCustomers(updatedCustomers);
  };

  return (
    <div className="outer-box">
      <div className="top-bar">
        <div className="heading-title">Customer List</div>
        <button
          className="add-customer-button"
          onClick={() => navigate("/customer-form")}
        >
          Add New Customer
        </button>
      </div>
      <div className="table-main-div">
        <table className="table-main">
          <thead>
            <tr>
              <th>PAN</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Mobile Number</th>
              <th>Addresses</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length > 0 ? (
              customers.map((customer, index) => (
                <tr key={index}>
                  <td>{customer.pan}</td>
                  <td>{customer.fullName}</td>
                  <td>{customer.email}</td>
                  <td>{customer.mobileNumber}</td>
                  <td>
                    {customer.addresses.map((address, addrIndex) => (
                      <div key={addrIndex}>
                        {address.addressLine1}, {address.addressLine2},{" "}
                        {address.city}, {address.state} - {address.postcode}
                      </div>
                    ))}
                  </td>
                  <td>
                    <button className="edit" onClick={() => handleEditForm(index)}>
                      Edit
                    </button>
                    <button
                      className="delete"
                      onClick={() => handleDeleteForm(index)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No customers available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerList;
