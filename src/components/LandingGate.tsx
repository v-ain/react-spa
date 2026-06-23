import React, { useState, useEffect } from 'react'

interface LandingGateProps {
  onInitializationComplete: () => void
}

export default function LandingGate({ onInitializationComplete }: LandingGateProps) {
  const [cryptoToken, setCryptoToken] = useState<string>('••••••••••••••••••••')
  const [bruteForceActive, setBruteForceActive] = useState<boolean>(false)
  const [clusterNode, setClusterNode] = useState<string>('node_eu#401')

  const executeBruteForce = (): void => {
    if (bruteForceActive) return
    setBruteForceActive(true)
    let iterations = 0

    const stream = setInterval(() => {
      const matrixChars = 'X01982#$@&%ABCDEF'
      let frame = ''
      for (let i = 0; i < 16; i++) {
        frame += matrixChars[Math.floor(Math.random() * matrixChars.length)]
      }
      setCryptoToken(frame)
      iterations++

      if (iterations > 12) {
        clearInterval(stream)
        setCryptoToken('SECURE_BYPASS_GRANTED_v3')
        setBruteForceActive(false)
        setTimeout(() => onInitializationComplete(), 500)
      }
    }, 70)
  }

  return (
    <div
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'var(--bg-matrix)',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '400px',
          backgroundColor: 'var(--bg-panel)',
          border: '1px solid var(--matrix-border)',
          borderRadius: '8px',
          padding: '32px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-bright)' }}>System Initializer</span>
          <span style={{ fontSize: '10px', color: 'var(--text-dimmed)' }}>// GATE_X7</span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            onInitializationComplete()
          }}
        >
          <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
              <label style={{ color: 'var(--text-muted)' }}>KERNEL_ACCESS_TOKEN</label>
              <span onClick={executeBruteForce} style={{ color: 'var(--text-neon)', cursor: 'pointer' }}>
                {bruteForceActive ? '[CRACKING...]' : '[BRUTE_FORCE]'}
              </span>
            </div>
            <input
              type="text"
              value={cryptoToken}
              disabled
              readOnly
              style={{
                backgroundColor: 'var(--bg-terminal)',
                border: '1px solid var(--matrix-border)',
                color: 'var(--text-bright)',
                padding: '10px',
                borderRadius: '4px',
                fontFamily: 'monospace',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TARGET_CLUSTER_NODE</label>
            <select
              value={clusterNode}
              onChange={(e) => setClusterNode(e.target.value)}
              style={{
                backgroundColor: 'var(--bg-terminal)',
                border: '1px solid var(--matrix-border)',
                color: 'var(--text-bright)',
                padding: '10px',
                borderRadius: '4px',
                outline: 'none',
              }}
            >
              <option value="node_eu#401">EU_MAIN_CLUSTER_NODE</option>
              <option value="node_us#102">US_BACKUP_CLUSTER_NODE</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={bruteForceActive}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'var(--text-neon)',
              color: '#030407',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'monospace',
            }}
          >
            CONNECT_TO_CORE_GRID {'->'}
          </button>
        </form>
      </div>
    </div>
  )
}
