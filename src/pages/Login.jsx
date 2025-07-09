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
      locations: [location], // Keep only the selected location
    };

    setEmployeeData(updatedEmployee); // Update local state
    localStorage.setItem("employee", JSON.stringify(updatedEmployee)); // Update localStorage
     // Redirect to scanner page
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

      // ✅ Replace this URL with your actual API endpoint
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

            <div className="mt-6 space-y-2">
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Return Login Form if not logged in

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
          {/* <form className="space-y-6" onSubmit={handleSubmit}> */}
          <form id="loginForm" className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="employeeId"
                className="block text-sm font-medium text-gray-700"
              >
                Employee ID
              </label>
              {/* <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  id="employeeIdInput"
                  name="employeeId"
                  type="text"
                  autoComplete="off"
                  value={inputValue}
                  onChange={handleInputChange}
                  className={`focus:ring-${scanning ? 'blue' : 'indigo'}-500 focus:border-${
                    scanning ? 'blue' : 'indigo'
                  }-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md py-3 px-4 ${
                    scanning ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  placeholder={scanning ? 'Ready to scan...' : 'Enter employee ID'}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {scanning ? (
                    <svg
                      className="h-5 w-5 text-blue-500 animate-pulse"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div> */}
              <div className="mt-1 relative rounded-md shadow-sm">
                {scanning ? (
                  <div className="border border-blue-300 rounded-md overflow-hidden">
                    <BarcodeScannerComponent
                      width={400}
                      height={200}
                      onUpdate={(err, result) => {
                        if (result) {
                          setScannedValue(result.text);
                          setInputValue(result.text);
                          setScanning(false);
                          setTimeout(() => {
                            document
                              .getElementById("loginForm")
                              ?.requestSubmit(); // submit form programmatically
                          }, 500);
                        }
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
                    className={`focus:ring-${
                      scanning ? "blue" : "indigo"
                    }-500 focus:border-${
                      scanning ? "blue" : "indigo"
                    }-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md py-3 px-4`}
                    placeholder={scanning ? "Scanning..." : "Enter employee ID"}
                  />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={toggleScanning}
                className={`flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
                  scanning
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                {scanning ? (
                  <>
                    <svg
                      className="-ml-1 mr-2 h-5 w-5 text-red-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Cancel Scanning
                  </>
                ) : (
                  <>
                    <svg
                      className="-ml-1 mr-2 h-5 w-5 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Scan Barcode
                  </>
                )}
              </button>

              <button
                type="submit"
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
