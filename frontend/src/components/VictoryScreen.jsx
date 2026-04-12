import React, { useEffect, useRef } from 'react';
import { sounds } from '../utils/sounds';

/**
 * VictoryScreen — displayed when the user successfully opens the cursed door
 * via metaprogramming. Full-screen, cinematic.
 */
const VictoryScreen = ({ onDismiss }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    sounds.victory();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    // Particle burst
    const particles = Array.from({ length: 180 }, () => ({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8 - 2,
      life: 1,
      decay: 0.008 + Math.random() * 0.012,
      size: 2 + Math.random() * 4,
      hue: 40 + Math.random() * 40,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        if (p.life <= 0) return;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${p.life})`;
        ctx.fill();
        p.x    += p.vx;
        p.y    += p.vy;
        p.vy   += 0.1; // gravity
        p.life -= p.decay;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="victory-overlay">
      <canvas ref={canvasRef} className="victory-canvas" />

      <div className="victory-content">
        <div className="victory-glyph">⛧</div>
        <h1 className="victory-title">呪いを突破した</h1>
        <p className="victory-subtitle">
          あなたは Ruby の力を使い、<br />
          世界の定義を書き換えました。
        </p>
        <div className="victory-detail">
          <code>class Door</code>を再オープンし、<br />
          <code>@cursed</code> を無効化することで、<br />
          不可能を可能にしました。
        </div>
        <div className="victory-ruby-lesson">
          <div className="lesson-label">📘 学んだこと</div>
          <ul>
            <li>Rubyのクラスは実行中に再定義できる（オープンクラス）</li>
            <li>メソッドを上書きすることで「不変の法則」を変えられる</li>
            <li>これを <strong>モンキーパッチ</strong> と呼ぶ</li>
          </ul>
        </div>
        <button className="button-tactical victory-btn" onClick={onDismiss}>
          続けて探索する →
        </button>
      </div>
    </div>
  );
};

export default VictoryScreen;
