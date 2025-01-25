import { FormEvent, useState } from "react";
import { Loader, Placeholder } from "@aws-amplify/ui-react";
import ReactMarkdown from "react-markdown";
import "./App.css";
import { Amplify } from "aws-amplify";
import { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";


import "@aws-amplify/ui-react/styles.css";

Amplify.configure({
  ...outputs,
  API: {
    endpoints: [
      {
        name: "yourAPIName",
        endpoint: "http://localhost:8000",
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

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const queryText = formData.get("ingredients")?.toString() || "";

      const response = await fetch('http://127.0.0.1:8000/submit_query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query_text: queryText }),
      });

      const resultData = await response.json();

      if (response.ok) {
        setResult(resultData?.answer_text || "No data returned");
      } else {
        setError(resultData?.error || "An error occurred");
      }

    } catch (e) {
      setError(`An error occurred: ${e}`);
    } finally {
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