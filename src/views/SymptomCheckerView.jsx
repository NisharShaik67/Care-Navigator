import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bot, Send, ShieldAlert, AlertTriangle, CheckCircle, Stethoscope, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';

const PRESET_SYMPTOMS = [
  "Chest pain and shortness of breath",
  "High fever (102°F) with body chills",
  "Severe headache & sudden dizziness",
  "Persistent dry cough & throat pain",
  "Abdominal pain after meals",
  "Joint swelling and stiffness"
];

export const SymptomCheckerView = () => {
  const { navigateTo, bookOPToken } = useApp();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I am Care Navigator's AI Medical Triage Assistant. Please describe what health symptoms or discomfort you are currently experiencing.",
      time: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [assessment, setAssessment] = useState(null);

  const handleSend = (textToSend = inputText) => {
    const query = textToSend.trim();
    if (!query) return;

    // Add User Message
    const userMsg = { id: Date.now(), sender: 'user', text: query, time: 'Just now' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsAnalyzing(true);

    // Simulate AI clinical triage analysis
    setTimeout(() => {
      let riskLevel = 'ROUTINE'; // ROUTINE, URGENT, EMERGENCY
      let specialist = 'General Physician';
      let summary = 'Your symptoms suggest mild seasonal discomfort or general fatigue.';
      let recommendations = [
        'Rest and stay well hydrated.',
        'Monitor temperature every 4 hours.',
        'Consult a General Physician if symptoms persist beyond 48 hours.'
      ];

      const lower = query.toLowerCase();
      if (lower.includes('chest') || lower.includes('breath') || lower.includes('shortness') || lower.includes('faint')) {
        riskLevel = 'EMERGENCY';
        specialist = 'Cardiologist / Emergency';
        summary = 'CRITICAL WARNING: Symptoms indicate potential cardiac or severe pulmonary stress.';
        recommendations = [
          'IMMEDIATE ACTION REQUIRED: Press Emergency SOS for 1-tap ambulance dispatch.',
          'Do not drive yourself to hospital.',
          'Sit in a comfortable upright position while waiting for emergency responders.'
        ];
      } else if (lower.includes('fever') || lower.includes('headache') || lower.includes('chills') || lower.includes('cough')) {
        riskLevel = 'URGENT';
        specialist = 'General Physician / Pulmonologist';
        summary = 'Symptoms indicate acute viral upper respiratory infection or pyrexia.';
        recommendations = [
          'Book an OP Token slot for same-day physician consultation.',
          'Take prescribed antipyretics if advised.',
          'Maintain adequate electrolyte intake.'
        ];
      } else if (lower.includes('stomach') || lower.includes('abdominal') || lower.includes('nausea')) {
        riskLevel = 'URGENT';
        specialist = 'Gastroenterologist';
        summary = 'Symptoms suggest acute gastric distress or gastrointestinal inflammation.';
        recommendations = [
          'Avoid solid, spicy, or heavy foods.',
          'Schedule an OP Token consultation with a Gastroenterologist.'
        ];
      }

      const botReply = {
        id: Date.now() + 1,
        sender: 'bot',
        text: `Analysis Complete: Evaluated risk level as ${riskLevel}. ${summary}`,
        time: 'Just now'
      };

      setMessages(prev => [...prev, botReply]);
      setAssessment({ riskLevel, specialist, summary, recommendations, symptomQuery: query });
      setIsAnalyzing(false);
    }, 1200);
  };

  const handleBookFromAssessment = () => {
    navigateTo('op-booking');
  };

  return (
    <div className="symptom-checker-container fade-in">
      {/* Header Banner */}
      <div className="ai-header-card glass-panel">
        <div className="ai-badge-row">
          <div className="ai-icon-box">
            <Bot size={24} color="#10b981" />
          </div>
          <div>
            <h3>AI Medical Triage Assistant</h3>
            <p>Powered by Clinical Triage Protocols & Machine Learning</p>
          </div>
        </div>
        <span className="badge badge-emerald">
          <Sparkles size={12} /> Clinical Guidance
        </span>
      </div>

      {/* Chat Conversation Area */}
      <div className="chat-window glass-panel">
        <div className="messages-scroll">
          {messages.map(msg => (
            <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender}`}>
              <div className={`chat-bubble ${msg.sender}`}>
                <p>{msg.text}</p>
                <span className="bubble-time">{msg.time}</span>
              </div>
            </div>
          ))}

          {isAnalyzing && (
            <div className="chat-bubble-wrapper bot">
              <div className="chat-bubble bot analyzing">
                <RefreshCw size={16} className="spin" color="#10b981" />
                <span>Analyzing clinical symptoms...</span>
              </div>
            </div>
          )}
        </div>

        {/* Assessment Card Result */}
        {assessment && (
          <div className={`assessment-card glass-panel fade-in risk-${assessment.riskLevel.toLowerCase()}`}>
            <div className="risk-header">
              {assessment.riskLevel === 'EMERGENCY' && <ShieldAlert size={24} color="#ef4444" />}
              {assessment.riskLevel === 'URGENT' && <AlertTriangle size={24} color="#f59e0b" />}
              {assessment.riskLevel === 'ROUTINE' && <CheckCircle size={24} color="#10b981" />}

              <div>
                <h4>Triage Assessment: {assessment.riskLevel}</h4>
                <p>{assessment.summary}</p>
              </div>
            </div>

            <div className="rec-box">
              <span className="rec-title">Recommended Specialist:</span>
              <span className="specialist-tag">{assessment.specialist}</span>
            </div>

            <ul className="rec-list">
              {assessment.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>

            <div className="assessment-actions">
              {assessment.riskLevel === 'EMERGENCY' ? (
                <button className="btn btn-emergency btn-block" onClick={() => navigateTo('emergency')}>
                  <ShieldAlert size={18} />
                  <span>TRIGGER EMERGENCY SOS DISPATCH</span>
                </button>
              ) : (
                <button className="btn btn-primary btn-block" onClick={handleBookFromAssessment}>
                  <Stethoscope size={18} />
                  <span>Book OP Token with {assessment.specialist}</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Preset Chips */}
        <div className="preset-chips-scroll">
          <span className="chip-label">Quick Symptoms:</span>
          {PRESET_SYMPTOMS.map((chip, idx) => (
            <button key={idx} className="symptom-chip" onClick={() => handleSend(chip)}>
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="chat-input-bar">
          <input
            type="text"
            placeholder="Type your health symptoms (e.g., severe chest pain, fever)..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button className="btn btn-primary btn-send" onClick={() => handleSend()}>
            <Send size={18} />
          </button>
        </div>
      </div>

      <style>{`
        .symptom-checker-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 24px;
          height: 100%;
          overflow: hidden;
        }

        .ai-header-card {
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .ai-badge-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .ai-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ai-badge-row h3 {
          font-size: 1rem;
          font-weight: 800;
        }

        .ai-badge-row p {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .chat-window {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          padding: 16px;
        }

        .messages-scroll {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-right: 8px;
          margin-bottom: 12px;
        }

        .chat-bubble-wrapper {
          display: flex;
        }

        .chat-bubble-wrapper.user {
          justify-content: flex-end;
        }

        .chat-bubble-wrapper.bot {
          justify-content: flex-start;
        }

        .chat-bubble {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .chat-bubble.user {
          background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-hover) 100%);
          color: #fff;
          border-bottom-right-radius: 4px;
        }

        .chat-bubble.bot {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: var(--text-main);
          border-bottom-left-radius: 4px;
        }

        .chat-bubble.analyzing {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-muted);
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin { 100% { transform: rotate(360deg); } }

        .bubble-time {
          font-size: 0.68rem;
          opacity: 0.7;
          display: block;
          margin-top: 4px;
          text-align: right;
        }

        .assessment-card {
          padding: 20px;
          margin-bottom: 12px;
          border-radius: 16px;
        }

        .assessment-card.risk-emergency {
          border-color: rgba(239, 68, 68, 0.4);
          background: rgba(239, 68, 68, 0.08);
        }

        .assessment-card.risk-urgent {
          border-color: rgba(245, 158, 11, 0.4);
          background: rgba(245, 158, 11, 0.08);
        }

        .assessment-card.risk-routine {
          border-color: rgba(16, 185, 129, 0.4);
          background: rgba(16, 185, 129, 0.08);
        }

        .risk-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }

        .risk-header h4 {
          font-size: 1rem;
          font-weight: 800;
          color: var(--text-main);
        }

        .risk-header p {
          font-size: 0.84rem;
          color: var(--text-sub);
        }

        .rec-box {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .rec-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .specialist-tag {
          background: rgba(2, 132, 199, 0.12);
          border: 1px solid rgba(2, 132, 199, 0.3);
          color: #0284c7;
          font-size: 0.82rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 999px;
        }

        .rec-list {
          padding-left: 20px;
          font-size: 0.82rem;
          color: var(--text-sub);
          margin-bottom: 16px;
        }

        .rec-list li {
          margin-bottom: 4px;
        }

        .preset-chips-scroll {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 8px;
          margin-bottom: 8px;
        }

        .chip-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .symptom-chip {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: var(--text-sub);
          font-size: 0.78rem;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 999px;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .symptom-chip:hover {
          background: rgba(16, 185, 129, 0.12);
          border-color: var(--primary);
          color: var(--text-main);
        }

        .chat-input-bar {
          display: flex;
          gap: 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 6px 6px 6px 16px;
        }

        .chat-input-bar input {
          flex: 1;
          background: none;
          border: none;
          color: var(--text-main);
          font-size: 0.95rem;
          outline: none;
        }

        .btn-send {
          padding: 10px 16px;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};
