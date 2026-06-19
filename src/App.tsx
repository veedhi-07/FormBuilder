import { Toaster } from "react-hot-toast";
import "react-hot-toast";
// import "./main.tsx";
import Home from "./WebRtc/components/homepage/index.tsx";
// import PromiseApi from "./task4/main.tsx";
// import KanbanboardPage from "./pages/kanbanboard";

function App() {
  return (
    <>
      <Toaster />
      <Home />
    </>
  );
}

export default App;
