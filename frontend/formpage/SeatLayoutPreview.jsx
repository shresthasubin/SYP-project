import React, { useState } from "react";



const SeatLayoutPreview = ({
  totalRows = 9,
  seatsPerRow = 12,
  rowConfig = null, // Optional: object like { A: 12, B: 11, C: 10 } for custom seats per row
  onSeatChange,
  editable = false,
  selectedSeats: propSelectedSeats = {},
  emptySpaces: propEmptySpaces = {},
  onSeatSelectionChange,
  onEmptySpaceChange,
}) => {
  // Generate row letters dynamically based on totalRows
  const rows = Array.from({ length: totalRows }, (_, i) => 
    String.fromCharCode(65 + i) // A, B, C, etc.
  );

  const [localSelectedSeats, setLocalSelectedSeats] =
    useState(propSelectedSeats);
  const [localEmptySpaces, setLocalEmptySpaces] = useState(propEmptySpaces);

  // Update local state when props change
  React.useEffect(() => {
    setLocalSelectedSeats(propSelectedSeats);
    setLocalEmptySpaces(propEmptySpaces);
  }, [propSelectedSeats, propEmptySpaces]);

  // Get seat count for a specific row
  const getSeatsForRow = (rowLetter) => {
    if (rowConfig && rowConfig[rowLetter] !== undefined) {
      return rowConfig[rowLetter];
    }
    return seatsPerRow;
  };

  const toggleSeat = (row, seatIndex) => {
    if (!editable) return;

    const seatKey = `${row}-${seatIndex}`;
    const isEmpty = localEmptySpaces[seatKey];

    if (isEmpty) return; // Can't select empty spaces

    const newSelectedSeats = {
      ...localSelectedSeats,
      [seatKey]: !localSelectedSeats[seatKey],
    };

    setLocalSelectedSeats(newSelectedSeats);

    if (onSeatSelectionChange) {
      onSeatSelectionChange(newSelectedSeats);
    }

    if (onSeatChange) {
      onSeatChange(row, seatIndex, !localSelectedSeats[seatKey]);
    }
  };

  const toggleEmptySpace = (row, seatIndex) => {
    if (!editable) return;

    const seatKey = `${row}-${seatIndex}`;
    const newEmptySpaces = {
      ...localEmptySpaces,
      [seatKey]: !localEmptySpaces[seatKey],
    };

    setLocalEmptySpaces(newEmptySpaces);

    // Clear selection if making it empty
    if (localSelectedSeats[seatKey]) {
      const newSelectedSeats = { ...localSelectedSeats };
      delete newSelectedSeats[seatKey];
      setLocalSelectedSeats(newSelectedSeats);

      if (onSeatSelectionChange) {
        onSeatSelectionChange(newSelectedSeats);
      }
    }

    if (onEmptySpaceChange) {
      onEmptySpaceChange(newEmptySpaces);
    }
  };

  const getSeatClass = (row, seatIndex) => {
    const seatKey = `${row}-${seatIndex}`;
    const isSelected = localSelectedSeats[seatKey];
    const isEmpty = localEmptySpaces[seatKey];

    if (isEmpty) {
      return "w-5 h-5 border border-dashed border-gray-400 dark:border-gray-600 rounded-sm bg-transparent";
    }

    return `w-5 h-5 rounded-sm cursor-pointer transition-all ${
      isSelected ? "bg-accent text-white" : "bg-pink-500 hover:bg-pink-600"
    }`;
  };

  const getSeatContent = (row, seatIndex) => {
    const seatKey = `${row}-${seatIndex}`;
    const isEmpty = localEmptySpaces[seatKey];

    if (isEmpty) {
      return null; // Empty space
    }

    return (
      <input
        type="checkbox"
        checked={localSelectedSeats[seatKey] || false}
        onChange={() => toggleSeat(row, seatIndex)}
        className="sr-only" // Hidden checkbox, visual seat is the clickable element
        disabled={!editable}
      />
    );
  };

  return (
    <div className="flex flex-col gap-2">
      {rows.map((rowLetter) => (
        <div key={rowLetter} className="flex items-center gap-2">
          <span className="w-4 font-semibold text-text-primary dark:text-text-primary">
            {rowLetter}
          </span>

          <div className="flex gap-1">
            {[...Array(getSeatsForRow(rowLetter))].map((_, index) => (
              <div key={index} className="relative">
                <div
                  onClick={() =>
                    editable && toggleEmptySpace(rowLetter, index)
                  }
                  onDoubleClick={() =>
                    editable && toggleSeat(rowLetter, index)
                  }
                  className={getSeatClass(rowLetter, index)}
                  title={`${rowLetter}${index + 1} ${localEmptySpaces[`${rowLetter}-${index}`] ? "(Empty Space)" : ""}`}
                >
                  {getSeatContent(rowLetter, index)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {editable && (
        <div className="mt-4 text-sm text-text-secondary dark:text-text-secondary">
          <p>• Single click: Toggle empty space</p>
          <p>• Double click: Select/deselect seat</p>
          <p>• Empty spaces shown as dashed boxes</p>
        </div>
      )}
    </div>
  );
};

const SeatLayoutForm = () => {
  const [layoutName, setLayoutName] = useState("");
  const [totalRows, setTotalRows] = useState(5);
  const [seatsPerRow, setSeatsPerRow] = useState(10);
  const [aislePositions, setAislePositions] = useState([5]);
  const [rowConfig, setRowConfig] = useState(null); // Optional custom seats per row
  const [seatCategories, setSeatCategories] = useState({
    regular: { rows: ["A", "B"], multiplier: 1.0 },
    premium: { rows: ["C", "D"], multiplier: 1.5 },
    vip: { rows: ["E"], multiplier: 2.0 },
  });
  const [selectedSeats, setSelectedSeats] = useState({});
  const [emptySpaces, setEmptySpaces] = useState({});
  const [errors, setErrors] = useState({});

  const generateLayout = () => {
    const newErrors = {};

    if (!layoutName.trim()) {
      newErrors.layoutName = "Layout name is required";
    }

    if (totalRows < 1 || totalRows > 26) {
      newErrors.totalRows = "Rows must be between 1 and 26";
    }

    if (seatsPerRow < 1 || seatsPerRow > 30) {
      newErrors.seatsPerRow = "Seats per row must be between 1 and 30";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // No need to generate layout array anymore
    // The component will use totalRows and seatsPerRow directly
    setErrors({});
  };

  const handleCategoryChange = (category, field, value) => {
    setSeatCategories((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: field === "multiplier" ? parseFloat(value) : value,
      },
    }));
  };

  const addRowToCategory = (category) => {
    const availableRows = [];
    for (let i = 0; i < totalRows; i++) {
      const rowLetter = String.fromCharCode(65 + i);
      const isUsed = Object.values(seatCategories).some((cat) =>
        cat.rows.includes(rowLetter),
      );
      if (!isUsed) {
        availableRows.push(rowLetter);
      }
    }

    if (availableRows.length > 0) {
      handleCategoryChange(category, "rows", [
        ...seatCategories[category].rows,
        availableRows[0],
      ]);
    }
  };

  const removeRowFromCategory = (category, rowIndex) => {
    handleCategoryChange(
      category,
      "rows",
      seatCategories[category].rows.filter((_, index) => index !== rowIndex),
    );
  };

  const getTotalSeats = () => {
    if (rowConfig) {
      return Object.values(rowConfig).reduce((total, seats) => total + seats, 0);
    }
    return totalRows * seatsPerRow;
  };

  const saveLayout = () => {
    const layoutData = {
      name: layoutName,
      totalRows,
      seatsPerRow,
      rowConfig,
      totalCapacity: getTotalSeats(),
      seatCategories,
      aislePositions,
      emptySpaces,
      description: `${totalRows} rows with ${seatsPerRow} seats each`,
    };

    console.log("Saving layout:", layoutData);
    // TODO: Save to backend
    alert("Layout saved successfully!");
  };

  return (
    <div className="min-h-screen bg-primary dark:bg-primary py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text-primary dark:text-text-primary mb-4">
            Seat Layout Designer
          </h1>
          <p className="text-lg text-text-secondary dark:text-text-secondary">
            Create custom seat layouts for your theater rooms
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Basic Layout Info */}
            <div className="bg-secondary dark:bg-secondary rounded-xl p-6">
              <h2 className="text-xl font-semibold text-text-primary dark:text-text-primary mb-4">
                Layout Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary dark:text-text-primary mb-2">
                    Layout Name *
                  </label>
                  <input
                    type="text"
                    value={layoutName}
                    onChange={(e) => setLayoutName(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-secondary dark:border-secondary dark:text-text-primary ${
                      errors.layoutName ? "border-red-500" : "border-secondary"
                    }`}
                    placeholder="e.g., Standard Theater Layout"
                  />
                  {errors.layoutName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.layoutName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary dark:text-text-primary mb-2">
                      Total Rows *
                    </label>
                    <input
                      type="number"
                      value={totalRows}
                      onChange={(e) =>
                        setTotalRows(parseInt(e.target.value) || 1)
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-secondary dark:border-secondary dark:text-text-primary ${
                        errors.totalRows ? "border-red-500" : "border-secondary"
                      }`}
                      min="1"
                      max="26"
                    />
                    {errors.totalRows && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.totalRows}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary dark:text-text-primary mb-2">
                      Seats Per Row *
                    </label>
                    <input
                      type="number"
                      value={seatsPerRow}
                      onChange={(e) =>
                        setSeatsPerRow(parseInt(e.target.value) || 1)
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-secondary dark:border-secondary dark:text-text-primary ${
                        errors.seatsPerRow
                          ? "border-red-500"
                          : "border-secondary"
                      }`}
                      min="1"
                      max="30"
                    />
                    {errors.seatsPerRow && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.seatsPerRow}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={generateLayout}
                  className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Generate Layout Preview
                </button>
              </div>
            </div>

            {/* Seat Categories */}
            <div className="bg-secondary dark:bg-secondary rounded-xl p-6">
              <h2 className="text-xl font-semibold text-text-primary dark:text-text-primary mb-4">
                Seat Categories
              </h2>

              <div className="space-y-4">
                {Object.entries(seatCategories).map(([category, config]) => (
                  <div
                    key={category}
                    className="border border-secondary dark:border-secondary rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium capitalize text-text-primary dark:text-text-primary">
                        {category} Seats
                      </h3>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={config.multiplier}
                          onChange={(e) =>
                            handleCategoryChange(
                              category,
                              "multiplier",
                              e.target.value,
                            )
                          }
                          className="w-20 px-2 py-1 border rounded text-sm dark:bg-secondary dark:border-secondary dark:text-text-primary"
                          step="0.1"
                          min="0.5"
                          max="5"
                        />
                        <span className="text-sm text-text-secondary dark:text-text-secondary">
                          × price
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {config.rows.map((row, index) => (
                          <span
                            key={row}
                            className="px-2 py-1 bg-accent/20 text-accent rounded text-sm font-medium"
                          >
                            {row}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => addRowToCategory(category)}
                        className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary/90"
                      >
                        + Add Row
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => window.history.back()}
                className="flex-1 px-6 py-3 border border-secondary dark:border-secondary rounded-lg text-text-primary dark:text-text-primary hover:bg-secondary dark:hover:bg-secondary/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveLayout}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Save Layout
              </button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            <div className="bg-secondary dark:bg-secondary rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-text-primary dark:text-text-primary">
                  Layout Preview
                </h2>
                <div className="text-right">
                  <p className="text-sm text-text-secondary dark:text-text-secondary">
                    Total Seats
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {getTotalSeats()}
                  </p>
                </div>
              </div>

              <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-6 overflow-x-auto">
                <SeatLayoutPreview
                  totalRows={totalRows}
                  seatsPerRow={seatsPerRow}
                  rowConfig={rowConfig}
                  editable={true}
                  selectedSeats={selectedSeats}
                  emptySpaces={emptySpaces}
                  onSeatSelectionChange={setSelectedSeats}
                  onEmptySpaceChange={setEmptySpaces}
                />
              </div>

              {/* Seat Selection Summary */}
              <div className="mt-4 p-4 bg-accent/10 dark:bg-accent/20 rounded-lg">
                <h4 className="font-medium text-text-primary dark:text-text-primary mb-2">
                  Selection Tools
                </h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      // Select all seats
                      const allSeats = {};
                      for (let i = 0; i < totalRows; i++) {
                        const rowLetter = String.fromCharCode(65 + i);
                        const seatsInRow = rowConfig?.[rowLetter] || seatsPerRow;
                        for (let j = 0; j < seatsInRow; j++) {
                          const seatKey = `${rowLetter}-${j}`;
                          if (!emptySpaces[seatKey]) {
                            allSeats[seatKey] = true;
                          }
                        }
                      }
                      setSelectedSeats(allSeats);
                    }}
                    className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary/90"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => {
                      // Clear all selections
                      setSelectedSeats({});
                    }}
                    className="px-3 py-1 bg-secondary dark:bg-secondary text-text-primary dark:text-text-primary rounded text-sm hover:bg-secondary/80"
                  >
                    Clear Selection
                  </button>
                  <button
                    onClick={() => {
                      // Reset empty spaces
                      setEmptySpaces({});
                      setSelectedSeats({});
                    }}
                    className="px-3 py-1 border border-accent text-accent rounded text-sm hover:bg-accent hover:text-white"
                  >
                    Reset Layout
                  </button>
                </div>

                <div className="mt-3 text-sm text-text-secondary dark:text-text-secondary">
                  <p>Selected Seats: {Object.keys(selectedSeats).length}</p>
                  <p>Empty Spaces: {Object.keys(emptySpaces).length}</p>
                  <p>
                    Available Seats:{" "}
                    {getTotalSeats() - Object.keys(emptySpaces).length}
                  </p>
                </div>
              </div>
            </div>

            {/* Layout Statistics */}
            <div className="bg-secondary dark:bg-secondary rounded-xl p-6">
              <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary mb-4">
                Layout Statistics
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary dark:text-text-secondary">
                    Layout Name:
                  </span>
                  <span className="font-medium text-text-primary dark:text-text-primary">
                    {layoutName || "Untitled Layout"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-text-secondary dark:text-text-secondary">
                    Dimensions:
                  </span>
                  <span className="font-medium text-text-primary dark:text-text-primary">
                    {totalRows} × {seatsPerRow}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-text-secondary dark:text-text-secondary">
                    Categories:
                  </span>
                  <span className="font-medium text-text-primary dark:text-text-primary">
                    {Object.keys(seatCategories).length}
                  </span>
                </div>

                {Object.entries(seatCategories).map(([category, config]) => (
                  <div key={category} className="flex justify-between text-sm">
                    <span className="text-text-secondary dark:text-text-secondary capitalize">
                      {category} rows:
                    </span>
                    <span className="font-medium text-text-primary dark:text-text-primary">
                      {config.rows.join(", ") || "None"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatLayoutForm;
