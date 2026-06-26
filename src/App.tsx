import { Toaster } from "react-hot-toast";
import { Routes, Route } from "react-router-dom";
import Task1 from "./task1/index.tsx";
import Task2 from "./task2/index.tsx";
import Task3 from "./task3/index.tsx";
import "react-hot-toast";
import Home from "./WebRtc/components/homepage/index.tsx";
import MainPage from "./WebRtc/components/mainpage/index.tsx";

function App() {
  return (
    <>
      <Toaster></Toaster>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mainpage" element={<MainPage />} />
        <Route path="/task1" element={<Task1 />} />
        <Route path="/task2" element={<Task2 />} />
        <Route path="/task3" element={<Task3 />} />
      </Routes>
    </>
  );
}

export default App;
