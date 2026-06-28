import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { formatAUD } from "../utils";

const COORDS = {
  "brisbane-stadium": [-27.4567, 153.0089],
  "national-aquatic-centre": [-27.462, 153.0078],
  "barlow-park-stadium": [-16.9186, 145.7781],
  "brisbane-aquatic-centre": [-27.5317, 153.1146],
  "brisbane-international-shooting-centre": [-27.51, 153.095],
  "brisbane-sx-bmx-centre": [-27.533, 153.1165],
  "anna-meares-velodrome": [-27.5345, 153.1155],
  "chandler-sports-precinct": [-27.5333, 153.115],
  "para-sport-facility": [-27.532, 153.117],
  "logan-indoor-sports-centre": [-27.6386, 153.1097],
  "moreton-bay-indoor-sports-centre": [-27.2677, 152.9983],
  "queensland-tennis-centre": [-27.5167, 152.9833],
  "redland-whitewater-centre": [-27.523, 153.231],
  "rockhampton-flatwater-facility": [-23.3789, 150.51],
  "sunshine-coast-mountain-bike-centre": [-26.65, 153.05],
  "sunshine-coast-stadium": [-26.705, 153.05],
  "toowoomba-showgrounds": [-27.5497, 151.9244],
};

const TYPE_COLOUR = {
  new: "#0e9f6e",
  upgraded: "#1a56db",
  existing: "#6b7280",
};

export default function VenueMap({ venues }) {
  return (
    <div className="card" style={{ marginBottom: "1.5rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "var(--grey-800)",
          }}
        >
          Venue Locations
        </h2>
        <p
          style={{
            fontSize: "0.78rem",
            color: "var(--grey-400)",
            marginTop: 2,
          }}
        >
          All 17 GIICA venues across Queensland · Click a marker for details
        </p>
      </div>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        {[
          ["New", "#0e9f6e"],
          ["Upgraded", "#1a56db"],
          ["Existing", "#6b7280"],
        ].map(([label, color]) => (
          <span
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: "0.72rem",
              color: "var(--grey-600)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: color,
              }}
            />
            {label}
          </span>
        ))}
      </div>
      <MapContainer
        center={[-25.5, 152.5]}
        zoom={6}
        style={{ height: 420, borderRadius: 8 }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {venues.map((v) => {
          const coords = COORDS[v.slug];
          if (!coords) return null;
          return (
            <CircleMarker
              key={v.slug}
              center={coords}
              radius={8}
              pathOptions={{
                fillColor: TYPE_COLOUR[v.type] || "#6b7280",
                color: "#fff",
                weight: 2,
                fillOpacity: 0.9,
              }}
            >
              <Popup>
                <strong>{v.name}</strong>
                <br />
                {v.latest_amount ? formatAUD(v.latest_amount) : "Cost TBC"}
                <br />
                <span
                  style={{
                    fontSize: "0.78rem",
                    color: "#666",
                    textTransform: "capitalize",
                  }}
                >
                  {v.type}
                </span>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
