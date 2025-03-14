import sys
import json
import requests
import pandas as pd

# Google Maps API key
api_key = "AIzaSyBr4JDfVthpvoF9PM3QuB8SO74Q3d1r1Hs"

def get_distance(origin, destination):
    url = f"https://maps.googleapis.com/maps/api/distancematrix/json?origins={origin}&destinations={destination}&key={api_key}"
    response = requests.get(url)
    data = response.json()
    if data['status'] == 'OK':
        distance = data['rows'][0]['elements'][0]['distance']['text']
        duration = data['rows'][0]['elements'][0]['duration']['text']
        return {"distance": distance, "duration": duration}
    else:
        return {"error": "Failed to get distance info", "details": data}

def geocode_address(address):
    url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={api_key}"
    response = requests.get(url)
    data = response.json()
    if data['status'] == 'OK':
        location = data['results'][0]['geometry']['location']
        return {"lat": location['lat'], "lng": location['lng']}
    else:
        return {"error": f"Geocoding failed for address '{address}'", "status": data['status']}

def find_nearby_places(lat, lng, place_type):
    url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={lat},{lng}&radius=1000&type={place_type}&key={api_key}"
    response = requests.get(url)
    results = response.json()
    places = []
    if results['status'] == 'OK':
        for place in results['results'][:5]:
            name = place['name']
            vic = place.get('vicinity', 'N/A')
            places.append({'name': name, 'address': vic})
    return places

def get_bus_routes(origin, destination):
    url = f"https://maps.googleapis.com/maps/api/directions/json"
    params = {
        "origin": origin,
        "destination": destination,
        "mode": "transit",
        "transit_mode": "bus",
        "departure_time": "now",
        "key": api_key
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    if data['status'] != 'OK':
        return {"error": f"Error fetching directions: {data['status']}"}
    
    routes = []
    for route in data.get('routes', []):
        summary = {
            "summary": route.get("summary", "N/A"),
            "duration": route['legs'][0]['duration'].get('text') if 'duration' in route['legs'][0] else None,
            "distance": route['legs'][0]['distance'].get('text') if 'distance' in route['legs'][0] else None,
            "departure_time": route['legs'][0]['departure_time'].get('text') if 'departure_time' in route['legs'][0] else "N/A",
            "arrival_time": route['legs'][0]['arrival_time'].get('text') if 'arrival_time' in route['legs'][0] else "N/A",
            "steps": []
        }
        for step in route['legs'][0].get('steps', []):
            if step.get('travel_mode') == 'TRANSIT' and step.get('transit_details', {}).get('line', {}).get('vehicle', {}).get('type') == 'BUS':
                bus_details = {
                    "bus_name": step['transit_details']['line'].get('name', ''),
                    "bus_number": step['transit_details']['line'].get('short_name', ''),
                    "departure_stop": step['transit_details']['departure_stop'].get('name', ''),
                    "departure_time": step['transit_details']['departure_time'].get('text', ''),
                    "arrival_stop": step['transit_details']['arrival_stop'].get('name', ''),
                    "num_stops": step['transit_details'].get('num_stops', 0),
                }
                summary["steps"].append(bus_details)
        routes.append(summary)
    return routes

def calculate_distances(home_address, universities):
    geo = geocode_address(home_address)
    if "error" in geo:
        return {"error": "Failed to geocode home address"}
    home_coords = f"{geo['lat']},{geo['lng']}"
    distances = []
    for university in universities:
        uni_geo = geocode_address(university)
        if "error" in uni_geo:
            distances.append({'University': university, 'error': f"Failed to geocode {university}"})
            continue
        uni_coords = f"{uni_geo['lat']},{uni_geo['lng']}"
        dist_info = get_distance(home_coords, uni_coords)
        distances.append({'University': university, **dist_info})
    return distances

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing listing address"}))
        sys.exit(1)
        
    listing_address = sys.argv[1]
    # Use Western University as the primary destination.
    western_university = "Western University, London, Ontario, Canada"
    
    # Run all functions:
    geocode_result = geocode_address(listing_address)
    distance_result = get_distance(listing_address, western_university)
    bus_routes_result = get_bus_routes(listing_address, western_university)
    
    # Use geocoded coordinates to find nearby places (e.g., restaurants)
    if "lat" in geocode_result:
        nearby_places_result = find_nearby_places(geocode_result["lat"], geocode_result["lng"], "restaurant")
    else:
        nearby_places_result = {"error": "Could not determine nearby places due to geocoding error"}
    
    # Calculate distances to a list of universities (example uses only Western University)
    distances_for_universities = calculate_distances(listing_address, [western_university])
    
    # Aggregate all results into one JSON object
    output = {
        "geocode": geocode_result,
        "distance": distance_result,
        "bus_routes": bus_routes_result,
        "nearby_places": nearby_places_result,
        "calculate_distances": distances_for_universities
    }
    # Print the JSON output to stdout (this will be captured by the backend)
    print(json.dumps(output))
