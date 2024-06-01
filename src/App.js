import React, { useEffect, useState } from "react";
import "./App.css";
import WrappedMap from "./components/gMap/Map";
import config from "./components/gMap/config";
import Header from "./components/Header/Header";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";

function App() {
  const [routes, setRoutes] = useState([]);
  const [stops] = useState({
    total: 3,
    data: [
      { lat: 17.61271, lng: 74.52881, id: "stop1" },
      { lat: 17.61272, lng: 74.52882, id: "stop2" },
      { lat: 17.61273, lng: 74.52883, id: "stop3" },
    ],
  });

  const mapURL = `https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=${config.mapsKey}&alternatives=true`;
  const origin = { lat: 17.61271, lng: 74.52881 };
  const destination = { lat: 17.6805, lng: 74.0183 };

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      const script = document.createElement("script");
      script.src = mapURL;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    };

    const initMap = () => {
      const directionsService = new window.google.maps.DirectionsService();
      const request = {
        origin: origin,
        destination: destination,
        travelMode: "DRIVING",
        provideRouteAlternatives: true,
      };

      directionsService.route(request, (response, status) => {
        if (status === "OK") {
          console.log(response);
          const routes = response.routes.map((route) => {
            const pathCoordinates = route.overview_path.map((point) => ({
              lat: point.lat(),
              lng: point.lng(),
            }));
            return pathCoordinates;
          });
          setRoutes(routes);
        } else {
          console.error("Directions request failed due to " + status);
        }
      });
    };

    loadGoogleMapsScript();
  }, [mapURL]);
  console.log(routes);
  return (
    <div className="App">
      <Header />

      {routes.length ? (
        <WrappedMap
          routes={routes}
          stops={stops}
          googleMapURL={mapURL}
          loadingElement={<div style={{ height: `100%` }} />}
          containerElement={<div className="mapContainer" />}
          mapElement={<div style={{ height: `100%` }} />}
        />
      ) : (
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      )}
    </div>
  );
}

export default App;
