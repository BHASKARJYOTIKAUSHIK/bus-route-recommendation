

import React, { useState } from 'react';
import axios from 'axios';

const SearchComponent = ({ onSearch }) => {
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [error, setError] = useState(null);

    const handleSearch = async () => {
        if (!source || !destination) {
            setError('Please enter the field.');
            return;
        }

        setError(null);
        try {
            const response = await axios.post('http://localhost:3003/search', {
                source,
                destination
            });
            onSearch(response.data);
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                setError(error.response.data.error);
            } else {
                setError('An unexpected error occurred.');
            }
        }
    };

    const checkBusStopExists = (busStop) => {
        // You can implement your logic to check if the bus stop exists in the database here
        // For demonstration purposes, let's assume we have a list of valid bus stops
        const validBusStops = [
            "",
            "Chandmari",
            "Bamunimaidam",
            "ZooRd Tini-ali",
            "Geetanagar",
            "Zoo Road",
            "Ganeshguri",
            "Six Mile",
            "Ulubari",
            "Guwahati Club"
        ];

        return validBusStops.includes(busStop);
    };

    const handleSourceChange = (e) => {
        setSource(e.target.value);
        if (!checkBusStopExists(e.target.value)) {
            setError('No bus stop found.');
        } else {
            setError(null);
        }
    };

    const handleDestinationChange = (e) => {
        setDestination(e.target.value);
        if (!checkBusStopExists(e.target.value)) {
            setError('No bus stop found.');
        } else {
            setError(null);
        }
    };

    return (
        <div className="search-component">
            <input
                type="text"
                placeholder="Source"
                value={source}
                onChange={handleSourceChange}
            />
            <input
                type="text"
                placeholder="Destination"
                value={destination}
                onChange={handleDestinationChange}
            />
            <button onClick={handleSearch}>Search</button>
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default SearchComponent;
