import React, { useState } from 'react';
import axios from 'axios';
import { useHistory, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/login.css'; 


function Login({ setAuth, setUserType }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const history = useHistory();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://backend-k16t.onrender.com/login', { email, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userType', response.data.userType);
            localStorage.setItem('userEmail', response.data.email);
            setAuth(true);
            setUserType(response.data.userType);
            toast.success('Logged in successfully!');
            if (response.data.userType === 'seller') {
                setTimeout(() => {
                    history.push('/postproperties');
                }, 2000);
            } else {
                setTimeout(() => {
                    history.push('/properties');
                }, 2000);
            }
        } catch (error) {
            console.error('Error logging in:', error);
            toast.error('Error logging in. Please try again.');
        }
    };

    return (
        <div className="container mt-5">
            <ToastContainer />
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card card0">
                        <div className="card-body card2">
                            <h2 className="card-title text-center">Login</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <input 
                                        type="email" 
                                        className="form-control" 
                                        placeholder="Email" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        placeholder="Password" 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary btn-block btn-blue">Login</button>
                            </form>
                            <p className="text-center text-sm mt-3">
                                Don't have an account? <Link to="/register">Register</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
