import { useState, useRef } from "react";
import CanvasDraw from "react-canvas-draw";
import "./DrawWidget.css";

const DrawWidget = () => {
  const canvasRef = useRef(null);

  const [image, setImage] = useState(null);
  const [maskImage, setMaskImage] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 100, height: 100 });
  const [canvas, setCanvas] = useState("#57bcf2");
  const [brushRadius, setBrushRadius] = useState(10);
  const [redoStack, setRedoStack] = useState([]);

  const handleUndo = () => {
    if (canvasRef.current) {
      const currentData = JSON.parse(canvasRef.current.getSaveData());

      if (currentData.lines.length > 0) {
        const removedStroke = currentData.lines.pop();
        setRedoStack((prevRedoStack) => [removedStroke, ...prevRedoStack]);
        canvasRef.current.loadSaveData(JSON.stringify(currentData), true);
      }
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0 && canvasRef.current) {
      const lastRedoStroke = redoStack[0];
      setRedoStack((prevRedoStack) => prevRedoStack.slice(1));

      const currentData = JSON.parse(canvasRef.current.getSaveData());
      currentData.lines.push(lastRedoStroke);
      canvasRef.current.loadSaveData(JSON.stringify(currentData), true);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          setImageSize({
            width: img.naturalWidth,
            height: img.naturalHeight,
          });

          console.log(img.naturalWidth, 1000);
          setTimeout(() => {
            setImage(e.target.result);
          }, 10);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const exportMask = () => {
    if (canvasRef.current && image) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      canvas.width = imageSize.width;
      canvas.height = imageSize.height;

      const img = new Image();
      img.onload = () => {
        context.drawImage(img, 0, 0, imageSize.width, imageSize.height);

        const maskCanvas = canvasRef.current.canvasContainer.children[1];
        context.drawImage(maskCanvas, 0, 0, imageSize.width, imageSize.height);

        const combinedImageDataURL = canvas.toDataURL("image/png");
        setMaskImage(combinedImageDataURL);
      };
      img.src = image;
    }
  };

  const clearCanvas = () => {
    if (canvasRef.current) canvasRef.current.clear();
  };

  const handleCancel = () => {
    setMaskImage(null);
  };

  console.log("imageSize", imageSize.height);

  return (
    <div className="drawWidget">
      <h1>Image Inpainting Widget</h1>

      <div>
        <input
          type="file"
          accept="image/png, image/jpeg"
          onChange={handleImageUpload}
        />
      </div>

      {image && (
        <div className="canvaImage">
          <img
            src={image}
            alt="Uploaded"
            style={{
              width: `${Math.min(imageSize.width, 800)}px`,
              height: `${Math.min(imageSize.height, 1000)}px`,
            }}
          />
          <CanvasDraw
            ref={canvasRef}
            canvasWidth={Math.min(imageSize.width, 800)}
            canvasHeight={Math.min(imageSize.height, 1000)}
            brushColor={canvas}
            backgroundColor="transparent"
            brushRadius={brushRadius}
            lazyRadius={0}
            style={{
              zIndex: 1,
            }}
          />
        </div>
      )}

      {image && (
        <>
          <div className="brushTools">
            <div>
              <label>Brush Size: </label>
              <input
                type="range"
                min="1"
                max="50"
                value={brushRadius}
                onChange={(e) => setBrushRadius(Number(e.target.value))}
              />
              <span> {brushRadius}px</span>
            </div>
            <div>
              <label>Colour:</label>
              <input
                type="color"
                value={canvas}
                onChange={(event) => {
                  setCanvas(event.target.value);
                }}
              />
            </div>
          </div>

          <button onClick={handleUndo}>UNDO</button>
          <button onClick={handleRedo}>REDO</button>
        </>
      )}

      {image && (
        <div style={{ marginTop: "20px" }}>
          <button onClick={exportMask} style={{ marginRight: "10px" }}>
            Export Mask
          </button>
          <button onClick={clearCanvas}>Clear Canvas</button>
        </div>
      )}

      {maskImage && (
        <div className="exportSection">
          <div className="exportImages">
            <div className="exportImage">
              <h3>Original Image</h3>
              <img src={image} alt="Original" />
            </div>
            <div className="exportImage">
              <h3>Mask Image</h3>
              <img src={maskImage} alt="Mask" />
            </div>
          </div>
          <div className="exportBtns">
            <a
              href={maskImage}
              download="mask_image.png">
              Download Mask
            </a>
            <button onClick={handleCancel}>Cancel Export</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrawWidget;
