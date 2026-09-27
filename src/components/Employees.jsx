
import React, { useState } from "react";

export default function Employees({ employees = [], setEmployees }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");

  const addEmployee = (e) => {
    e.preventDefault();

    if (!name.trim() || !role.trim()) {
      alert("Enter employee name and role");
      return;
    }

    setEmployees([
      ...employees,
      {
        id: Date.now(),
        name,
        role,
        phone,
      },
    ]);

    setName("");
    setRole("");
    setPhone("");
  };

  return (
    <div style={{ padding: "24px" }}>
      <h1>Employees</h1>
      <p>Manage your business employees</p>

      <form onSubmit={addEmployee}>
        <input
          placeholder="Employee Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Job Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />

        <input
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button type="submit">Add Employee</button>
      </form>

      <h2>Employee List</h2>

      {employees.map((employee) => (
        <div key={employee.id}>
          <strong>{employee.name}</strong>
          {" - "}
          {employee.role}
          {" - "}
          {employee.phone}
        </div>
      ))}
    </div>
  );
}