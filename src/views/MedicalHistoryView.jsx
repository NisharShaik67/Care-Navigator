import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FolderHeart, FileText, Download, Upload, Plus, Search, Filter, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const MedicalHistoryView = () => {
  const { records, addMedicalRecord } = useApp();
  const [filterType, setFilterType] = useState('All');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [title, setTitle] = useState('');
  const [type, setType] = useState('Lab Report');
  const [doctor, setDoctor] = useState('Dr. Rajesh Sharma');
  const [facility, setFacility] = useState('City Care Hospital');
  const [summary, setSummary] = useState('');

  const filteredRecords = records.filter(rec => filterType === 'All' || rec.type === filterType);

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!title) return;
    addMedicalRecord({
      title,
      type,
      date: new Date().toISOString().split('T')[0],
      doctor,
      facility,
      summary: summary || 'Patient uploaded digital health record document.'
    });
    setShowUploadModal(false);
    setTitle('');
    setSummary('');
  };

  return (
    <div className="medical-history-container fade-in">
      {/* Header Banner */}
      <div className="vault-header-card glass-panel">
        <div className="vault-left">
          <div className="vault-icon-box">
            <FolderHeart size={26} color="#a855f7" />
          </div>
          <div>
            <h3>Digital Health Vault & EHR</h3>
            <p>Encrypted personal medical records, lab tests, and digital prescriptions</p>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
          <Plus size={18} />
          <span>Upload Record</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs-row glass-panel">
        {['All', 'Lab Report', 'Prescription', 'Vaccination'].map(t => (
          <button
            key={t}
            className={`tab-btn ${filterType === t ? 'active' : ''}`}
            onClick={() => setFilterType(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Records List */}
      <div className="records-grid">
        {filteredRecords.map(rec => (
          <div key={rec.id} className="record-card glass-panel fade-in">
            <div className="rec-top">
              <div className="rec-type-badge">
                <FileText size={16} color="#a855f7" />
                <span>{rec.type}</span>
              </div>
              <span className="rec-date">{rec.date}</span>
            </div>

            <h4 className="rec-title">{rec.title}</h4>
            <p className="rec-doctor">{rec.doctor} • {rec.facility}</p>
            <p className="rec-summary">{rec.summary}</p>

            <div className="rec-footer">
              <span className="encrypted-tag">
                <ShieldCheck size={14} color="#10b981" /> 256-Bit Encrypted
              </span>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => alert(`Downloading encrypted record PDF: ${rec.title}`)}
              >
                <Download size={14} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(null)}>
          <div className="modal-content glass-panel fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Upload New Medical Record</h3>
            <p className="modal-subtitle">Add prescriptions, diagnostic lab reports, or vaccination files.</p>

            <form onSubmit={handleUploadSubmit} className="upload-form">
              <label className="form-label">Document Title</label>
              <input
                type="text"
                className="form-input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Lipid Profile Lab Test"
                required
              />

              <label className="form-label">Record Category</label>
              <select className="form-input" value={type} onChange={e => setType(e.target.value)}>
                <option value="Lab Report">Lab Report</option>
                <option value="Prescription">Prescription</option>
                <option value="Vaccination">Vaccination Record</option>
                <option value="Discharge Summary">Discharge Summary</option>
              </select>

              <label className="form-label">Prescribing Doctor / Facility</label>
              <input
                type="text"
                className="form-input"
                value={doctor}
                onChange={e => setDoctor(e.target.value)}
                placeholder="Dr. Rajesh Sharma"
              />

              <label className="form-label">Clinical Notes / Summary</label>
              <textarea
                className="form-input textarea"
                value={summary}
                onChange={e => setSummary(e.target.value)}
                placeholder="Brief summary of test findings or dosage instructions..."
              />

              <div className="file-drop-area">
                <Upload size={28} color="#a855f7" />
                <span>Drag & drop image or PDF file here</span>
                <span className="file-sub">Supports PDF, JPG, PNG up to 15MB</span>
              </div>

              <div className="modal-footer-btns">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle2 size={18} />
                  <span>Save to EHR Vault</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .medical-history-container {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .vault-header-card {
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .vault-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .vault-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: rgba(168, 85, 247, 0.15);
          border: 1px solid rgba(168, 85, 247, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vault-left h3 {
          font-size: 1.15rem;
          font-weight: 800;
        }

        .vault-left p {
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .filter-tabs-row {
          padding: 8px 12px;
          display: flex;
          gap: 8px;
        }

        .tab-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 0.82rem;
          font-weight: 700;
          padding: 8px 16px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab-btn.active {
          background: rgba(168, 85, 247, 0.12);
          color: #9333ea;
        }

        .records-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px;
        }

        .record-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .rec-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .rec-type-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(168, 85, 247, 0.12);
          border: 1px solid rgba(168, 85, 247, 0.3);
          color: #9333ea;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 999px;
        }

        .rec-date {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .rec-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .rec-doctor {
          font-size: 0.82rem;
          color: var(--text-sub);
          margin-top: -6px;
        }

        .rec-summary {
          font-size: 0.84rem;
          color: var(--text-sub);
          line-height: 1.5;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 12px;
          border-radius: 10px;
        }

        .rec-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 4px;
        }

        .encrypted-tag {
          font-size: 0.72rem;
          color: #059669;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .upload-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .form-input {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 10px 14px;
          color: var(--text-main);
          font-size: 0.92rem;
          outline: none;
        }

        .form-input.textarea {
          min-height: 80px;
          resize: vertical;
        }

        .file-drop-area {
          border: 2px dashed rgba(168, 85, 247, 0.4);
          background: rgba(168, 85, 247, 0.08);
          border-radius: 14px;
          padding: 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-sub);
        }

        .file-sub {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .modal-footer-btns {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
};
