import React, { useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
} from '@tanstack/react-query';

function SearchParams() {
  const [station, setStation] = useState('');

  const fetchStations = async () => {
    const res = await fetch('https://api.weather.gov/stations?limit=500');
    const data = await res.json();
    return data.features.map((feature) => feature.properties.stationIdentifier);
  };

  const {
    data: stations,
    isLoading,
    error,
  } = useQuery({
    queryKey: 'stations',
    queryFn: fetchStations,
  });

  const fetchTemperature = async (station) => {
    const res = await fetch(
      `https://api.weather.gov/stations/${station}/observations/latest`,
    );
    const data = await res.json();
    return data.properties.temperature.value;
  };

  const mutation = useMutation({
    mutationFn: fetchTemperature,
  });

  if (isLoading) return 'Loading...';
  if (error) return 'An error has occurred: ' + error.message;

  return (
    <div className="search-params">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate(station);
        }}
      >
        <label htmlFor="station">
          Stations
          <select
            id="stations"
            value={station}
            onChange={(e) => setStation(e.target.value)}
            onBlur={(e) => setStation(e.target.value)}
          >
            <option />
            {stations.map((station) => (
              <option key={station} value={station}>
                {station}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Submit</button>
      </form>
      {mutation.isSuccess && (
        <div>
          <label>Temperature: </label>
          <span>{mutation.data}°C</span>
        </div>
      )}
    </div>
  );
}

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <header className="App-header">
          <SearchParams />
        </header>
      </div>
    </QueryClientProvider>
  );
}

export default App;
