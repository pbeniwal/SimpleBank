import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { Landmark, UserPlus, Users, ArrowLeft, ReceiptIndianRupee } from 'lucide-react';

// --- 1. PAGE: HOME (Create Account Only) ---
function HomePage() {
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  // New state for the confirmation message
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

  const createAccount = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/accounts', { 
        name, 
        initial_balance: parseFloat(balance) 
      });
      
      setName(''); 
      setBalance('');
      
      // Set the success message
      setStatusMessage({ 
        text: `Success! Account created for ${res.data.account.name}.`, 
        type: 'success' 
      });

      // Hide the message automatically after 4 seconds
      setTimeout(() => setStatusMessage({ text: '', type: '' }), 4000);

    } catch (err) {
      setStatusMessage({ text: 'Error creating account. Please try again.', type: 'error' });
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <section style={{ background: '#f3f4f6', padding: '30px', borderRadius: '12px', marginBottom: '20px' }}>
        <h3><UserPlus size={20} /> Open a New Account</h3>
        
        {/* IN-PAGE CONFIRMATION MESSAGE */}
        {statusMessage.text && (
          <div style={{ 
            padding: '10px', 
            marginBottom: '15px', 
            borderRadius: '6px',
            backgroundColor: statusMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: statusMessage.type === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${statusMessage.type === 'success' ? '#86efac' : '#fecaca'}`
          }}>
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={createAccount} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '300px', margin: '0 auto' }}>
          <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: '10px' }} />
          <input type="number" placeholder="Initial Deposit" value={balance} onChange={(e) => setBalance(e.target.value)} required style={{ padding: '10px' }} />
          <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>Create Account</button>
        </form>
      </section>

      <Link to="/accounts-list" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#2563eb', fontWeight: 'bold', fontSize: '1.1rem' }}>
        <Users size={20} /> View All Existing Accounts →
      </Link>
    </div>
  );
}

// --- 2. PAGE: ACCOUNTS LIST ---
function AccountsListPage() {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/accounts').then(res => setAccounts(res.data));
  }, []);

  return (
    <div>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: '#667', marginBottom: '20px' }}>
        <ArrowLeft size={16}/> Back to Home
      </Link>
      <h3><Users size={20} /> Registered Bank Accounts</h3>
      <div style={{ display: 'grid', gap: '10px' }}>
        {accounts.map(acc => (
          <div key={acc.id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
            <div>
              <strong>{acc.name}</strong>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>Acc: {acc.account_number}</div>
            </div>
            <Link to={`/account/${acc.account_number}`} style={{ textDecoration: 'none', color: '#2563eb', fontWeight: 'bold' }}>Manage →</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- 3. PAGE: ACCOUNT DETAILS (Deposit/Withdraw with In-Page Messages) ---
// --- UPDATED ACCOUNT DETAILS WITH HISTORY ---
function AccountDetails() {
  const { accNum } = useParams();
  const [account, setAccount] = useState(null);
  const [history, setHistory] = useState([]); // State for history
  const [amount, setAmount] = useState('');
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

  const fetchDetails = async () => {
    const res = await axios.get(`http://localhost:5000/accounts`); 
    const found = res.data.find(a => a.account_number === accNum);
    setAccount(found);
    
    // Fetch Transaction History
    const histRes = await axios.get(`http://localhost:5000/transactions/${accNum}`);
    setHistory(histRes.data);
  };

  useEffect(() => { fetchDetails(); }, [accNum]);

  const handleTransaction = async (type) => {
    if (!amount || amount <= 0) return setStatusMessage({text: "Enter valid amount", type: 'error'});
    try {
      await axios.post('http://localhost:5000/transactions', {
        account_number: accNum, amount: parseFloat(amount), type: type
      });
      setAmount('');
      fetchDetails(); // Refreshes both balance AND history
      setStatusMessage({ text: `Success: ${type} of ₹${amount}`, type: 'success' });
      setTimeout(() => setStatusMessage({ text: '', type: '' }), 4000);
    } catch (err) {
      setStatusMessage({ text: err.response?.data?.error || "Error", type: 'error' });
    }
  };

  if (!account) return <p>Loading...</p>;

  return (
    <div>
      <Link to="/accounts-list" style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: '#667', marginBottom: '20px' }}>
        <ArrowLeft size={16}/> Back
      </Link>
      
      {/* Main Account Card */}
      <div style={{ background: '#fff', border: '2px solid #2563eb', padding: '30px', borderRadius: '12px' }}>
        {statusMessage.text && <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '6px', textAlign: 'center', backgroundColor: statusMessage.type === 'success' ? '#dcfce7' : '#fee2e2', color: statusMessage.type === 'success' ? '#166534' : '#991b1b' }}>{statusMessage.text}</div>}
        <h2>{account.name}</h2>
        <h1 style={{ color: '#059669' }}>₹{account.balance}</h1>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ padding: '10px', width: '120px' }} />
          <button onClick={() => handleTransaction('deposit')} style={{ background: '#059669', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>Deposit</button>
          <button onClick={() => handleTransaction('withdraw')} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>Withdraw</button>
        </div>
      </div>

      {/* TRANSACTION HISTORY SECTION */}
      <div style={{ marginTop: '40px' }}>
        <h3>Transaction History</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #eee' }}>
          <thead>
            <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Date</th>
              <th style={{ padding: '12px' }}>Type</th>
              <th style={{ padding: '12px' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No transactions yet.</td></tr> : 
              history.map(t => (
                <tr key={t.id} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: '12px', fontSize: '0.85rem' }}>{new Date(t.created_at).toLocaleString()}</td>
                  <td style={{ padding: '12px', textTransform: 'capitalize', color: t.type === 'deposit' ? '#059669' : '#dc2626', fontWeight: 'bold' }}>{t.type}</td>
                  <td style={{ padding: '12px' }}>₹{t.amount}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- MAIN APP COMPONENT ---
export default function App() {
  return (
    <Router>
      <div style={{ fontFamily: 'sans-serif', padding: '40px', maxWidth: '800px', margin: '0 auto', minHeight: '100vh', background: '#fafafa' }}>
        <header style={{ textAlign: 'center', borderBottom: '2px solid #eee', marginBottom: '30px', paddingBottom: '10px' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <Landmark size={40} color="#2563eb" />
            <h1 style={{ margin: 0 }}>Demo Bank</h1>
          </Link>
        </header>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/accounts-list" element={<AccountsListPage />} />
          <Route path="/account/:accNum" element={<AccountDetails />} />
        </Routes>
      </div>
    </Router>
  );
}