import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/landing/landing";
import Helmet from "react-helmet";
import Nopage from "./pages/nopage/nopage";
import "./App.css";
import Register from "./pages/register/register";
import Login from "./pages/login/login";
import Home from "./pages/home/home";
import Create from "./pages/creategame/create";
import Play from "./pages/play/play";

function App() {
  return (
    <div className="App">
      <Helmet>
        <title>Tic-Tac-Toe</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Helmet>
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route index element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/create" element={<Create />} />
            <Route path="/play" element={<Play />} />
            <Route path="*" element={<Nopage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
