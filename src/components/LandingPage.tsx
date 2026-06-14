import React, { useState, useEffect } from 'react';

// Описываем строгий контракт для входящих пропсов
interface LandingPageProps {
  onConnect: () => void;
}

export default function LandingPage({ onConnect }: LandingPageProps) {
  const [token, setToken] = useState<string>('••••••••••••••••••••');
  const [isBypassing, setIsBypassing] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<string>('node_eu#401');
  const [nodePing, setNodePing] = useState<number>(18);

  // Симулируем колебание пинга выбранного сервера
  useEffect(() => {
    const interval = setInterval(() => {
      setNodePing((prev) => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(10, prev + change);
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Алгоритм хакерского перебора токена (Brute force)
  const handleAutoBypass = (): void => {
    if (isBypassing) return;
    setIsBypassing(true);
    let counter = 0;

    const interval = setInterval(() => {
      const chars = 'ABCDEF0123456789X#$@';
      let randomStr = '';
      for (let i = 0; i < 16; i++) {
        randomStr += chars[Math.floor(Math.random() * chars.length)];
      }
      setToken(randomStr);
      counter++;

      if (counter > 15) {
        clearInterval(interval);
        setToken('ACC_GRANTED_OK_v3.0');
        setIsBypassing(false);
        // Задержка перед автоматическим триггером входа для фиксации успеха визуально
        setTimeout(() => onConnect(), 600);
      }
    }, 80);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    onConnect();
  };

  return (
    <div className="landing-page">
      <div className="landing-glow"></div>

      <div className="auth-gateway">
        <div className="gateway-deco">// SECURE_GATE_v3</div>

        <div className="gateway-header">
          <h1 className="gateway-title">Terminal Gateway</h1>
          <p className="gateway-subtitle">
            Автономная система мониторинга. Для входа инициализируйте сессию или запустите обходной протокол.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ margin: 0 }}>

          {/* Поле токена с хакерской кнопкой взлома */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Client Access Token</label>
              <button
                type="button"
                onClick={handleAutoBypass}
                disabled={isBypassing}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--tech-cyan)',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontFamily: 'JetBrains Mono, monospace'
                }}
              >
                {isBypassing ? '[BYPASSING...]' : '[AUTO_BYPASS]'}
              </button>
            </div>
            <input
              type="text"
              className="gateway-input"
              value={token}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToken(e.target.value)}
              disabled={isBypassing}
              required
            />
          </div>

          {/* Интерактивный выбор узла */}
          <div className="form-group">
            <label className="form-label">Target Cluster Node</label>
            <select
              className="gateway-input"
              value={selectedNode}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedNode(e.target.value)}
              style={{ appearance: 'none', cursor: 'pointer' }}
            >
              <option value="node_eu#401">EU_CENTRAL_CLUSTER (Active)</option>
              <option value="node_us#102">US_EAST_CLUSTER (Backup)</option>
              <option value="node_asia#90">ASIA_TOKYO_CLUSTER (Restricted)</option>
            </select>
          </div>

          <button type="submit" className="btn-connect" disabled={isBypassing}>
            <span>INITIALIZE_SESSION</span>
            <span>-&gt;</span>
          </button>

        </form>

        <div className="gateway-footer">
          <span>PING: {nodePing}ms</span>
          <span>NODE: {selectedNode.toUpperCase()}</span>
        </div>

      </div>
    </div>
  );
}

