
import React, { useState } from "react";

export default function Suppliers({ suppliers = [], setSuppliers }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [product, setProduct] = useState("");

  const addSupplier = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Enter supplier name");
      return;
    }

    setSuppliers([
      ...suppliers,
      {
        id: Date.now(),
        name,
        phone,
        product,
      },
    ]);

    setName("");
    setPhone("");
    setProduct("");
  };

  return (
    <div style={{ padding: "24px" }}>
      <h1>Suppliers</h1>
      <p>Manage your business suppliers</p>

      <form onSubmit={addSupplier}>
        <input
          placeholder="Supplier Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          placeholder="Product Supplied"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
        />

        <button type="submit">Add Supplier</button>
      </form>

      <h2>Supplier List</h2>

      {suppliers.map((supplier) => (
        <div key={supplier.id}>
          <strong>{supplier.name}</strong>
          {" - "}
          {supplier.phone}
          {" - "}
          {supplier.product}
        </div>
      ))}
    </div>
  );
}