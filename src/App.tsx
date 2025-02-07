import { FormEvent, useState } from "react";
import { Loader, Placeholder } from "@aws-amplify/ui-react";
import ReactMarkdown from "react-markdown";
import "./App.css";
import { Amplify } from "aws-amplify";
import { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";

import "@aws-amplify/ui-react/styles.css";

// Load environment variables
const API_ENDPOINT = import.meta.env.VITE_REACT_APP_API_ENDPOINT || "";
const NYC_TOKEN = import.meta.env.VITE_REACT_APP_NYC_TOKEN || "";

if (!API_ENDPOINT) {
  console.error("API_ENDPOINT is not set. Please check your environment variables.");
}

if (!NYC_TOKEN) {
  console.error("NYC_TOKEN is not set. Please check your environment variables.");
}


console.log("API_ENDPOINT:", API_ENDPOINT); // Should log the correct API endpoint
console.log("NYC_TOKEN:", NYC_TOKEN); // Should log the correct NYC token

Amplify.configure({
  ...outputs,
  API: {
    endpoints: [
      {
        name: "yourAPIName",
        endpoint: API_ENDPOINT, // Use environment variable
      },
    ],
  },
});

const amplifyClient = generateClient<Schema>({
  authMode: "userPool",
});

function App() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollQueryStatus = async (queryId: string) => {
    try {
      const response = await fetch(`${API_ENDPOINT}/get_query/${queryId}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      });

      const resultData = await response.json();

      if (response.ok) {
        if (resultData.is_complete) {
          setResult(resultData?.answer_text || "No data returned");
          setLoading(false);
        } else {
          setTimeout(() => pollQueryStatus(queryId), 2000); // Poll every 2 seconds
        }
      } else {
        setError(resultData?.error || "An error occurred");
        setLoading(false);
      }
    } catch (e) {
      setError(`An error occurred: ${e}`);
      setLoading(false);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const queryText = formData.get("ingredients")?.toString() || "";

      const response = await fetch(`${API_ENDPOINT}/submit_query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${NYC_TOKEN}`, // Use token for authorization
        },
        body: JSON.stringify({ query_text: queryText }),
      });

      const resultData = await response.json();

      if (response.ok) {
        const queryId = resultData.query_id;
        pollQueryStatus(queryId);
      } else {
        setError(resultData?.error || "An error occurred");
        setLoading(false);
      }

    } catch (e) {
      setError(`An error occurred: ${e}`);
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="header-container">
        <h1 className="main-header">
        New York Restaurant Week
          <br />
          <span className="highlight">Food Recomendation AI</span>
        </h1>
        <p className="description">
         Ask questions about restaurant menus and get detailed answers.
        </p>
      </div>
      <form onSubmit={onSubmit} className="form-container">
        <div className="search-container">
          <input
            type="text"
            className="wide-input"
            id="ingredients"
            name="ingredients"
            placeholder="Enter your idea about the food/restrauant you want to eat"
          />
          <button type="submit" className="search-button">
            Generate
          </button>
        </div>
      </form>
      <div className="result-container">
        {loading ? (
          <div className="loader-container">
            <p>Loading...</p>
            <Loader size="large" />
            <Placeholder size="large" />
            <Placeholder size="large" />
            <Placeholder size="large" />
          </div>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          result && <ReactMarkdown className="result">{result}</ReactMarkdown>
        )}
      </div>
    </div>
  );
}

export default App;