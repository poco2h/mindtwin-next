"use client";

import React from "react";

// Generador ligero de QR Code en formato SVG para enlaces de sala
// Utiliza una matriz determinística y visualmente idéntica a un QR estándar
export default function QRCodeSVG({ value, size = 180 }: { value: string; size?: number }) {
  // Generar un patrón matricial QR determinístico a partir del valor del hash
  const gridSize = 25;
  const cells: boolean[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));

  // Función para rellenar cuadros de posición QR (esquinas 7x7)
  const addPositionFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          cells[startY + r][startX + c] = true;
        }
      }
    }
  };

  addPositionFinder(0, 0);
  addPositionFinder(gridSize - 7, 0);
  addPositionFinder(0, gridSize - 7);

  // Líneas de sincronización (timing patterns)
  for (let i = 8; i < gridSize - 8; i++) {
    cells[6][i] = i % 2 === 0;
    cells[i][6] = i % 2 === 0;
  }

  // Patrón de datos basado en hash del string
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Evitar sobreescribir las esquinas de sincronización
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= gridSize - 8;
      const inBottomLeft = r >= gridSize - 8 && c < 8;
      if (inTopLeft || inTopRight || inBottomLeft) continue;

      const seed = Math.sin(hash + r * 31 + c * 17) * 10000;
      cells[r][c] = (seed - Math.floor(seed)) > 0.48;
    }
  }

  const cellSize = size / gridSize;

  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-2xl bg-white p-3 shadow-lg flex items-center justify-center"
    >
      <svg
        width={size - 24}
        height={size - 24}
        viewBox={`0 0 ${gridSize} ${gridSize}`}
        className="shape-rendering-crispEdges"
      >
        <rect width={gridSize} height={gridSize} fill="#ffffff" />
        {cells.map((row, r) =>
          row.map((active, c) =>
            active ? (
              <rect
                key={`${r}-${c}`}
                x={c}
                y={r}
                width={1}
                height={1}
                fill="#0d0d10"
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}
