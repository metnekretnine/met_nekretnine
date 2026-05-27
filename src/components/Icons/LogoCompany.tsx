import React from "react";

interface LogoCompanyProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
  primaryColor?: string;
}

const LogoCompany: React.FC<LogoCompanyProps> = ({
  width = 180,
  height = 64,
  primaryColor = "#101114",
  ...props
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 180 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="MET"
    {...props}
  >
    <text
      x="2"
      y="49"
      fill={primaryColor}
      fontFamily="Inter, Arial, Helvetica, sans-serif"
      fontSize="56"
      fontWeight="700"
      letterSpacing="-2"
    >
      MET
    </text>
  </svg>
);

export { LogoCompany };
