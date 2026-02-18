import { useState, useEffect } from "react";

const data = [
    { type: "Technology", value: 27, color: "#6366f1" },
    { type: "Healthcare", value: 25, color: "#22d3ee" },
    { type: "Finance", value: 18, color: "#f59e0b" },
    { type: "Retail", value: 15, color: "#10b981" },
    { type: "Energy", value: 10, color: "#f43f5e" },
    { type: "Other", value: 5, color: "#94a3b8" },
];

const total = data.reduce((s, d) => s + d.value, 0);

function PieSlice({ slice, isHovered, onHover, onLeave }) {
    const { startAngle, endAngle, color, item } = slice;
    const cx = 160, cy = 160, r = isHovered ? 130 : 120;
    const innerR = 55;

    const toXY = (angle, radius) => ({
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
    });

    const start = toXY(startAngle, r);
    const end = toXY(endAngle, r);
    const innerStart = toXY(startAngle, innerR);
    const innerEnd = toXY(endAngle, innerR);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

    const d = [
        `M ${innerStart.x} ${innerStart.y}`,
        `L ${start.x} ${start.y}`,
        `A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`,
        `L ${innerEnd.x} ${innerEnd.y}`,
        `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
        "Z",
    ].join(" ");

    return (
        <path
            d={d}
            fill={color}
            opacity={isHovered ? 1 : 0.85}
            style={{
                transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                cursor: "pointer",
                filter: isHovered ? `drop-shadow(0 0 12px ${color}88)` : "none",
            }}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
        />
    );
}

export default function PurchasePieChart() {
    const [hovered, setHovered] = useState(null);
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        setTimeout(() => setAnimated(true), 100);
    }, []);

    // Build slices
    const slices = [];
    let angle = -Math.PI / 2;
    for (const item of data) {
        const sweep = (item.value / total) * 2 * Math.PI;
        slices.push({ item, startAngle: angle, endAngle: angle + sweep, color: item.color });
        angle += sweep;
    }

    const hoveredItem = hovered !== null ? data[hovered] : null;

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f4f4f8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'DM Sans', sans-serif",
                padding: "40px 20px",
            }}
        >
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .legend-item { transition: all 0.2s ease; }
        .legend-item:hover { transform: translateX(4px); }
      `}</style>

            <div
                style={{
                    background: "linear-gradient(145deg, #ffffff 0%, #f8f8fd 100%)",
                    border: "1px solid #e5e5f0",
                    borderRadius: "24px",
                    padding: "40px",
                    maxWidth: "720px",
                    width: "100%",
                    boxShadow: "0 20px 60px #0000000d, 0 4px 16px #0000000a",
                }}
            >
                {/* Header */}
                <div style={{ marginBottom: "36px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6366f1", boxShadow: "0 0 8px #6366f1" }} />
                        <span style={{ color: "#6366f1", fontSize: "11px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                            Market Overview
                        </span>
                    </div>
                    <h1
                        style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: "28px",
                            fontWeight: 800,
                            color: "#f1f1f9",
                            letterSpacing: "-0.02em",
                            lineHeight: 1.2,
                        }}
                    >
                        Sector Distribution
                    </h1>
                    <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "6px", fontWeight: 300 }}>
                        Portfolio allocation across key market segments
                    </p>
                </div>

                {/* Main content */}
                <div style={{ display: "flex", gap: "40px", alignItems: "center", flexWrap: "wrap" }}>
                    {/* SVG Chart */}
                    <div style={{ position: "relative", flexShrink: 0 }}>
                        <svg
                            width="320"
                            height="320"
                            style={{
                                opacity: animated ? 1 : 0,
                                transform: animated ? "scale(1)" : "scale(0.85)",
                                transition: "all 0.6s cubic-bezier(0.34, 1.2, 0.64, 1)",
                            }}
                        >
                            <defs>
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>

                            {/* Subtle ring */}
                            <circle cx="160" cy="160" r="145" fill="none" stroke="#ffffff06" strokeWidth="1" />
                            <circle cx="160" cy="160" r="55" fill="#0d0d1a" />

                            {slices.map((slice, i) => (
                                <PieSlice
                                    key={i}
                                    slice={slice}
                                    isHovered={hovered === i}
                                    onHover={() => setHovered(i)}
                                    onLeave={() => setHovered(null)}
                                />
                            ))}

                            {/* Center text */}
                            <text
                                x="160"
                                y="152"
                                textAnchor="middle"
                                fill={hoveredItem ? hoveredItem.color : "#f1f1f9"}
                                fontSize={hoveredItem ? "22" : "26"}
                                fontWeight="700"
                                fontFamily="Syne, sans-serif"
                                style={{ transition: "all 0.2s ease" }}
                            >
                                {hoveredItem ? `${hoveredItem.value}%` : `${total}`}
                            </text>
                            <text
                                x="160"
                                y="172"
                                textAnchor="middle"
                                fill="#6b7280"
                                fontSize="10"
                                fontFamily="DM Sans, sans-serif"
                                letterSpacing="0.08em"
                            >
                                {hoveredItem ? hoveredItem.type.toUpperCase() : "TOTAL UNITS"}
                            </text>
                        </svg>
                    </div>

                    {/* Legend */}
                    <div style={{ flex: 1, minWidth: "180px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {data.map((item, i) => {
                                const pct = ((item.value / total) * 100).toFixed(1);
                                const isActive = hovered === i;
                                return (
                                    <div
                                        key={i}
                                        className="legend-item"
                                        onMouseEnter={() => setHovered(i)}
                                        onMouseLeave={() => setHovered(null)}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",
                                            padding: "10px 12px",
                                            borderRadius: "10px",
                                            background: isActive ? `${item.color}15` : "transparent",
                                            border: `1px solid ${isActive ? item.color + "40" : "transparent"}`,
                                            cursor: "pointer",
                                            transition: "all 0.2s ease",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "10px",
                                                height: "10px",
                                                borderRadius: "3px",
                                                background: item.color,
                                                flexShrink: 0,
                                                boxShadow: isActive ? `0 0 8px ${item.color}` : "none",
                                                transition: "box-shadow 0.2s ease",
                                            }}
                                        />
                                        <span
                                            style={{
                                                color: isActive ? "#f1f1f9" : "#9ca3af",
                                                fontSize: "13px",
                                                fontWeight: isActive ? 500 : 400,
                                                flex: 1,
                                                transition: "color 0.2s ease",
                                            }}
                                        >
                                            {item.type}
                                        </span>
                                        <span
                                            style={{
                                                color: isActive ? item.color : "#4b5563",
                                                fontSize: "13px",
                                                fontWeight: 600,
                                                fontVariantNumeric: "tabular-nums",
                                                transition: "color 0.2s ease",
                                            }}
                                        >
                                            {pct}%
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Stats row */}
                        <div
                            style={{
                                marginTop: "20px",
                                display: "flex",
                                gap: "12px",
                            }}
                        >
                            <div
                                style={{
                                    flex: 1,
                                    background: "#ffffff06",
                                    border: "1px solid #ffffff10",
                                    borderRadius: "10px",
                                    padding: "12px",
                                    textAlign: "center",
                                }}
                            >
                                <div style={{ color: "#f1f1f9", fontSize: "20px", fontWeight: 700, fontFamily: "Syne, sans-serif" }}>
                                    {data.length}
                                </div>
                                <div style={{ color: "#6b7280", fontSize: "11px", marginTop: "2px", letterSpacing: "0.05em" }}>
                                    Sectors
                                </div>
                            </div>
                            <div
                                style={{
                                    flex: 1,
                                    background: "#ffffff06",
                                    border: "1px solid #ffffff10",
                                    borderRadius: "10px",
                                    padding: "12px",
                                    textAlign: "center",
                                }}
                            >
                                <div style={{ color: "#6366f1", fontSize: "20px", fontWeight: 700, fontFamily: "Syne, sans-serif" }}>
                                    27%
                                </div>
                                <div style={{ color: "#6b7280", fontSize: "11px", marginTop: "2px", letterSpacing: "0.05em" }}>
                                    Top Share
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}