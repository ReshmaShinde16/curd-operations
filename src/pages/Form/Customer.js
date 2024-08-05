import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { verifyPan, getPostcodeDetails } from '../../api'; 
import "./Customer.css";

// loader styling
const loaderStyle = {
    position: 'absolute',
    right: '10px',

    transform: 'translateY(-50%)',
    border: '5px solid blue',
    borderTop: '5px solid #3498db',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    animation: 'spin 1s linear infinite',
};

// Keyframes for spinning loader
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`;
document.head.appendChild(styleSheet);

const Customer = () => {
    const navigate = useNavigate();
    const { index } = useParams();
    const [formData, setFormData] = useState({
        pan: '',
        fullName: '',
        email: '',
        mobileNumber: '',
        addresses: [{ addressLine1: '', addressLine2: '', postcode: '', state: '', city: '' }],
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [panLoading, setPanLoading] = useState(false);
    const [states, setStates] = useState([]); 
    const [cities, setCities] = useState([]); 

    useEffect(() => {
        if (index !== undefined) {
            const customers = JSON.parse(localStorage.getItem('customers')) || [];
            if (customers[index]) {
                setFormData(customers[index]);
            }
        }
    }, [index]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handlePanNumber = async () => {
        const { pan } = formData;
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (pan && panRegex.test(pan)) {
            setPanLoading(true);
            try {
                const response = await verifyPan(pan);
                if (response.isValid) {
                    setFormData((prevData) => ({
                        ...prevData,
                        fullName: response.fullName,
                    }));
                    setErrors((prevErrors) => ({
                        ...prevErrors,
                        pan: '', 
                    }));
                } else {
                    throw new Error('Invalid PAN number');
                }
            } catch (error) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    pan: 'Please Enter valid PAN Number',
                }));
                setFormData((prevData) => ({
                    ...prevData,
                    fullName: '', 
                }));
            } finally {
                setPanLoading(false); 
            }
        } else {
            setErrors((prevErrors) => ({
                ...prevErrors,
                pan: 'Please Enter valid PAN Number',
            }));
            setFormData((prevData) => ({
                ...prevData,
                fullName: '', 
            }));
        }
    };

    const validatePostcode = async (index, postcode) => {
        const postcodeRegex = /^\d{6}$/;
        if (postcode && postcodeRegex.test(postcode)) {
            setLoading(true);
            try {
                const response = await getPostcodeDetails(postcode);
                if (response.status === 'Success') {
                    const stateOptions = response.state.map((s) => ({ id: s.id, name: s.name }));
                    const cityOptions = response.city.map((c) => ({ id: c.id, name: c.name }));

                    setStates(stateOptions);
                    setCities(cityOptions);

                    const newAddresses = [...formData.addresses];
                    newAddresses[index].state = stateOptions.length > 0 ? stateOptions[0].name : '';
                    newAddresses[index].city = cityOptions.length > 0 ? cityOptions[0].name : '';

                    setFormData((prevData) => ({
                        ...prevData,
                        addresses: newAddresses,
                    }));

                    setErrors((prevErrors) => ({
                        ...prevErrors,
                        [`postcode_${index}`]: '', 
                    }));
                } else {
                    throw new Error('Failed to fetch postcode details');
                }
            } catch (error) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    [`postcode_${index}`]: 'Error fetching postcode details',
                }));
                setFormData((prevData) => ({
                    ...prevData,
                    addresses: prevData.addresses.map((addr, idx) =>
                        idx === index ? { ...addr, state: '', city: '' } : addr
                    ),
                }));
            } finally {
                setLoading(false);
            }
        } else {
            setErrors((prevErrors) => ({
                ...prevErrors,
                [`postcode_${index}`]: 'Postcode must be 6 digits',
            }));
            setFormData((prevData) => ({
                ...prevData,
                addresses: prevData.addresses.map((addr, idx) =>
                    idx === index ? { ...addr, state: '', city: '' } : addr
                ),
            }));
        }
    };

    const handleAddressChange = (index, e) => {
        const { name, value } = e.target;
        const newAddresses = [...formData.addresses];
        newAddresses[index][name] = value;
        setFormData((prevData) => ({
            ...prevData,
            addresses: newAddresses,
        }));

        if (name === 'postcode') {
            validatePostcode(index, value);
        }
    };

    const addAddress = () => {
        setFormData((prevData) => ({
            ...prevData,
            addresses: [...prevData.addresses, { addressLine1: '', addressLine2: '', postcode: '', state: '', city: '' }],
        }));
    };

    const removeAddress = (index) => {
        const newAddresses = formData.addresses.filter((_, i) => i !== index);
        setFormData((prevData) => ({
            ...prevData,
            addresses: newAddresses,
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.pan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) {
            newErrors.pan = 'Invalid PAN format';
        }
        if (formData.fullName.length === 0 || formData.fullName.length > 140) {
            newErrors.fullName = 'Full Name is required and must be less than 140 characters';
        }
        if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (formData.mobileNumber.length !== 10 || isNaN(formData.mobileNumber)) {
            newErrors.mobileNumber = 'Mobile Number must be 10 digits';
        }

        formData.addresses.forEach((address, index) => {
            if (address.addressLine1.length === 0) {
                newErrors[`addressLine1_${index}`] = 'Address Line 1 is required';
            }
            if (!/^\d{6}$/.test(address.postcode)) {
                newErrors[`postcode_${index}`] = 'Postcode must be 6 digits';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const customers = JSON.parse(localStorage.getItem('customers')) || [];
            if (index !== undefined) {
                customers[index] = formData;
            } else {
                customers.push(formData);
            }
            localStorage.setItem('customers', JSON.stringify(customers));
            navigate('/');
        }
    };

    return (
        <div className="main-div">
            <div className='submain-div'>
            <div className='form-heading'>Customer Form</div>
            <div className='form-subheading'>Please fill the below details and submit form</div>
            </div>
            <form className="form-div" onSubmit={handleSubmit}>
                <div className='input-main-div'>
                    <div className='input'>
                    <label className="label" htmlFor="pan">PAN Number</label>
                    <input
                        type="text"
                        id="pan"
                        name="pan"
                        value={formData.pan}
                        onChange={handleInputChange}
                        onBlur={handlePanNumber} 
                        maxLength={10}
                        required
                        className='input-box'
                    />
                    {panLoading && (
                        <div style={loaderStyle} /> 
                    )}
                    </div>
                    <div className='error'>
                    {errors.pan && <div className="error">{errors.pan}</div>}
                    </div>
                </div>

                <div className='input-main-div'>
                    <div className='input'>
                    <label className='label' htmlFor="fullName">Full Name</label>
                    <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        maxLength={140}
                        required
                        className='input-box'
                    />
                    </div>
                    <div className='error'>
                    {errors.fullName && <div className="error">{errors.fullName}</div>}
                </div>
                </div>

                <div className='input-main-div'>
                    <div className='input'>
                    <label className="label" htmlFor="email">Email</label>
                    <input
                        type="text"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        maxLength={255}
                        className='input-box'
                        required
                    />
                    </div>
                    <div className='error'>
                    {errors.email && <div className="error">{errors.email}</div>}
                </div>
                </div>

                <div className='input-main-div'>
                    <div className='input'>
                    <label className="label" htmlFor="mobileNumber">Mobile Number</label>
                    <div className="mobile-input">
                        <span className="prefix">+91</span>
                        <input
                            type="text"
                            id="mobileNumber"
                            name="mobileNumber"
                            value={formData.mobileNumber}
                            onChange={handleInputChange}
                            maxLength={10}
                            required
                            pattern="[0-9]{10}"
                            className='input-box'
                        />
                    </div>
                    </div>
                    <div className='error'>
                    {errors.mobileNumber && <div className="error">{errors.mobileNumber}</div>}
                </div>
                </div>

                {formData.addresses.map((address, index) => (
                    <div key={index} className="address-group">
                        <div className='input-main-div'>
                            <div className='input'>
                            <label className="label" htmlFor={`addressLine1_${index}`}>Address Line 1</label>
                            <input
                                type="text"
                                id={`addressLine1_${index}`}
                                name="addressLine1"
                                value={address.addressLine1}
                                onChange={(e) => handleAddressChange(index, e)}
                                className='input-box'
                                required
                            />
                            </div>
                            <div className='error'>
                            {errors[`addressLine1_${index}`] && <div className="error">{errors[`addressLine1_${index}`]}</div>}
                        </div>
                        </div>

                        <div className='input-main-div'>
                            <div className='input'>
                            <label className="label" htmlFor={`addressLine2_${index}`}>Address Line 2</label>
                            <input
                                type="text"
                                id={`addressLine2_${index}`}
                                name="addressLine2"
                                value={address.addressLine2}
                                onChange={(e) => handleAddressChange(index, e)}
                                className='input-box'
                            />
                        </div>
                        </div>
                        <div className="input-main-div">
                            <div className='input'>
                            <label className="label" htmlFor={`postcode_${index}`}>Postcode</label>
                            <input
                                type="text"
                                id={`postcode_${index}`}
                                name="postcode"
                                value={address.postcode}
                                onChange={(e) => handleAddressChange(index, e)}
                                maxLength={6}
                                required
                                className='input-box'
                            />
                            {loading && (
                                <div style={loaderStyle} />
                            )}
                            </div>
                            <div className='error'>
                            {errors[`postcode_${index}`] && <div className="error">{errors[`postcode_${index}`]}</div>}
                        </div>
                        </div>

                        <div className='input-main-div'> 
                            <div className='input'>
                            <label className='label' htmlFor={`state_${index}`}>State</label>
                            <select
                                id={`state_${index}`}
                                name="state"
                                value={address.state}
                                onChange={(e) => handleAddressChange(index, e)}
                                className='input-box'
                            >
                                <option value="">Select State</option>
                                {states.map((state) => (
                                    <option key={state.id} value={state.name}>
                                        {state.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        </div>

                        <div className='input-main-div'>
                            <div className='input'>
                            <label className="label" htmlFor={`city_${index}`}>City</label>
                            <select
                                id={`city_${index}`}
                                name="city"
                                value={address.city}
                                onChange={(e) => handleAddressChange(index, e)}
                                className='input-box'
                            >
                                <option value="">Select City</option>
                                {cities.map((city) => (
                                    <option key={city.id} value={city.name}>
                                        {city.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        </div>

                        <button type="button" className="remove-address" onClick={() => removeAddress(index)}>Remove Address</button>
                    </div>
                ))}
            <div className='form-buttons'>
                <button type="button" className='add-address' onClick={addAddress}>Add Address</button>
                <button className="save-form" type="submit">Save</button>
            </div>
            </form>
        </div>
    );
};

export default Customer;
