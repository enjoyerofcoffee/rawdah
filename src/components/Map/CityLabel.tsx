import React from "react";

type CityLabelProps = {
  name: string;
};
export const CityLabel: React.FC<CityLabelProps> = ({ name }) => {
  const paddingX = 2;
  console.log(name);
  const boxW = name.length + 10;
  const boxH = 12;

  return (
    <g transform="translate(3, -2)">
      <rect
        x={0}
        y={0}
        rx={1}
        ry={1}
        width={boxW}
        height={boxH}
        fill="#121C23" // dark bg
        strokeWidth={0.2}
      />

      {/* actual text */}
      <text
        x={paddingX}
        y={boxH / 2 + 1.2} // vertical centering fudge
        style={{
          fontSize: "0.2rem",
          fill: "#e2e8f0",
          fontWeight: 500,
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        {name}
      </text>
    </g>
  );
};
