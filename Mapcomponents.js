
import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const MapComponent = ({ route }) => {
    const mapRef = useRef(null);

    useEffect(() => {
        const map = L.map(mapRef.current).setView([26.171838, 91.768723], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Add markers for bus stops
        const busStops = [
            { name: "Chandmari", coords: [26.183852, 91.774712] },
            { name: "Bamunimaidam", coords: [26.183269, 91.793546] },
            { name: "ZooRd Tini-ali", coords: [26.174745, 91.776818] },
            { name: "Geetanagar", coords: [26.172509, 91.795494] },
            { name: "Zoo Road", coords: [26.163783, 91.780457] },
            { name: "Ganeshguri", coords: [26.149681, 91.785221] },
            { name: "Six Mile", coords: [26.142112, 91.794654] },
            { name: "Ulubari", coords: [26.175010, 91.757240] },
            { name: "Guwahati Club", coords: [26.184947, 91.756982] },
        ];

        busStops.forEach(stop => {
            L.marker(stop.coords).addTo(map).bindPopup(stop.name);
        });
        if (route && route.other_paths) {
            route.other_paths.forEach((path, index) => {
                const otherPathCoords = path.map(stop => busStops.find(b => b.name === stop).coords);
                L.polyline(otherPathCoords, { color: 'red' }).addTo(map).bindPopup(`ETA: ${route.other_paths_eta[index]} minutes`);
            });
        }
        if (route && route.shortest_path && route.shortest_path.length) {
            const shortestPathCoords = route.shortest_path.map(stop => busStops.find(b => b.name === stop).coords);
            L.polyline(shortestPathCoords, { color: 'green' }).addTo(map).bindPopup(`ETA: ${route.shortest_path_eta} minutes`);
        }

        return () => {
            map.remove();
        };
    }, [route]);

    useEffect(() => {
        if (mapRef.current && mapRef.current.leafletElement) {
            mapRef.current.leafletElement.panTo([26.171838, 91.768723]);
        }
    }, []);

    const relocateToCenter = () => {
        if (mapRef.current && mapRef.current.leafletElement) {
            mapRef.current.leafletElement.panTo([26.171838, 91.768723]);
        }
    };



    return (
        <div>


            <div ref={mapRef} style={{ height: '600px', width: '600px' }}></div>

        </div>
    );
};

export default MapComponent;
