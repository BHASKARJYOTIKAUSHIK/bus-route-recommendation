
import React, { useState } from 'react';
import SearchComponent from './components/SearchComponent';
import MapComponent from './components/MapComponent';

const App = () => {
    const [route, setRoute] = useState(null);
    const [error, setError] = useState(null);

    const handleSearch = (data) => {
        if (data.error) {
            setError(data.error);
            setRoute(null);
        } else {
            setError(null);
            setRoute(data);
        }
    };

    return (
        <div className="app">
            <header className="app-header">
                <h1>Bus Route Finder</h1>
            </header>
            <div className="search-container">
                <SearchComponent onSearch={handleSearch} />
            </div>
            <div className="map-container">
                <MapComponent route={route} />
                {error && (
                    <div className="error-message">
                        <p>{error}</p>
                    </div>
                )}
                {route && !error && (
                    <div className="route-info">
                        <h2>Route Information</h2>
                        {route.shortest_path ? (
                            <p>Shortest Path: {route.shortest_path.join(' -> ')}</p>
                        ) : (
                            <p>No shortest path found.</p>
                        )}
                        {route.buses ? (
                            <p>Buses: {route.buses.join(', ')}</p>
                        ) : (
                            <p>No buses found for the shortest path.</p>
                        )}
                        {route.shortest_path_eta !== undefined && (
                            <p>ETA for Shortest Path: {route.shortest_path_eta} minutes</p>
                        )}
                        {route.other_paths && route.other_paths.length > 0 && (
                            <div>
                                <h3>Alternative Paths:</h3>
                                {route.other_paths.map((path, index) => (
                                    <div key={index}>
                                        <p>Path: {path.join(' -> ')}</p>
                                        <p>ETA: {route.other_paths_eta[index]} minutes</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;
