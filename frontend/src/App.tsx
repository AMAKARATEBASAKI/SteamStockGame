import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/ping")
      .then(res => res.json())
      .then(data => setMessage(data.message));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Steam Stock Game</h1>
      <p>API Response: {message}</p>
    </div>
  );
}

export default App;
