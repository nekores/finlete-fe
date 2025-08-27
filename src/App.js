import { useState } from 'react';
import DealsList from './components/DealsList';
import InvestorsList from './components/InvestorsList';
import CreateInvestorForm from './components/CreateInvestorForm';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('deals');
  const [selectedDeal, setSelectedDeal] = useState(null);

  const handleDealSelect = (deal) => {
    setSelectedDeal(deal);
    setActiveView('create');
  };

  const handleBackToDeals = () => {
    setSelectedDeal(null);
    setActiveView('deals');
  };

  return (
    <div className="App">
      <nav className="app-nav">
        <button 
          className={`nav-btn ${activeView === 'deals' ? 'active' : ''}`}
          onClick={() => setActiveView('deals')}
        >
          🏆 Deals
        </button>
        <button 
          className={`nav-btn ${activeView === 'investors' ? 'active' : ''}`}
          onClick={() => setActiveView('investors')}
        >
          👥 Investors
        </button>
        {selectedDeal && (
          <button 
            className={`nav-btn ${activeView === 'create' ? 'active' : ''}`}
            onClick={() => setActiveView('create')}
          >
            ➕ Create Investor for {selectedDeal.title}
          </button>
        )}
      </nav>
      
      {activeView === 'deals' && <DealsList onDealSelect={handleDealSelect} />}
      {activeView === 'investors' && <InvestorsList />}
      {activeView === 'create' && selectedDeal && (
        <CreateInvestorForm 
          selectedDeal={selectedDeal} 
          onBack={handleBackToDeals}
        />
      )}
    </div>
  );
}

export default App;
