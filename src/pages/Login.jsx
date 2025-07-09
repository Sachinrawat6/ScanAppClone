import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useGlobalContext } from "../Context/Context";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import axios from "axios";

const Login = () => {
  const { employeeId } = useGlobalContext();
  const [employeeData, setEmployeeData] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmployee = window.localStorage.getItem("employee");
    if (storedEmployee) {
      const parsed = JSON.parse(storedEmployee);
      setEmployeeData(parsed);
      setSuccess(true);
    }
  }, []);

  useEffect(() => {
    if (scanning) {
      const input = document.getElementById("employeeIdInput");
      input?.focus();
    }
  }, [scanning]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) {
      setError("Please enter or scan your employee ID");
      return;
    }

    const matchedEmployee = employeeId.find(
      (emp) => emp.id === Number(inputValue)
    );
    if (matchedEmployee) {
      localStorage.setItem("employee", JSON.stringify(matchedEmployee));
      setEmployeeData(matchedEmployee);
      setSuccess(true);
      setError("");
    } else {
      setError("Invalid employee ID. Please try again.");
      setSuccess(false);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (e.target.value.includes("\n")) {
      const cleanedValue = e.target.value.replace("\n", "");
      setInputValue(cleanedValue);
      handleSubmit(e);
    }
  };

  const toggleScanning = () => {
    setScanning(!scanning);
    setInputValue("");
    setError("");
  };

  const handleLogout = () => {
    localStorage.removeItem("employee");
    setEmployeeData(null);
    setSuccess(false);
    setInputValue("");
    setSelectedLocation(null);
  };

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
    setSaveMessage("");
    const updatedEmployee = {
      ...employeeData,
      locations: [location],
    };
    setEmployeeData(updatedEmployee);
    localStorage.setItem("employee", JSON.stringify(updatedEmployee));
    navigate('/scanner');
  };

  const saveEmployeeLocation = async () => {
    if (!selectedLocation) {
      setSaveMessage("Please select a location before saving.");
      return;
    }

    try {
      const payload = {
        employee_id: employeeData.id,
        employee_name: employeeData.user_name,
        location_id: selectedLocation.id,
        location_name: selectedLocation.name,
      };
      await axios.post("/api/save-employee-location", payload);
      setSaveMessage("Location saved successfully!");
    } catch (error) {
      console.error("Error saving location:", error);
      setSaveMessage("Failed to save. Please try again.");
    }
  };

  if (employeeData) {
    return (
      <div className="min-h-screen p-4 bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Employee Details
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center mb-6">
              <div className="mx-auto h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                <span className="text-indigo-600 text-2xl font-bold">
                  {employeeData.user_name.charAt(0)}
                </span>
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                {employeeData.user_name}
              </h3>
              <p className="text-sm text-gray-500">
                Employee ID: {employeeData.id}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-500 mb-3">
                Select Location:
              </h4>
              <ul className="space-y-2">
                {employeeData.locations.map((location) => (
                  <li
                    key={location.id}
                    onClick={() => handleLocationClick(location)}
                    className={`cursor-pointer p-2 rounded-md flex items-center ${
                      selectedLocation?.id === location.id
                        ? "bg-blue-100 border-l-4 border-blue-500 text-blue-700"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <svg
                      className={`h-5 w-5 mr-2 ${
                        selectedLocation?.id === location.id
                          ? "text-blue-500"
                          : "text-gray-400"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5l-3-3 1.414-1.414L9 10.586l4.293-4.293L15 8l-6 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{location.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* <div className="mt-6 space-y-2">
              <button
                onClick={saveEmployeeLocation}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Save Location
              </button>
              {saveMessage && (
                <p className="text-sm text-center text-gray-600">
                  {saveMessage}
                </p>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Logout
              </button>
            </div> */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Employee Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Scan your employee barcode or enter ID manually
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form id="loginForm" className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="employeeId"
                className="block text-sm font-medium text-gray-700"
              >
                Employee ID
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                {scanning ? (
                  <div className="border border-blue-300 rounded-md overflow-hidden">
                    <BarcodeScannerComponent
                      width={400}
                      height={200}
                      onUpdate={(err, result) => {
                        if (err) {
                          console.error("Scanner error:", err);
                          return;
                        }
                        if (result?.text) {
                          setInputValue(result.text);
                          setScanning(false);
                          setTimeout(() => {
                            document.getElementById("loginForm")?.requestSubmit();
                          }, 300);
                        }
                      }}
                      videoConstraints={{
                        facingMode: "environment",
                      }}
                    />
                    <p className="text-sm text-center text-gray-500 mt-2">
                      Align your ID barcode with the camera
                    </p>
                  </div>
                ) : (
                  <input
                    id="employeeIdInput"
                    name="employeeId"
                    type="text"
                    autoComplete="off"
                    value={inputValue}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-3 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter employee ID"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={toggleScanning}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  scanning
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                {scanning ? "Cancel Scanning" : "Scan Barcode"}
              </button>

              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
