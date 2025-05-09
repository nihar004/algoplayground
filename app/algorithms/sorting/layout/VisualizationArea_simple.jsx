import { useState, useRef, useEffect } from "react";
import ProgressBar from "../../../Components/controls/ProgressBar";
import Controls from "../../../Components/controls/Controls";
import { useTheme } from "../../../context/ThemeContext";
import { useSorting } from "../SortingContext";
import SortingVisualization3D from "./SortingVisualization3D";
import { useWarnings } from "../../../context/WarningContext";
import { useAppContext } from "@/app/context/AppContext";

const VisualizationAreaSimple = () => {
  const { isDarkMode } = useTheme();
  const [showAutoAdjustOption, setShowAutoAdjustOption] = useState(false);
  const { states, currentStateIndex, array, setArray, setSize, is3D, setIs3D } =
    useSorting();
  const { addWarning } = useWarnings();
  const [containerWidth, setContainerWidth] = useState(800);
  const containerRef = useRef(null);
  const { currentAlgorithm, layoutMode } = useAppContext();

  const currentState = states[currentStateIndex];

  // Check if array meets 3D visualization requirements
  const checkArrayRequirements = (array) => {
    const meetsLengthRequirement = array.length <= 10;
    const meetsValueRequirement = array.every((value) => value <= 20);

    return meetsLengthRequirement && meetsValueRequirement;
  };

  useEffect(() => {
    if (showAutoAdjustOption) {
      const timer = setTimeout(() => setShowAutoAdjustOption(false), 3000);

      return () => clearTimeout(timer);
    }
  }, [showAutoAdjustOption]);

  // Auto-adjust array to meet 3D visualization requirements
  const autoAdjustArray = () => {
    // Take only the first 10 elements if array is longer than 10
    const slicedArray = currentState.array.slice(0, 10);
    setSize(slicedArray.length);

    // Adjust values: if value > 20, subtract a random number between 0-5
    const adjustedArray = slicedArray.map((value) => {
      if (value > 20) {
        return 20 - Math.floor(Math.random() * 6); // Random number between 0-5
      }
      return value;
    });

    setArray(adjustedArray);

    // Hide auto-adjust option and reset view
    setIs3D(true);
    setShowAutoAdjustOption(false);
  };

  // Check array requirements when switching to 3D mode
  const handle3DButtonClick = () => {
    const meetsRequirements = checkArrayRequirements(currentState.array);

    if (!meetsRequirements) {
      // Show auto-adjust option
      setShowAutoAdjustOption(true);

      // Add warning about requirements
      addWarning(
        "3D visualization requires array length ≤ 10 and values ≤ 20",
        5000
      );
    } else {
      setShowAutoAdjustOption(false);
      setIs3D(true);
    }
  };

  // Calculate the maximum value in the array for scaling
  const maxValue = Math.max(...(states[currentStateIndex]?.array || []));

  // Update container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth - 64; // Subtract padding (32px on each side)
        setContainerWidth(width);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const getBarColorMap = {
    bubble: (index) => {
      // Bubble sort specific color logic
      return getBarColor_bubble(index);
    },
    selection: (index) => {
      // Selection sort specific color logic
      return getBarColor_selection(index);
    },
    insertion: (index) => {
      // Insertion sort specific color logic
      return getBarColor_insertion(index);
    },
    quick: (index) => {
      // Quick sort specific color logic
      return getBarColor_quick(index);
    },
  };

  // For Insertion Sort
  const getBarColor_insertion = (index) => {
    switch (currentState.action) {
      case "shift":
        if (index > currentState.j && index <= currentState.i)
          return "bg-rose-500";
        break;
      case "section-sorted":
        if (index <= currentState.i) return "bg-green-500";
        break;
    }

    if (index === currentState.i) return "bg-amber-500"; // Current key
    if (index === currentState.j) return "bg-sky-500"; // Comparison element

    return isDarkMode ? "bg-slate-400" : "bg-slate-200"; // Default unsorted color
  };

  // For Bubble Sort
  const getBarColor_bubble = (index) => {
    // Color bars green if they are in the completed bars list
    if (
      currentState.action === "complete" ||
      (currentState.completedBars && currentState.completedBars.includes(index))
    ) {
      return "bg-green-500";
    }

    // Color currently compared bars yellow
    if (index === currentState.j || index === currentState.j + 1) {
      return currentState.action === "swap" ? "bg-red-600" : "bg-yellow-400";
    }

    // Highlight the entire array in blue when early stop happens
    if (currentState.action === "early-stop") {
      return "bg-green-300";
    }

    // Default color is blue, especially at the start
    return "bg-blue-500";
  };

  // For Selection Sort
  const getBarColor_selection = (index) => {
    // Current outer loop index (i)
    if (index === currentState.i) {
      return "bg-blue-500"; // Soft blue to highlight current iteration
    }

    // Current minimum element
    if (index === currentState.minIndex) {
      return "bg-yellow-500"; // Keeping yellow to highlight min element
    }

    // Elements being compared or swapped
    if (
      currentState.action === "swap" &&
      (index === currentState.i || index === currentState.minIndex)
    ) {
      return "bg-red-500"; // Red for active swapping
    }

    // Sorted portion (completed elements)
    if (index <= currentState.i) {
      return "bg-green-500"; // Teal to indicate sorted portion
    }

    // Default unsorted elements
    return isDarkMode ? "bg-slate-400" : "bg-slate-200"; // Default unsorted color
  };

  // For quick sort
  const getBarColor_quick = (index) => {
    if (!currentState) return isDarkMode ? "bg-slate-400" : "bg-slate-200";

    // Elements in their final sorted positions
    if (currentState.correctPositions && currentState.correctPositions[index]) {
      return "bg-green-500";
    }

    // Current pivot element
    if (currentState.pivotIndex === index) {
      return "bg-purple-500"; // Highlight current pivot
    }

    // Elements being compared with pivot
    if (currentState.action === "compare" && index === currentState.j) {
      return "bg-yellow-400";
    }

    // Elements being swapped
    if (
      (currentState.action === "swap" ||
        currentState.action === "swap-prepare") &&
      (index === currentState.i || index === currentState.j)
    ) {
      return "bg-rose-500";
    }

    // When sorting left subarray, shade right subarray lighter
    if (currentState.action === "sort-left") {
      // Elements in left subarray (being sorted)
      if (index >= currentState.low && index <= currentState.high) {
        return "bg-blue-400";
      }
    }

    // When sorting right subarray, shade left subarray lighter
    if (currentState.action === "sort-right") {
      // Elements in right subarray (being sorted)
      if (index >= currentState.low && index <= currentState.high) {
        return "bg-blue-400";
      }
    }

    // Default color for other elements
    return isDarkMode ? "bg-slate-400" : "bg-slate-200";
  };

  // Calculate dynamic bar width based on array length (max 30)
  const calculateBarDimensions = () => {
    const arrayLength = currentState?.array.length || 1;

    // Adjust gap based on array length
    let gap;
    if (arrayLength <= 10) gap = 8;
    else if (arrayLength <= 20) gap = 4;
    else gap = 2;

    // Calculate bar width using actual container width
    const totalGapWidth = (arrayLength - 1) * gap;
    const barWidth = Math.floor((containerWidth - totalGapWidth) / arrayLength);

    // Ensure minimum and maximum widths
    const finalWidth = Math.min(Math.max(barWidth, 16), 48);

    return { width: finalWidth, gap };
  };

  const { width: barWidth, gap } = calculateBarDimensions();

  return (
    <>
      <div
        className={`h-130 rounded-t-lg flex flex-col items-center relative shadow-lg ${
          is3D
            ? !isDarkMode
              ? "bg-zinc-100"
              : "bg-zinc-700"
            : !isDarkMode
              ? "bg-white"
              : "bg-zinc-700"
        }`}
      >
        {/* Auto-adjust option */}
        {showAutoAdjustOption && (
          <div
            className={`
absolute
top-4
              right-4
              z-10
              px-4
              py-2
              rounded-md
              shadow-lg
              flex
              items-center
              justify-between
              font-medium
              ${
                !isDarkMode
                  ? "bg-blue-50 border border-blue-200 text-blue-700"
                  : "bg-zinc-500 border border-zinc-700"
              }
            `}
          >
            <span className="text-sm mr-4">
              Auto-adjust for 3D visualization?
            </span>
            <button
              onClick={autoAdjustArray}
              className={`
                px-3
                py-1
                rounded
                text-sm
                font-medium
                transition-colors
                duration-200
                bg-blue-500 text-white
                hover:bg-blue-600
              `}
            >
              Adjust
            </button>
            <button
              onClick={() => setShowAutoAdjustOption(false)}
              className={`
                px-3
                py-1
                rounded
                text-sm
                font-medium
                transition-colors
                duration-200
                ml-2 bg-blue-500 text-white hover:bg-blue-600
              `}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Main Visualization Content */}
        <div className="flex-1 w-full flex items-center justify-center">
          {is3D ? (
            <div className="w-full h-full">
              <SortingVisualization3D />
            </div>
          ) : (
            <div
              ref={containerRef}
              className="flex items-end justify-center h-full w-full p-8 mb-10"
              style={{ gap: `${gap}px` }}
            >
              {currentState?.array.map((value, index) => {
                // Calculate the percentage height
                const heightPercentage = Math.max((value / maxValue) * 85, 3);

                // Determine text visibility and styling
                const textStyle = {
                  fontSize: barWidth < 35 ? "0.6rem" : "0.875rem", // text-xs : text-sm
                  fontWeight: 600,
                  textAlign: "center",
                  position: "absolute",
                  bottom: "2px",
                  left: 0,
                  right: 0,
                };

                return (
                  <div
                    key={index}
                    className={`rounded-t-xs transition-all duration-500 relative ${
                      currentAlgorithm !== "merge" &&
                      getBarColorMap[currentAlgorithm](index)
                    }`}
                    style={{
                      height: `${heightPercentage}%`,
                      width: `${barWidth}px`,
                    }}
                  >
                    <div className="text-white" style={textStyle}>
                      {value}
                    </div>
                  </div>
                );
              })}

              {/* Description Text - Show when not in default layout */}
              {layoutMode !== "default" && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                  <p className="text-sm px-3 py-1.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    {currentState.description || "Sorting in progress..."}
                  </p>
                </div>
              )}

              {currentAlgorithm === "insertion" && (
                <div
                  className={`absolute top-18 right-10 rounded-lg px-3 py-1 text-md font-bold text-blue-900 ${
                    !isDarkMode ? "bg-blue-200 " : "bg-blue-200"
                  }`}
                >
                  <span className="opacity-60 mr-2">Key:</span>
                  {currentState ? currentState.key : "_"}
                </div>
              )}

              {/* Indices Container */}
              <div
                className="flex items-center justify-center w-full p-8 absolute -bottom-8"
                style={{ gap: `${gap}px` }}
              >
                {currentState?.array.map((_, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center relative transition-all duration-300 ease-in-out"
                    style={{ width: `${barWidth}px`, height: "3rem" }}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      {/* i indicator replacing index when it matches */}
                      {currentState.i === index && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                          i
                        </div>
                      )}

                      {currentState.j === index && (
                        <div className="w-5 h-5 rounded-full bg-amber-600 flex items-center justify-center text-white text-sm font-medium">
                          j
                        </div>
                      )}
                      {currentState.minIndex === index && (
                        <div className="w-6 h-5 rounded-sm bg-purple-400 flex items-center justify-center text-white text-xs font-medium">
                          min
                        </div>
                      )}

                      {currentAlgorithm === "quick" &&
                        currentState?.pivotIndex === index && (
                          <div
                            className={`${
                              barWidth < 35 ? "w-6" : "w-10"
                            } h-5 rounded-sm bg-purple-500 flex items-center justify-center text-white text-xs font-medium`}
                          >
                            {barWidth < 35 ? "P" : "Pivot"}
                          </div>
                        )}
                    </div>

                    <div
                      className={`text-center ${
                        !isDarkMode ? "text-zinc-500" : "text-zinc-300"
                      } ${barWidth < 35 ? "text-xs" : "text-sm"}`}
                    >
                      {index}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* View Toggle - Absolute positioned */}
        <div className="absolute top-4 right-4 rounded-lg shadow-lg">
          <div
            className={`flex rounded-lg font-medium hover:scale-101 ${
              !isDarkMode ? "bg-zinc-100 " : "bg-zinc-600"
            }`}
          >
            <button
              className={`px-4 py-2 rounded-l-lg ${
                !is3D
                  ? "bg-blue-500 text-zinc-100 hover:bg-blue-600"
                  : isDarkMode
                    ? "hover:bg-zinc-500"
                    : "hover:bg-zinc-200"
              }`}
              onClick={() => setIs3D(false)}
            >
              2D
            </button>
            <button
              className={`px-4 py-2 rounded-r-lg ${
                is3D
                  ? "bg-blue-500 text-zinc-100 hover:bg-blue-600"
                  : isDarkMode
                    ? "hover:bg-zinc-500"
                    : "hover:bg-zinc-200"
              }`}
              onClick={() => handle3DButtonClick()}
            >
              3D
            </button>
          </div>
        </div>
      </div>

      <ProgressBar />
      <Controls />
    </>
  );
};

export default VisualizationAreaSimple;
