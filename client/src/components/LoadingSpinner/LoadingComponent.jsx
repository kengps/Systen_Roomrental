import * as React from "react";


const LoadingComponent = ({
    text = "Loading",
    className = "",
    variant = "gradient",
    size = "md",
    theme = "minimal",
}) => {
    const sizeConfig = {
        sm: { spinner: 40, text: "text-sm", gap: "gap-4" },
        md: { spinner: 60, text: "text-base", gap: "gap-6" },
        lg: { spinner: 80, text: "text-xl", gap: "gap-8" },
    };

    const config = sizeConfig[size];

    const themeStyles = {
        neon: {
            bg: "from-purple-900 via-blue-900 to-indigo-900",
            text: "text-cyan-300",
            accent1: "#00f0ff",
            accent2: "#ff00ff",
            accent3: "#00ff88",
        },
        glass: {
            bg: "from-slate-900 via-purple-900 to-slate-900",
            text: "text-white",
            accent1: "#ffffff",
            accent2: "#a78bfa",
            accent3: "#60a5fa",
        },
        gradient: {
            bg: "from-rose-900 via-purple-900 to-indigo-900",
            text: "text-rose-200",
            accent1: "#fb7185",
            accent2: "#c084fc",
            accent3: "#818cf8",
        },
        minimal: {
            bg: "from-gray-950 via-gray-900 to-black",
            text: "text-gray-300",
            accent1: "#d4d4d8",
            accent2: "#a1a1aa",
            accent3: "#71717a",
        },
        cosmic: {
            bg: "from-indigo-950 via-violet-950 to-purple-950",
            text: "text-violet-200",
            accent1: "#8b5cf6",
            accent2: "#d946ef",
            accent3: "#06b6d4",
        },
    };

    const currentTheme = themeStyles[theme];

    const renderGradientSpinner = () => (
        <div
            className="relative"
            style={{ width: config.spinner, height: config.spinner }}
        >
            <svg
                className="absolute inset-0 w-full h-full animate-spin"
                style={{ animationDuration: "2s" }}
                viewBox="0 0 100 100"
            >
                <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop
                            offset="0%"
                            stopColor={currentTheme.accent1}
                            stopOpacity="1"
                        />
                        <stop
                            offset="50%"
                            stopColor={currentTheme.accent2}
                            stopOpacity="1"
                        />
                        <stop
                            offset="100%"
                            stopColor={currentTheme.accent3}
                            stopOpacity="1"
                        />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#gradient1)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="283"
                    strokeDashoffset="75"
                    filter="url(#glow)"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <div
                    className="rounded-full animate-pulse"
                    style={{
                        width: config.spinner * 0.3,
                        height: config.spinner * 0.3,
                        background: `radial-gradient(circle, ${currentTheme.accent2}, transparent)`,
                    }}
                />
            </div>
        </div>
    );

    const renderDotsSpinner = () => (
        <div className="flex items-center justify-center gap-2">
            {[0, 1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="rounded-full"
                    style={{
                        width: size === "sm" ? 8 : size === "md" ? 12 : 16,
                        height: size === "sm" ? 8 : size === "md" ? 12 : 16,
                        background:
                            i % 2 === 0 ? currentTheme.accent1 : currentTheme.accent2,
                        animation: "dotPulse 1.4s ease-in-out infinite",
                        animationDelay: `${i * 0.2}s`,
                        boxShadow: `0 0 20px ${i % 2 === 0 ? currentTheme.accent1 : currentTheme.accent2
                            }`,
                    }}
                />
            ))}
        </div>
    );

    const renderOrbitSpinner = () => (
        <div
            className="relative"
            style={{ width: config.spinner, height: config.spinner }}
        >
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className="absolute inset-0 animate-spin"
                    style={{
                        animationDuration: `${2 + i * 0.5}s`,
                        animationDirection: i % 2 === 0 ? "normal" : "reverse",
                    }}
                >
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: 12,
                            height: 12,
                            top: 0,
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: [
                                currentTheme.accent1,
                                currentTheme.accent2,
                                currentTheme.accent3,
                            ][i],
                            boxShadow: `0 0 20px ${[
                                    currentTheme.accent1,
                                    currentTheme.accent2,
                                    currentTheme.accent3,
                                ][i]
                                }`,
                        }}
                    />
                </div>
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
                <div
                    className="rounded-full animate-pulse"
                    style={{
                        width: 16,
                        height: 16,
                        background: currentTheme.accent2,
                        boxShadow: `0 0 30px ${currentTheme.accent2}`,
                    }}
                />
            </div>
        </div>
    );

    const renderWaveSpinner = () => (
        <div className="flex items-center justify-center gap-1">
            {[0, 1, 2, 3, 4, 6, 7].map((i) => (
                <div
                    key={i}
                    className="rounded-full"
                    style={{
                        width: size === "sm" ? 3 : size === "md" ? 4 : 5,
                        height: size === "sm" ? 20 : size === "md" ? 30 : 40,
                        background: `linear-gradient(to top, ${currentTheme.accent1}, ${currentTheme.accent2})`,
                        animation: "waveMove 1.2s ease-in-out infinite",
                        animationDelay: `${i * 0.1}s`,
                        boxShadow: `0 0 10px ${currentTheme.accent1}`,
                    }}
                />
            ))}
        </div>
    );

    const renderMorphSpinner = () => (
        <div
            className="relative"
            style={{ width: config.spinner, height: config.spinner }}
        >
            <div
                className="absolute inset-0 rounded-full"
                style={{
                    background: `linear-gradient(135deg, ${currentTheme.accent1}, ${currentTheme.accent2}, ${currentTheme.accent3})`,
                    animation: "morph 3s ease-in-out infinite",
                    boxShadow: `0 0 40px ${currentTheme.accent2}`,
                }}
            />
        </div>
    );

    const renderRingsSpinner = () => (
        <div
            className="relative"
            style={{ width: config.spinner, height: config.spinner }}
        >
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className="absolute animate-spin"
                    style={{
                        inset: i * 8,
                        border: "3px solid transparent",
                        borderTopColor: [
                            currentTheme.accent1,
                            currentTheme.accent2,
                            currentTheme.accent3,
                        ][i],
                        borderRadius: "50%",
                        animationDuration: `${1.5 - i * 0.3}s`,
                        animationDirection: i % 2 === 0 ? "normal" : "reverse",
                        boxShadow: `0 0 15px ${[
                                currentTheme.accent1,
                                currentTheme.accent2,
                                currentTheme.accent3,
                            ][i]
                            }`,
                    }}
                />
            ))}
        </div>
    );

    const renderSpinner = () => {
        switch (variant) {
            case "dots":
                return renderDotsSpinner();
            case "orbit":
                return renderOrbitSpinner();
            case "wave":
                return renderWaveSpinner();
            case "morph":
                return renderMorphSpinner();
            case "rings":
                return renderRingsSpinner();
            default:
                return renderGradientSpinner();
        }
    };

    const renderText = () => {
        return text.split("").map((char, i) => (
            <span
                key={i}
                className="inline-block"
                style={{
                    animation: "textFloat 2s ease-in-out infinite",
                    animationDelay: `${i * 0.1}s`,
                }}
            >
                {char === " " ? "\u00A0" : char}
            </span>
        ));
    };

    return (
        <>
            <style>{`
        @keyframes dotPulse {
          0%, 100% { 
            transform: scale(0.5); 
            opacity: 0.5; 
          }
          50% { 
            transform: scale(1.2); 
            opacity: 1; 
          }
        }

        @keyframes waveMove {
          0%, 100% { 
            transform: scaleY(0.4);
            opacity: 0.4;
          }
          50% { 
            transform: scaleY(1);
            opacity: 1;
          }
        }

        @keyframes morph {
          0%, 100% { 
            border-radius: 50% 50% 50% 50%;
            transform: rotate(0deg) scale(1);
          }
          25% { 
            border-radius: 60% 40% 60% 40%;
            transform: rotate(90deg) scale(0.9);
          }
          50% { 
            border-radius: 40% 60% 40% 60%;
            transform: rotate(180deg) scale(1.1);
          }
          75% { 
            border-radius: 50% 50% 40% 60%;
            transform: rotate(270deg) scale(0.95);
          }
        }

        @keyframes textFloat {
          0%, 100% { 
            transform: translateY(0px);
            opacity: 0.7;
          }
          50% { 
            transform: translateY(-5px);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

            <div
                className={`fixed inset-0 bg-gradient-to-br ${currentTheme.bg} flex items-center justify-center z-50 ${className}`}
                style={{ animation: "fadeIn 0.5s ease-out" }}
            >
                <div className={`flex flex-col items-center ${config.gap}`}>
                    {renderSpinner()}

                    <div
                        className={`${config.text} ${currentTheme.text} font-semibold tracking-wider`}
                    >
                        {renderText()}
                        <span
                            className="inline-block"
                            style={{ animation: "dotPulse 1.4s ease-in-out infinite" }}
                        >
                            .
                        </span>
                        <span
                            className="inline-block"
                            style={{
                                animation: "dotPulse 1.4s ease-in-out infinite",
                                animationDelay: "0.2s",
                            }}
                        >
                            .
                        </span>
                        <span
                            className="inline-block"
                            style={{
                                animation: "dotPulse 1.4s ease-in-out infinite",
                                animationDelay: "0.4s",
                            }}
                        >
                            .
                        </span>
                    </div>
                </div>

                {/* Ambient particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full"
                            style={{
                                width: Math.random() * 4 + 2,
                                height: Math.random() * 4 + 2,
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                background: [
                                    currentTheme.accent1,
                                    currentTheme.accent2,
                                    currentTheme.accent3,
                                ][i % 3],
                                animation: `dotPulse ${2 + Math.random() * 3
                                    }s ease-in-out infinite`,
                                animationDelay: `${Math.random() * 2}s`,
                            }}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

export default LoadingComponent;
