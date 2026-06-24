// Shared formatting helpers used across the dashboard

export const formatAUD = (n) => {
  if (!n) return "TBC";
  return n >= 1e9
    ? `$${(n / 1e9).toFixed(2)}B`
    : `$${(n / 1e6).toFixed(0)}M`;
};

// "initial_estimate" → "Initial Estimate"
export const formatChangeType = (str) => {
  if (!str) return "—";
  return str
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

// "planning" → "Planning", "under_construction" → "Under Construction"
export const formatStatus = (str) => {
  if (!str) return "—";
  return str
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

// "new" → "New", "upgraded" → "Upgraded"
export const formatType = (str) => {
  if (!str) return "—";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Shorten venue names for chart x-axis
export const shortVenueName = (name) => {
  return name
    .replace("Sunshine Coast", "SC")
    .replace("Brisbane", "Bris.")
    .replace("International", "Intl.")
    .replace("Indoor Sports Centre", "Indoor")
    .replace("Mountain Bike Centre", "MTB")
    .replace("Sports Centre", "Sports")
    .replace("Aquatic Centre", "Aquatic")
    .replace("Whitewater Centre", "Whitewater")
    .replace("Flatwater Facility", "Flatwater")
    .replace(" Stadium", " Stad.")
    .replace("Showgrounds", "Showgrounds")
    .replace("Para Sport Facility", "Para Sport")
    .replace("Sports Precinct", "Precinct")
    .trim();
};
