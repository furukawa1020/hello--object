import React, { useState, useEffect } from 'react';

const NaviGuide = ({ currentObject, lastResult, lastError }) => {
  const [message, setMessage] = useState("こんにちは。私はこの世界の観測者です。オブジェクトをクリックして、その性質を調べてみましょう。");

  useEffect(() => {
    if (lastError) {
      if (lastError.includes("NoMethodError")) {
        setMessage("その言葉はこのオブジェクトには通じないようです。サイドパネルの『Try』リストを見てみてください。");
      } else {
        setMessage("何か問題が起きたようです。コードをもう一度確認してみましょう。");
      }
    } else if (currentObject) {
      if (currentObject.class_name === 'Chest' && currentObject.variables.locked) {
        setMessage("このチェストは鍵がかかっていますね。まずは『鍵』を探して、それを使ってみてはどうでしょうか？");
      } else if (currentObject.class_name === 'Door' && currentObject.variables.locked) {
        setMessage("扉に鍵がかかっています。『door.unlock』と唱えれば、道が開けるかもしれません。");
      } else {
        setMessage(`${currentObject.name}を調べていますね。そのオブジェクトが持っている『変数』に注目してみてください。`);
      }
    }
  }, [currentObject, lastResult, lastError]);

  return (
    <div className="navi-guide tactical-panel">
      <div className="navi-character">
        <div className="navi-eye"></div>
      </div>
      <div className="navi-content">
        <div className="navi-header">NAVI SYSTEM v1.0</div>
        <div className="navi-text">{message}</div>
      </div>
    </div>
  );
};

export default NaviGuide;
