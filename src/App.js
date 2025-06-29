import React, { useState, useEffect } from "react";

const App = () => {
  // State to hold today's entries
  const [entries, setEntries] = useState([]);
  // State for new entry form fields
  const [sNo, setSNo] = useState(1); // Starting S.no from 1
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // Current date in YYYY-MM-DD
  const [patientName, setPatientName] = useState("");
  const [cashMemoBill, setCashMemoBill] = useState("");
  const [saleAmount, setSaleAmount] = useState("");

  // Calculate Total Sales of Today
  const totalSalesToday = entries
    .reduce((sum, entry) => sum + parseFloat(entry.saleAmount || 0), 0)
    .toFixed(2);

  // Function to handle adding a new entry
  const handleAddEntry = async () => {
    if (!patientName || !saleAmount || isNaN(parseFloat(saleAmount))) {
      // Basic validation
      console.error("Please fill in Patient Name and a valid Sale Amount.");
      return;
    }

    const newEntry = {
      sNo: sNo,
      date: date,
      patientName: patientName,
      cashMemoBill: cashMemoBill,
      saleAmount: parseFloat(saleAmount).toFixed(2), // Ensure amount is formatted
    };

    setEntries([...entries, newEntry]); // Add to local state
    setSNo((prevSNo) => prevSNo + 1); // Increment S.no for next entry
    setPatientName(""); // Clear form fields
    setCashMemoBill("");
    setSaleAmount("");

    // TODO: In a real application, you would send this data to your Google Apps Script backend here.
    // Example:
    // try {
    //     const response = await fetch('YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL', {
    //         method: 'POST',
    //         mode: 'no-cors', // Required for simple CORS with Apps Script Web App
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(newEntry),
    //     });
    //     // Handle response if needed, though no-cors won't let you read it
    //     console.log("Data sent to backend (simulated for demo).");
    // } catch (error) {
    //     console.error("Error sending data to backend:", error);
    // }
    console.log(
      "Entry added locally. Data would be sent to Google Sheet via Apps Script.",
      newEntry
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Dr Rajeev Kumar Garg - Dispensary
        </h1>

        {/* New Entry Form */}
        <div className="mb-8 p-4 bg-blue-50 rounded-md border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">
            Add New Sale Entry
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="sNo"
                className="block text-sm font-medium text-gray-700"
              >
                S.no
              </label>
              <input
                type="text"
                id="sNo"
                value={sNo}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 p-2"
              />
            </div>
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700"
              >
                Date
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="patientName"
                className="block text-sm font-medium text-gray-700"
              >
                Patient Name
              </label>
              <input
                type="text"
                id="patientName"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter patient name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="cashMemoBill"
                className="block text-sm font-medium text-gray-700"
              >
                Cash Memo / Bill
              </label>
              <input
                type="text"
                id="cashMemoBill"
                value={cashMemoBill}
                onChange={(e) => setCashMemoBill(e.target.value)}
                placeholder="Enter cash memo or bill no."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="saleAmount"
                className="block text-sm font-medium text-gray-700"
              >
                Sale Amount
              </label>
              <input
                type="number"
                id="saleAmount"
                value={saleAmount}
                onChange={(e) => setSaleAmount(e.target.value)}
                placeholder="Enter sale amount"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
              />
            </div>
          </div>
          <button
            onClick={handleAddEntry}
            className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition duration-150 ease-in-out hover:scale-105"
          >
            Add Sale
          </button>
        </div>

        {/* Total Sales of Today */}
        <div className="bg-green-50 p-4 rounded-md flex items-center justify-between border border-green-200 mb-8">
          <span className="text-lg font-medium text-green-700">
            Total Sales of Today:
          </span>
          <span className="text-2xl font-bold text-green-900">
            ₹ {totalSalesToday}
          </span>
        </div>

        {/* List of Today's Sales */}
        <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200">
          <h2 className="text-xl font-semibold text-yellow-700 mb-4">
            Today's Entries
          </h2>
          {entries.length === 0 ? (
            <p className="text-gray-600 text-center">
              No sales entries for today yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-yellow-200">
                <thead className="bg-yellow-100">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tl-md">
                      S.no
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Patient Name
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Cash Memo / Bill
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tr-md">
                      Sale Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-yellow-200">
                  {entries.map((entry, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">
                        {entry.sNo}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">
                        {entry.date}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">
                        {entry.patientName}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">
                        {entry.cashMemoBill}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">
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
  );
};

export default App;
