import React from "react";

interface LogoCompanyProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
  primaryColor?: string;
}

const LogoCompany: React.FC<LogoCompanyProps> = ({
  width = 180,
  height = 62,
  primaryColor = "#101114",
  ...props
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 1145 397"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="MET"
    {...props}
  >
    <path d="M822.124 1.16765H1145V67.7235H822.124V1.16765Z" fill={primaryColor} />
    <path d="M1023.34 41.2765V397H942.618V41.2765H1023.34Z" fill={primaryColor} />
    <path d="M584.646 67.7235V397H503.927V67.7235L584.646 67.7235Z" fill={primaryColor} />
    <path d="M503.927 1.16765H775.33V67.7235L503.927 67.7235V1.16765Z" fill={primaryColor} />
    <path d="M503.927 330.444H775.33V397H503.927V330.444Z" fill={primaryColor} />
    <path d="M503.927 163.471H758.953V230.026H503.927V163.471Z" fill={primaryColor} />
    <path d="M0 397L0.8172 0H114.135L216.829 294.411L319.251 0H431.751L432.841 397H356.569V96.3371L251.424 397H181.417L75.7267 94.9162V397H0Z" fill={primaryColor} />
    <path d="M584.646 21.2238V350.5H503.927V21.2237L584.646 21.2238Z" fill={primaryColor} />
  </svg>
);

export { LogoCompany };
