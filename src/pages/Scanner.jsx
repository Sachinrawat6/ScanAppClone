import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import axios from 'axios';

const Scanner = () => {
  const navigate = useNavigate();
  const BASE_URL = 'https://fastapi.qurvii.com';

  const [scannedData, setScannedData] = useState(null);
  const [employeeData, setEmployeeData] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [isScanning, setIsScanning] = useState(true);

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

  const handleScan = async (scannedId) => {
    if (!scannedId) return;
    
    try {
      const payload = {
        order_id: Number(scannedId),
        user_id: Number(employeeData.id),
        user_location_id: Number(employeeData?.locations?.[0]?.id),
      };

      const response = await axios.post(`${BASE_URL}/scan`, payload);
      setScannedData(response.data.data);
      setErrorMsg('');
      setIsScanning(false); // Stop scanning after successful scan
    } catch (error) {
      setScannedData(null);
      setErrorMsg('Scan failed. Please try again.');
      console.error('Scan Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              <span className="text-blue-600">Barcode</span> Scanner
            </h2>
            <button
              onClick={handleLogout}
              className="text-xs bg-red-400 hover:bg-red-200 text-gray-900 py-1 px-2 rounded-md  transition-colors"
            >
              Logout
            </button>
          </div>

          {isScanning ? (
            <>
              <div className="mb-6 rounded-lg overflow-hidden border-2 border-gray-200">
                <BarcodeScannerComponent
                  width={400}
                  height={300}
                  onUpdate={(err, result) => {
                    if (result?.text) {
                      handleScan(result.text);
                    }
                  }}
                />
                <div className="bg-gray-800 text-white text-center py-2 text-sm">
                  Point your camera at the barcode
                </div>
              </div>

              <button
                onClick={() => setIsScanning(false)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg shadow-sm transition-colors"
              >
                Cancel Scanning
              </button>
            </>
          ) : (
            <>
              <div className="mb-6 text-center">
                <button
                  onClick={() => {
                    setScannedData(null);
                    setIsScanning(true);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg shadow-sm transition-colors"
                >
                  Scan Another Order
                </button>
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
                    <h3 className="font-semibold">Scan Successful</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {[
                      { label: 'Channel', value: scannedData.channel },
                      {label:"Style No.",value : scannedData.style_number},
                      {label:"Size.",value : scannedData.size},
                      { label: 'Color', value: scannedData.color },
                      { label: 'Created At', value: new Date(scannedData.created_at).toLocaleString() },
                      { label: 'Employee', value: scannedData.employee_name?.split('/')[0] },
                      { label: 'Location', value: scannedData.location_name?.split('/')[0] },
                      { label: 'Scanned Time', value: new Date(scannedData.scan_timestamp).toLocaleString() },
                    ].map((item, index) => (
                      <div key={index} className="px-4 py-3">
                        <div className="text-sm text-gray-500">{item.label} : <b> {item.value} </b> </div>
                        {/* <div className="font-medium text-gray-900">{item.value || 'N/A'}</div> */}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scanner;