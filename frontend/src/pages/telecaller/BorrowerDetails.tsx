import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
  ChevronLeft, ChevronRight, Copy, MapPin, 
  MessageCircle, Mail, MessageSquare, Phone, Clock, Calendar, Check, X,
  ChevronDown, ChevronUp, Award, History, Plus, FileText, User
} from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function BorrowerDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();
  const rowData = state || {
    name: 'Kundan Kumar',
    acc: 'xxxxxxxx4525',
    fullAcc: '314590004525',
    phone: 'xxxxxx1264',
    fullPhone: '+919876541264',
    cardNumber: '',
    altPhone: '',
    email: '',
    dob: '',
    state: '',
    product: '95000',
    bucket: 'bkt91-180',
    location: 'Semaria',
    out: '₹9,810',
    followUp: '',
    remarks: '',
    best: '-',
    last: '-',
  };

  const [activeTab, setActiveTab] = useState('Basic Details');

  // Toggle View states
  const [viewPhone, setViewPhone] = useState(false);
  const [viewAcc, setViewAcc] = useState(false);
  const [viewCard, setViewCard] = useState(false);

  // Edit states for dynamic fields
  const [selectedDisposition, setSelectedDisposition] = useState('');
  const [selectedSubDisposition, setSelectedSubDisposition] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [skipFields, setSkipFields] = useState(false);
  const [paymentDate, setPaymentDate] = useState<Date | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [refNumber, setRefNumber] = useState('');
  const [comments, setComments] = useState('');

  const [lastDisposition, setLastDisposition] = useState('-');
  const [bestDisposition, setBestDisposition] = useState('-');

  const [showErrors, setShowErrors] = useState(false);

  const [currentOutstanding, setCurrentOutstanding] = useState(rowData.out || '0');
  const [lastPayment, setLastPayment] = useState({
    amount: 'N/A',
    mode: 'N/A',
    date: 'N/A'
  });

  const [mapCenter, setMapCenter] = useState<[number, number]>([12.899, 77.63]); // Default to Bangalore/Beguru
  const [isMapLoading, setIsMapLoading] = useState(false);

  useEffect(() => {
    if (rowData.location) {
      setIsMapLoading(true);
      const query = encodeURIComponent(`${rowData.location}, India`);
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          }
        })
        .catch(err => console.error("Geocoding failed:", err))
        .finally(() => setIsMapLoading(false));
    }
  }, [rowData.location]);

  useEffect(() => {
    const saved = localStorage.getItem('crm_updates');
    if (saved) {
      try {
        const updates = JSON.parse(saved);
        const myUpdate = updates[rowData.acc];
        if (myUpdate) {
          if (myUpdate.outstanding) setCurrentOutstanding(myUpdate.outstanding);
          if (myUpdate.lastPayment) setLastPayment(myUpdate.lastPayment);
          if (myUpdate.lastDisposition) {
            setLastDisposition(myUpdate.lastDisposition);
            setBestDisposition(myUpdate.lastDisposition);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [rowData.acc]);

  const handleSubmitDisposition = () => {
    setShowErrors(true);
    if (!selectedDisposition) {
      alert('Please select a disposition from Positive or Difficult pool.');
      return;
    }
    
    if (selectedSubDisposition && !skipFields) {
      if (!paymentDate || !paymentAmount || !paymentMode) {
        return;
      }
    }
    
    const dispName = selectedSubDisposition ? `${selectedDisposition} - ${selectedSubDisposition}` : selectedDisposition;
    setLastDisposition(dispName);
    // For simplicity in the demo, we just set Best Disposition to the same as Last
    setBestDisposition(dispName);

    let newOutStr = currentOutstanding;
    let newPaymentObj = { amount: 'N/A', mode: 'N/A', date: 'N/A' };

    if (!skipFields && paymentAmount) {
      newPaymentObj = {
        amount: `₹ ${paymentAmount}`,
        mode: paymentMode || 'N/A',
        date: paymentDate ? paymentDate.toLocaleDateString('en-GB') : 'N/A'
      };
      setLastPayment(newPaymentObj);

      let outStr = currentOutstanding.replace(/[^\d.]/g, '');
      let outNum = parseFloat(outStr);
      if (currentOutstanding.includes('Lakh')) outNum *= 100000;
      
      const payNum = parseFloat(paymentAmount);
      if (!isNaN(outNum) && !isNaN(payNum)) {
        outNum -= payNum;
        if (outNum >= 100000) {
          newOutStr = `₹ ${(outNum / 100000).toFixed(2)} Lakh`;
        } else {
          newOutStr = `₹ ${outNum.toLocaleString('en-IN')}`;
        }
        setCurrentOutstanding(newOutStr);
      }
    }
    
    // Save to localStorage
    const saved = localStorage.getItem('crm_updates');
    const updates = saved ? JSON.parse(saved) : {};
    updates[rowData.acc] = {
      ...updates[rowData.acc],
      outstanding: newOutStr,
      lastPayment: newPaymentObj.amount !== 'N/A' ? newPaymentObj : (updates[rowData.acc]?.lastPayment || newPaymentObj),
      lastDisposition: dispName,
      latestRemark: comments
    };
    localStorage.setItem('crm_updates', JSON.stringify(updates));

    alert(`Disposition successfully added: ${dispName}`);
    
    // Clear form
    setShowErrors(false);
    setSelectedDisposition('');
    setSelectedSubDisposition('');
    setSkipFields(false);
    setPaymentDate(null);
    setPaymentAmount('');
    setPaymentMode('');
    setRefNumber('');
    setComments('');
  };

  const [localData, setLocalData] = useState({
    altPhone: rowData.altPhone || '',
    email: rowData.email || '',
    dob: rowData.dob || '',
    state: rowData.state || ''
  });

  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [tempData, setTempData] = useState<Record<string, string>>({});

  const startEdit = (field: string) => {
    setTempData({ ...tempData, [field]: localData[field as keyof typeof localData] });
    setEditing({ ...editing, [field]: true });
  };

  const saveEdit = (field: string) => {
    setLocalData({ ...localData, [field]: tempData[field] });
    setEditing({ ...editing, [field]: false });
  };

  const cancelEdit = (field: string) => {
    setEditing({ ...editing, [field]: false });
  };

  const renderEditableField = (field: string, label: string, type = 'text', placeholder = '') => {
    const hasData = !!localData[field as keyof typeof localData];
    const isEditing = editing[field];

    return (
      <div style={{ marginBottom: '0.875rem' }}>
        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500', marginBottom: '0.25rem' }}>{label}</div>
        {isEditing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type={type} 
              value={tempData[field] || ''} 
              onChange={(e) => setTempData({...tempData, [field]: e.target.value})}
              placeholder={placeholder}
              style={{ padding: '0.35rem 0.65rem', border: '1px solid var(--border-active, rgba(99, 102, 241, 0.4))', borderRadius: 'var(--radius-md, 8px)', fontSize: '0.8125rem', width: '100%', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}
              autoFocus
            />
            <button type="button" onClick={() => saveEdit(field)} title="Save" style={{ background: 'var(--accent-success-bg, rgba(16, 185, 129, 0.12))', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-sm, 6px)', cursor: 'pointer', color: 'var(--accent-success, #10b981)', padding: '4px', display: 'flex' }}><Check size={14} /></button>
            <button type="button" onClick={() => cancelEdit(field)} title="Cancel" style={{ background: 'var(--accent-danger-bg, rgba(239, 68, 68, 0.12))', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-sm, 6px)', cursor: 'pointer', color: 'var(--accent-danger, #ef4444)', padding: '4px', display: 'flex' }}><X size={14} /></button>
          </div>
        ) : hasData ? (
          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{localData[field as keyof typeof localData]}</span>
            <button 
              type="button" 
              onClick={() => startEdit(field)}
              style={{ background: 'none', border: 'none', color: 'var(--accent-primary-light, #818cf8)', fontSize: '0.75rem', cursor: 'pointer', padding: 0, fontWeight: '500' }}
            >
              Edit
            </button>
          </div>
        ) : (
          <button 
            type="button" 
            onClick={() => startEdit(field)}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.35rem', 
              fontSize: '0.75rem', 
              fontWeight: '500', 
              color: 'var(--accent-primary-light, #818cf8)', 
              background: 'var(--bg-secondary)', 
              border: '1px dashed var(--border-color)', 
              borderRadius: 'var(--radius-md, 8px)', 
              padding: '0.35rem 0.65rem', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Plus size={12} /> Add {label.toLowerCase()}
          </button>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '1.5rem 2rem', background: 'var(--bg-main)', minHeight: '100vh', boxSizing: 'border-box' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={() => navigate(-1)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '34px', 
              height: '34px', 
              borderRadius: 'var(--radius-md, 8px)', 
              border: '1px solid var(--border-color)', 
              background: 'var(--bg-card)', 
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title="Back to My Calling Data"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <span>My Calling Data</span>
              <span style={{ opacity: 0.5 }}>/</span>
              <span style={{ color: 'var(--accent-primary-light, #818cf8)', fontWeight: '500' }}>Borrower Details</span>
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0.125rem 0 0 0', letterSpacing: '-0.02em' }}>
              Borrower Details
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ 
            fontSize: '0.8125rem', 
            color: 'var(--text-secondary)', 
            background: 'var(--bg-card)', 
            border: '1px solid var(--border-color)', 
            padding: '0.375rem 0.75rem', 
            borderRadius: 'var(--radius-md, 8px)' 
          }}>
            Account: <strong style={{ color: 'var(--text-primary)' }}>{rowData.acc}</strong>
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        
        {/* Left Column */}
        <div style={{ width: '270px', display: 'flex', flexDirection: 'column', gap: '1rem', flexShrink: 0 }}>
          
          {/* Borrower Profile Card */}
          <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-lg, 12px)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ 
                width: '42px', 
                height: '42px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-primary-dark, #4f46e5))', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#ffffff', 
                fontWeight: '700', 
                fontSize: '0.9375rem',
                boxShadow: '0 2px 8px var(--accent-primary-glow)',
                flexShrink: 0
              }}>
                {rowData.name ? rowData.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'B'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {rowData.name}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Primary Borrower
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: '0.875rem' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500', marginBottom: '0.25rem' }}>Primary contact number</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                <span>{viewPhone ? (rowData.fullPhone || rowData.phone) : rowData.phone}</span>
                <button 
                  type="button" 
                  onClick={() => setViewPhone(!viewPhone)}
                  style={{ 
                    fontSize: '0.6875rem', 
                    fontWeight: '600', 
                    color: 'var(--accent-primary-light, #818cf8)', 
                    background: 'var(--bg-secondary)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: 'var(--radius-sm, 6px)', 
                    padding: '2px 8px', 
                    cursor: 'pointer' 
                  }}
                >
                  {viewPhone ? 'Hide' : 'View'}
                </button>
              </div>
            </div>
            
            {renderEditableField('altPhone', 'Alternate number', 'tel', 'e.g. +91...')}
            {renderEditableField('email', 'Email', 'email', 'e.g. name@example.com')}
            {renderEditableField('dob', 'Date of Birth', 'date')}
            
            <div style={{ marginBottom: '0.875rem' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500', marginBottom: '0.25rem' }}>Customer City</div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>{rowData.location}</div>
            </div>
            
            {renderEditableField('state', 'State', 'text', 'e.g. Maharashtra')}
            
            <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border-color)', marginBottom: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500', marginBottom: '0.35rem' }}>
                <MapPin size={12} color="var(--accent-primary-light, #818cf8)" /> Address
              </div>
              <div style={{ fontSize: '0.8125rem', fontWeight: '500', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                simariai, Simaria Ghat, Barauni, Begusarai, Semaria
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500', marginBottom: '0.25rem' }}>Location</div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>{rowData.location}</div>
            </div>
          </div>
          
          {/* Best Disposition */}
          <div style={{ background: 'var(--bg-card)', padding: '1rem 1.125rem', borderRadius: 'var(--radius-lg, 12px)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-md, 8px)', background: 'rgba(99, 102, 241, 0.12)', color: 'var(--accent-primary-light, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={15} />
              </div>
              <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Best disposition</span>
            </div>
            <div style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--text-primary)', paddingLeft: '2.25rem' }}>
              {bestDisposition !== '-' ? bestDisposition : rowData.best || 'No Record'}
            </div>
          </div>
          
          {/* Last Disposition */}
          <div style={{ background: 'var(--bg-card)', padding: '1rem 1.125rem', borderRadius: 'var(--radius-lg, 12px)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-md, 8px)', background: 'rgba(6, 182, 212, 0.12)', color: 'var(--accent-info, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <History size={15} />
              </div>
              <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Last disposition</span>
            </div>
            <div style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--text-primary)', paddingLeft: '2.25rem' }}>
              {lastDisposition !== '-' ? lastDisposition : rowData.last || 'No Record'}
            </div>
          </div>
          
          {/* Map */}
          <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-lg, 12px)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <MapPin size={16} color="var(--accent-primary-light, #818cf8)" />
              <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>Last Location Captured</h3>
            </div>
            <div style={{ width: '100%', height: '200px', borderRadius: 'var(--radius-md, 8px)', overflow: 'hidden', position: 'relative', zIndex: 1, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
              {isMapLoading ? (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Loading location...</div>
              ) : (
                <MapContainer key={`${mapCenter[0]}-${mapCenter[1]}`} center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <Marker position={mapCenter}></Marker>
                </MapContainer>
              )}
            </div>
          </div>
        </div>

        {/* Middle Column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
          
          {/* Caller Banner */}
          <div style={{ 
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #0f172a 100%)', 
            borderRadius: 'var(--radius-lg, 12px)', 
            padding: '1.375rem 1.5rem', 
            color: '#ffffff', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.625rem', 
                background: 'rgba(255, 255, 255, 0.07)', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '0.35rem 0.875rem', 
                borderRadius: 'var(--radius-full, 9999px)', 
                fontSize: '0.75rem' 
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fbbf24', boxShadow: '0 0 10px #fbbf24', flexShrink: 0 }}></span>
                <span style={{ color: '#fbbf24', fontWeight: '700', fontFamily: 'monospace', letterSpacing: '0.05em' }}>00:00:00</span> 
                <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Waiting for call...</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                Channel: IVR Telephony
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.375rem', fontWeight: '700', margin: 0, color: '#ffffff', letterSpacing: '-0.02em' }}>{rowData.name}</h2>
                <div style={{ fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.65)', marginTop: '2px' }}>
                  Loan: {rowData.acc} • Bucket: {rowData.bucket}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                <button 
                  title="Send WhatsApp Message"
                  style={{ 
                    padding: '0.5rem 0.75rem', 
                    background: 'rgba(16, 185, 129, 0.15)', 
                    color: '#34d399', 
                    border: '1px solid rgba(16, 185, 129, 0.3)', 
                    borderRadius: 'var(--radius-md, 8px)', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <MessageCircle size={18} />
                </button>
                <button 
                  title="Send Email"
                  style={{ 
                    padding: '0.5rem 0.75rem', 
                    background: 'rgba(14, 165, 233, 0.15)', 
                    color: '#38bdf8', 
                    border: '1px solid rgba(14, 165, 233, 0.3)', 
                    borderRadius: 'var(--radius-md, 8px)', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <Mail size={18} />
                </button>
                <button 
                  title="Send SMS"
                  style={{ 
                    padding: '0.5rem 0.75rem', 
                    background: 'rgba(148, 163, 184, 0.15)', 
                    color: '#cbd5e1', 
                    border: '1px solid rgba(148, 163, 184, 0.3)', 
                    borderRadius: 'var(--radius-md, 8px)', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <MessageSquare size={18} />
                </button>
                <button 
                  style={{ 
                    padding: '0.5625rem 1.25rem', 
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-primary-dark, #4f46e5))', 
                    color: '#ffffff', 
                    border: 'none', 
                    borderRadius: 'var(--radius-md, 8px)', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    boxShadow: '0 4px 14px var(--accent-primary-glow)',
                    transition: 'all 0.2s'
                  }}
                >
                  <Phone size={16} /> Call Now
                </button>
              </div>
            </div>
          </div>
          
          {/* Details Tabs & Grid */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg, 12px)', border: '1px solid var(--border-color)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
              <button 
                onClick={() => setActiveTab('Basic Details')}
                style={{ 
                  padding: '0 0 0.75rem 0', 
                  border: 'none', 
                  background: 'none', 
                  borderBottom: activeTab === 'Basic Details' ? '2px solid var(--accent-primary)' : '2px solid transparent', 
                  color: activeTab === 'Basic Details' ? 'var(--accent-primary-light, #818cf8)' : 'var(--text-secondary)', 
                  fontWeight: activeTab === 'Basic Details' ? '600' : '500', 
                  fontSize: '0.875rem', 
                  cursor: 'pointer', 
                  marginBottom: '-1px' 
                }}
              >
                Basic Details
              </button>
              <button 
                onClick={() => setActiveTab('Additional Details')}
                style={{ 
                  padding: '0 0 0.75rem 0', 
                  border: 'none', 
                  background: 'none', 
                  borderBottom: activeTab === 'Additional Details' ? '2px solid var(--accent-primary)' : '2px solid transparent', 
                  color: activeTab === 'Additional Details' ? 'var(--accent-primary-light, #818cf8)' : 'var(--text-secondary)', 
                  fontWeight: activeTab === 'Additional Details' ? '600' : '500', 
                  fontSize: '0.875rem', 
                  cursor: 'pointer', 
                  marginBottom: '-1px' 
                }}
              >
                Additional Details
              </button>
            </div>
            
            {activeTab === 'Basic Details' ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500', marginBottom: '0.35rem' }}>Loan number</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      <span>{viewAcc ? (rowData.fullAcc || rowData.acc) : rowData.acc}</span>
                      <button onClick={() => navigator.clipboard.writeText(rowData.fullAcc || rowData.acc)} title="Copy" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-card)', padding: '3px', borderRadius: '4px', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}><Copy size={12} /></button>
                      <button onClick={() => setViewAcc(!viewAcc)} style={{ border: 'none', background: 'none', color: 'var(--accent-primary-light, #818cf8)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '600' }}>
                        {viewAcc ? 'Hide' : 'View'}
                      </button>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500', marginBottom: '0.35rem' }}>Card number</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      <span>{rowData.cardNumber ? (viewCard ? rowData.cardNumber : 'xxxx-xxxx-xxxx') : 'N/A'}</span>
                      {rowData.cardNumber && (
                        <button onClick={() => setViewCard(!viewCard)} style={{ border: 'none', background: 'none', color: 'var(--accent-primary-light, #818cf8)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '600' }}>
                          {viewCard ? 'Hide' : 'View'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500', marginBottom: '0.35rem' }}>Product & Bucket</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      <span>{rowData.product}, {rowData.bucket}</span>
                      <button onClick={() => navigator.clipboard.writeText(`${rowData.product}, ${rowData.bucket}`)} title="Copy" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-card)', padding: '3px', borderRadius: '4px', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}><Copy size={12} /></button>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500', marginBottom: '0.35rem' }}>Outstanding</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem', fontWeight: '700', color: 'var(--accent-primary-light, #818cf8)' }}>
                      <span>{currentOutstanding}</span>
                      <button onClick={() => navigator.clipboard.writeText(currentOutstanding)} title="Copy" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-card)', padding: '3px', borderRadius: '4px', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}><Copy size={12} /></button>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500', marginBottom: '0.35rem' }}>Overdue</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      <span>₹ 3</span>
                      <button onClick={() => navigator.clipboard.writeText('₹ 3')} title="Copy" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-card)', padding: '3px', borderRadius: '4px', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}><Copy size={12} /></button>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500', marginBottom: '0.35rem' }}>EMI</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>N/A</div>
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500', marginBottom: '0.35rem' }}>Bounce reason</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>N/A</div>
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500', marginBottom: '0.35rem' }}>Cycle</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>N/A</div>
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500', marginBottom: '0.35rem' }}>Due date</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      <span>2026-06-05</span>
                      <button onClick={() => navigator.clipboard.writeText('2026-06-05')} title="Copy" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-card)', padding: '3px', borderRadius: '4px', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}><Copy size={12} /></button>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500', marginBottom: '0.35rem' }}>Stab amount</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>N/A</div>
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '2rem 0 1.5rem 0' }} />
                
                {/* Previous Payment History */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Previous Payment History</h3>
                  {lastPayment.amount === 'N/A' ? (
                    <span style={{ fontSize: '0.6875rem', background: 'var(--accent-danger-bg, rgba(239, 68, 68, 0.12))', color: 'var(--accent-danger, #ef4444)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '3px 10px', borderRadius: 'var(--radius-full, 9999px)', fontWeight: '600' }}>
                      No Payment
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.6875rem', background: 'var(--accent-success-bg, rgba(16, 185, 129, 0.12))', color: 'var(--accent-success, #10b981)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '3px 10px', borderRadius: 'var(--radius-full, 9999px)', fontWeight: '600' }}>
                      Payment Received
                    </span>
                  )}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500', marginBottom: '0.35rem' }}>Amount Paid</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      <span>{lastPayment.amount}</span>
                      <button onClick={() => navigator.clipboard.writeText(lastPayment.amount)} title="Copy" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-card)', padding: '3px', borderRadius: '4px', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}><Copy size={12} /></button>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500', marginBottom: '0.35rem' }}>Mode</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      <span>{lastPayment.mode}</span>
                      <button onClick={() => navigator.clipboard.writeText(lastPayment.mode)} title="Copy" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-card)', padding: '3px', borderRadius: '4px', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}><Copy size={12} /></button>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500', marginBottom: '0.35rem' }}>Date of Payment</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      <span>{lastPayment.date}</span>
                      <button onClick={() => navigator.clipboard.writeText(lastPayment.date)} title="Copy" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-card)', padding: '3px', borderRadius: '4px', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}><Copy size={12} /></button>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500', marginBottom: '0.35rem' }}>Last Paid</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      <span>{lastPayment.amount !== 'N/A' ? lastPayment.amount : '₹ 0'}</span>
                      <button onClick={() => navigator.clipboard.writeText(lastPayment.amount !== 'N/A' ? lastPayment.amount : '₹ 0')} title="Copy" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-card)', padding: '3px', borderRadius: '4px', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}><Copy size={12} /></button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ maxHeight: '320px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {[
                    { label: 'Preapproved Link', value: 'N/A' },
                    { label: 'Address', value: 'simariai,Simaria Ghat,Barauni,Begusarai,...' },
                    { label: 'allocationRecordId', value: '3d730265-24e0-43a2-a176-689ece62210d' },
                    { label: 'Channel', value: 'Call' },
                    { label: 'Payment_Link', value: 'https://moneyview.whizdm.com/payment/ini...' },
                    { label: 'weighted_average', value: '0.0037' },
                    { label: 'ERROR_REMARKS', value: 'N/A' },
                    { label: 'Tc name', value: 'Priyanka Kumari' },
                    { label: 'Alternate No', value: 'N/A' },
                    { label: 'Tenure', value: '5' },
                    { label: 'Penalties', value: '1591' },
                    { label: 'spoctoId', value: '0aa98ec5-dd1f-3e84-9b5e-4d8c1ffe9927' },
                    { label: 'is_field_valid', value: 'false' },
                    { label: 'is_paid', value: 'false' },
                    { label: 'pos_in_lakhs', value: '0.09245' },
                    { label: 'Customer Name', value: rowData.name },
                    { label: 'Partner', value: 'NACL' },
                    { label: 'tos_in_lakhs', value: '0.11501' },
                    { label: 'Loan_Emi', value: '3275.0' },
                    { label: 'is_closed', value: 'false' },
                    { label: 'Due_Date', value: '2026-06-05 00:00:00' },
                    { label: 'Disbursed_Loan', value: '15000.0' },
                    { label: 'Contact No', value: 'XX1264' },
                    { label: 'Email_Id', value: 'KUNDANKUMAR8612@GMAIL.COM' },
                    { label: 'Fcl Link', value: 'N/A' },
                    { label: 'Bkt', value: 'bkt91-180' },
                    { label: 'City', value: 'Semaria' },
                    { label: 'maskedAccountNumber', value: '4525' },
                    { label: 'TL Name', value: 'N/A' },
                    { label: 'Cibil No', value: 'N/A' },
                    { label: 'Disbursal_Date', value: '2026-01-05 00:00:00' },
                    { label: 'Pos', value: '9245.0' },
                    { label: 'State', value: 'Bihar' },
                    { label: 'Overdue_Amount', value: '11401.0' },
                    { label: 'paid_amount', value: '0' },
                    { label: 'Tos', value: '11501.0' },
                    { label: 'Retain Status', value: 'N/A' }
                  ].map((item, idx) => (
                    <div key={idx} style={{ background: 'var(--bg-secondary)', padding: '0.75rem 0.875rem', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500', marginBottom: '0.25rem' }}>{item.label}</div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                        <span>{item.value}</span>
                        <button onClick={() => navigator.clipboard.writeText(item.value)} title="Copy" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-card)', padding: '2px', borderRadius: '4px', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }}>
                          <Copy size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
          
          {/* Activity History */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg, 12px)', border: '1px solid var(--border-color)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} color="var(--accent-primary-light, #818cf8)" />
                <h3 style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Activity History</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md, 8px)', fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}>
                <span>Start date</span>
                <ChevronRight size={12} />
                <span>End date</span>
                <Calendar size={14} style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }} />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500', marginBottom: '0.35rem' }}>Search Agents</div>
                <input type="text" placeholder="Search agents.." style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md, 8px)', fontSize: '0.8125rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500', marginBottom: '0.35rem' }}>Filter By Channel</div>
                <select style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md, 8px)', fontSize: '0.8125rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }}>
                  <option>All Channels</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500', marginBottom: '0.35rem' }}>Filter By Disposition</div>
                <select style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md, 8px)', fontSize: '0.8125rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }}>
                  <option>All Dispositions</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500', marginBottom: '0.35rem' }}>Filter By Sub Disposition</div>
                <select style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md, 8px)', fontSize: '0.8125rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }}>
                  <option>Sub Disposition</option>
                </select>
              </div>
            </div>
            
            <div style={{ padding: '2.5rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md, 8px)', border: '1px dashed var(--border-color)' }}>
              No activity history available for this record
            </div>
          </div>
          
        </div>
        
        {/* Right Column (Add new disposition) */}
        <div style={{ width: '290px', flexShrink: 0, background: 'var(--bg-card)', borderRadius: 'var(--radius-lg, 12px)', border: '1px solid var(--border-color)', padding: '1.25rem', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <FileText size={16} color="var(--accent-primary-light, #818cf8)" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Add New Disposition</h3>
          </div>
          
          {/* Positive Pool */}
          <div style={{ marginBottom: '0.625rem' }}>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '0.6875rem', 
              fontWeight: '700', 
              color: 'var(--accent-success, #10b981)', 
              background: 'var(--accent-success-bg, rgba(16, 185, 129, 0.12))', 
              padding: '3px 10px', 
              borderRadius: 'var(--radius-full, 9999px)', 
              letterSpacing: '0.04em' 
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></span> 
              POSITIVE POOL
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {['Paid', 'Call Back', 'PTP', 'Settlement'].map((disp) => {
              const isSel = selectedDisposition === disp;
              return (
                <button 
                  key={disp} 
                  type="button" 
                  onClick={() => setSelectedDisposition(disp)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    padding: '0.5rem 0.625rem', 
                    borderRadius: 'var(--radius-md, 8px)', 
                    border: isSel ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)', 
                    background: isSel ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(99, 102, 241, 0.04))' : 'var(--bg-secondary)', 
                    color: isSel ? 'var(--accent-primary-light, #818cf8)' : 'var(--text-primary)', 
                    fontSize: '0.8125rem', 
                    fontWeight: isSel ? '600' : '500', 
                    cursor: 'pointer', 
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    boxShadow: isSel ? '0 2px 8px var(--accent-primary-glow)' : 'none'
                  }}
                >
                  <span style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%', 
                    border: isSel ? '3.5px solid var(--accent-primary)' : '1.5px solid var(--border-color)', 
                    background: isSel ? '#ffffff' : 'transparent', 
                    flexShrink: 0 
                  }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{disp}</span>
                </button>
              );
            })}
          </div>
          
          {/* Difficult Pool */}
          <div style={{ marginBottom: '0.625rem' }}>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '0.6875rem', 
              fontWeight: '700', 
              color: 'var(--accent-danger, #ef4444)', 
              background: 'var(--accent-danger-bg, rgba(239, 68, 68, 0.12))', 
              padding: '3px 10px', 
              borderRadius: 'var(--radius-full, 9999px)', 
              letterSpacing: '0.04em' 
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></span> 
              DIFFICULT POOL
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {['RTP', 'Not Contacted', 'Dispute'].map((disp) => {
              const isSel = selectedDisposition === disp;
              return (
                <button 
                  key={disp} 
                  type="button" 
                  onClick={() => setSelectedDisposition(disp)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    padding: '0.5rem 0.625rem', 
                    borderRadius: 'var(--radius-md, 8px)', 
                    border: isSel ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)', 
                    background: isSel ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(99, 102, 241, 0.04))' : 'var(--bg-secondary)', 
                    color: isSel ? 'var(--accent-primary-light, #818cf8)' : 'var(--text-primary)', 
                    fontSize: '0.8125rem', 
                    fontWeight: isSel ? '600' : '500', 
                    cursor: 'pointer', 
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    boxShadow: isSel ? '0 2px 8px var(--accent-primary-glow)' : 'none',
                    gridColumn: disp === 'Not Contacted' ? 'span 2' : 'span 1'
                  }}
                >
                  <span style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%', 
                    border: isSel ? '3.5px solid var(--accent-primary)' : '1.5px solid var(--border-color)', 
                    background: isSel ? '#ffffff' : 'transparent', 
                    flexShrink: 0 
                  }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{disp}</span>
                </button>
              );
            })}
          </div>

          {selectedDisposition && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500', marginBottom: '0.35rem' }}>Sub disposition</div>
                <div style={{ position: 'relative' }}>
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={{ 
                      width: '100%', padding: '0.5625rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md, 8px)', 
                      fontSize: '0.8125rem', background: 'var(--bg-secondary)', color: selectedSubDisposition ? 'var(--text-primary)' : 'var(--text-muted)', 
                      boxSizing: 'border-box', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedSubDisposition || 'Choose sub disposition'}</span>
                    {isDropdownOpen ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                  </div>
                  
                  {isDropdownOpen && (
                    <div style={{ 
                      position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', 
                      background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md, 8px)',
                      boxShadow: 'var(--shadow-xl)',
                      zIndex: 20,
                      padding: '0.35rem 0',
                      backdropFilter: 'blur(8px)'
                    }}>
                      {['Payment Collected - Fully', 'Payment Details Shared', 'On Call Online Payment', 'Claim Paid'].map(option => (
                        <div 
                          key={option}
                          onClick={() => {
                            setSelectedSubDisposition(option);
                            setIsDropdownOpen(false);
                          }}
                          style={{
                            padding: '0.5rem 0.875rem',
                            fontSize: '0.8125rem',
                            cursor: 'pointer',
                            color: 'var(--text-primary)',
                            fontWeight: selectedSubDisposition === option ? '600' : '500',
                            background: selectedSubDisposition === option ? 'var(--bg-secondary)' : 'transparent',
                            transition: 'background 0.15s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                          onMouseOut={(e) => e.currentTarget.style.background = selectedSubDisposition === option ? 'var(--bg-secondary)' : 'transparent'}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selectedSubDisposition && (
                <>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={skipFields} onChange={(e) => setSkipFields(e.target.checked)} /> Skip Other Fields
                  </label>

                  {!skipFields && (
                    <>
                      <div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500', marginBottom: '0.35rem' }}>Payment Date*</div>
                        <DatePicker 
                          selected={paymentDate} 
                          onChange={(date: Date | null) => setPaymentDate(date)} 
                          showMonthDropdown 
                          showYearDropdown 
                          dropdownMode="select"
                          placeholderText="Select date"
                          dateFormat="dd/MM/yyyy"
                          className="custom-datepicker"
                          wrapperClassName="datepicker-wrapper"
                        />
                        {showErrors && !paymentDate && <div style={{ fontSize: '0.6875rem', color: 'var(--accent-danger, #ef4444)', marginTop: '0.25rem' }}>This field is required</div>}
                      </div>

                      <div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500', marginBottom: '0.35rem' }}>Payment Amount*</div>
                        <input type="text" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="Enter payment amount" style={{ width: '100%', padding: '0.5rem 0.75rem', border: (showErrors && !paymentAmount) ? '1px solid var(--accent-danger, #ef4444)' : '1px solid var(--border-color)', borderRadius: 'var(--radius-md, 8px)', fontSize: '0.8125rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                        {showErrors && !paymentAmount && <div style={{ fontSize: '0.6875rem', color: 'var(--accent-danger, #ef4444)', marginTop: '0.25rem' }}>This field is required</div>}
                      </div>

                      <div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500', marginBottom: '0.35rem' }}>Payment mode*</div>
                        <input type="text" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} placeholder="Enter payment mode" style={{ width: '100%', padding: '0.5rem 0.75rem', border: (showErrors && !paymentMode) ? '1px solid var(--accent-danger, #ef4444)' : '1px solid var(--border-color)', borderRadius: 'var(--radius-md, 8px)', fontSize: '0.8125rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                        {showErrors && !paymentMode && <div style={{ fontSize: '0.6875rem', color: 'var(--accent-danger, #ef4444)', marginTop: '0.25rem' }}>This field is required</div>}
                      </div>

                      <div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500', marginBottom: '0.35rem' }}>Reference Number</div>
                        <input type="text" value={refNumber} onChange={(e) => setRefNumber(e.target.value)} placeholder="Enter reference number" style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md, 8px)', fontSize: '0.8125rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
          
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '500', marginBottom: '0.35rem' }}>Comments / Remarks</div>
          <textarea 
            placeholder="Add call notes, conversation summary, or remarks..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            style={{ 
              width: '100%', 
              height: '90px', 
              padding: '0.625rem 0.75rem', 
              border: '1px solid var(--border-color)', 
              borderRadius: 'var(--radius-md, 8px)', 
              fontSize: '0.8125rem', 
              background: 'var(--bg-secondary)', 
              color: 'var(--text-primary)', 
              boxSizing: 'border-box', 
              resize: 'none', 
              marginBottom: '1.25rem',
              fontFamily: 'inherit'
            }}
          ></textarea>
          
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
            <button 
              type="button"
              style={{ 
                flex: 1, 
                padding: '0.625rem 1rem', 
                border: '1px solid var(--border-color)', 
                background: 'var(--bg-secondary)', 
                color: 'var(--text-secondary)', 
                borderRadius: 'var(--radius-md, 8px)', 
                fontSize: '0.8125rem', 
                fontWeight: '600', 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => {
                setSelectedDisposition('');
                setSelectedSubDisposition('');
                setSkipFields(false);
                setPaymentDate(null);
                setPaymentAmount('');
                setPaymentMode('');
                setRefNumber('');
                setComments('');
                setShowErrors(false);
              }}
            >
              Clear
            </button>
            <button 
              type="button"
              style={{ 
                flex: 1, 
                padding: '0.625rem 1rem', 
                border: 'none', 
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-primary-dark, #4f46e5))', 
                color: '#ffffff', 
                borderRadius: 'var(--radius-md, 8px)', 
                fontSize: '0.8125rem', 
                fontWeight: '600', 
                cursor: 'pointer',
                boxShadow: '0 4px 14px var(--accent-primary-glow)',
                transition: 'all 0.2s'
              }}
              onClick={handleSubmitDisposition}
            >
              Submit
            </button>
          </div>
        </div>

        <style>
          {`
            .datepicker-wrapper {
              width: 100%;
            }
            .custom-datepicker {
              width: 100%;
              padding: 0.5rem 0.75rem;
              border: 1px solid var(--border-color);
              border-radius: var(--radius-md, 8px);
              font-size: 0.8125rem;
              background-color: var(--bg-secondary);
              color: var(--text-primary);
              box-sizing: border-box;
            }
            .react-datepicker__month-select, .react-datepicker__year-select {
              padding: 0.25rem;
              border-radius: 0.25rem;
              border: 1px solid var(--border-color);
              background: var(--bg-card);
              color: var(--text-primary);
              font-size: 0.8125rem;
              outline: none;
            }
          `}
        </style>
      </div>
    </div>
  );
}
