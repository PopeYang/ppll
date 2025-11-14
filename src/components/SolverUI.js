import React, { useState } from 'react';

// [!] 关键: 你的 API 服务器地址
const API_URL = 'http://Hyakkaou.pythonanywhere.com/solve';

// 这是 React 组件, 而不是一个完整的页面
export default function SolverUI() {
    // --- State (状态) ---
    const [width, setWidth] = useState(6);
    const [height, setHeight] = useState(6);
    // [!] 我们把默认 pieces 放在一个变量里, 方便复用
    const defaultPieces = '{"L4": 2, "I4": 2, "O4": 1, "T4": 2, "Z4": 2}';
    const [pieces, setPieces] = useState(defaultPieces);

    const [solution, setSolution] = useState(null); // 存储结果
    const [error, setError] = useState(null);       // 存储错误信息
    const [isLoading, setIsLoading] = useState(false); // 存储加载状态

    // --- API 调用函数 ---
    const handleSubmit = async (event) => {
        event.preventDefault(); // 阻止表单默认提交
        setIsLoading(true);
        setSolution(null);
        setError(null);

        let piecesJson;
        try {
            // 1. 验证和解析 Pieces JSON
            piecesJson = JSON.parse(pieces);
        } catch (e) {
            setError('Pieces 字段的 JSON 格式错误: ' + e.message);
            setIsLoading(false);
            return;
        }

        // 2. 准备要发送的数据
        const payload = {
            width: parseInt(width, 10),
            height: parseInt(height, 10),
            pieces: piecesJson,
        };

        // 3. 发送 fetch 请求
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            // [!] 检查响应是否 OK (e.g., 500 错误)
            if (!response.ok) {
                throw new Error(`API 请求失败, 状态码: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === 'success') {
                setSolution(data.solution); // 成功
            } else {
                setError(data.message); // API 返回的失败 (e.g., "No solution found")
            }
        } catch (e) {
            // 网络错误或 CORS 错误会在这里捕获
            setError('请求失败: ' + e.message + ' (请检查CORS或网络连接)');
        }

        setIsLoading(false);
    };

    // --- 重置函数 ---
    const handleReset = () => {
        setWidth(6);
        setHeight(6);
        setPieces(defaultPieces);
        setSolution(null);
        setError(null);
        setIsLoading(false);
    }

    // --- UI (界面) ---
    // 注意: 这里没有 <Layout> 标签, 只是组件本身
    return (
        <div style={{ padding: '1rem 0' }}>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label>宽度 (Width): </label>
                    <input
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        required
                        style={{ marginLeft: '0.5rem' }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>高度 (Height): </label>
                    <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        required
                        style={{ marginLeft: '0.5rem' }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>方块 (Pieces JSON): </label>
                    <textarea
                        value={pieces}
                        onChange={(e) => setPieces(e.target.value)}
                        rows={5}
                        style={{
                            width: '100%',
                            fontFamily: 'monospace',
                            display: 'block',
                            marginTop: '0.5rem'
                        }}
                        required
                    />
                </div>

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
                        overflowX: 'auto'
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
                        backgroundColor: 'var(--ifm-background-color-danger-dark)', // Docusaurus 警告色
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