import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
  ChevronLeft, ChevronRight, Copy, MapPin, Home, 
  MessageCircle, Mail, MessageSquare, Phone, Clock, Calendar, Check, X,
  ChevronDown, ChevronUp
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
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{label}</div>
        {isEditing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type={type} 
              value={tempData[field] || ''} 
              onChange={(e) => setTempData({...tempData, [field]: e.target.value})}
              placeholder={placeholder}
              style={{ padding: '0.25rem 0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.25rem', fontSize: '0.75rem', width: '100%', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              autoFocus
            />
            <button onClick={() => saveEdit(field)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', padding: 0, display: 'flex' }}><Check size={16} /></button>
            <button onClick={() => cancelEdit(field)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 0, display: 'flex' }}><X size={16} /></button>
          </div>
        ) : hasData ? (
          <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{localData[field as keyof typeof localData]}</div>
        ) : (
          <div style={{ fontSize: '0.875rem', color: '#3b82f6', cursor: 'pointer' }} onClick={() => startEdit(field)}>Add {label.toLowerCase()}</div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '1rem 2rem', background: 'var(--bg-main)', minHeight: '100vh', boxSizing: 'border-box' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '600' }} onClick={() => navigate(-1)}>
          <ChevronLeft size={20} />
          <span>Borrower details</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={{ padding: '0.25rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem', background: 'var(--bg-card)', cursor: 'pointer' }}><ChevronLeft size={16} /></button>
          <button style={{ padding: '0.25rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem', background: 'var(--bg-card)', cursor: 'pointer' }}><ChevronRight size={16} /></button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        
        {/* Left Column */}
        <div style={{ width: '260px', display: 'flex', flexDirection: 'column', gap: '1rem', flexShrink: 0 }}>
          
          {/* Info Card */}
          <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '1.25rem' }}>Borrower details</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Name</div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{rowData.name}</div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Primary contact number</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                {viewPhone ? (rowData.fullPhone || rowData.phone) : rowData.phone}
                <span style={{ fontSize: '0.75rem', color: '#3b82f6', cursor: 'pointer' }} onClick={() => setViewPhone(!viewPhone)}>
                  {viewPhone ? 'Hide' : 'View'}
                </span>
              </div>
            </div>
            
            {renderEditableField('altPhone', 'Alternate number', 'tel', 'e.g. +91...')}
            {renderEditableField('email', 'Email', 'email', 'e.g. name@example.com')}
            {renderEditableField('dob', 'Date of Birth', 'date')}
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Customer City</div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{rowData.location}</div>
            </div>
            
            {renderEditableField('state', 'State', 'text', 'e.g. Maharashtra')}
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Address</div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', lineHeight: '1.4' }}>
                simariai<br/>Simaria Ghat<br/>Barauni<br/>Begusarai<br/>Semaria
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Location</div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{rowData.location}</div>
            </div>
          </div>
          
          {/* Best Disposition */}
          <div style={{ background: '#eff6ff', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Best disposition</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)' }}>
              <Home size={16} /> {rowData.best}
            </div>
          </div>
          
          {/* Last Disposition */}
          <div style={{ background: '#eff6ff', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Last disposition</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)' }}>
              <Home size={16} /> {rowData.last}
            </div>
          </div>
          
          {/* Map */}
          <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}>Last location captured</h3>
            <div style={{ width: '100%', height: '200px', borderRadius: '0.375rem', overflow: 'hidden', position: 'relative', zIndex: 1, background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
          
          {/* Banner */}
          <div style={{ background: 'linear-gradient(90deg, #0f172a 0%, #1e1b4b 100%)', borderRadius: '0.5rem', padding: '1.5rem', color: 'white', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.1)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', alignSelf: 'flex-start' }}>
              <Clock size={14} color="#fcd34d" /> 
              <span style={{ color: '#fcd34d', fontWeight: '600' }}>00:00:00</span> Waiting for call...
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>{rowData.name}</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={{ padding: '0.5rem', background: 'white', color: '#16a34a', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageCircle size={18} /></button>
                <button style={{ padding: '0.5rem', background: 'white', color: '#3b82f6', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={18} /></button>
                <button style={{ padding: '0.5rem', background: 'white', color: '#4b5563', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageSquare size={18} /></button>
                <button style={{ padding: '0.5rem 1rem', background: 'white', color: '#4b5563', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                  <Phone size={18} color="#8b5cf6" /> Call
                </button>
              </div>
            </div>
          </div>
          
          {/* Details Tabs & Grid */}
          <div style={{ background: 'var(--bg-card)', borderRadius: '0.5rem', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
              <button 
                onClick={() => setActiveTab('Basic Details')}
                style={{ padding: '0 0 0.5rem 0', border: 'none', background: 'none', borderBottom: activeTab === 'Basic Details' ? '2px solid #ea580c' : '2px solid transparent', color: activeTab === 'Basic Details' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'Basic Details' ? '600' : '500', fontSize: '0.875rem', cursor: 'pointer', marginBottom: '-1px' }}
              >
                Basic Details
              </button>
              <button 
                onClick={() => setActiveTab('Additional Details')}
                style={{ padding: '0 0 0.5rem 0', border: 'none', background: 'none', borderBottom: activeTab === 'Additional Details' ? '2px solid #ea580c' : '2px solid transparent', color: activeTab === 'Additional Details' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'Additional Details' ? '600' : '500', fontSize: '0.875rem', cursor: 'pointer', marginBottom: '-1px' }}
              >
                Additional Details
              </button>
            </div>
            
            {activeTab === 'Basic Details' ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem 1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Account number</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                      {viewAcc ? (rowData.fullAcc || rowData.acc) : rowData.acc} 
                      <button style={{ border: '1px solid var(--border-color)', background: 'transparent', padding: '2px', borderRadius: '4px', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}><Copy size={12} /></button>
                      <span style={{ fontSize: '0.75rem', color: '#3b82f6', cursor: 'pointer' }} onClick={() => setViewAcc(!viewAcc)}>
                        {viewAcc ? 'Hide' : 'View'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Card number</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                      {rowData.cardNumber ? (viewCard ? rowData.cardNumber : 'xxxx-xxxx-xxxx') : 'N/A'} 
                      {rowData.cardNumber && (
                        <span style={{ fontSize: '0.75rem', color: '#3b82f6', cursor: 'pointer' }} onClick={() => setViewCard(!viewCard)}>
                          {viewCard ? 'Hide' : 'View'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Product & Bucket</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                      {rowData.product}, {rowData.bucket} <button style={{ border: '1px solid var(--border-color)', background: 'transparent', padding: '2px', borderRadius: '4px', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}><Copy size={12} /></button>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Outstanding</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                      {currentOutstanding} <button style={{ border: '1px solid var(--border-color)', background: 'transparent', padding: '2px', borderRadius: '4px', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}><Copy size={12} /></button>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Overdue</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                      ₹ 3 <button style={{ border: '1px solid var(--border-color)', background: 'transparent', padding: '2px', borderRadius: '4px', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}><Copy size={12} /></button>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>EMI</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>N/A</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Bounce reason</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>N/A</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Cycle</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>N/A</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Due date</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                      2026-06-05<br/>00:00:00.0 <button style={{ border: '1px solid var(--border-color)', background: 'transparent', padding: '2px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignSelf: 'flex-start', color: 'var(--text-muted)' }}><Copy size={12} /></button>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Stab amount</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>N/A</div>
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '2rem 0' }} />
                
                {/* Previous Payment History */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>Previous Payment History</h3>
                  {lastPayment.amount === 'N/A' ? (
                    <span style={{ fontSize: '0.75rem', background: '#fce7f3', color: '#be185d', padding: '2px 8px', borderRadius: '4px', fontWeight: '500' }}>No Payment</span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '4px', fontWeight: '500' }}>Payment Received</span>
                  )}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem 1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Amount Paid</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                      {lastPayment.amount} <button style={{ border: '1px solid var(--border-color)', background: 'transparent', padding: '2px', borderRadius: '4px', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}><Copy size={12} /></button>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Mode</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                      {lastPayment.mode} <button style={{ border: '1px solid var(--border-color)', background: 'transparent', padding: '2px', borderRadius: '4px', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}><Copy size={12} /></button>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Date of Payment</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                      {lastPayment.date} <button style={{ border: '1px solid var(--border-color)', background: 'transparent', padding: '2px', borderRadius: '4px', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}><Copy size={12} /></button>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Last Paid</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                      {lastPayment.amount !== 'N/A' ? lastPayment.amount : '₹ 0'} <button style={{ border: '1px solid var(--border-color)', background: 'transparent', padding: '2px', borderRadius: '4px', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}><Copy size={12} /></button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ maxHeight: '280px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem 1rem' }}>
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
                    <div key={idx}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{item.label}</div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600', wordBreak: 'break-all' }}>
                        {item.value} 
                        <button style={{ border: '1px solid var(--border-color)', background: 'transparent', padding: '2px', borderRadius: '4px', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }}>
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
          <div style={{ background: 'var(--bg-card)', borderRadius: '0.5rem', border: '1px solid var(--border-color)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '700', margin: 0 }}>Activity history</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem', fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}>
                Start date <ChevronRight size={12} /> End date
                <Calendar size={14} style={{ marginLeft: '1rem' }} />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Search Agents</div>
                <input type="text" placeholder="Search agents.." style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem', fontSize: '0.875rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Filter By Channel</div>
                <select style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem', fontSize: '0.875rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }}>
                  <option>All Channels</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Filter By Disposition</div>
                <select style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem', fontSize: '0.875rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }}>
                  <option>All Dispositions</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Filter By Sub Disposition</div>
                <select style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem', fontSize: '0.875rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }}>
                  <option>Sub Disposition</option>
                </select>
              </div>
            </div>
            
            <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No activity history available
            </div>
          </div>
          
        </div>
        
        {/* Right Column */}
        <div style={{ width: '280px', flexShrink: 0, background: 'var(--bg-card)', borderRadius: '0.5rem', border: '1px solid var(--border-color)', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '700', marginBottom: '1rem' }}>Add new disposition</h3>
          
          <div style={{ background: '#dcfce7', padding: '0.25rem', textAlign: 'center', fontSize: '0.75rem', color: '#16a34a', fontWeight: '600', borderRadius: '0.25rem', marginBottom: '1rem' }}>
            Positive Pool
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}><input type="radio" name="disp" value="Paid" checked={selectedDisposition === 'Paid'} onChange={(e) => setSelectedDisposition(e.target.value)} /> Paid</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}><input type="radio" name="disp" value="Call Back" checked={selectedDisposition === 'Call Back'} onChange={(e) => setSelectedDisposition(e.target.value)} /> Call Back</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}><input type="radio" name="disp" value="PTP" checked={selectedDisposition === 'PTP'} onChange={(e) => setSelectedDisposition(e.target.value)} /> PTP</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}><input type="radio" name="disp" value="Settlement" checked={selectedDisposition === 'Settlement'} onChange={(e) => setSelectedDisposition(e.target.value)} /> Settlement</label>
          </div>
          
          <div style={{ background: '#fce7f3', padding: '0.25rem', textAlign: 'center', fontSize: '0.75rem', color: '#be185d', fontWeight: '600', borderRadius: '0.25rem', marginBottom: '1rem' }}>
            Difficult Pool
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', whiteSpace: 'nowrap' }}><input type="radio" name="disp" value="RTP" checked={selectedDisposition === 'RTP'} onChange={(e) => setSelectedDisposition(e.target.value)} /> RTP</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', whiteSpace: 'nowrap' }}><input type="radio" name="disp" value="Not Contacted" checked={selectedDisposition === 'Not Contacted'} onChange={(e) => setSelectedDisposition(e.target.value)} /> Not Contacted</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', whiteSpace: 'nowrap' }}><input type="radio" name="disp" value="Dispute" checked={selectedDisposition === 'Dispute'} onChange={(e) => setSelectedDisposition(e.target.value)} /> Dispute</label>
          </div>

          {selectedDisposition && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Sub disposition</div>
                <div style={{ position: 'relative' }}>
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={{ 
                      width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem', 
                      fontSize: '0.875rem', background: 'var(--bg-secondary)', color: selectedSubDisposition ? 'var(--text-primary)' : 'var(--text-muted)', 
                      boxSizing: 'border-box', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    {selectedSubDisposition || 'Choose sub disposition'}
                    {isDropdownOpen ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                  </div>
                  
                  {isDropdownOpen && (
                    <div style={{ 
                      position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', 
                      background: 'white', border: '1px solid var(--border-color)', borderRadius: '0.375rem',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      zIndex: 10,
                      padding: '0.5rem 0'
                    }}>
                      {['Payment Collected - Fully', 'Payment Details Shared', 'On Call Online Payment', 'Claim Paid'].map(option => (
                        <div 
                          key={option}
                          onClick={() => {
                            setSelectedSubDisposition(option);
                            setIsDropdownOpen(false);
                          }}
                          style={{
                            padding: '0.5rem 1rem',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            color: 'var(--text-primary)',
                            fontWeight: '500'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
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
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <input type="checkbox" checked={skipFields} onChange={(e) => setSkipFields(e.target.checked)} /> Skip Other Fields
                  </label>

                  {!skipFields && (
                    <>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Payment Date</div>
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
                        {showErrors && !paymentDate && <div style={{ fontSize: '0.65rem', color: '#ef4444', marginTop: '0.25rem' }}>This field is required</div>}
                      </div>

                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Payment Amount*</div>
                        <input type="text" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="Enter payment amount" style={{ width: '100%', padding: '0.5rem', border: '1px solid #f87171', borderRadius: '0.375rem', fontSize: '0.875rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                        {showErrors && !paymentAmount && <div style={{ fontSize: '0.65rem', color: '#ef4444', marginTop: '0.25rem' }}>This field is required</div>}
                      </div>

                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Payment mode*</div>
                        <input type="text" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} placeholder="Enter payment mode" style={{ width: '100%', padding: '0.5rem', border: '1px solid #f87171', borderRadius: '0.375rem', fontSize: '0.875rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                        {showErrors && !paymentMode && <div style={{ fontSize: '0.65rem', color: '#ef4444', marginTop: '0.25rem' }}>This field is required</div>}
                      </div>

                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Reference Number</div>
                        <input type="text" value={refNumber} onChange={(e) => setRefNumber(e.target.value)} placeholder="Enter reference number" style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem', fontSize: '0.875rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
          
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Comments</div>
          <textarea 
            placeholder="Add comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            style={{ width: '100%', height: '100px', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', fontSize: '0.875rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box', resize: 'none', marginBottom: '1.5rem' }}
          ></textarea>
          
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
            <button 
              style={{ flex: 1, padding: '0.625rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}
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
              style={{ flex: 1, padding: '0.625rem', border: 'none', background: '#e2e8f0', color: '#475569', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}
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
              padding: 0.5rem;
              border: 1px solid #f87171;
              border-radius: 0.375rem;
              font-size: 0.875rem;
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
              font-size: 0.875rem;
              outline: none;
            }
          `}
        </style>
      </div>
    </div>
  );
}
