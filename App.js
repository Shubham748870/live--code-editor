import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Home from "./Home";
import EditorPage from "./components/EditorPage";

function App() {
  return (
    <div>
      {/* ✅ Notification Toaster */}
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            theme: {
              primary: "#4aed88",
            },
          },
        }}
      />

      {/* ✅ App Routing */}
      <BrowserRouter>
        <Routes>
          {/* Home Page */}
          <Route path="/" element={<Home />} />

          {/* Editor Page with roomId param */}
          <Route path="/editor/:roomId" element={<EditorPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
