import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/PropertyList.css';
import { useHistory } from 'react-router-dom';
import Pagination from './Pagination';

function PropertyList() {
    const [properties, setProperties] = useState([]);
    const [filteredProperties, setFilteredProperties] = useState([]);
    const [placeFilter, setPlaceFilter] = useState('');
    const [sellerDetails, setSellerDetails] = useState({});
    const [showSellerDetails, setShowSellerDetails] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(4);
    const history = useHistory();

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await axios.get('https://backend-k16t.onrender.com/properties');
                const propertiesWithLikes = response.data.map(property => ({ ...property, likes: 0 }));
                setProperties(propertiesWithLikes);
                setFilteredProperties(propertiesWithLikes);
            } catch (error) {
                console.error('Error fetching properties:', error);
            }
        };

        fetchProperties();
    }, []);

    const fetchSellerDetails = async (sellerId, propertyId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`https://backend-k16t.onrender.com/seller/${sellerId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Seller details fetched:', response.data);
            setSellerDetails({ ...sellerDetails, [propertyId]: response.data });
        } catch (error) {
            console.error('Error fetching seller details:', error);
        }
    };

    const handleInterestedClick = async (propertyId, sellerId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`https://backend-k16t.onrender.com/properties/${propertyId}/interest`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            await fetchSellerDetails(sellerId, propertyId);
            setShowSellerDetails({ ...showSellerDetails, [propertyId]: !showSellerDetails[propertyId] });
        } catch (error) {
            console.error('Error expressing interest:', error);
        }
    };

    const handlePlaceFilterChange = (e) => {
        const value = e.target.value;
        setPlaceFilter(value);
        applyPlaceFilter(value);
    };

    const applyPlaceFilter = (place) => {
        const filteredList = properties.filter(property => {
            return property.place && property.place.toLowerCase().includes(place.toLowerCase());
        });
        setFilteredProperties(filteredList);
        setCurrentPage(1);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        history.push('/login');
    };

    const handleLikeClick = (propertyId) => {
        setProperties(properties.map(property =>
            property.id === propertyId ? { ...property, likes: property.likes + 1 } : property
        ));
        setFilteredProperties(filteredProperties.map(property =>
            property.id === propertyId ? { ...property, likes: property.likes + 1 } : property
        ));
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProperties = filteredProperties.slice(indexOfFirstItem, indexOfFirstItem + itemsPerPage);
    const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="property-list-container">
            <header className="header">
                <h2>Property List</h2>
                <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
            </header>
            <div className="filters-container">
                <h3>Filter by Place</h3>
                <div className="filter-item">
                    <input
                        type="text"
                        name="place"
                        value={placeFilter}
                        onChange={handlePlaceFilterChange}
                        placeholder="Enter place"
                    />
                </div>
            </div>
            <div className="property-cards">
                {currentProperties.map(property => (
                    <div key={property.id} className="property-card">
                        <h3>{property.place}</h3>
                        <img src={`https://backend-k16t.onrender.com${property.image_url}`} alt="Property" className="property-image" />
                        <div className="property-details">
                            <p><strong>Area:</strong> {property.area} sq ft</p>
                            <p><strong>Bedrooms:</strong> {property.num_bedrooms}</p>
                            <p><strong>Bathrooms:</strong> {property.num_bathrooms}</p>
                            <p><strong>Hospitals Nearby:</strong> {property.hospitals_nearby ? 'Yes' : 'No'}</p>
                            <p><strong>Colleges Nearby:</strong> {property.colleges_nearby ? 'Yes' : 'No'}</p>
                        </div>
                        <button className="interested-button" onClick={() => handleInterestedClick(property.id, property.seller_id)}>
                            {showSellerDetails[property.id] ? 'Hide Seller Details' : "I'm Interested"}
                        </button>
                        {showSellerDetails[property.id] && (
                            <div className="seller-details">
                                <h2>Seller Details</h2>
                                <p><strong>First Name:</strong> {sellerDetails[property.id]?.first_name}</p>
                                <p><strong>Last Name:</strong> {sellerDetails[property.id]?.last_name}</p>
                                <p><strong>Email:</strong> {sellerDetails[property.id]?.email}</p>
                                <p><strong>Phone Number:</strong> {sellerDetails[property.id]?.phone_number}</p>
                            </div>
                        )}
                        <button className="like-button" onClick={() => handleLikeClick(property.id)}>
                            Like ({property.likes})
                        </button>
                    </div>
                ))}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />
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

export default withAuth(PropertyList);
