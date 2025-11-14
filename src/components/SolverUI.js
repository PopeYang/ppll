import React, { useState } from 'react';

// 你的 API 服务器地址
const API_URL = 'http://Hyakkaou.pythonanywhere.com/solve';

// --- 新的配置 ---

// 1. 定义方块的默认数量
const initialPieceCounts = {
    L3: 0,
    L4: 2,
    I4: 2,
    O4: 1,
    T4: 2,
    Z4: 2,
};

// 2. 定义 UI 配置 (包括 Emoji)
const shapeConfig = [
    { key: 'L3', label: 'L3 (3格L)', emoji: '📐' },
    { key: 'L4', label: 'L4 (4格L)', emoji: '🟪' },
    { key: 'I4', label: 'I4 (直线)', emoji: '🟦' },
    { key: 'O4', label: 'O4 (方形)', emoji: '🟨' },
    { key: 'T4', label: 'T4 (T形)', emoji: '🟣' },
    { key: 'Z4', label: 'Z4 (Z形)', emoji: '🟥' },
];

// --- React 组件 ---

export default function SolverUI() {
    // --- State (状态) ---
    const [width, setWidth] = useState(6);
    const [height, setHeight] = useState(6);

    // [!] 使用新 state 替换旧的 'pieces' 字符串
    const [pieceCounts, setPieceCounts] = useState(initialPieceCounts);

    const [solution, setSolution] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // --- 事件处理 ---

    // 处理单个方块数量变化的函数
    const handlePieceCountChange = (key, value) => {
        // 确保输入是数字, 最小为 0
        const newCount = Math.max(0, parseInt(value, 10) || 0);
        setPieceCounts(prevCounts => ({
            ...prevCounts,
            [key]: newCount,
        }));
    };

    // handleSubmit 使用 pieceCounts 对象, 而不是 JSON 字符串
    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setSolution(null);
        setError(null);

        // 准备要发送的数据
        const payload = {
            width: parseInt(width, 10),
            height: parseInt(height, 10),
            pieces: pieceCounts,
        };

        // 发送 fetch 请求
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`API 请求失败, 状态码: ${response.status}`);
            }
            const data = await response.json();
            if (data.status === 'success') {
                setSolution(data.solution);
            } else {
                setError(data.message);
            }
        } catch (e) {
            setError('请求失败: ' + e.message + ' (请检查CORS或网络连接)');
        }

        setIsLoading(false);
    };

    // handleReset 重置 pieceCounts 对象
    const handleReset = () => {
        setWidth(6);
        setHeight(6);
        setPieceCounts(initialPieceCounts);
        setSolution(null);
        setError(null);
        setIsLoading(false);
    }

    // --- UI (界面) ---
    return (
        <div style={{ padding: '1rem 0' }}>
            <form onSubmit={handleSubmit}>

                {/* --- 宽度和高度 (一行) --- */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap', // 移动端换行
                    gap: '1.5rem',
                    marginBottom: '1.5rem'
                }}>
                    <div>
                        <label style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>
                            宽度 (Width):
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={width}
                            onChange={(e) => setWidth(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            required
                            style={{ width: '80px' }}
                        />
                    </div>
                    <div>
                        <label style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>
                            高度 (Height):
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={height}
                            onChange={(e) => setHeight(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            required
                            style={{ width: '80px' }}
                        />
                    </div>
                </div>

                {/* --- 方块数量输入 (网格布局) --- */}
                <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 'bold' }}>
                    方块数量 (Pieces):
                </label>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', // 响应式网格
                    gap: '1rem',
                    marginBottom: '2rem',
                }}>
                    {shapeConfig.map(shape => (
                        <div key={shape.key} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.75rem',
                            borderRadius: 'var(--ifm-code-border-radius)',
                            border: '1px solid var(--ifm-color-emphasis-300)',
                            backgroundColor: 'var(--ifm-background-color-secondary)'
                        }}>
                            <label htmlFor={shape.key} style={{ fontWeight: '500' }}>
                                <span style={{ fontSize: '1.75rem', marginRight: '0.75rem', verticalAlign: 'middle' }}>
                                    {shape.emoji}
                                </span>
                                {shape.label}:
                            </label>
                            <input
                                id={shape.key}
                                type="number"
                                min="0"
                                value={pieceCounts[shape.key]}
                                onChange={(e) => handlePieceCountChange(shape.key, e.target.value)}
                                style={{ width: '70px', fontSize: '1rem', textAlign: 'center' }}
                            />
                        </div>
                    ))}
                </div>

                {/* --- 按钮 --- */}
                <button type="submit" className="button button--primary" disabled={isLoading}>
                    {isLoading ? '正在计算...' : '求解'}
                </button>
                <button
                    type="button"
                    className="button button--secondary"
                    onClick={handleReset}
                    style={{ marginLeft: '1rem' }}
                    disabled={isLoading}
                >
                    重置
                </button>
            </form>

            {/* --- 结果显示区 --- */}
            {solution && (
                <div style={{ marginTop: '2rem' }}>
                    <h3>求解成功!</h3>
                    <pre style={{
                        backgroundColor: 'var(--ifm-code-background)',
                        padding: '1rem',
                        lineHeight: '1.5',
                        fontSize: '1.5rem',
                        overflowX: 'auto',
                        borderRadius: 'var(--ifm-code-border-radius)'
                    }}>
                        {solution.join('\n')}
                    </pre>
                </div>
            )}

            {/* --- 错误显示区 --- */}
            {error && (
                <div style={{ marginTop: '2rem' }}>
                    <h3>错误</h3>
                    <div style={{
                        backgroundColor: 'var(--ifm-background-color-danger-dark)',
                        color: 'white',
                        padding: '1rem',
                        borderRadius: 'var(--ifm-code-border-radius)'
                    }}>
                        <p style={{ margin: 0 }}>{error}</p>
                    </div>
                </div>
            )}
        </div>
    );
}