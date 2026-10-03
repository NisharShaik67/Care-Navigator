import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, Search, Filter, Star, Phone, MapPin, Clock, Bed, HeartPulse, ChevronRight, Stethoscope, X } from 'lucide-react';

const SPECIALTY_FILTERS = ['All', 'Emergency', 'Cardiology', 'ICU', 'Pediatrics', 'Orthopedics', 'General'];

export const HospitalsView = () => {
  const { hospitals, navigateTo } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedHospitalModal, setSelectedHospitalModal] = useState(null);

  const filteredHospitals = (hospitals || []).filter(hosp => {
    const q = (searchTerm || '').toLowerCase().trim();
    const matchesSearch = !q ||
                          (hosp.name || '').toLowerCase().includes(q) ||
                          (hosp.address || '').toLowerCase().includes(q) ||
                          (hosp.specialties || []).some(s => (s || '').toLowerCase().includes(q));
    const matchesFilter = selectedFilter === 'All' || 
                          (hosp.specialties || []).some(s => (s || '').toLowerCase().includes((selectedFilter || '').toLowerCase()));
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="hospitals-view-container fade-in">
      {/* Search & Filter Header */}
      <div className="search-filter-bar glass-panel">
        <div className="search-input-group" style={{ position: 'relative' }}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search hospitals by name, area, or specialty..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px', display: 'flex', alignItems: 'center' }}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="filter-chips-row">
          <Filter size={16} color="#94a3b8" />
          {SPECIALTY_FILTERS.map(filter => (
            <button
              key={filter}
              className={`filter-pill ${selectedFilter === filter ? 'active' : ''}`}
              onClick={() => setSelectedFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Hospitals Cards Grid */}
      <div className="hospitals-grid">
        {filteredHospitals.map(hosp => (
          <div key={hosp.id} className="hospital-card glass-panel fade-in">
            <div className="hosp-card-header">
              <div>
                <h3 className="hosp-title">{hosp.name}</h3>
                <p className="hosp-address">
                  <MapPin size={14} color="#94a3b8" />
                  <span>{hosp.address} • <strong>{hosp.distance}</strong></span>
                </p>
              </div>
              <div className="rating-box">
                <Star size={14} color="#eab308" fill="#eab308" />
                <span>{hosp.rating}</span>
                <span className="reviews">({hosp.reviews})</span>
              </div>
            </div>

            <div className="hosp-vitals-row">
              <div className="vital-tag tag-emerald">
                <Bed size={15} />
                <span>{hosp.bedsAvailable} Beds Available</span>
              </div>
              <div className="vital-tag tag-sky">
                <HeartPulse size={15} />
                <span>{hosp.icuAvailable} ICU Units</span>
              </div>
              <div className="vital-tag tag-amber">
                <Clock size={15} />
                <span>{hosp.emergencyQueue}</span>
              </div>
            </div>

            <div className="specialties-tags">
              {hosp.specialties.map((spec, i) => (
                <span key={i} className="spec-badge">{spec}</span>
              ))}
            </div>

            <div className="hosp-card-footer">
              <a href={`tel:${hosp.phone}`} className="btn btn-secondary btn-sm">
                <Phone size={14} />
                <span>Call</span>
              </a>
              <button 
                className="btn btn-primary btn-sm" 
                onClick={() => navigateTo('op-booking')}
              >
                <Stethoscope size={14} />
                <span>Book OP Token</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .hospitals-view-container {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .search-filter-bar {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .search-input-group {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f8fafc;
          border: 1px solid var(--border-dark);
          border-radius: 14px;
          padding: 10px 16px;
        }

        .search-input-group input {
          background: none;
          border: none;
          color: var(--text-main);
          font-size: 0.95rem;
          outline: none;
          width: 100%;
        }

        .filter-chips-row {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .filter-pill {
          background: #f1f5f9;
          border: 1.5px solid #cbd5e1;
          color: #334155;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 999px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .filter-pill:hover {
          background: #e2e8f0;
          color: #0f172a;
          border-color: #94a3b8;
        }

        .filter-pill.active {
          background: #0284c7 !important;
          border-color: #0284c7 !important;
          color: #ffffff !important;
          font-weight: 800;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);
        }

        .hospitals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }

        .hospital-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 16px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
          transition: all 0.25s ease;
        }

        .hospital-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
          border-color: #cbd5e1;
        }

        .hosp-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .hosp-title {
          font-size: 1.15rem;
          font-weight: 800;
          margin-bottom: 4px;
          color: var(--text-main);
        }

        .hosp-address {
          font-size: 0.82rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .rating-box {
          display: flex;
          align-items: center;
          gap: 4px;
          background: transparent;
          border: none;
          padding: 0;
          font-size: 0.85rem;
          font-weight: 800;
          color: #eab308;
          white-space: nowrap;
        }

        .rating-box .reviews {
          font-size: 0.72rem;
          color: #94a3b8;
          font-weight: 600;
        }

        .hosp-vitals-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .vital-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 10px;
          font-size: 0.78rem;
          font-weight: 700;
        }

        .tag-emerald {
          background: rgba(16, 185, 129, 0.12);
          color: #059669;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .tag-sky {
          background: rgba(2, 132, 199, 0.12);
          color: #0284c7;
          border: 1px solid rgba(2, 132, 199, 0.3);
        }

        .tag-amber {
          background: rgba(245, 158, 11, 0.12);
          color: #d97706;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .specialties-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .spec-badge {
          background: #f8fafc;
          border: 1px solid var(--border-dark);
          color: var(--text-sub);
          font-size: 0.72rem;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .hosp-card-footer {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }

        .hosp-card-footer .btn {
          flex: 1;
        }

        /* Mobile & Small Screen Responsive Adjustments */
        @media (max-width: 768px) {
          .hospitals-view-container {
            padding: 14px 12px;
            gap: 14px;
          }

          .hospitals-grid {
            display: flex;
            flex-direction: column;
            gap: 14px;
            width: 100%;
          }

          .hospital-card {
            width: 100%;
            padding: 18px 16px;
            gap: 14px;
          }

          .hosp-card-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
          }

          .hosp-title {
            font-size: 1.05rem;
          }

          .hosp-vitals-row {
            display: flex;
            flex-direction: column;
            gap: 6px;
            width: 100%;
          }

          .vital-tag {
            width: 100%;
            justify-content: flex-start;
            padding: 8px 12px;
          }

          .hosp-card-footer {
            flex-direction: column;
            gap: 8px;
            width: 100%;
          }

          .hosp-card-footer .btn {
            width: 100%;
            justify-content: center;
          }
        }

      `}</style>
    </div>
  );
};
