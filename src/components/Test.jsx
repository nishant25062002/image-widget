import { useRef, useState } from "react";
import CanvasDraw from "react-canvas-draw";

const DrawingComponent = () => {
  const canvasRef = useRef(null);
  const [redoStack, setRedoStack] = useState([]);

  const handleUndo = () => {
    if (canvasRef.current) {
      // Save the current canvas state for redo
      const currentData = canvasRef.current.getSaveData();
      setRedoStack((prevRedoStack) => [currentData, ...prevRedoStack]);

      // Perform undo
      canvasRef.current.undo();
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0 && canvasRef.current) {
      // Get the last saved state from the redo stack
      const lastRedoState = redoStack[0];

      // Remove the last saved state from the redo stack
      setRedoStack((prevRedoStack) => prevRedoStack.slice(1));

      // Restore the state to the canvas
      canvasRef.current.loadSaveData(lastRedoState, false);
    }
  };

  return (
    <div>
      <CanvasDraw ref={canvasRef} brushRadius={5} lazyRadius={1} />

      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={handleUndo}
          style={{
            padding: "10px 20px",
            backgroundColor: "#FF6347",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          UNDO
        </button>
        <button
          onClick={handleRedo}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          REDO
        </button>
      </div>
    </div>
  );
};

export default DrawingComponent;
