import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, Search, Filter, Star, Phone, MapPin, Clock, Bed, HeartPulse, ChevronRight, Stethoscope } from 'lucide-react';

const SPECIALTY_FILTERS = ['All', 'Emergency', 'Cardiology', 'ICU', 'Pediatrics', 'Orthopedics', 'General'];

export const HospitalsView = () => {
  const { hospitals, navigateTo } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedHospitalModal, setSelectedHospitalModal] = useState(null);

  const filteredHospitals = hospitals.filter(hosp => {
    const matchesSearch = hosp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          hosp.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || hosp.specialties.some(s => s.toLowerCase().includes(selectedFilter.toLowerCase()));
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="hospitals-view-container fade-in">
      {/* Search & Filter Header */}
      <div className="search-filter-bar glass-panel">
        <div className="search-input-group">
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search hospitals by name, area, or specialty..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
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
          background: #f8fafc;
          border: 1px solid var(--border-dark);
          color: var(--text-sub);
          font-size: 0.78rem;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 999px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .filter-pill.active {
          background: var(--primary);
          border-color: var(--primary);
          color: #fff;
        }

        .hospitals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px;
        }

        .hospital-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 16px;
        }

        .hosp-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
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
      `}</style>
    </div>
  );
};
