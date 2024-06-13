from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import networkx as nx
from datetime import datetime

app = Flask(__name__)
CORS(app)

@app.route('/search', methods=['POST'])
def search():
    data = request.json
    source = data['source']
    destination = data['destination']

    G = nx.DiGraph()

    # Connect to the MySQL database
    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password='password',
        database='bus_routes_db'
    )
    cursor = conn.cursor()

    # Retrieve all bus routes
    cursor.execute('SELECT * FROM bus_routes')
    routes = cursor.fetchall()

    # Add bus routes to the graph
    for route in routes:
        add_bus_route(G, route)

    conn.close()

    # Check if source and destination bus stops exist in the graph
    if source not in G.nodes or destination not in G.nodes:
        return jsonify({
            'error': 'One or both of the bus stops do not exist.'
        }), 404

    # Find the shortest path
    shortest_path, shortest_path_eta, buses = find_shortest_path(G, source, destination)
    
    # Find other alternate paths
    other_paths = find_other_paths(G, source, destination, exclude_path=shortest_path)
    other_paths_eta = [calculate_total_time(G, path) for path in other_paths]

    if shortest_path:
        return jsonify({
            'shortest_path': shortest_path,
            'shortest_path_eta': shortest_path_eta,
            'other_paths': other_paths,
            'other_paths_eta': other_paths_eta,
            'buses': buses
        })
    else:
        # Check if there are any routes at all in the graph
        if not routes:
            return jsonify({
                'error': 'No routes exist in the database.'
            }), 404
        else:
            return jsonify({
                'error': 'No routes found between the given bus stops.'
            }), 404

def add_bus_route(G, route):
    bus_id, start_stop, end_stop, dep_time, arr_time, intermediate_stops = route
    try:
        stops = [(start_stop, dep_time)]

        if intermediate_stops and intermediate_stops.lower() != 'none':
            intermediate_stops_list = intermediate_stops.split(',')
            for stop in intermediate_stops_list:
                stop_time_pair = stop.split(':')
                if len(stop_time_pair) == 2:
                    stops.append((stop_time_pair[0].strip(), stop_time_pair[1].strip()))

        stops.append((end_stop, arr_time))
        stops = [(stop, datetime.strptime(time, '%H:%M')) for stop, time in stops]

        for i in range(len(stops) - 1):
            G.add_edge(stops[i][0], stops[i+1][0], weight=(stops[i+1][1] - stops[i][1]).seconds / 60, bus_id=bus_id)
    except Exception as e:
        print(f"Error processing route {route}: {e}")

def find_shortest_path(G, start, end):
    try:
        def custom_weight(u, v, d):
            prev_bus_id = G.nodes[u].get('prev_bus_id', None)
            curr_bus_id = d['bus_id']
            penalty = 0
            if prev_bus_id is not None and prev_bus_id != curr_bus_id:
                penalty = 5
            G.nodes[v]['prev_bus_id'] = curr_bus_id
            return d['weight'] + penalty

        G.nodes[start]['prev_bus_id'] = None
        path = nx.dijkstra_path(G, start, end, weight=custom_weight)
        buses = [G.edges[path[i], path[i+1]]['bus_id'] for i in range(len(path) - 1)]
        unique_buses = []
        current_bus = buses[0]
        unique_buses.append(current_bus)
        for bus in buses[1:]:
            if bus != current_bus:
                current_bus = bus
                unique_buses.append(current_bus)

        shortest_path_eta = calculate_total_time(G, path)
        return path, shortest_path_eta, unique_buses
    except nx.NetworkXNoPath:
        return None, None, None

def find_other_paths(G, start, end, exclude_path=None):
    all_paths = list(nx.all_simple_paths(G, start, end, cutoff=20))
    if exclude_path:
        all_paths = [path for path in all_paths if path != exclude_path]
    all_paths = sorted(all_paths, key=lambda path: sum(G.edges[path[i], path[i+1]]['weight'] for i in range(len(path) - 1)))
    return all_paths[:1]

def calculate_total_time(G, path):
    total_time = 0
    for i in range(len(path) - 1):
        total_time += G.edges[path[i], path[i+1]]['weight']
    return total_time

if __name__ == '__main__':
    app.run(port=3003)

