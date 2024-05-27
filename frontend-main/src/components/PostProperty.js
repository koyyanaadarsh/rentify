import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function PostProperty() {
    const [formData, setFormData] = useState({
        place: '',
        area: '',
        num_bedrooms: '',
        num_bathrooms: '',
        hospitals_nearby: false,
        colleges_nearby: false,
        image: null
    });
    const [properties, setProperties] = useState([]);
    const [editingProperty, setEditingProperty] = useState(null);
    const history = useHistory();

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const response = await axios.get('https://backend-k16t.onrender.com/properties');
            setProperties(response.data);
        } catch (error) {
            console.error('Error fetching properties:', error);
            if (error.response && error.response.status === 401) {
                handleLogout();
            }
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const data = new FormData();
            data.append('place', formData.place);
            data.append('area', formData.area);
            data.append('num_bedrooms', formData.num_bedrooms);
            data.append('num_bathrooms', formData.num_bathrooms);
            data.append('hospitals_nearby', formData.hospitals_nearby);
            data.append('colleges_nearby', formData.colleges_nearby);
            if (formData.image) {
                if (formData.image.size > 5 * 1024 * 1024) {
                    toast.error('File size should be less than 5MB');
                    return;
                }
                data.append('image', formData.image);
            }

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            if (editingProperty) {
                await axios.put(`https://backend-k16t.onrender.com/properties/${editingProperty.id}`, data, config);
                toast.success('Property updated successfully!');
                setEditingProperty(null);
            } else {
                await axios.post('https://backend-k16t.onrender.com/properties', data, config);
                toast.success('Property added successfully!');
            }

            setFormData({
                place: '',
                area: '',
                num_bedrooms: '',
                num_bathrooms: '',
                hospitals_nearby: false,
                colleges_nearby: false,
                image: null
            });

            fetchProperties();
        } catch (error) {
            console.error('Error submitting property:', error);
            if (error.response && error.response.status === 401) {
                handleLogout();
            } else {
                toast.error('Error submitting property. Please try again.');
            }
        }
    };

    const handleEdit = (property) => {
        setEditingProperty(property);
        setFormData({
            place: property.place,
            area: property.area,
            num_bedrooms: property.num_bedrooms,
            num_bathrooms: property.num_bathrooms,
            hospitals_nearby: property.hospitals_nearby,
            colleges_nearby: property.colleges_nearby,
            image: null 
        });
    };

    const handleDelete = async (propertyId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`https://backend-k16t.onrender.com/properties/${propertyId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchProperties();
            toast.success('Property deleted successfully!');
        } catch (error) {
            console.error('Error deleting property:', error);
            if (error.response && error.response.status === 401) {
                handleLogout();
            } else {
                toast.error('Error deleting property. Please try again.');
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        history.push('/login');
    };

    return (
        <div className="container mt-4">
            <ToastContainer />
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>{editingProperty ? 'Edit Property' : 'Properties Have To Post'}</h2>
                <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
            </div>
            <form onSubmit={handleSubmit} className="mb-4" encType="multipart/form-data">
                <div className="form-group">
                    <input type="text" className="form-control" name="place" placeholder="Place" value={formData.place} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <input type="number" className="form-control" name="area" placeholder="Area" value={formData.area} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <input type="number" className="form-control" name="num_bedrooms" placeholder="Number of Bedrooms" value={formData.num_bedrooms} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <input type="number" className="form-control" name="num_bathrooms" placeholder="Number of Bathrooms" value={formData.num_bathrooms} onChange={handleChange} required />
                </div>
                <div className="form-check">
                    <input type="checkbox" className="form-check-input" name="hospitals_nearby" checked={formData.hospitals_nearby} onChange={handleChange} />
                    <label className="form-check-label">Hospitals Nearby</label>
                </div>
                <div className="form-check">
                    <input type="checkbox" className="form-check-input" name="colleges_nearby" checked={formData.colleges_nearby} onChange={handleChange} />
                    <label className="form-check-label">Colleges Nearby</label>
                </div>
                <div className="form-group">
                    <input type="file" className="form-control-file" name="image" onChange={handleChange} />
                </div>
                <button type="submit" className="btn btn-primary mt-3">{editingProperty ? 'Update Property' : 'Post Property'}</button>
            </form>

            <h2>Property List</h2>
            <div className="property-cards">
                {properties.map(property => (
                    <div key={property.id} className="property-card card mb-3">
                        <div className="card-body">
                            <h5 className="card-title">{property.place}</h5>
                            <p className="card-text">Area: {property.area} sq ft</p>
                            <p className="card-text">Bedrooms: {property.num_bedrooms}</p>
                            <p className="card-text">Bathrooms: {property.num_bathrooms}</p>
                            <p className="card-text">Hospitals Nearby: {property.hospitals_nearby ? 'Yes' : 'No'}</p>
                            <p className="card-text">Colleges Nearby: {property.colleges_nearby ? 'Yes' : 'No'}</p>
                            {property.image_url && <img src={`https://backend-k16t.onrender.com${property.image_url}`} alt="Property" className="img-thumbnail mb-3" />}
                            <div className="d-flex justify-content-between">
                                <button className="btn btn-warning mr-2" onClick={() => handleEdit(property)}>Edit</button>
                                <button className="btn btn-danger" onClick={() => handleDelete(property.id)}>Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const withAuth = (Component) => {
    return (props) => {
        const history = useHistory();

        useEffect(() => {
            const token = localStorage.getItem('token');
            if (!token) {
                history.push('/login'); 
            }
        }, [history]);

        return <Component {...props} />;
    };
};

export default withAuth(PostProperty);
