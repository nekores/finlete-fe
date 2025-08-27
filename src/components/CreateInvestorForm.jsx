import React, { useState } from 'react';
import './CreateInvestorForm.css';

const CreateInvestorForm = ({ selectedDeal, onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    investmentAmount: '', investorType: '', streetAddress: '',
    unit: '', city: '', postalCode: '', state: '', country: '',
    dateOfBirth: '', taxpayerId: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [investorId, setInvestorId] = useState(null);
  const [accessLink, setAccessLink] = useState(null);

  const API_BASE_URL = '/api';

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateStep = (step) => {
    const errors = {};
    
    if (step === 1) {
      if (!formData.firstName) errors.firstName = 'First name is required';
      if (!formData.lastName) errors.lastName = 'Last name is required';
      if (!formData.email) errors.email = 'Email is required';
      if (!formData.phone) errors.phone = 'Phone is required';
    }
    
    if (step === 2) {
      if (!formData.investmentAmount) errors.investmentAmount = 'Investment amount is required';
      if (Number(formData.investmentAmount) < 300) errors.investmentAmount = 'Minimum investment is $300';
    }
    
    if (step === 3) {
      if (!formData.investorType) errors.investorType = 'Investor type is required';
      if (!formData.streetAddress) errors.streetAddress = 'Street address is required';
      if (!formData.city) errors.city = 'City is required';
      if (!formData.postalCode) errors.postalCode = 'Postal code is required';
      if (!formData.state) errors.state = 'State is required';
      if (!formData.country) errors.country = 'Country is required';
      if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
      if (!formData.taxpayerId) errors.taxpayerId = 'Taxpayer ID is required';
    }
    
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createInvestor = async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/deals/${selectedDeal.id}/investors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating investor:', error);
      throw error;
    }
  };

  const updateInvestor = async (investorId, data) => {
    try {
      console.log('updateInvestor called with method: PATCH');
      const response = await fetch(`${API_BASE_URL}/deals/${selectedDeal.id}/investors/${investorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating investor:', error);
      throw error;
    }
  };

  const patchInvestor = async (investorId, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/deals/${selectedDeal.id}/investors/${investorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error patching investor:', error);
      throw error;
    }
  };

  const createIndividualProfile = async (investorData, investorType) => {
    try {
      const url = `${API_BASE_URL}/investor_profiles/${investorType}`;
      console.log('Making request to:', url);
      console.log('Request data:', investorData);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(investorData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('Error response:', errorData);
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating individual profile:', error);
      throw error;
    }
  };

  const handleNextStep = async () => {
    if (!validateStep(currentStep)) return;

    if (currentStep === 1) {
      setLoading(true);
      try {
        const investorData = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone_number: formData.phone,
          tags: ['web-form'],
          deal_id: selectedDeal.id,
        };

        const response = await createInvestor(investorData);
        setInvestorId(response.id); // Store the investor ID from response
        setCurrentStep(2);
      } catch (error) {
        setErrors({ api: error.message || 'Failed to create investor. Please try again.' });
      } finally {
        setLoading(false);
      }
    } else if (currentStep === 2) {
      setLoading(true);
      try {
        const investmentData = {
          investment_value: parseFloat(formData.investmentAmount),
          number_of_securities: Math.round(formData.investmentAmount / selectedDeal.price_per_security),
        };

        const response = await updateInvestor(investorId, investmentData);
        if (response.access_link) {
          setAccessLink(response.access_link);
        }
        setCurrentStep(3);
      } catch (error) {
        setErrors({ api: error.message || 'Failed to update investment amount. Please try again.' });
      } finally {
        setLoading(false);
      }
    } else if (currentStep === 3) {
      setLoading(true);
      try {
        // Format date to match backend expectation (YYYY-MM-DD)
        const formatDate = (dateString) => {
          const date = new Date(dateString);
          return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        };

        let profileData = {};
        
        if (formData.investorType === 'individuals') {
          profileData = {
            first_name: String(formData.firstName),
            email: String(formData.email),
            last_name: String(formData.lastName),
            phone_number: formData.phone.replace(/-/g, ""),
            investorInfo: String(formData.investorType),
            city: String(formData.city),
            country: String(formData.country),
            date_of_birth: String(formatDate(formData.dateOfBirth)),
            investor_id: Number(investorId),
            investor_profile_id: Number(investorId),
            postal_code: String(formData.postalCode),
            region: String(formData.state),
            street_address: String(formData.streetAddress),
            unit2: String(formData.unit || ""),
            taxpayer_id: String(formData.taxpayerId),
          };
        } else if (formData.investorType === 'joints') {
          // For joint accounts, we'll need additional fields
          // This is a placeholder - you may need to add joint holder fields to the form
          profileData = {
            first_name: String(formData.firstName),
            email: String(formData.email),
            last_name: String(formData.lastName),
            phone_number: formData.phone.replace(/-/g, ""),
            investorInfo: String(formData.investorType),
            city: String(formData.city),
            country: String(formData.country),
            date_of_birth: String(formatDate(formData.dateOfBirth)),
            investor_id: Number(investorId),
            postal_code: String(formData.postalCode),
            region: String(formData.state),
            street_address: String(formData.streetAddress),
            unit2: String(formData.unit || ""),
            taxpayer_id: String(formData.taxpayerId),
            // Note: Joint holder fields would need to be added to the form
          };
        }

        const profileResponse = await createIndividualProfile(profileData, formData.investorType);
        
        // Use the response ID to update the investor with the profile ID
        if (profileResponse && profileResponse.id) {
          const patchData = {
            investor_profile_id: profileResponse.id,
            current_step: "contact-information"
          };
          
          await patchInvestor(profileResponse.id, patchData);
        }
        
        // Redirect to payment page if access_link is available
        console.log("aaaaaaaa", accessLink)
        // if (accessLink) {
        //   window.location.href = accessLink;
        // } else {
        //   setSuccess(true);
        // }
      } catch (error) {
        setErrors({ api: error.message || 'Failed to complete investor profile.' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (success) {
    return (
      <div className="create-investor-container">
        <div className="success-message">
          <h2>🎉 Investor Created Successfully!</h2>
          <p>Investor ID: {investorId}</p>
          <p>Deal: {selectedDeal.title}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Create Another Investor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-investor-container">
              <div className="form-header">
          <h1>👤 Create New Investor</h1>
          <p>Deal: {selectedDeal.title}</p>
          <p>Deal ID: {selectedDeal.id}</p>
          <button className="back-btn" onClick={onBack}>
            ← Back to Deals
          </button>
        </div>

      <div className="progress-bar">
        <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>1. Basic Info</div>
        <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>2. Investment</div>
        <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>3. Details</div>
      </div>

      {errors.api && <div className="alert alert-danger">{errors.api}</div>}

      <div className="form-content">
        {currentStep === 1 && (
          <div className="form-step">
            <h3>Basic Information</h3>
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={errors.firstName ? 'error' : ''}
              />
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={errors.lastName ? 'error' : ''}
              />
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="form-step">
            <h3>Investment Amount</h3>
            <div className="form-group">
              <label>Investment Amount (USD) *</label>
              <input
                type="number"
                value={formData.investmentAmount}
                onChange={(e) => handleInputChange('investmentAmount', e.target.value)}
                className={errors.investmentAmount ? 'error' : ''}
                min="300"
                placeholder="Enter amount (min $300)"
              />
              {errors.investmentAmount && <span className="error-message">{errors.investmentAmount}</span>}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="form-step">
            <h3>Investor Details</h3>
            
            <div className="form-group">
              <label>Investor Type *</label>
              <select
                value={formData.investorType}
                onChange={(e) => handleInputChange('investorType', e.target.value)}
                className={errors.investorType ? 'error' : ''}
              >
                <option value="">Select investor type</option>
                <option value="individuals">Individual</option>
                <option value="joints">Joint Account</option>
                <option value="corporation">Corporation</option>
                <option value="trust">Trust</option>
              </select>
              {errors.investorType && <span className="error-message">{errors.investorType}</span>}
            </div>

            <div className="form-group">
              <label>Street Address *</label>
              <input
                type="text"
                value={formData.streetAddress}
                onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                className={errors.streetAddress ? 'error' : ''}
              />
              {errors.streetAddress && <span className="error-message">{errors.streetAddress}</span>}
            </div>

            <div className="form-group">
              <label>Unit/Apt</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={errors.city ? 'error' : ''}
                />
                {errors.city && <span className="error-message">{errors.city}</span>}
              </div>

              <div className="form-group">
                <label>Postal Code *</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  className={errors.postalCode ? 'error' : ''}
                />
                {errors.postalCode && <span className="error-message">{errors.postalCode}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className={errors.state ? 'error' : ''}
                />
                {errors.state && <span className="error-message">{errors.state}</span>}
              </div>

              <div className="form-group">
                <label>Country *</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className={errors.country ? 'error' : ''}
                />
                {errors.country && <span className="error-message">{errors.country}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date of Birth *</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className={errors.dateOfBirth ? 'error' : ''}
                />
                {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
              </div>

              <div className="form-group">
                <label>Taxpayer ID *</label>
                <input
                  type="text"
                  value={formData.taxpayerId}
                  onChange={(e) => handleInputChange('taxpayerId', e.target.value)}
                  className={errors.taxpayerId ? 'error' : ''}
                  placeholder="XXX-XX-XXXX"
                />
                {errors.taxpayerId && <span className="error-message">{errors.taxpayerId}</span>}
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          {currentStep > 1 && (
            <button className="btn btn-secondary" onClick={handlePrevStep} disabled={loading}>
              ← Previous
            </button>
          )}
          
          <button className="btn btn-primary" onClick={handleNextStep} disabled={loading}>
            {loading ? 'Processing...' : currentStep === 3 ? 'Create Investor' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateInvestorForm;
