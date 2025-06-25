"use client";

import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [serviceKey, setServiceKey] = useState("");
  const [output, setOutput] = useState("");
  const [formattedOutput, setFormattedOutput] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(true);
  const [requestBody, setRequestBody] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");

  const handleSubmit = async () => {
    setIsLoading(true);
    setOutput("");
    setRequestBody("");
    setFormattedOutput(null);

    try {
      const response = await fetch("/api/proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, serviceKey, emails }),
      });

      const data = await response.json();

      if (!response.ok) {
        setOutput(`Error: ${data.error || "An unknown error occurred."}`);
      } else {
        const { endpoint, sentRequest, apiResponse, formattedOutput } = data;

        const bodyForDisplay = JSON.stringify(sentRequest, null, 2);
        const headersForDisplay = JSON.stringify(endpoint.headers, null, 2);

        const fullFetchCommand = `fetch('${endpoint.endpoint}', {\n  method: '${endpoint.method}',\n  headers: ${headersForDisplay},\n  body: JSON.stringify(${bodyForDisplay})\n});`;

        setRequestBody(fullFetchCommand);
        setFormattedOutput(formattedOutput);
        setOutput(JSON.stringify(apiResponse, null, 2));
      }
    } catch (error) {
      setOutput(`An error occurred while fetching the data: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 w-full items-center">
        <h1 className="text-2xl font-bold text-gray-200 mt-4">
          Windsurf Analytics API Sandbox
        </h1>
        {/* Main flex container with two side-by-side divs */}
        <div className="flex flex-row w-full gap-8 p-8">
          {/* Left side: dropdown and text input */}
          <div className="flex flex-1 flex-col gap-4 bg-gray-800 rounded-lg shadow p-6 min-w-0 max-w-1/3">
            <label className="font-semibold text-gray-200">
              Choose a sample query:
              <select
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={`mt-1 block w-full rounded border-gray-700 bg-gray-900 border p-2 ${
                  query === "" ? "text-gray-500" : "text-gray-100"
                }`}
              >
                <option value="" disabled>
                  Select a query
                </option>
                <option value="option1">Total Users Signed Up</option>
                <option value="option2">Number of Active Users</option>
                <option value="option3">
                  Lines Accepted vs. Lines Suggested on Cascade Per Day
                </option>
                <option value="option4">Models Used Per Day</option>
                <option value="option5">
                  Total Requests to Cascade Per Day
                </option>
                <option value="option6">Credit Spend Per Day</option>
                <option value="option7">Credit Spend Per User Per Day</option>
              </select>
            </label>
            {query === "option7" && (
              <label className="font-semibold text-gray-200">
                Emails:
                <input
                  type="text"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    const enteredEmails = e.target.value
                      .split(/[,;]+/)
                      .map((email) => email.trim())
                      .filter((email) => email);
                    setEmails(enteredEmails);
                  }}
                  className="mt-1 block w-full rounded border-gray-700 bg-gray-900 text-gray-100 border p-2"
                  placeholder="Enter emails separated by commas..."
                />
              </label>
            )}
            <label className="font-semibold text-gray-200">
              Service Key:
              <input
                type="text"
                value={serviceKey}
                onChange={(e) => setServiceKey(e.target.value)}
                className="mt-1 block w-full rounded border-gray-700 bg-gray-900 text-gray-100 border p-2"
                placeholder="Enter your service key..."
              />
            </label>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="mt-2 block w-full bg-gray-700 text-gray-100 rounded-lg shadow p-2 disabled:opacity-50"
            >
              Submit
            </button>
          </div>
          {/* Right side: paragraph text */}
          <div className="flex flex-1 items-start justify-center flex-col bg-gray-800 rounded-lg shadow p-6 min-w-0">
            <button
              onClick={() => setIsRequestOpen(!isRequestOpen)}
              className="flex items-center justify-between w-full text-left font-semibold text-gray-200 mb-2"
            >
              Request
              <svg
                className={`w-4 h-4 transition-transform transform ${
                  isRequestOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>
            {isRequestOpen && (
              <pre className="text-gray-300 text-sm bg-gray-900 p-4 rounded w-full overflow-auto mb-8">
                {requestBody ||
                  "This is where your request payload from the query you select will show up!"}
              </pre>
            )}
            <h3 className="text-gray-200 font-semibold mb-2">Output</h3>
            <pre className="text-gray-300 text-sm bg-gray-900 p-4 rounded w-full overflow-auto max-h-75 mb-8">
              {isLoading
                ? "Loading..."
                : output ||
                  "This is where output from the query you select will show up!"}
            </pre>
            {formattedOutput && (
              <div>
                <h3 className="text-gray-200 font-semibold mb-2 mt-8">
                  Formatted Output
                </h3>
                <div className="grid grid-flow-col auto-cols-max gap-4 overflow-x-auto pb-4">
                  {Object.entries(formattedOutput).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <h4 className="text-gray-400 font-medium capitalize mb-1">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </h4>
                      <pre className="text-gray-300 text-sm bg-gray-900 p-4 rounded w-full overflow-auto max-h-75">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
