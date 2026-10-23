export type Status = "in_transit" | "delayed" | "at_risk" | "delivered";

export interface ShipmentEvent {
  time: string;
  location: string;
  note: string;
}

export interface Shipment {
  id: string;
  customer: string;
  origin: string;
  destination: string;
  status: Status;
  eta: string;
  delayReason?: string;
  events: ShipmentEvent[];
}

export const shipments: Shipment[] = [
  {
    id: "SHP-1001",
    customer: "Acme Home Goods",
    origin: "Shenzhen, CN",
    destination: "Rotterdam, NL",
    status: "in_transit",
    eta: "2026-10-27",
    events: [
      { time: "2026-10-18T08:00:00Z", location: "Shenzhen, CN", note: "Picked up" },
      { time: "2026-10-19T14:30:00Z", location: "Yantian Port, CN", note: "Departed port" },
    ],
  },
  {
    id: "SHP-1002",
    customer: "Blue Fern Cafe",
    origin: "Mumbai, IN",
    destination: "Hamburg, DE",
    status: "delayed",
    eta: "2026-10-30",
    delayReason: "Port congestion at Jebel Ali; vessel waiting 3 days for a berth.",
    events: [
      { time: "2026-10-12T09:00:00Z", location: "Mumbai, IN", note: "Picked up" },
      { time: "2026-10-14T18:00:00Z", location: "Nhava Sheva, IN", note: "Departed port" },
      { time: "2026-10-20T06:00:00Z", location: "Jebel Ali, AE", note: "Held: waiting for berth" },
    ],
  },
  {
    id: "SHP-1003",
    customer: "Northwind Bikes",
    origin: "Chennai, IN",
    destination: "Felixstowe, UK",
    status: "at_risk",
    eta: "2026-10-28",
    delayReason: "Customs documents incomplete; clearance not yet started.",
    events: [
      { time: "2026-10-15T10:00:00Z", location: "Chennai, IN", note: "Picked up" },
      { time: "2026-10-21T12:00:00Z", location: "Chennai, IN", note: "Awaiting customs documents" },
    ],
  },
  {
    id: "SHP-1004",
    customer: "Lumen Books",
    origin: "Colombo, LK",
    destination: "Singapore, SG",
    status: "delivered",
    eta: "2026-10-20",
    events: [
      { time: "2026-10-16T07:00:00Z", location: "Colombo, LK", note: "Picked up" },
      { time: "2026-10-20T15:00:00Z", location: "Singapore, SG", note: "Delivered" },
    ],
  },
];

export function findShipment(id: string): Shipment | undefined {
  return shipments.find((s) => s.id === id.toUpperCase());
}