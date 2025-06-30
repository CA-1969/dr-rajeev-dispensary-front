import React, { useState, useEffect } from "react";

const App = () => {
  // State to hold today's entries
  const [entries, setEntries] = useState([]);
  // State for new entry form fields
  const [sNo, setSNo] = useState(1); // Starting S.no from 1, will be updated by useEffect
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // Current date in ISO-MM-DD
  const [patientName, setPatientName] = useState("");
  const [cashMemoBill, setCashMemoBill] = useState("");
  const [saleAmount, setSaleAmount] = useState("");
  const [paymentType, setPaymentType] = useState("Cash"); // Default to Cash
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // For in-app validation messages
  const [isLoadingSNo, setIsLoadingSNo] = useState(true); // To show loading state for S.no

  // New state variables for detailed totals
  const [cashTotal, setCashTotal] = useState(0);
  const [upiTotal, setUpiTotal] = useState(0);

  // Grand Total of Daily sales is already covered by totalSalesToday
  const totalSalesToday = entries
    .reduce((sum, entry) => sum + parseFloat(entry.saleAmount || 0), 0)
    .toFixed(2);

  // Effect to recalculate Cash Total and UPI Total whenever entries change
  useEffect(() => {
    let currentCashTotal = 0;
    let currentUpiTotal = 0;
    entries.forEach((entry) => {
      if (entry.paymentType === "Cash") {
        currentCashTotal += parseFloat(entry.saleAmount || 0);
      } else if (entry.paymentType === "UPI") {
        currentUpiTotal += parseFloat(entry.saleAmount || 0);
      }
    });
    setCashTotal(currentCashTotal.toFixed(2));
    setUpiTotal(currentUpiTotal.toFixed(2));
  }, [entries]); // Recalculate whenever entries array changes

  // Effect to fetch last S.no and Date from Google Sheet on component mount
  useEffect(() => {
    const fetchLastSNo = async () => {
      // IMPORTANT: Your Google Apps Script Web App URL for GET requests
      const appsScriptDoGetUrl =
        "https://script.google.com/macros/s/AKfycbzsZWO9UPRheDGRP2E3oJ2aNt9UKw1m7eJ_Obp2We19kgD9CEUpyX8z8bhFMz_ZTfA/exec";

      try {
        const response = await fetch(appsScriptDoGetUrl, {
          method: "GET",
        });

        // Check if response is okay and is JSON
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.error) {
          console.error("Error from Apps Script GET:", data.error);
          setErrorMessage("Error fetching S.no. Check console.");
          setSNo(1); // Default to 1 on error
        } else {
          const today = new Date().toISOString().split("T")[0];
          if (data.lastDate === today) {
            setSNo(data.lastSNo + 1); // Continue sequence
          } else {
            setSNo(1); // Reset for new day
          }
        }
      } catch (error) {
        console.error("Error fetching last S.no from Google Sheet:", error);
        setErrorMessage("Could not load initial S.no. Starting from 1.");
        setSNo(1); // Default to 1 on any fetch error
      } finally {
        setIsLoadingSNo(false); // Done loading S.no
      }
    };

    fetchLastSNo();
  }, []); // Empty dependency array means this effect runs once on mount

  // Function to handle adding a new entry
  const handleAddEntry = async () => {
    setErrorMessage(""); // Clear previous error message

    if (!patientName.trim() || !saleAmount || isNaN(parseFloat(saleAmount))) {
      setErrorMessage("Please fill in Patient Name and a valid Sale Amount.");
      return;
    }

    const newEntry = {
      sNo: sNo, // Use the current sNo
      date: date,
      patientName: patientName.trim(),
      cashMemoBill: cashMemoBill.trim(),
      saleAmount: parseFloat(saleAmount).toFixed(2),
      paymentType: paymentType,
      phoneNumber: phoneNumber.trim(),
    };

    setEntries([...entries, newEntry]); // Add to local state first
    setSNo((prevSNo) => prevSNo + 1); // Increment S.no for next entry immediately
    setPatientName("");
    setCashMemoBill("");
    setSaleAmount("");
    setPhoneNumber("");
    setPaymentType("Cash"); // Reset payment type to default 'Cash' for next entry

    // Sending data to Google Apps Script backend
    try {
      // Use the same URL for POST requests
      const appsScriptDoPostUrl =
        "https://script.google.com/macros/s/AKfycbzsZWO9UPRheDGRP2E3oJ2aNt9UKw1m7eJ_Obp2We19kgD9CEUpyX8z8bhFMz_ZTfA/exec";
      await fetch(appsScriptDoPostUrl, {
        method: "POST",
        mode: "no-cors", // Required for cross-origin requests to Apps Script
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEntry),
      });
      console.log("Data sent to Google Apps Script backend.");
    } catch (error) {
      console.error("Error sending data to backend:", error);
      setErrorMessage("Failed to send data to Google Sheet. Check console.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center font-sans">
      <div className="max-w-4xl w-full mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white">
          <h1 className="text-2xl md:text-3xl font-bold text-center">
            Dr Rajeev Kumar Garg - Dispensary
          </h1>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Error Message Display */}
          {errorMessage && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative"
              role="alert"
            >
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline ml-2">{errorMessage}</span>
            </div>
          )}

          {/* New Entry Form */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">
              Add New Sale Entry
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  S.no
                </label>
                <input
                  type="text"
                  value={isLoadingSNo ? "Loading..." : sNo} // Show loading state
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Name*
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Enter patient name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Optional phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Type
                </label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cash Memo / Bill
                </label>
                <input
                  type="text"
                  value={cashMemoBill}
                  onChange={(e) => setCashMemoBill(e.target.value)}
                  placeholder="Enter cash memo or bill no."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sale Amount*
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">₹</span>
                  </div>
                  <input
                    type="number"
                    value={saleAmount}
                    onChange={(e) => setSaleAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
            <button
              onClick={handleAddEntry}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoadingSNo} // Disable button while S.no is loading
            >
              {isLoadingSNo ? "Loading S.no..." : "Add Sale"}
            </button>
          </div>

          {/* Detailed Daily Totals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 flex items-center justify-between col-span-1">
              <span className="text-md font-medium text-yellow-800">
                Cash Total:
              </span>
              <span className="text-xl font-bold text-yellow-900">
                ₹ {cashTotal}
              </span>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 flex items-center justify-between col-span-1">
              <span className="text-md font-medium text-purple-800">
                UPI Total:
              </span>
              <span className="text-xl font-bold text-purple-900">
                ₹ {upiTotal}
              </span>
            </div>
            {/* Grand Total of Daily sales */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex items-center justify-between md:col-span-1">
              <span className="text-md font-medium text-green-800">
                Grand Total:
              </span>
              <span className="text-xl font-bold text-green-900">
                ₹ {totalSalesToday}
              </span>
            </div>
          </div>

          {/* Entries Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <h2 className="text-xl font-semibold text-gray-800 p-4 border-b border-gray-200">
              Today's Entries
            </h2>
            {entries.length === 0 ? (
              <p className="text-gray-500 p-4 text-center">
                No sales entries for today yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        S.no
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Memo/Bill
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {entries.map((entry, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                          {entry.sNo}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                          {entry.date}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {entry.patientName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {entry.phoneNumber || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {entry.cashMemoBill || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800 capitalize">
                          {entry.paymentType}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          ₹ {entry.saleAmount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
