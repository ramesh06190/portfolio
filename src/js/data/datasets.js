// Sample data for the component demos. Every name and number is made up.

export const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah",
  "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
];

const people = [
  "Avery Johnson", "Jordan Smith", "Taylor Nguyen", "Morgan Patel", "Casey Martinez", "Riley Thompson",
  "Jamie Robinson", "Quinn Walker", "Drew Hernandez", "Skyler Lee", "Reese Clark", "Rowan Lewis",
  "Parker Young", "Hayden King", "Emerson Wright", "Finley Scott", "Sawyer Green", "Dakota Adams",
  "Elliot Baker", "Harper Hill", "Kendall Rivera", "Logan Campbell", "Peyton Mitchell", "Remy Carter",
];
const programs = ["Unemployment Insurance", "Disaster Assistance", "Trade Adjustment", "Work Share"];
const statuses = ["Approved", "Pending review", "Needs information", "Denied"];

// Deterministic so the table looks the same on every load
export const CLAIMS = people.map((name, i) => {
  const day = ((i * 7) % 28) + 1;
  const month = ((i * 5) % 9) + 1;
  return {
    id: `CL-${String(24051 + i * 37).padStart(6, "0")}`,
    name,
    program: programs[(i * 3) % programs.length],
    filed: `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    status: statuses[(i * 5) % statuses.length],
    amount: 180 + ((i * 97) % 520),
  };
});
