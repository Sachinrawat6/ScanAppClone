import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import axios from 'axios';

const Scanner = () => {
  const navigate = useNavigate();
  const BASE_URL = 'https://fastapi.qurvii.com';

  const [orderId, setOrderId] = useState('');
  const [scannedData, setScannedData] = useState(null);
  const [employeeData, setEmployeeData] = useState({});
  const [showScanner, setShowScanner] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [scanMethod, setScanMethod] = useState(null); // 'camera' or 'manual'
  const inputRef = useRef(null);

  useEffect(() => {
    const storedEmployee = localStorage.getItem('employee');
    if (storedEmployee) {
      setEmployeeData(JSON.parse(storedEmployee));
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('employee');
    navigate('/');
  };

  const handleScan = async (scannedId, method) => {
    if (!scannedId) return;
    
    setOrderId(scannedId);
    setScanMethod(method);

    try {
      const payload = {
        order_id: Number(scannedId),
        user_id: Number(employeeData.id),
        user_location_id: Number(employeeData?.locations?.[0]?.id),
      };

      const response = await axios.post(`${BASE_URL}/scan`, payload);
      setScannedData(response.data.data);
      setOrderId("");
      
      // Different behavior based on scan method
      if (method === 'camera') {
        setShowScanner(false);
      } else {
        inputRef.current.focus();
      }
      
      setTimeout(() => {
        setScannedData(null);
      }, 1000);
      
      setErrorMsg('');
    } catch (error) {
      setScannedData(null);
      setErrorMsg('Failed to scan or fetch data. Please try again.');
      console.error('Scan Error:', error);
    }
  };

  const handleScanAgain = () => {
    setShowScanner(true);
    setScannedData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              <span className="text-blue-600">Order</span> Scanner
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">{employeeData?.name}</span>
              <button
                onClick={handleLogout}
                className="text-xs bg-red-100 hover:bg-red-200 text-gray-800 py-1 px-2 rounded cursor-pointer transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {showScanner && (
            <div className="mb-6 rounded-lg overflow-hidden border-2 border-gray-200">
              <BarcodeScannerComponent
                width={400}
                height={300}
                onUpdate={(err, result) => {
                  if (result?.text) {
                    handleScan(result.text, 'camera');
                  }
                }}
              />
              <div className="bg-gray-800 text-white text-center py-2 text-sm">
                Scanning Mode - Point at Barcode
              </div>
            </div>
          )}

          {!showScanner && (
            <div className="mb-6">
              <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-1">
                Enter Order ID
              </label>
              <input
                id="orderId"
                type="number"
                ref={inputRef}
                placeholder="e.g., 123456"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleScan(orderId, 'manual');
                  }
                }}
              />
            </div>
          )}

          <div className="flex flex-col space-y-3 mb-6">
            {!showScanner ? (
              <>
                <button
                  onClick={() => handleScan(orderId, 'manual')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg shadow-sm transition-colors"
                >
                  Submit Order ID
                </button>
                <button
                  onClick={() => {
                    setShowScanner(true);
                    setScanMethod('camera');
                  }}
                  className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-3 px-4 rounded-lg shadow-sm transition-colors"
                >
                  Open Barcode Scanner
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowScanner(false)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg shadow-sm transition-colors"
              >
                Close Scanner
              </button>
            )}

            {scanMethod === 'camera' && !showScanner && scannedData === null && (
              <button
                onClick={handleScanAgain}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg shadow-sm transition-colors"
              >
                Scan Again
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <div className="flex items-center text-red-700">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium">{errorMsg}</span>
              </div>
            </div>
          )}

          {scannedData && (
            <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-800 text-white px-4 py-3">
                <h3 className="font-semibold">Scan Details</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {[
                  { label: 'Channel', value: scannedData.channel },
                  {label:"Style No.",value: scannedData.style_number},
                  {label:"Size ",value: scannedData.size},
                  { label: 'Color', value: scannedData.color },
                  { label: 'Created At', value: new Date(scannedData.created_at).toLocaleString() },
                  { label: 'Employee', value: scannedData.employee_name?.split('/')[0] },
                  { label: 'Location', value: scannedData.location_name?.split('/')[0] },
                  { label: 'Scanned Time', value: new Date(scannedData.scan_timestamp).toLocaleString() },
                ].map((item, index) => (
                  <div key={index} className="px-4 py-3 ">
                    <div className="text-sm text-gray-500 grid grid-cols-2">{item.label} : <b>{item.value} </b> </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scanner;