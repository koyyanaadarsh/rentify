import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import PropertyList from './components/PropertyList';
import PostProperty from './components/PostProperty';



function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userType, setUserType] = useState('');

    return (
        <Router>
            <div className="App">
                <Switch>
                    <Route path="/login">
                        <Login setAuth={setIsAuthenticated} setUserType={setUserType} />
                    </Route>
                    <Route path="/register" component={Register} />
                    <Route path="/properties" component={PropertyList} />
                    <Route path="/postproperties" component={PostProperty} />
                    <Route path="/">
                        {isAuthenticated ? (
                            userType === 'seller' ? (
                                <Redirect to="/postproperties" />
                            ) : (
                                <Redirect to="/properties" />
                            )
                        ) : (
                            <Redirect to="/login" />
                        )}
                    </Route>
                </Switch>
            </div>
        </Router>
    );
}

export default App;
