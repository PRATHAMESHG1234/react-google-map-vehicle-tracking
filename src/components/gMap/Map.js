import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  withScriptjs,
  withGoogleMap,
  Polyline,
  Marker,
} from "react-google-maps";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";

const Map = ({ routes }) => {
  const [progress, setProgress] = useState([]);
  const velocity = 200; // 100km per hour
  let initialDate;
  let interval = null;
  const icon1 = {
    url: "https://images.vexels.com/media/users/3/154573/isolated/preview/bd08e000a449288c914d851cb9dae110-hatchback-car-top-view-silhouette-by-vexels.png",
    scaledSize: new window.google.maps.Size(40, 40),
    anchor: new window.google.maps.Point(20, 20),
    scale: 0.7,
  };

  useEffect(() => {
    calculatePaths();
    return () => {
      interval && window.clearInterval(interval);
    };
  }, [routes]);

  const calculatePaths = () => {
    routes.forEach((route, index) => {
      routes[index] = route.map((coordinates, i, array) => {
        if (i === 0) {
          return { ...coordinates, distance: 0 };
        }
        const { lat: lat1, lng: lng1 } = coordinates;
        const latLong1 = new window.google.maps.LatLng(lat1, lng1);
        const { lat: lat2, lng: lng2 } = array[0];
        const latLong2 = new window.google.maps.LatLng(lat2, lng2);
        const distance =
          window.google.maps.geometry.spherical.computeDistanceBetween(
            latLong1,
            latLong2
          );
        return { ...coordinates, distance };
      });
    });
  };

  const getDistance = () => {
    const differentInTime = (new Date() - initialDate) / 1000;
    return differentInTime * velocity;
  };

  const moveObject = () => {
    const distance = getDistance();
    if (!distance) {
      return;
    }

    let updatedProgress = [];
    routes.forEach((route, index) => {
      let progress = route.filter(
        (coordinates) => coordinates.distance < distance
      );

      const nextLine = route.find(
        (coordinates) => coordinates.distance > distance
      );

      if (!nextLine) {
        console.log(`Trip ${index + 1} Completed!! Thank You !!`);
      } else {
        const lastLine = progress[progress.length - 1];

        const lastLineLatLng = new window.google.maps.LatLng(
          lastLine.lat,
          lastLine.lng
        );

        const nextLineLatLng = new window.google.maps.LatLng(
          nextLine.lat,
          nextLine.lng
        );

        const totalDistance = nextLine.distance - lastLine.distance;
        const percentage = (distance - lastLine.distance) / totalDistance;

        const position = window.google.maps.geometry.spherical.interpolate(
          lastLineLatLng,
          nextLineLatLng,
          percentage
        );

        updatedProgress.push(progress.concat(position));
      }
    });

    mapUpdate();
    setProgress(updatedProgress);
  };

  const startSimulation = () => {
    if (interval) {
      window.clearInterval(interval);
    }
    setProgress([]);
    initialDate = new Date();
    interval = window.setInterval(moveObject, 1000);
  };
  let route;
  const mapUpdate = () => {
    const distance = getDistance();
    if (!distance) {
      return;
    }

    // Find the route with the smallest distance
    route = routes[1];

    let progress = route.filter(
      (coordinates) => coordinates.distance < distance
    );

    const nextLine = route.find(
      (coordinates) => coordinates.distance > distance
    );

    let point1, point2;

    if (nextLine) {
      point1 = progress[progress.length - 1];
      point2 = nextLine;
    } else {
      point1 = progress[progress.length - 2];
      point2 = progress[progress.length - 1];
    }

    const point1LatLng = new window.google.maps.LatLng(point1.lat, point1.lng);
    const point2LatLng = new window.google.maps.LatLng(point2.lat, point2.lng);

    const angle = window.google.maps.geometry.spherical.computeHeading(
      point1LatLng,
      point2LatLng
    );
    const actualAngle = angle - 90;

    const marker = document.querySelector(`[src="${icon1.url}"]`);

    if (marker) {
      marker.style.transform = `rotate(${actualAngle}deg)`;
    }
  };

  console.log("====================================");
  console.log(progress);
  console.log("====================================");
  return (
    <Card variant="outlined">
      <div className="btnCont">
        <Button variant="contained" onClick={startSimulation}>
          Start Simulation
        </Button>
      </div>

      <div className="gMapCont">
        <GoogleMap
          defaultZoom={10}
          defaultCenter={{
            lat: routes[0][Math.floor(routes[0].length / 2)].lat,
            lng: routes[0][Math.floor(routes[0].length / 2)].lng,
          }}
        >
          {routes.map((route, index) => (
            <Polyline
              key={index}
              path={route}
              options={{
                strokeColor: index === progress.length - 1 ? "blue" : "#0088FF",
                strokeWeight: 6,
                strokeOpacity: 0.6,
                defaultVisible: true,
              }}
            />
          ))}

          {progress &&
            progress.map((routeProgress, index) => {
              // Find the index of the route with the shortest length
              const shortestRouteIndex = progress.reduce((acc, cur, i) => {
                if (i === 0 || cur.length < progress[acc].length) {
                  return i;
                } else {
                  return acc;
                }
              }, 0);

              // Only render the polyline and marker for the shortest route
              if (index === shortestRouteIndex) {
                return (
                  <React.Fragment key={index}>
                    <Polyline
                      path={routeProgress}
                      options={{ strokeColor: "orange" }}
                    />
                    <Marker
                      icon={icon1}
                      position={routeProgress[routeProgress.length - 1]}
                    />
                  </React.Fragment>
                );
              } else {
                return null; // Render nothing for other routes
              }
            })}
        </GoogleMap>
      </div>
    </Card>
  );
};

export default withScriptjs(withGoogleMap(Map));
