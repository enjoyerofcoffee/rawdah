import React, { useRef, useState } from "react";

type CityLabelProps = {
  name: string;
  fill: string;
};
export const CityLabel: React.FC<CityLabelProps> = ({ name }) => {
  const [textWidth, setTextWidth] = useState<number>(0);
  const textRef = useRef<SVGTextElement | null>(null);

  // measure text once it's rendered
  React.useEffect(() => {
    if (textRef.current) {
      const w = textRef.current.getComputedTextLength();
      setTextWidth(w);
    }
  }, [name]);

  const paddingX = 2;
  const boxW = textWidth + paddingX * 2;
  const boxH = 10; // tweak

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
        ref={textRef}
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
