import React from 'react';

const NaviGuide = ({ naviMessage }) => {
  const displayMessage = naviMessage || "こんにちは。私はこの世界の観測者です。オブジェクトをクリックして、その性質を調べてみましょう。";

  return (
    <div className="navi-guide tactical-panel">
      <div className="navi-character">
        <div className="navi-eye"></div>
      </div>
      <div className="navi-content">
        <div className="navi-header">NAVI SYSTEM v1.0</div>
        <div className="navi-text">{displayMessage}</div>
      </div>
    </div>
  );
};

export default NaviGuide;
