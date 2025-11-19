import React, { useState } from "react";

const API_URL = "https://Hyakkaou.pythonanywhere.com/solve";

// 默认方块数量
const initialPieceCounts = {
    L3: 1,
    L4: 2,
    I4: 1,
    O4: 1,
    T4: 1,
    Z4: 2,
    C5: 1,
};

// UI 配置
const shapeConfig = [
    { key: "I2", label: "I2", emoji: "🟩" },
    { key: "L3", label: "L3", emoji: "📐" },
    { key: "L4", label: "L4", emoji: "🟪" },
    { key: "I4", label: "I4", emoji: "🟦" },
    { key: "O4", label: "O4", emoji: "🟨" },
    { key: "T4", label: "T4", emoji: "🟣" },
    { key: "Z4", label: "Z4", emoji: "🟥" },
    { key: "C5", label: "C5", emoji: "🟧" },
];

export default function SolverUI() {
    const [width, setWidth] = useState(6);
    const [height, setHeight] = useState(6);
    const [pieceCounts, setPieceCounts] = useState(initialPieceCounts);
    const [solution, setSolution] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handlePieceCountChange = (key, value) => {
        const newValue = Math.max(0, parseInt(value, 10) || 0);

        setPieceCounts((prev) => ({
            ...prev,
            [key]: newValue,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setSolution(null);
        setError(null);

        const payload = {
            width: Number(width),
            height: Number(height),
            pieces: pieceCounts,
        };

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("API 请求失败，状态码: " + res.status);

            const data = await res.json();

            if (data.status === "success") setSolution(data.solution);
            else setError(data.message);
        } catch (err) {
            setError("请求失败: " + err.message);
        }

        setIsLoading(false);
    };

    const handleReset = () => {
        setWidth(6);
        setHeight(6);
        setPieceCounts(initialPieceCounts);
        setSolution(null);
        setError(null);
    };

    return (
        <div className="container margin-top--lg margin-bottom--lg">
            {/* 表单 */}
            <form onSubmit={handleSubmit}>

                {/* =================== 卡片：尺寸 =================== */}
                <div className="card shadow--md margin-bottom--lg">
                    <div className="card__header">
                        <h3>网格尺寸</h3>
                    </div>

                    <div className="card__body">
                        <div className="row">

                            {/* 宽度 */}
                            <div className="col col--6">
                                <label className="margin-bottom--xs"><strong>宽度 (Width)</strong></label>
                                <input
                                    type="number"
                                    value={width}
                                    onChange={(e) => setWidth(Math.max(1, Number(e.target.value)))}
                                    className="padding--sm"
                                    style={{
                                        width: "100%",
                                        borderRadius: "8px",
                                        border: "1px solid var(--ifm-color-emphasis-300)",
                                    }}
                                />
                            </div>

                            {/* 高度 */}
                            <div className="col col--6">
                                <label className="margin-bottom--xs"><strong>高度 (Height)</strong></label>
                                <input
                                    type="number"
                                    value={height}
                                    onChange={(e) => setHeight(Math.max(1, Number(e.target.value)))}
                                    className="padding--sm"
                                    style={{
                                        width: "100%",
                                        borderRadius: "8px",
                                        border: "1px solid var(--ifm-color-emphasis-300)",
                                    }}
                                />
                            </div>

                        </div>
                    </div>
                </div>

                {/* =================== 卡片：方块 =================== */}
                <div className="card shadow--md margin-bottom--lg">
                    <div className="card__header">
                        <h3>方块设置</h3>
                    </div>

                    <div className="card__body">
                        <div
                            className="row"
                            style={{ rowGap: "1rem" }}
                        >
                            {shapeConfig.map((shape) => (
                                <div key={shape.key} className="col col--4">
                                    <div
                                        className="padding--sm"
                                        style={{
                                            border: "1px solid var(--ifm-color-emphasis-300)",
                                            borderRadius: "10px",
                                            background: "var(--ifm-background-color-secondary)",
                                        }}
                                    >
                                        <label>
                                            <span style={{ fontSize: "1.8rem", marginRight: "0.5rem" }}>
                                                {shape.emoji}
                                            </span>
                                            {shape.label}
                                        </label>

                                        <input
                                            type="number"
                                            value={pieceCounts[shape.key]}
                                            min={0}
                                            className="margin-top--xs padding--xs"
                                            onChange={(e) => handlePieceCountChange(shape.key, e.target.value)}
                                            style={{
                                                width: "100%",
                                                borderRadius: "8px",
                                                border: "1px solid var(--ifm-color-emphasis-300)",
                                                textAlign: "center",
                                                fontSize: "1.1rem",
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 按钮区 */}
                <div className="text--center margin-bottom--lg">
                    <button
                        type="submit"
                        className="button button--primary button--lg"
                        disabled={isLoading}
                    >
                        {isLoading ? "计算中..." : "开始求解"}
                    </button>

                    <button
                        type="button"
                        onClick={handleReset}
                        className="button button--secondary button--lg margin-left--md"
                        disabled={isLoading}
                    >
                        重置
                    </button>
                </div>
            </form>

            {/* 结果 */}
            {solution && (
                <div className="card shadow--md margin-top--lg">
                    <div className="card__header">
                        <h3>求解成功</h3>
                    </div>
                    <div className="card__body">
                        <pre
                            style={{
                                whiteSpace: "pre-wrap",
                                fontSize: "1.4rem",
                                lineHeight: "1.5",
                                background: "var(--ifm-code-background)",
                                padding: "1rem",
                                borderRadius: "10px",
                            }}
                        >
                            {solution.join("\n")}
                        </pre>
                    </div>
                </div>
            )}

            {/* 错误 */}
            {error && (
                <div className="card shadow--md margin-top--lg">
                    <div className="card__header">
                        <h3>错误</h3>
                    </div>
                    <div
                        className="card__body"
                        style={{ background: "var(--ifm-color-danger-dark)", color: "white" }}
                    >
                        {error}
                    </div>
                </div>
            )}

        </div>
    );
}
