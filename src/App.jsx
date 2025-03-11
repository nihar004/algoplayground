import Header from "./Components/common/Header";
import { useTheme } from "./context/ThemeContext";
import { WarningProvider } from "./context/WarningContext";
import Warning from "./Components/common/Warning";
import BubbleSort from "./algorithms/sorting/bubbleSort/BubbleSort";

function App() {
  const { isDarkMode } = useTheme();

  return (
    <>
      <div
        className={`min-h-screen transition-colors duration-500 ease-in-out ${
          !isDarkMode ? "bg-zinc-50 text-zinc-900" : "bg-zinc-900 text-zinc-50"
        } `}
      >
        {/* Header */}
        <Header />

        <WarningProvider>
          {/* Global Warning Component */}
          <Warning />
          <BubbleSort />
        </WarningProvider>
      </div>
    </>
  );
}

export default App;
