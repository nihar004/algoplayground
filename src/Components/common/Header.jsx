import { useTheme } from "../../context/ThemeContext";
import logo from "../../assets/logo.png";
import DarkModeToggle from "./DarkModeToggle";

const Header = () => {
  const { isDarkMode } = useTheme();

  return (
    <>
      {/* Header */}
      <nav
        className={`border-b p-4 shadow-sm ${
          !isDarkMode
            ? "border-zinc-100 shadow-zinc-200/50"
            : "border-zinc-700 shadow-zinc-600/20"
        }`}
      >
        {/* <div className="container mx-auto flex justify-between items-center"> */}
        <div className="w-full px-1 mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="#" className="flex items-center">
              <img src={logo} alt="logo" className="h-10 w-auto" />
            </a>
            <h1 className="text-2xl font-bold">Sorting</h1>
            <select
              className={`px-3 py-1 outline-none rounded-sm border ${
                !isDarkMode
                  ? "bg-white border-zinc-200"
                  : "bg-zinc-700 border-zinc-700"
              }`}
            >
              <option>Bubble Sort</option>
              <option>Selection Sort</option>
              <option>Quick Sort</option>
            </select>
          </div>
          <DarkModeToggle />
        </div>
      </nav>
    </>
  );
};

export default Header;
