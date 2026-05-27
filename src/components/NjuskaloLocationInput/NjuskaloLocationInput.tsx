"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { StringInputProps, set, unset } from "sanity";
import locations from "./njuskalo_locations.json";

interface Location {
  id: string;
  county: string;
  town: string;
  district: string;
}

const allLocations: Location[] = locations as Location[];

export function NjuskaloLocationInput(props: StringInputProps) {
  const { value, onChange, readOnly } = props;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLocation = value
    ? allLocations.find((l) => l.id === value)
    : null;

  const filtered =
    query.trim().length < 2
      ? []
      : allLocations
          .filter((l) => {
            const q = query.toLowerCase();
            return (
              l.town.toLowerCase().includes(q) ||
              l.district.toLowerCase().includes(q) ||
              l.county.toLowerCase().includes(q) ||
              l.id.includes(q)
            );
          })
          .slice(0, 30);

  const select = useCallback(
    (loc: Location) => {
      onChange(set(loc.id));
      setQuery("");
      setOpen(false);
    },
    [onChange],
  );

  const clear = useCallback(() => {
    onChange(unset());
    setQuery("");
  }, [onChange]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && filtered[highlighted]) {
      e.preventDefault();
      select(filtered[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", fontFamily: "inherit" }}
    >
      {/* Selected value display */}
      {selectedLocation && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px",
            marginBottom: "6px",
            background: "#1a2744",
            border: "1px solid #2a3a6a",
            borderRadius: "6px",
            fontSize: "13px",
            color: "#c8d8ff",
          }}
        >
          <span>
            <strong style={{ color: "#6b9fff" }}>
              ID: {selectedLocation.id}
            </strong>
            {" — "}
            {selectedLocation.district ? `${selectedLocation.district}, ` : ""}
            {selectedLocation.town},{" "}
            <span style={{ color: "#7a8aaa" }}>{selectedLocation.county}</span>
          </span>
          {!readOnly && (
            <button
              onClick={clear}
              style={{
                marginLeft: "8px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#7a8aaa",
                fontSize: "18px",
                lineHeight: 1,
                padding: "0 2px",
              }}
              title="Ukloni"
            >
              ×
            </button>
          )}
        </div>
      )}

      {/* Search input */}
      {!readOnly && (
        <input
          type="text"
          placeholder="Pretraži po gradu, kvartu ili županiji..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlighted(0);
          }}
          onFocus={() => query.length >= 2 && setOpen(true)}
          onKeyDown={handleKeyDown}
          style={{
            width: "100%",
            padding: "8px 12px",
            background: "#1a1a1a",
            border: "1px solid #333",
            borderRadius: "6px",
            fontSize: "14px",
            color: "#e0e0e0",
            boxSizing: "border-box",
            outline: "none",
          }}
        />
      )}

      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 1000,
            background: "#1e1e1e",
            border: "1px solid #333",
            borderRadius: "6px",
            marginTop: "4px",
            maxHeight: "260px",
            overflowY: "auto",
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
          }}
        >
          {filtered.map((loc, i) => (
            <div
              key={loc.id}
              onMouseDown={() => select(loc)}
              onMouseEnter={() => setHighlighted(i)}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: "13px",
                color: "#d0d0d0",
                background: i === highlighted ? "#2a2a3a" : "transparent",
                borderBottom: "1px solid #2a2a2a",
              }}
            >
              <span style={{ fontWeight: 600, color: "#6b9fff" }}>
                {loc.id}
              </span>
              {" — "}
              {loc.district ? (
                <>
                  <strong style={{ color: "#e0e0e0" }}>{loc.district}</strong>
                  {", "}
                  <span style={{ color: "#aaa" }}>{loc.town}</span>
                  {", "}
                  <span style={{ color: "#666" }}>{loc.county}</span>
                </>
              ) : (
                <>
                  <strong style={{ color: "#e0e0e0" }}>{loc.town}</strong>
                  {", "}
                  <span style={{ color: "#666" }}>{loc.county}</span>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {open && query.trim().length >= 2 && filtered.length === 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 1000,
            background: "#1e1e1e",
            border: "1px solid #333",
            borderRadius: "6px",
            marginTop: "4px",
            padding: "10px 12px",
            fontSize: "13px",
            color: "#666",
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
          }}
        >
          Nema rezultata za &quot;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
