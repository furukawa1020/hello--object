import React, { useState } from 'react';

const Onboarding = ({ onComplete, steps: providedSteps }) => {
  const [step, setStep] = useState(0);
  
  const steps = (providedSteps && providedSteps.length > 0) ? providedSteps : [
    {
      title: "Loading Tutorial...",
      content: "真理を読み込んでいます..."
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
