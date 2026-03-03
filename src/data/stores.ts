export interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  hours: string;
  distance?: number;
}

export const stores: Store[] = [
  {
    id: "sac-1",
    name: "Reserve Spirits – Midtown",
    address: "1420 R Street",
    city: "Sacramento",
    state: "CA",
    zip: "95811",
    hours: "Mon–Sat 10am–9pm · Sun 11am–7pm",
    distance: 0.8,
  },
  {
    id: "sac-2",
    name: "Reserve Spirits – East Sac",
    address: "5510 Folsom Blvd",
    city: "Sacramento",
    state: "CA",
    zip: "95819",
    hours: "Mon–Sat 10am–9pm · Sun 11am–7pm",
    distance: 3.2,
  },
  {
    id: "sf-1",
    name: "Reserve Spirits – Mission",
    address: "2200 Mission St",
    city: "San Francisco",
    state: "CA",
    zip: "94110",
    hours: "Mon–Sat 10am–10pm · Sun 12pm–8pm",
    distance: 87.4,
  },
  {
    id: "la-1",
    name: "Reserve Spirits – Silver Lake",
    address: "3401 Sunset Blvd",
    city: "Los Angeles",
    state: "CA",
    zip: "90026",
    hours: "Mon–Sat 9am–10pm · Sun 10am–8pm",
    distance: 384.1,
  },
];
