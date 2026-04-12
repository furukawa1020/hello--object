import React, { useState, useEffect } from 'react';

const NaviGuide = ({ currentObject, lastResult, lastError }) => {
  const [message, setMessage] = useState("こんにちは。私はこの世界の観測者です。オブジェクトをクリックして、その性質を調べてみましょう。");

  useEffect(() => {
    if (lastError) {
      if (lastError.includes("呪印") || lastError.includes("呪い") || lastError.includes("cursed")) {
        setMessage("この扉の呪いは、通常の『鍵』や『魔法』では太刀打ちできないようです。…ならば『扉の定義』そのものを書き換えてみてはどうでしょう？右側にヒントがあります。");
      } else if (lastError.includes("NoMethodError")) {
        setMessage("その言葉はこのオブジェクトには通じないようです。サイドパネルの『Actions』を参考にしてください。");
      } else {
        setMessage("何か問題が起きたようです。コードをもう一度確認してみましょう。");
      }
    } else if (currentObject) {
      if (currentObject.variables.cursed) {
        setMessage("そのオブジェクトには、強力な『論理の呪い』がかかっています。右下の『Class Schematic』を見て、プログラムの定義を調べてみてください。");
      } else if (currentObject.class_name === 'Tome') {
        setMessage(`${currentObject.name}を見つけましたね。『tome.read』と唱えると、この世界の秘密が読み解けるかもしれません。`);
      } else if (currentObject.class_name === 'Npc') {
        setMessage(`石像の賢者です。『sage.talk』と話しかけてみてください。『sage.ask("cursed")』で呪いのヒントも聞けます。`);
      } else if (currentObject.class_name === 'Chest' && currentObject.variables.locked) {
        setMessage("このチェストは鍵がかかっていますね。まずは『鍵』を探して、それを使ってみてはどうでしょうか？");
      } else if (currentObject.class_name === 'Door' && currentObject.variables.locked) {
        setMessage("扉に鍵がかかっています。『door.unlock』と唱えれば、道が開けるかもしれません。");
      } else if (currentObject.class_name === 'Mirror') {
        setMessage("知識の鏡です。mirror.reflect(door) のように、任意のオブジェクトを引数に渡すと、そのクラスや使えるメソッドを映してくれます。");
      } else if (currentObject.class_name === 'Pedestal') {
        setMessage("試練の台座です。正しいアイテムを置くと何かが起こるようです。pedestal.place(key) を試してみてください。");
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
