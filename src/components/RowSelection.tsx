import { OverlayPanel } from "primereact/overlaypanel";
import React, { useRef, useState } from "react";

interface RowSelectionOverlayProps {
  onSelect: (count: number) => Promise<void>;
}

export const RowSelectionOverlay = ({ onSelect }: RowSelectionOverlayProps) => {
  const [inputValue, setInputValue] = useState("");
  const overlayRef = useRef<OverlayPanel>(null);

  const handleApply = () => {
    const num = parseInt(inputValue, 10);

    if (isNaN(num) || num <= 0) { 
      alert("Please enter a valid positive number.");
      return;
    }

    // Call parent function and close overlay when done
    onSelect(num).then(() => {
      overlayRef.current?.hide();
    });
  };

  return (
    <>

      {/* Popup panel */}
      <OverlayPanel ref={overlayRef}>
        <div className="p-3">
          <label htmlFor="rowCount">Number of rows to select:</label>
          <input
            id="rowCount"
            type="number"
            min="1"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="p-inputtext w-full mt-2"
          />

          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={() => overlayRef.current?.hide()}
              className="p-button p-button-text"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="p-button p-button-primary"
            >
              Apply
            </button>
          </div>
        </div>
      </OverlayPanel>
    </>
  );
};