import React, { useState } from 'react';

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  
  const steps = [
    {
      title: "hello, object へようこそ",
      content: "ここは、Rubyという魔法を使って『オブジェクト』と対話する世界です。まずは画面左のオブジェクト（ドアやチェスト）をクリックしてみましょう。"
    },
    {
      title: "オブジェクトの正体を知る",
      content: "オブジェクトをクリックすると、右側にその『内部状態（変数）』と、何ができるかの『Actions』が表示されます。"
    },
    {
      title: "魔法を唱える (Magic Note)",
      content: "画面下のノートにコードを入力して『Execute』を押すと、オブジェクトに命令を送れます。最初は『Actions』ボタンをクリックして、魔法を試してみましょう！"
    }
  ];

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal tactical-panel">
        <div className="onboarding-header">
          {steps[step].title}
          <div className="step-dots">
            {steps.map((_, i) => (
              <div key={i} className={`dot ${i === step ? 'active' : ''}`}></div>
            ))}
          </div>
        </div>
        <div className="onboarding-content">
          {steps[step].content}
        </div>
        <button onClick={next} className="button-tactical">
          {step === steps.length - 1 ? "冒険を始める" : "次へ"}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
