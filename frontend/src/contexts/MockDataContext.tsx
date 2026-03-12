import React, { createContext, useContext, useState, useCallback } from "react";
import {
  anchorToLedger,
  getSeedEntries,
  type LedgerEntry,
} from "@/lib/blockchain-sim";
import {
  runFraudChecks,
  type FraudAlert as FraudAlertType,
} from "@/lib/fraud-engine";
import { calculateDVA, type DVAResult } from "@/lib/dva-engine";

export interface Supplier {
  id: string;
  name: string;
  email: string;
  gst: string;
  pan: string;
  udyam: string;
  location: string;
  state: string;
  msmeStatus: string;
  sector: string;
  products: number;
  status: "active" | "inactive" | "suspended";
  createdAt: string;
}

export interface Product {
  id: string;
  supplierId: string;
  supplierName: string;
  name: string;
  category: string;
  hsnCode: string;
  estimatedCost: number;
  dvaScore?: number;
  classification?: string;
  status: "draft" | "submitted" | "verified";
  createdAt: string;
}

export interface BOMComponent {
  id: string;
  productId: string;
  name: string;
  origin: "domestic" | "imported";
  cost: number;
  supplierName: string;
}

export interface ComplianceRecord {
  id: string;
  productId: string;
  productName: string;
  supplierName: string;
  category: string;
  dvaScore: number;
  classification: "Class I" | "Class II" | "Non-Local";
  confidenceScore: number;
  riskScore: number;
  status: "compliant" | "non-compliant" | "under-review";
  verifiedAt: string;
  blockchainTxHash?: string;
}

export interface RiskAlert {
  id: string;
  productId: string;
  productName: string;
  supplierName: string;
  alertType: string;
  severity: "high" | "medium" | "low";
  description: string;
  details?: string;
  ruleId?: string;
  createdAt: string;
  resolved: boolean;
}

export interface VerificationLog {
  id: string;
  productId: string;
  productName: string;
  supplierName: string;
  requestedBy: string;
  status: "verified" | "failed" | "pending";
  dvaScore: number;
  confidenceScore: number;
  classification: string;
  riskScore: number;
  blockchainTxHash: string;
  timestamp: string;
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: "superadmin" | "admin" | "procurement" | "supplier" | "auditor";
  organization: string;
  department: string;
  lastLogin: string;
  status: "active" | "inactive" | "suspended";
  createdAt: string;
}

// ─── EXPANDED MOCK DATA ───

const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: "SUP-001",
    name: "Vikram Industries Pvt Ltd",
    email: "contact@vikram.co.in",
    gst: "27AABCU9603R1ZM",
    pan: "AABCU9603R",
    udyam: "UDYAM-MH-01-0012345",
    location: "Pune",
    state: "Maharashtra",
    msmeStatus: "Medium",
    sector: "Electrical Equipment",
    products: 4,
    status: "active",
    createdAt: "2025-01-15",
  },
  {
    id: "SUP-002",
    name: "Bharat Electronics Ltd",
    email: "info@bel.co.in",
    gst: "29AAACB1234D1ZP",
    pan: "AAACB1234D",
    udyam: "UDYAM-KA-02-0098765",
    location: "Bangalore",
    state: "Karnataka",
    msmeStatus: "Large",
    sector: "Defence Electronics",
    products: 6,
    status: "active",
    createdAt: "2025-02-10",
  },
  {
    id: "SUP-003",
    name: "Tata Advanced Systems",
    email: "procurement@tata.com",
    gst: "36AAACT5678E1ZQ",
    pan: "AAACT5678E",
    udyam: "UDYAM-TS-03-0054321",
    location: "Hyderabad",
    state: "Telangana",
    msmeStatus: "Large",
    sector: "Aerospace",
    products: 3,
    status: "active",
    createdAt: "2025-01-28",
  },
  {
    id: "SUP-004",
    name: "Mahindra Defence Systems",
    email: "defence@mahindra.com",
    gst: "27AAECM9876F1ZR",
    pan: "AAECM9876F",
    udyam: "UDYAM-MH-04-0067890",
    location: "Mumbai",
    state: "Maharashtra",
    msmeStatus: "Large",
    sector: "Defence",
    products: 2,
    status: "inactive",
    createdAt: "2025-03-01",
  },
  {
    id: "SUP-005",
    name: "Reliance Naval Engineering",
    email: "naval@reliance.com",
    gst: "24AABCR1122G1ZS",
    pan: "AABCR1122G",
    udyam: "UDYAM-GJ-05-0011223",
    location: "Surat",
    state: "Gujarat",
    msmeStatus: "Large",
    sector: "Naval Engineering",
    products: 1,
    status: "active",
    createdAt: "2024-12-20",
  },
  {
    id: "SUP-006",
    name: "Larsen & Toubro Defence",
    email: "lt.defence@lt.com",
    gst: "27AAACL1234H1ZT",
    pan: "AAACL1234H",
    udyam: "UDYAM-MH-06-0033445",
    location: "Mumbai",
    state: "Maharashtra",
    msmeStatus: "Large",
    sector: "Defence",
    products: 5,
    status: "active",
    createdAt: "2024-11-15",
  },
  {
    id: "SUP-007",
    name: "HAL Accessories Division",
    email: "hal.acc@hal.co.in",
    gst: "29AAACH5678I1ZU",
    pan: "AAACH5678I",
    udyam: "UDYAM-KA-07-0055667",
    location: "Bangalore",
    state: "Karnataka",
    msmeStatus: "Large",
    sector: "Aerospace",
    products: 8,
    status: "active",
    createdAt: "2024-10-05",
  },
  {
    id: "SUP-008",
    name: "Kalyani Group Defence",
    email: "defence@kalyani.com",
    gst: "27AAACK9012J1ZV",
    pan: "AAACK9012J",
    udyam: "UDYAM-MH-08-0077889",
    location: "Pune",
    state: "Maharashtra",
    msmeStatus: "Large",
    sector: "Defence",
    products: 3,
    status: "active",
    createdAt: "2025-01-10",
  },
  {
    id: "SUP-009",
    name: "Adani Defence & Aerospace",
    email: "defence@adani.com",
    gst: "24AAECA3456K1ZW",
    pan: "AAECA3456K",
    udyam: "UDYAM-GJ-09-0099001",
    location: "Ahmedabad",
    state: "Gujarat",
    msmeStatus: "Large",
    sector: "Aerospace",
    products: 2,
    status: "active",
    createdAt: "2025-02-20",
  },
  {
    id: "SUP-010",
    name: "BEML Limited",
    email: "info@beml.co.in",
    gst: "29AAACB7890L1ZX",
    pan: "AAACB7890L",
    udyam: "UDYAM-KA-10-0011234",
    location: "Mysore",
    state: "Karnataka",
    msmeStatus: "Large",
    sector: "Heavy Engineering",
    products: 4,
    status: "active",
    createdAt: "2024-09-15",
  },
  {
    id: "SUP-011",
    name: "Zen Technologies",
    email: "info@zentechnologies.com",
    gst: "36AAACZ1234M1ZY",
    pan: "AAACZ1234M",
    udyam: "UDYAM-TS-11-0022345",
    location: "Hyderabad",
    state: "Telangana",
    msmeStatus: "Medium",
    sector: "Defence Electronics",
    products: 3,
    status: "active",
    createdAt: "2025-01-20",
  },
  {
    id: "SUP-012",
    name: "Data Patterns India",
    email: "sales@datapatterns.com",
    gst: "33AABCD5678N1ZZ",
    pan: "AABCD5678N",
    udyam: "UDYAM-TN-12-0033456",
    location: "Chennai",
    state: "Tamil Nadu",
    msmeStatus: "Medium",
    sector: "Defence Electronics",
    products: 5,
    status: "active",
    createdAt: "2024-12-01",
  },
  {
    id: "SUP-013",
    name: "Bharat Dynamics Ltd",
    email: "info@bdl.co.in",
    gst: "36AAACB9012O1AA",
    pan: "AAACB9012O",
    udyam: "UDYAM-TS-13-0044567",
    location: "Hyderabad",
    state: "Telangana",
    msmeStatus: "Large",
    sector: "Defence",
    products: 6,
    status: "active",
    createdAt: "2024-08-10",
  },
  {
    id: "SUP-014",
    name: "Paras Defence & Space",
    email: "info@parasdefence.com",
    gst: "27AABCP3456P1AB",
    pan: "AABCP3456P",
    udyam: "UDYAM-MH-14-0055678",
    location: "Navi Mumbai",
    state: "Maharashtra",
    msmeStatus: "Small",
    sector: "Defence Electronics",
    products: 2,
    status: "active",
    createdAt: "2025-02-05",
  },
  {
    id: "SUP-015",
    name: "Astra Microwave Products",
    email: "sales@astramwp.com",
    gst: "36AAACA7890Q1AC",
    pan: "AAACA7890Q",
    udyam: "UDYAM-TS-15-0066789",
    location: "Hyderabad",
    state: "Telangana",
    msmeStatus: "Medium",
    sector: "Telecom",
    products: 4,
    status: "inactive",
    createdAt: "2025-03-01",
  },
  {
    id: "SUP-016",
    name: "Midhani Steel Alloys",
    email: "sales@midhani.com",
    gst: "36AAACM1234R1AD",
    pan: "AAACM1234R",
    udyam: "UDYAM-TS-16-0077890",
    location: "Hyderabad",
    state: "Telangana",
    msmeStatus: "Large",
    sector: "Metallurgy",
    products: 3,
    status: "active",
    createdAt: "2024-07-15",
  },
  {
    id: "SUP-017",
    name: "Godrej Aerospace",
    email: "aerospace@godrej.com",
    gst: "27AAACG5678S1AE",
    pan: "AAACG5678S",
    udyam: "UDYAM-MH-17-0088901",
    location: "Mumbai",
    state: "Maharashtra",
    msmeStatus: "Large",
    sector: "Aerospace",
    products: 7,
    status: "active",
    createdAt: "2024-06-20",
  },
  {
    id: "SUP-018",
    name: "Precision Electronics Ltd",
    email: "info@precisionel.com",
    gst: "07AABCP9012T1AF",
    pan: "AABCP9012T",
    udyam: "UDYAM-DL-18-0099012",
    location: "New Delhi",
    state: "Delhi",
    msmeStatus: "Small",
    sector: "IT Hardware",
    products: 2,
    status: "active",
    createdAt: "2025-01-25",
  },
  {
    id: "SUP-019",
    name: "Dynamatic Technologies",
    email: "info@dynamatic.com",
    gst: "29AABD3456U1AG",
    pan: "AABD3456U",
    udyam: "UDYAM-KA-19-0000123",
    location: "Bangalore",
    state: "Karnataka",
    msmeStatus: "Medium",
    sector: "Aerospace",
    products: 3,
    status: "suspended",
    createdAt: "2024-11-01",
  },
  {
    id: "SUP-020",
    name: "SLN Technologies Pvt Ltd",
    email: "info@slntech.in",
    gst: "33AABCS7890V1AH",
    pan: "AABCS7890V",
    udyam: "UDYAM-TN-20-0001234",
    location: "Coimbatore",
    state: "Tamil Nadu",
    msmeStatus: "Micro",
    sector: "Electrical Equipment",
    products: 1,
    status: "active",
    createdAt: "2025-02-28",
  },
  {
    id: "SUP-021",
    name: "Walchandnagar Industries",
    email: "info@walchand.com",
    gst: "27AABCW1234A1AI",
    pan: "AABCW1234A",
    udyam: "UDYAM-MH-21-0012345",
    location: "Pune",
    state: "Maharashtra",
    msmeStatus: "Large",
    sector: "Heavy Engineering",
    products: 4,
    status: "active",
    createdAt: "2024-05-10",
  },
  {
    id: "SUP-022",
    name: "Centum Electronics",
    email: "info@centum.in",
    gst: "29AABCC5678B1AJ",
    pan: "AABCC5678B",
    udyam: "UDYAM-KA-22-0023456",
    location: "Bangalore",
    state: "Karnataka",
    msmeStatus: "Medium",
    sector: "Defence Electronics",
    products: 3,
    status: "active",
    createdAt: "2024-08-15",
  },
  {
    id: "SUP-023",
    name: "Alpha Design Technologies",
    email: "sales@alphadesign.in",
    gst: "29AABCA9012C1AK",
    pan: "AABCA9012C",
    udyam: "UDYAM-KA-23-0034567",
    location: "Bangalore",
    state: "Karnataka",
    msmeStatus: "Small",
    sector: "Defence Electronics",
    products: 2,
    status: "active",
    createdAt: "2025-01-05",
  },
  {
    id: "SUP-024",
    name: "Garden Reach Shipbuilders",
    email: "grse@grse.co.in",
    gst: "19AAACG3456D1AL",
    pan: "AAACG3456D",
    udyam: "UDYAM-WB-24-0045678",
    location: "Kolkata",
    state: "West Bengal",
    msmeStatus: "Large",
    sector: "Naval Engineering",
    products: 5,
    status: "active",
    createdAt: "2024-04-20",
  },
  {
    id: "SUP-025",
    name: "Mazagon Dock Shipbuilders",
    email: "info@mazagondock.in",
    gst: "27AAACM7890E1AM",
    pan: "AAACM7890E",
    udyam: "UDYAM-MH-25-0056789",
    location: "Mumbai",
    state: "Maharashtra",
    msmeStatus: "Large",
    sector: "Naval Engineering",
    products: 6,
    status: "active",
    createdAt: "2024-03-15",
  },
  {
    id: "SUP-026",
    name: "Cochin Shipyard Ltd",
    email: "info@cochinshipyard.com",
    gst: "32AABCC1234F1AN",
    pan: "AABCC1234F",
    udyam: "UDYAM-KL-26-0067890",
    location: "Kochi",
    state: "Kerala",
    msmeStatus: "Large",
    sector: "Naval Engineering",
    products: 3,
    status: "active",
    createdAt: "2024-06-10",
  },
  {
    id: "SUP-027",
    name: "Ordnance Factory Board",
    email: "ofb@gov.in",
    gst: "19AAACO5678G1AO",
    pan: "AAACO5678G",
    udyam: "UDYAM-WB-27-0078901",
    location: "Kolkata",
    state: "West Bengal",
    msmeStatus: "Large",
    sector: "Defence",
    products: 12,
    status: "active",
    createdAt: "2024-01-01",
  },
  {
    id: "SUP-028",
    name: "Nova Integrated Systems",
    email: "info@novaint.com",
    gst: "36AABCN9012H1AP",
    pan: "AABCN9012H",
    udyam: "UDYAM-TS-28-0089012",
    location: "Hyderabad",
    state: "Telangana",
    msmeStatus: "Medium",
    sector: "Defence Electronics",
    products: 3,
    status: "active",
    createdAt: "2025-01-18",
  },
  {
    id: "SUP-029",
    name: "Punj Lloyd Defence",
    email: "defence@punjlloyd.com",
    gst: "06AABCP3456I1AQ",
    pan: "AABCP3456I",
    udyam: "UDYAM-HR-29-0090123",
    location: "Gurgaon",
    state: "Haryana",
    msmeStatus: "Large",
    sector: "Defence",
    products: 2,
    status: "suspended",
    createdAt: "2024-09-20",
  },
  {
    id: "SUP-030",
    name: "Tonbo Imaging",
    email: "info@tonboimaging.com",
    gst: "29AABCT7890J1AR",
    pan: "AABCT7890J",
    udyam: "UDYAM-KA-30-0001345",
    location: "Bangalore",
    state: "Karnataka",
    msmeStatus: "Small",
    sector: "Defence Electronics",
    products: 2,
    status: "active",
    createdAt: "2025-02-15",
  },
  {
    id: "SUP-031",
    name: "Elbit Systems India",
    email: "india@elbit.com",
    gst: "36AABCE1234K1AS",
    pan: "AABCE1234K",
    udyam: "UDYAM-TS-31-0012456",
    location: "Hyderabad",
    state: "Telangana",
    msmeStatus: "Large",
    sector: "Aerospace",
    products: 4,
    status: "active",
    createdAt: "2024-07-05",
  },
  {
    id: "SUP-032",
    name: "Solar Industries India",
    email: "info@solargroup.com",
    gst: "27AABCS5678L1AT",
    pan: "AABCS5678L",
    udyam: "UDYAM-MH-32-0023567",
    location: "Nagpur",
    state: "Maharashtra",
    msmeStatus: "Large",
    sector: "Defence",
    products: 5,
    status: "active",
    createdAt: "2024-05-25",
  },
  {
    id: "SUP-033",
    name: "Yantra India Ltd",
    email: "info@yantra.co.in",
    gst: "27AABCY9012M1AU",
    pan: "AABCY9012M",
    udyam: "UDYAM-MH-33-0034678",
    location: "Nagpur",
    state: "Maharashtra",
    msmeStatus: "Large",
    sector: "Defence",
    products: 3,
    status: "active",
    createdAt: "2024-04-10",
  },
  {
    id: "SUP-034",
    name: "Bharat Forge Defence",
    email: "defence@bharatforge.com",
    gst: "27AABCB3456N1AV",
    pan: "AABCB3456N",
    udyam: "UDYAM-MH-34-0045789",
    location: "Pune",
    state: "Maharashtra",
    msmeStatus: "Large",
    sector: "Heavy Engineering",
    products: 6,
    status: "active",
    createdAt: "2024-02-28",
  },
  {
    id: "SUP-035",
    name: "Samtel Avionics",
    email: "info@samtel.com",
    gst: "06AABCS7890O1AW",
    pan: "AABCS7890O",
    udyam: "UDYAM-HR-35-0056890",
    location: "Gurgaon",
    state: "Haryana",
    msmeStatus: "Medium",
    sector: "Aerospace",
    products: 3,
    status: "active",
    createdAt: "2024-11-20",
  },
  {
    id: "SUP-036",
    name: "KELTEC Defence",
    email: "info@keltec.in",
    gst: "32AABCK1234P1AX",
    pan: "AABCK1234P",
    udyam: "UDYAM-KL-36-0067901",
    location: "Thiruvananthapuram",
    state: "Kerala",
    msmeStatus: "Small",
    sector: "Defence Electronics",
    products: 2,
    status: "active",
    createdAt: "2025-03-02",
  },
  {
    id: "SUP-037",
    name: "Mishra Dhatu Nigam",
    email: "midhani@midhani.gov.in",
    gst: "36AAACM5678Q1AY",
    pan: "AAACM5678Q",
    udyam: "UDYAM-TS-37-0078012",
    location: "Hyderabad",
    state: "Telangana",
    msmeStatus: "Large",
    sector: "Metallurgy",
    products: 5,
    status: "active",
    createdAt: "2024-03-05",
  },
  {
    id: "SUP-038",
    name: "ITI Limited",
    email: "info@itiltd.co.in",
    gst: "29AAACI9012R1AZ",
    pan: "AAACI9012R",
    udyam: "UDYAM-KA-38-0089123",
    location: "Bangalore",
    state: "Karnataka",
    msmeStatus: "Large",
    sector: "Telecom",
    products: 4,
    status: "active",
    createdAt: "2024-08-10",
  },
  {
    id: "SUP-039",
    name: "RathiSteel Defence",
    email: "defence@rathisteel.com",
    gst: "09AABCR3456S1BA",
    pan: "AABCR3456S",
    udyam: "UDYAM-UP-39-0090234",
    location: "Kanpur",
    state: "Uttar Pradesh",
    msmeStatus: "Medium",
    sector: "Heavy Engineering",
    products: 2,
    status: "inactive",
    createdAt: "2025-02-20",
  },
  {
    id: "SUP-040",
    name: "Continental Defence Solutions",
    email: "info@contdefence.com",
    gst: "07AABCC7890T1BB",
    pan: "AABCC7890T",
    udyam: "UDYAM-DL-40-0001456",
    location: "New Delhi",
    state: "Delhi",
    msmeStatus: "Small",
    sector: "IT Hardware",
    products: 3,
    status: "active",
    createdAt: "2025-01-12",
  },
  {
    id: "SUP-041",
    name: "Goa Shipyard Ltd",
    email: "info@goashipyard.co.in",
    gst: "30AABCG1234U1BC",
    pan: "AABCG1234U",
    udyam: "UDYAM-GA-41-0012567",
    location: "Vasco da Gama",
    state: "Goa",
    msmeStatus: "Large",
    sector: "Naval Engineering",
    products: 4,
    status: "active",
    createdAt: "2024-07-20",
  },
  {
    id: "SUP-042",
    name: "Rossell Techsys",
    email: "info@rosselltechsys.com",
    gst: "29AABCR5678V1BD",
    pan: "AABCR5678V",
    udyam: "UDYAM-KA-42-0023678",
    location: "Bangalore",
    state: "Karnataka",
    msmeStatus: "Small",
    sector: "Aerospace",
    products: 2,
    status: "active",
    createdAt: "2025-02-08",
  },
  {
    id: "SUP-043",
    name: "Hindustan Shipyard",
    email: "info@hsl.co.in",
    gst: "37AABCH9012W1BE",
    pan: "AABCH9012W",
    udyam: "UDYAM-AP-43-0034789",
    location: "Visakhapatnam",
    state: "Andhra Pradesh",
    msmeStatus: "Large",
    sector: "Naval Engineering",
    products: 5,
    status: "active",
    createdAt: "2024-06-15",
  },
  {
    id: "SUP-044",
    name: "BDL Bhanur Unit",
    email: "bhanur@bdl.co.in",
    gst: "36AABCB3456X1BF",
    pan: "AABCB3456X",
    udyam: "UDYAM-TS-44-0045890",
    location: "Bhanur",
    state: "Telangana",
    msmeStatus: "Large",
    sector: "Defence",
    products: 4,
    status: "active",
    createdAt: "2024-09-10",
  },
  {
    id: "SUP-045",
    name: "Wipro Infrastructure",
    email: "infra@wipro.com",
    gst: "29AABCW7890Y1BG",
    pan: "AABCW7890Y",
    udyam: "UDYAM-KA-45-0056901",
    location: "Bangalore",
    state: "Karnataka",
    msmeStatus: "Large",
    sector: "IT Hardware",
    products: 3,
    status: "active",
    createdAt: "2024-10-20",
  },
  {
    id: "SUP-046",
    name: "Tata Power SED",
    email: "sed@tatapower.com",
    gst: "27AABCT1234Z1BH",
    pan: "AABCT1234Z",
    udyam: "UDYAM-MH-46-0068012",
    location: "Mumbai",
    state: "Maharashtra",
    msmeStatus: "Large",
    sector: "Defence Electronics",
    products: 5,
    status: "active",
    createdAt: "2024-04-15",
  },
  {
    id: "SUP-047",
    name: "DCX Systems",
    email: "info@dcxsystems.com",
    gst: "29AABCD5678A2BI",
    pan: "AABCD5678A2",
    udyam: "UDYAM-KA-47-0079123",
    location: "Bangalore",
    state: "Karnataka",
    msmeStatus: "Medium",
    sector: "Defence Electronics",
    products: 3,
    status: "active",
    createdAt: "2025-01-30",
  },
  {
    id: "SUP-048",
    name: "MKU Limited",
    email: "info@maborgo.com",
    gst: "09AABCM9012B2BJ",
    pan: "AABCM9012B2",
    udyam: "UDYAM-UP-48-0080234",
    location: "Kanpur",
    state: "Uttar Pradesh",
    msmeStatus: "Medium",
    sector: "Defence",
    products: 4,
    status: "active",
    createdAt: "2024-12-10",
  },
  {
    id: "SUP-049",
    name: "Cyient DLM",
    email: "dlm@cyient.com",
    gst: "36AABCC3456C2BK",
    pan: "AABCC3456C2",
    udyam: "UDYAM-TS-49-0091345",
    location: "Hyderabad",
    state: "Telangana",
    msmeStatus: "Large",
    sector: "Defence Electronics",
    products: 3,
    status: "active",
    createdAt: "2025-02-25",
  },
  {
    id: "SUP-050",
    name: "Sasmos HET Technologies",
    email: "info@sasmos.com",
    gst: "29AABCS7890D2BL",
    pan: "AABCS7890D2",
    udyam: "UDYAM-KA-50-0002456",
    location: "Bangalore",
    state: "Karnataka",
    msmeStatus: "Small",
    sector: "Aerospace",
    products: 2,
    status: "active",
    createdAt: "2025-03-05",
  },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: "PRD-001",
    supplierId: "SUP-001",
    supplierName: "Vikram Industries Pvt Ltd",
    name: "Industrial Motor Assembly",
    category: "Electrical Equipment",
    hsnCode: "8501",
    estimatedCost: 245000,
    dvaScore: 62.8,
    classification: "Class I",
    status: "verified",
    createdAt: "2025-02-01",
  },
  {
    id: "PRD-002",
    supplierId: "SUP-002",
    supplierName: "Bharat Electronics Ltd",
    name: "Radar Processing Unit",
    category: "Defence Electronics",
    hsnCode: "8526",
    estimatedCost: 1850000,
    dvaScore: 45.2,
    classification: "Class II",
    status: "submitted",
    createdAt: "2025-02-15",
  },
  {
    id: "PRD-003",
    supplierId: "SUP-001",
    supplierName: "Vikram Industries Pvt Ltd",
    name: "Power Distribution Panel",
    category: "Electrical Equipment",
    hsnCode: "8537",
    estimatedCost: 185000,
    dvaScore: 71.5,
    classification: "Class I",
    status: "verified",
    createdAt: "2025-03-01",
  },
  {
    id: "PRD-004",
    supplierId: "SUP-003",
    supplierName: "Tata Advanced Systems",
    name: "Avionics Control System",
    category: "Aerospace",
    hsnCode: "8803",
    estimatedCost: 4500000,
    dvaScore: 38.9,
    classification: "Class II",
    status: "submitted",
    createdAt: "2025-02-20",
  },
  {
    id: "PRD-005",
    supplierId: "SUP-004",
    supplierName: "Mahindra Defence Systems",
    name: "Armoured Vehicle Turret",
    category: "Defence",
    hsnCode: "8710",
    estimatedCost: 12000000,
    dvaScore: 15.2,
    classification: "Non-Local",
    status: "draft",
    createdAt: "2025-03-05",
  },
  {
    id: "PRD-006",
    supplierId: "SUP-006",
    supplierName: "Larsen & Toubro Defence",
    name: "Artillery Fire Control System",
    category: "Defence",
    hsnCode: "9305",
    estimatedCost: 8500000,
    dvaScore: 58.4,
    classification: "Class I",
    status: "verified",
    createdAt: "2025-01-10",
  },
  {
    id: "PRD-007",
    supplierId: "SUP-007",
    supplierName: "HAL Accessories Division",
    name: "Aircraft Landing Gear Assembly",
    category: "Aerospace",
    hsnCode: "8803",
    estimatedCost: 22000000,
    dvaScore: 52.1,
    classification: "Class I",
    status: "verified",
    createdAt: "2024-12-15",
  },
  {
    id: "PRD-008",
    supplierId: "SUP-002",
    supplierName: "Bharat Electronics Ltd",
    name: "Electronic Warfare Suite",
    category: "Defence Electronics",
    hsnCode: "8526",
    estimatedCost: 35000000,
    dvaScore: 67.3,
    classification: "Class I",
    status: "verified",
    createdAt: "2025-01-20",
  },
  {
    id: "PRD-009",
    supplierId: "SUP-008",
    supplierName: "Kalyani Group Defence",
    name: "155mm Howitzer Barrel",
    category: "Defence",
    hsnCode: "9301",
    estimatedCost: 5200000,
    dvaScore: 78.6,
    classification: "Class I",
    status: "verified",
    createdAt: "2025-02-05",
  },
  {
    id: "PRD-010",
    supplierId: "SUP-010",
    supplierName: "BEML Limited",
    name: "Metro Rail Bogie",
    category: "Heavy Engineering",
    hsnCode: "8607",
    estimatedCost: 15000000,
    dvaScore: 61.4,
    classification: "Class I",
    status: "submitted",
    createdAt: "2025-01-25",
  },
  {
    id: "PRD-011",
    supplierId: "SUP-011",
    supplierName: "Zen Technologies",
    name: "Combat Simulator System",
    category: "Defence Electronics",
    hsnCode: "9504",
    estimatedCost: 9500000,
    dvaScore: 55.8,
    classification: "Class I",
    status: "verified",
    createdAt: "2025-02-10",
  },
  {
    id: "PRD-012",
    supplierId: "SUP-012",
    supplierName: "Data Patterns India",
    name: "Satellite Communication Module",
    category: "Defence Electronics",
    hsnCode: "8525",
    estimatedCost: 7800000,
    dvaScore: 42.3,
    classification: "Class II",
    status: "submitted",
    createdAt: "2025-01-15",
  },
  {
    id: "PRD-013",
    supplierId: "SUP-013",
    supplierName: "Bharat Dynamics Ltd",
    name: "Anti-Tank Guided Missile",
    category: "Defence",
    hsnCode: "9306",
    estimatedCost: 45000000,
    dvaScore: 72.8,
    classification: "Class I",
    status: "verified",
    createdAt: "2024-11-20",
  },
  {
    id: "PRD-014",
    supplierId: "SUP-009",
    supplierName: "Adani Defence & Aerospace",
    name: "UAV Airframe",
    category: "Aerospace",
    hsnCode: "8802",
    estimatedCost: 18000000,
    dvaScore: 35.6,
    classification: "Class II",
    status: "submitted",
    createdAt: "2025-03-01",
  },
  {
    id: "PRD-015",
    supplierId: "SUP-014",
    supplierName: "Paras Defence & Space",
    name: "Optronic Periscope",
    category: "Defence Electronics",
    hsnCode: "9013",
    estimatedCost: 3200000,
    dvaScore: 48.9,
    classification: "Class II",
    status: "verified",
    createdAt: "2025-02-25",
  },
  {
    id: "PRD-016",
    supplierId: "SUP-015",
    supplierName: "Astra Microwave Products",
    name: "TR Module for Radar",
    category: "Telecom",
    hsnCode: "8525",
    estimatedCost: 12500000,
    dvaScore: 54.2,
    classification: "Class I",
    status: "draft",
    createdAt: "2025-03-03",
  },
  {
    id: "PRD-017",
    supplierId: "SUP-016",
    supplierName: "Midhani Steel Alloys",
    name: "Superalloy Turbine Blade",
    category: "Metallurgy",
    hsnCode: "7218",
    estimatedCost: 890000,
    dvaScore: 85.3,
    classification: "Class I",
    status: "verified",
    createdAt: "2024-09-10",
  },
  {
    id: "PRD-018",
    supplierId: "SUP-017",
    supplierName: "Godrej Aerospace",
    name: "Rocket Motor Casing",
    category: "Aerospace",
    hsnCode: "8803",
    estimatedCost: 28000000,
    dvaScore: 69.1,
    classification: "Class I",
    status: "verified",
    createdAt: "2024-08-20",
  },
  {
    id: "PRD-019",
    supplierId: "SUP-018",
    supplierName: "Precision Electronics Ltd",
    name: "Tactical Data Link Terminal",
    category: "IT Hardware",
    hsnCode: "8517",
    estimatedCost: 2400000,
    dvaScore: 31.7,
    classification: "Class II",
    status: "submitted",
    createdAt: "2025-02-18",
  },
  {
    id: "PRD-020",
    supplierId: "SUP-005",
    supplierName: "Reliance Naval Engineering",
    name: "Naval Vessel Propulsion Unit",
    category: "Naval Engineering",
    hsnCode: "8408",
    estimatedCost: 65000000,
    dvaScore: 44.8,
    classification: "Class II",
    status: "submitted",
    createdAt: "2025-01-05",
  },
  {
    id: "PRD-021",
    supplierId: "SUP-007",
    supplierName: "HAL Accessories Division",
    name: "Helicopter Rotor Hub",
    category: "Aerospace",
    hsnCode: "8803",
    estimatedCost: 16500000,
    dvaScore: 56.2,
    classification: "Class I",
    status: "verified",
    createdAt: "2025-02-12",
  },
  {
    id: "PRD-022",
    supplierId: "SUP-020",
    supplierName: "SLN Technologies Pvt Ltd",
    name: "Industrial Motor Controller",
    category: "Electrical Equipment",
    hsnCode: "8504",
    estimatedCost: 95000,
    dvaScore: 73.4,
    classification: "Class I",
    status: "verified",
    createdAt: "2025-03-04",
  },
  {
    id: "PRD-023",
    supplierId: "SUP-006",
    supplierName: "Larsen & Toubro Defence",
    name: "Submarine Hull Section",
    category: "Defence",
    hsnCode: "8906",
    estimatedCost: 120000000,
    dvaScore: 51.2,
    classification: "Class I",
    status: "submitted",
    createdAt: "2025-01-30",
  },
  {
    id: "PRD-024",
    supplierId: "SUP-012",
    supplierName: "Data Patterns India",
    name: "AESA Radar Module",
    category: "Defence Electronics",
    hsnCode: "8526",
    estimatedCost: 19500000,
    dvaScore: 47.5,
    classification: "Class II",
    status: "verified",
    createdAt: "2025-02-22",
  },
  {
    id: "PRD-025",
    supplierId: "SUP-013",
    supplierName: "Bharat Dynamics Ltd",
    name: "Surface-to-Air Missile Seeker",
    category: "Defence",
    hsnCode: "9306",
    estimatedCost: 32000000,
    dvaScore: 63.9,
    classification: "Class I",
    status: "verified",
    createdAt: "2024-10-15",
  },
  {
    id: "PRD-026",
    supplierId: "SUP-021",
    supplierName: "Walchandnagar Industries",
    name: "Cryogenic Engine Component",
    category: "Heavy Engineering",
    hsnCode: "8412",
    estimatedCost: 45000000,
    dvaScore: 68.2,
    classification: "Class I",
    status: "verified",
    createdAt: "2024-06-20",
  },
  {
    id: "PRD-027",
    supplierId: "SUP-022",
    supplierName: "Centum Electronics",
    name: "Airborne Signal Processor",
    category: "Defence Electronics",
    hsnCode: "8543",
    estimatedCost: 8200000,
    dvaScore: 52.7,
    classification: "Class I",
    status: "verified",
    createdAt: "2024-09-10",
  },
  {
    id: "PRD-028",
    supplierId: "SUP-024",
    supplierName: "Garden Reach Shipbuilders",
    name: "Corvette Weapon Control",
    category: "Naval Engineering",
    hsnCode: "8906",
    estimatedCost: 85000000,
    dvaScore: 57.3,
    classification: "Class I",
    status: "submitted",
    createdAt: "2024-05-15",
  },
  {
    id: "PRD-029",
    supplierId: "SUP-025",
    supplierName: "Mazagon Dock Shipbuilders",
    name: "Submarine Sonar Array",
    category: "Naval Engineering",
    hsnCode: "9014",
    estimatedCost: 55000000,
    dvaScore: 41.8,
    classification: "Class II",
    status: "submitted",
    createdAt: "2024-04-10",
  },
  {
    id: "PRD-030",
    supplierId: "SUP-027",
    supplierName: "Ordnance Factory Board",
    name: "5.56mm Assault Rifle",
    category: "Defence",
    hsnCode: "9301",
    estimatedCost: 75000,
    dvaScore: 92.1,
    classification: "Class I",
    status: "verified",
    createdAt: "2024-02-01",
  },
  {
    id: "PRD-031",
    supplierId: "SUP-028",
    supplierName: "Nova Integrated Systems",
    name: "Battlefield Management System",
    category: "Defence Electronics",
    hsnCode: "8471",
    estimatedCost: 12000000,
    dvaScore: 49.8,
    classification: "Class II",
    status: "verified",
    createdAt: "2025-02-01",
  },
  {
    id: "PRD-032",
    supplierId: "SUP-030",
    supplierName: "Tonbo Imaging",
    name: "Thermal Weapon Sight",
    category: "Defence Electronics",
    hsnCode: "9013",
    estimatedCost: 4500000,
    dvaScore: 55.4,
    classification: "Class I",
    status: "verified",
    createdAt: "2025-03-01",
  },
  {
    id: "PRD-033",
    supplierId: "SUP-031",
    supplierName: "Elbit Systems India",
    name: "Helicopter EW Suite",
    category: "Aerospace",
    hsnCode: "8526",
    estimatedCost: 28000000,
    dvaScore: 33.2,
    classification: "Class II",
    status: "submitted",
    createdAt: "2024-08-05",
  },
  {
    id: "PRD-034",
    supplierId: "SUP-032",
    supplierName: "Solar Industries India",
    name: "Multi-Mode Grenade",
    category: "Defence",
    hsnCode: "9306",
    estimatedCost: 3500,
    dvaScore: 88.5,
    classification: "Class I",
    status: "verified",
    createdAt: "2024-06-25",
  },
  {
    id: "PRD-035",
    supplierId: "SUP-034",
    supplierName: "Bharat Forge Defence",
    name: "Artillery Gun Barrel",
    category: "Heavy Engineering",
    hsnCode: "9301",
    estimatedCost: 8500000,
    dvaScore: 76.9,
    classification: "Class I",
    status: "verified",
    createdAt: "2024-03-20",
  },
  {
    id: "PRD-036",
    supplierId: "SUP-035",
    supplierName: "Samtel Avionics",
    name: "Heads-Up Display Unit",
    category: "Aerospace",
    hsnCode: "9013",
    estimatedCost: 15000000,
    dvaScore: 44.1,
    classification: "Class II",
    status: "submitted",
    createdAt: "2024-12-05",
  },
  {
    id: "PRD-037",
    supplierId: "SUP-037",
    supplierName: "Mishra Dhatu Nigam",
    name: "Titanium Alloy Plate",
    category: "Metallurgy",
    hsnCode: "8108",
    estimatedCost: 1200000,
    dvaScore: 91.3,
    classification: "Class I",
    status: "verified",
    createdAt: "2024-04-15",
  },
  {
    id: "PRD-038",
    supplierId: "SUP-038",
    supplierName: "ITI Limited",
    name: "Military Radio Set",
    category: "Telecom",
    hsnCode: "8525",
    estimatedCost: 650000,
    dvaScore: 58.7,
    classification: "Class I",
    status: "verified",
    createdAt: "2024-09-20",
  },
  {
    id: "PRD-039",
    supplierId: "SUP-040",
    supplierName: "Continental Defence Solutions",
    name: "Ruggedized Server Unit",
    category: "IT Hardware",
    hsnCode: "8471",
    estimatedCost: 3200000,
    dvaScore: 28.4,
    classification: "Class II",
    status: "submitted",
    createdAt: "2025-02-10",
  },
  {
    id: "PRD-040",
    supplierId: "SUP-041",
    supplierName: "Goa Shipyard Ltd",
    name: "Patrol Vessel Hull",
    category: "Naval Engineering",
    hsnCode: "8906",
    estimatedCost: 95000000,
    dvaScore: 62.5,
    classification: "Class I",
    status: "verified",
    createdAt: "2024-08-30",
  },
  {
    id: "PRD-041",
    supplierId: "SUP-043",
    supplierName: "Hindustan Shipyard",
    name: "Fleet Tanker Section",
    category: "Naval Engineering",
    hsnCode: "8906",
    estimatedCost: 150000000,
    dvaScore: 54.8,
    classification: "Class I",
    status: "submitted",
    createdAt: "2024-07-10",
  },
  {
    id: "PRD-042",
    supplierId: "SUP-044",
    supplierName: "BDL Bhanur Unit",
    name: "Konkurs-M Missile Assembly",
    category: "Defence",
    hsnCode: "9306",
    estimatedCost: 22000000,
    dvaScore: 71.2,
    classification: "Class I",
    status: "verified",
    createdAt: "2024-10-05",
  },
  {
    id: "PRD-043",
    supplierId: "SUP-046",
    supplierName: "Tata Power SED",
    name: "Pinaka Rocket Launcher Electronics",
    category: "Defence Electronics",
    hsnCode: "9306",
    estimatedCost: 18000000,
    dvaScore: 59.6,
    classification: "Class I",
    status: "verified",
    createdAt: "2024-05-10",
  },
  {
    id: "PRD-044",
    supplierId: "SUP-047",
    supplierName: "DCX Systems",
    name: "Radar Power Supply Module",
    category: "Defence Electronics",
    hsnCode: "8504",
    estimatedCost: 4800000,
    dvaScore: 46.3,
    classification: "Class II",
    status: "submitted",
    createdAt: "2025-02-18",
  },
  {
    id: "PRD-045",
    supplierId: "SUP-048",
    supplierName: "MKU Limited",
    name: "Ballistic Helmet Level IIIA",
    category: "Defence",
    hsnCode: "6506",
    estimatedCost: 28000,
    dvaScore: 82.1,
    classification: "Class I",
    status: "verified",
    createdAt: "2025-01-08",
  },
  {
    id: "PRD-046",
    supplierId: "SUP-049",
    supplierName: "Cyient DLM",
    name: "Avionics LRU Board",
    category: "Defence Electronics",
    hsnCode: "8543",
    estimatedCost: 6500000,
    dvaScore: 50.2,
    classification: "Class I",
    status: "verified",
    createdAt: "2025-03-02",
  },
  {
    id: "PRD-047",
    supplierId: "SUP-050",
    supplierName: "Sasmos HET Technologies",
    name: "Aircraft Wiring Harness",
    category: "Aerospace",
    hsnCode: "8544",
    estimatedCost: 2100000,
    dvaScore: 67.8,
    classification: "Class I",
    status: "verified",
    createdAt: "2025-03-06",
  },
  {
    id: "PRD-048",
    supplierId: "SUP-026",
    supplierName: "Cochin Shipyard Ltd",
    name: "Aircraft Carrier Block Section",
    category: "Naval Engineering",
    hsnCode: "8906",
    estimatedCost: 250000000,
    dvaScore: 48.5,
    classification: "Class II",
    status: "submitted",
    createdAt: "2024-07-25",
  },
  {
    id: "PRD-049",
    supplierId: "SUP-033",
    supplierName: "Yantra India Ltd",
    name: "T-90 Tank Track Assembly",
    category: "Defence",
    hsnCode: "8710",
    estimatedCost: 5500000,
    dvaScore: 74.3,
    classification: "Class I",
    status: "verified",
    createdAt: "2024-05-20",
  },
  {
    id: "PRD-050",
    supplierId: "SUP-023",
    supplierName: "Alpha Design Technologies",
    name: "Border Surveillance Radar",
    category: "Defence Electronics",
    hsnCode: "8526",
    estimatedCost: 11000000,
    dvaScore: 53.1,
    classification: "Class I",
    status: "verified",
    createdAt: "2025-01-22",
  },
];

const MOCK_BOM: BOMComponent[] = [
  {
    id: "BOM-001",
    productId: "PRD-001",
    name: "Copper Winding Coil",
    origin: "domestic",
    cost: 45000,
    supplierName: "Hindalco Copper",
  },
  {
    id: "BOM-002",
    productId: "PRD-001",
    name: "Steel Housing",
    origin: "domestic",
    cost: 32000,
    supplierName: "Tata Steel",
  },
  {
    id: "BOM-003",
    productId: "PRD-001",
    name: "Bearing Assembly",
    origin: "imported",
    cost: 28000,
    supplierName: "SKF Sweden",
  },
  {
    id: "BOM-004",
    productId: "PRD-001",
    name: "Control Circuit Board",
    origin: "imported",
    cost: 55000,
    supplierName: "Siemens AG",
  },
  {
    id: "BOM-005",
    productId: "PRD-001",
    name: "Shaft Assembly",
    origin: "domestic",
    cost: 38000,
    supplierName: "Bharat Forge",
  },
  {
    id: "BOM-006",
    productId: "PRD-001",
    name: "Insulation Material",
    origin: "domestic",
    cost: 12000,
    supplierName: "Supreme Industries",
  },
  {
    id: "BOM-007",
    productId: "PRD-001",
    name: "Connector Set",
    origin: "imported",
    cost: 8000,
    supplierName: "TE Connectivity",
  },
  {
    id: "BOM-008",
    productId: "PRD-001",
    name: "Assembly Labour",
    origin: "domestic",
    cost: 27000,
    supplierName: "In-house",
  },
  {
    id: "BOM-009",
    productId: "PRD-002",
    name: "FPGA Processing Board",
    origin: "imported",
    cost: 450000,
    supplierName: "Xilinx USA",
  },
  {
    id: "BOM-010",
    productId: "PRD-002",
    name: "RF Receiver Module",
    origin: "domestic",
    cost: 280000,
    supplierName: "BEL Bangalore",
  },
  {
    id: "BOM-011",
    productId: "PRD-002",
    name: "Signal Processor ASIC",
    origin: "imported",
    cost: 380000,
    supplierName: "Texas Instruments",
  },
  {
    id: "BOM-012",
    productId: "PRD-002",
    name: "Antenna Array",
    origin: "domestic",
    cost: 220000,
    supplierName: "Astra Microwave",
  },
  {
    id: "BOM-013",
    productId: "PRD-002",
    name: "Power Supply Unit",
    origin: "domestic",
    cost: 145000,
    supplierName: "Delta India",
  },
  {
    id: "BOM-014",
    productId: "PRD-002",
    name: "Ruggedized Chassis",
    origin: "domestic",
    cost: 175000,
    supplierName: "ECIL",
  },
  {
    id: "BOM-015",
    productId: "PRD-002",
    name: "Cooling System",
    origin: "imported",
    cost: 120000,
    supplierName: "Parker Hannifin",
  },
  {
    id: "BOM-016",
    productId: "PRD-002",
    name: "Integration & Testing",
    origin: "domestic",
    cost: 80000,
    supplierName: "In-house",
  },
  {
    id: "BOM-017",
    productId: "PRD-003",
    name: "Copper Bus Bars",
    origin: "domestic",
    cost: 35000,
    supplierName: "Hindalco",
  },
  {
    id: "BOM-018",
    productId: "PRD-003",
    name: "Circuit Breakers",
    origin: "domestic",
    cost: 42000,
    supplierName: "Siemens India",
  },
  {
    id: "BOM-019",
    productId: "PRD-003",
    name: "Control Panel PCB",
    origin: "imported",
    cost: 18000,
    supplierName: "Omron Japan",
  },
  {
    id: "BOM-020",
    productId: "PRD-003",
    name: "Steel Enclosure",
    origin: "domestic",
    cost: 55000,
    supplierName: "Tata Steel",
  },
  {
    id: "BOM-021",
    productId: "PRD-003",
    name: "Wiring Harness",
    origin: "domestic",
    cost: 15000,
    supplierName: "Motherson Sumi",
  },
  {
    id: "BOM-022",
    productId: "PRD-003",
    name: "Meters & Displays",
    origin: "imported",
    cost: 20000,
    supplierName: "Yokogawa Japan",
  },
];

const INITIAL_ALERTS: RiskAlert[] = [
  {
    id: "ALT-001",
    productId: "PRD-005",
    productName: "Armoured Vehicle Turret",
    supplierName: "Mahindra Defence Systems",
    alertType: "Low DVA Score",
    severity: "high",
    description: "DVA score 15.2% falls below Class II threshold of 20%",
    ruleId: "FR-01",
    createdAt: "2025-03-06",
    resolved: false,
  },
  {
    id: "ALT-002",
    productId: "PRD-004",
    productName: "Avionics Control System",
    supplierName: "Tata Advanced Systems",
    alertType: "Cost Anomaly",
    severity: "medium",
    description: "Imported component cost exceeds 60% of total BOM value",
    ruleId: "FR-04",
    createdAt: "2025-03-05",
    resolved: false,
  },
  {
    id: "ALT-003",
    productId: "PRD-002",
    productName: "Radar Processing Unit",
    supplierName: "Bharat Electronics Ltd",
    alertType: "BOM Modification",
    severity: "low",
    description: "BOM modified after initial submission timestamp",
    ruleId: "FR-02",
    createdAt: "2025-03-03",
    resolved: true,
  },
  {
    id: "ALT-004",
    productId: "PRD-001",
    productName: "Industrial Motor Assembly",
    supplierName: "Vikram Industries Pvt Ltd",
    alertType: "Origin Mismatch",
    severity: "medium",
    description: "Component origin inconsistent with customs import records",
    ruleId: "FR-03",
    createdAt: "2025-02-25",
    resolved: true,
  },
  {
    id: "ALT-005",
    productId: "PRD-014",
    productName: "UAV Airframe",
    supplierName: "Adani Defence & Aerospace",
    alertType: "DVA Jump Detection",
    severity: "high",
    description: "DVA changed by >15% between consecutive declarations",
    ruleId: "FR-01",
    createdAt: "2025-03-04",
    resolved: false,
  },
  {
    id: "ALT-006",
    productId: "PRD-019",
    productName: "Tactical Data Link Terminal",
    supplierName: "Precision Electronics Ltd",
    alertType: "Circular Supply",
    severity: "medium",
    description: "3+ components sourced from same entity network",
    ruleId: "FR-05",
    createdAt: "2025-03-02",
    resolved: false,
  },
  {
    id: "ALT-007",
    productId: "PRD-020",
    productName: "Naval Vessel Propulsion Unit",
    supplierName: "Reliance Naval Engineering",
    alertType: "Missing Cost Data",
    severity: "low",
    description: "2 components have zero or missing cost declarations",
    ruleId: "FR-06",
    createdAt: "2025-03-01",
    resolved: false,
  },
  {
    id: "ALT-008",
    productId: "PRD-012",
    productName: "Satellite Communication Module",
    supplierName: "Data Patterns India",
    alertType: "Post-Bid BOM Change",
    severity: "high",
    description: "BOM was modified after bid submission deadline",
    ruleId: "FR-02",
    createdAt: "2025-02-28",
    resolved: true,
  },
  {
    id: "ALT-009",
    productId: "PRD-016",
    productName: "TR Module for Radar",
    supplierName: "Astra Microwave Products",
    alertType: "Import Mismatch",
    severity: "high",
    description:
      "Component claimed as domestic but ICEGATE shows import record",
    ruleId: "FR-03",
    createdAt: "2025-03-05",
    resolved: false,
  },
  {
    id: "ALT-010",
    productId: "PRD-023",
    productName: "Submarine Hull Section",
    supplierName: "Larsen & Toubro Defence",
    alertType: "Cost Anomaly",
    severity: "medium",
    description: "Component cost 40% below market rate benchmark",
    ruleId: "FR-04",
    createdAt: "2025-02-20",
    resolved: true,
  },
];

const makeHash = () =>
  `0x${Array.from({ length: 12 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}...${Array.from({ length: 6 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

const INITIAL_VERIFICATION_LOGS: VerificationLog[] = [
  {
    id: "VL-001",
    productId: "PRD-001",
    productName: "Industrial Motor Assembly",
    supplierName: "Vikram Industries",
    requestedBy: "GeM Portal",
    status: "verified",
    dvaScore: 62.8,
    confidenceScore: 0.87,
    classification: "Class I",
    riskScore: 0.08,
    blockchainTxHash: makeHash(),
    timestamp: "2025-03-06T10:30:00Z",
  },
  {
    id: "VL-002",
    productId: "PRD-002",
    productName: "Radar Processing Unit",
    supplierName: "Bharat Electronics",
    requestedBy: "Defence Procurement",
    status: "verified",
    dvaScore: 45.2,
    confidenceScore: 0.72,
    classification: "Class II",
    riskScore: 0.22,
    blockchainTxHash: makeHash(),
    timestamp: "2025-03-06T09:15:00Z",
  },
  {
    id: "VL-003",
    productId: "PRD-004",
    productName: "Avionics Control System",
    supplierName: "Tata Advanced Systems",
    requestedBy: "HAL Procurement",
    status: "pending",
    dvaScore: 38.9,
    confidenceScore: 0.58,
    classification: "Class II",
    riskScore: 0.35,
    blockchainTxHash: makeHash(),
    timestamp: "2025-03-05T16:45:00Z",
  },
  {
    id: "VL-004",
    productId: "PRD-005",
    productName: "Armoured Vehicle Turret",
    supplierName: "Mahindra Defence",
    requestedBy: "Army Ordnance",
    status: "failed",
    dvaScore: 15.2,
    confidenceScore: 0.32,
    classification: "Non-Local",
    riskScore: 0.72,
    blockchainTxHash: makeHash(),
    timestamp: "2025-03-05T14:00:00Z",
  },
  {
    id: "VL-005",
    productId: "PRD-006",
    productName: "Artillery Fire Control System",
    supplierName: "L&T Defence",
    requestedBy: "Army Ordnance",
    status: "verified",
    dvaScore: 58.4,
    confidenceScore: 0.81,
    classification: "Class I",
    riskScore: 0.12,
    blockchainTxHash: makeHash(),
    timestamp: "2025-03-04T11:20:00Z",
  },
  {
    id: "VL-006",
    productId: "PRD-008",
    productName: "Electronic Warfare Suite",
    supplierName: "Bharat Electronics",
    requestedBy: "Indian Navy",
    status: "verified",
    dvaScore: 67.3,
    confidenceScore: 0.89,
    classification: "Class I",
    riskScore: 0.06,
    blockchainTxHash: makeHash(),
    timestamp: "2025-03-03T15:30:00Z",
  },
  {
    id: "VL-007",
    productId: "PRD-013",
    productName: "Anti-Tank Guided Missile",
    supplierName: "Bharat Dynamics",
    requestedBy: "Army Ordnance",
    status: "verified",
    dvaScore: 72.8,
    confidenceScore: 0.92,
    classification: "Class I",
    riskScore: 0.04,
    blockchainTxHash: makeHash(),
    timestamp: "2025-03-02T09:45:00Z",
  },
  {
    id: "VL-008",
    productId: "PRD-017",
    productName: "Superalloy Turbine Blade",
    supplierName: "Midhani",
    requestedBy: "DRDO",
    status: "verified",
    dvaScore: 85.3,
    confidenceScore: 0.95,
    classification: "Class I",
    riskScore: 0.02,
    blockchainTxHash: makeHash(),
    timestamp: "2025-03-01T13:00:00Z",
  },
  {
    id: "VL-009",
    productId: "PRD-020",
    productName: "Naval Vessel Propulsion Unit",
    supplierName: "Reliance Naval",
    requestedBy: "Indian Navy",
    status: "pending",
    dvaScore: 44.8,
    confidenceScore: 0.55,
    classification: "Class II",
    riskScore: 0.38,
    blockchainTxHash: makeHash(),
    timestamp: "2025-02-28T10:15:00Z",
  },
  {
    id: "VL-010",
    productId: "PRD-014",
    productName: "UAV Airframe",
    supplierName: "Adani Defence",
    requestedBy: "Indian Air Force",
    status: "pending",
    dvaScore: 35.6,
    confidenceScore: 0.48,
    classification: "Class II",
    riskScore: 0.42,
    blockchainTxHash: makeHash(),
    timestamp: "2025-02-27T16:30:00Z",
  },
];

const INITIAL_COMPLIANCE: ComplianceRecord[] = MOCK_PRODUCTS.filter(
  (p) => p.dvaScore != null,
).map((p, i) => ({
  id: `CR-${String(i + 1).padStart(3, "0")}`,
  productId: p.id,
  productName: p.name,
  supplierName: p.supplierName,
  category: p.category,
  dvaScore: p.dvaScore!,
  classification: (p.classification || "Non-Local") as
    | "Class I"
    | "Class II"
    | "Non-Local",
  confidenceScore: 0.3 + Math.random() * 0.65,
  riskScore:
    p.dvaScore! >= 50
      ? 0.02 + Math.random() * 0.15
      : p.dvaScore! >= 20
        ? 0.15 + Math.random() * 0.25
        : 0.5 + Math.random() * 0.3,
  status: (p.dvaScore! >= 50
    ? "compliant"
    : p.dvaScore! >= 20
      ? "under-review"
      : "non-compliant") as "compliant" | "non-compliant" | "under-review",
  verifiedAt: p.createdAt,
  blockchainTxHash: makeHash(),
}));

const MOCK_USERS: PlatformUser[] = [
  {
    id: "USR-001",
    name: "Rajesh Kumar",
    email: "admin@nmicov.gov.in",
    role: "superadmin",
    organization: "DPIIT",
    department: "Public Procurement Division",
    lastLogin: "2025-03-06T10:00:00Z",
    status: "active",
    createdAt: "2024-06-01",
  },
  {
    id: "USR-002",
    name: "Anita Sharma",
    email: "procurement@nmicov.gov.in",
    role: "procurement",
    organization: "GeM",
    department: "Verification Cell",
    lastLogin: "2025-03-06T09:30:00Z",
    status: "active",
    createdAt: "2024-07-15",
  },
  {
    id: "USR-003",
    name: "Vikram Industries",
    email: "supplier@vikram.co.in",
    role: "supplier",
    organization: "Vikram Industries Pvt Ltd",
    department: "Compliance",
    lastLogin: "2025-03-05T14:00:00Z",
    status: "active",
    createdAt: "2025-01-15",
  },
  {
    id: "USR-004",
    name: "Priya Patel",
    email: "priya@gem.gov.in",
    role: "procurement",
    organization: "GeM",
    department: "Technical Evaluation",
    lastLogin: "2025-03-06T08:15:00Z",
    status: "active",
    createdAt: "2024-08-20",
  },
  {
    id: "USR-005",
    name: "Amit Deshmukh",
    email: "amit@cag.gov.in",
    role: "auditor",
    organization: "CAG",
    department: "Procurement Audit",
    lastLogin: "2025-03-04T11:30:00Z",
    status: "active",
    createdAt: "2024-09-01",
  },
  {
    id: "USR-006",
    name: "Suresh Nair",
    email: "suresh@mod.gov.in",
    role: "procurement",
    organization: "Ministry of Defence",
    department: "Defence Procurement",
    lastLogin: "2025-03-05T16:45:00Z",
    status: "active",
    createdAt: "2024-10-10",
  },
  {
    id: "USR-007",
    name: "Meera Krishnan",
    email: "meera@dpiit.gov.in",
    role: "admin",
    organization: "DPIIT",
    department: "Policy Division",
    lastLogin: "2025-03-06T07:00:00Z",
    status: "active",
    createdAt: "2024-06-15",
  },
  {
    id: "USR-008",
    name: "Bharat Electronics Ltd",
    email: "compliance@bel.co.in",
    role: "supplier",
    organization: "Bharat Electronics Ltd",
    department: "Compliance & Legal",
    lastLogin: "2025-03-06T10:20:00Z",
    status: "active",
    createdAt: "2025-02-10",
  },
  {
    id: "USR-009",
    name: "Tata Advanced Systems",
    email: "compliance@tata-ad.com",
    role: "supplier",
    organization: "Tata Advanced Systems",
    department: "Government Affairs",
    lastLogin: "2025-03-05T12:00:00Z",
    status: "active",
    createdAt: "2025-01-28",
  },
  {
    id: "USR-010",
    name: "Ravi Shankar",
    email: "ravi@gem.gov.in",
    role: "procurement",
    organization: "GeM",
    department: "Fraud Investigation",
    lastLogin: "2025-03-03T09:00:00Z",
    status: "inactive",
    createdAt: "2024-11-01",
  },
  {
    id: "USR-011",
    name: "Deepa Menon",
    email: "deepa@cag.gov.in",
    role: "auditor",
    organization: "CAG",
    department: "Performance Audit",
    lastLogin: "2025-02-28T14:30:00Z",
    status: "active",
    createdAt: "2024-12-05",
  },
  {
    id: "USR-012",
    name: "Larsen & Toubro Defence",
    email: "compliance@ltdefence.com",
    role: "supplier",
    organization: "Larsen & Toubro Defence",
    department: "Compliance",
    lastLogin: "2025-03-04T15:00:00Z",
    status: "active",
    createdAt: "2024-11-15",
  },
  {
    id: "USR-013",
    name: "Neha Gupta",
    email: "neha@dpiit.gov.in",
    role: "admin",
    organization: "DPIIT",
    department: "Digital Systems",
    lastLogin: "2025-03-06T11:00:00Z",
    status: "active",
    createdAt: "2024-07-01",
  },
  {
    id: "USR-014",
    name: "Arjun Reddy",
    email: "arjun@mod.gov.in",
    role: "procurement",
    organization: "Ministry of Defence",
    department: "Naval Procurement",
    lastLogin: "2025-03-05T10:30:00Z",
    status: "active",
    createdAt: "2024-08-15",
  },
  {
    id: "USR-015",
    name: "Garden Reach Shipbuilders",
    email: "compliance@grse.co.in",
    role: "supplier",
    organization: "Garden Reach Shipbuilders",
    department: "Compliance",
    lastLogin: "2025-03-03T09:45:00Z",
    status: "active",
    createdAt: "2024-04-20",
  },
  {
    id: "USR-016",
    name: "Kavita Joshi",
    email: "kavita@cag.gov.in",
    role: "auditor",
    organization: "CAG",
    department: "Defence Audit",
    lastLogin: "2025-03-06T08:00:00Z",
    status: "active",
    createdAt: "2024-10-01",
  },
  {
    id: "USR-017",
    name: "Mazagon Dock Shipbuilders",
    email: "compliance@mdsl.co.in",
    role: "supplier",
    organization: "Mazagon Dock Shipbuilders",
    department: "Govt Affairs",
    lastLogin: "2025-03-04T14:20:00Z",
    status: "active",
    createdAt: "2024-03-15",
  },
  {
    id: "USR-018",
    name: "Sanjay Verma",
    email: "sanjay@gem.gov.in",
    role: "procurement",
    organization: "GeM",
    department: "Supplier Onboarding",
    lastLogin: "2025-03-06T09:00:00Z",
    status: "active",
    createdAt: "2024-09-15",
  },
  {
    id: "USR-019",
    name: "Pooja Rao",
    email: "pooja@dpiit.gov.in",
    role: "admin",
    organization: "DPIIT",
    department: "Compliance Policy",
    lastLogin: "2025-03-05T16:00:00Z",
    status: "active",
    createdAt: "2024-06-20",
  },
  {
    id: "USR-020",
    name: "Solar Industries India",
    email: "compliance@solargroup.com",
    role: "supplier",
    organization: "Solar Industries India",
    department: "Defence Compliance",
    lastLogin: "2025-03-02T11:30:00Z",
    status: "active",
    createdAt: "2024-05-25",
  },
  {
    id: "USR-021",
    name: "Rahul Mehta",
    email: "rahul@cag.gov.in",
    role: "auditor",
    organization: "CAG",
    department: "IT Audit",
    lastLogin: "2025-02-25T10:00:00Z",
    status: "inactive",
    createdAt: "2024-11-10",
  },
  {
    id: "USR-022",
    name: "DCX Systems",
    email: "compliance@dcxsystems.com",
    role: "supplier",
    organization: "DCX Systems",
    department: "Quality Assurance",
    lastLogin: "2025-03-05T13:00:00Z",
    status: "active",
    createdAt: "2025-01-30",
  },
  {
    id: "USR-023",
    name: "Manish Tiwari",
    email: "manish@mod.gov.in",
    role: "procurement",
    organization: "Ministry of Defence",
    department: "Air Force Procurement",
    lastLogin: "2025-03-06T07:45:00Z",
    status: "active",
    createdAt: "2024-12-01",
  },
  {
    id: "USR-024",
    name: "Bharat Forge Defence",
    email: "compliance@bharatforge.com",
    role: "supplier",
    organization: "Bharat Forge Defence",
    department: "Defence Division",
    lastLogin: "2025-03-04T12:15:00Z",
    status: "active",
    createdAt: "2024-02-28",
  },
  {
    id: "USR-025",
    name: "Lakshmi Iyer",
    email: "lakshmi@gem.gov.in",
    role: "procurement",
    organization: "GeM",
    department: "Price Intelligence",
    lastLogin: "2025-03-06T10:45:00Z",
    status: "active",
    createdAt: "2025-01-05",
  },
  {
    id: "USR-026",
    name: "Cochin Shipyard Ltd",
    email: "compliance@cochinshipyard.com",
    role: "supplier",
    organization: "Cochin Shipyard Ltd",
    department: "Compliance",
    lastLogin: "2025-03-01T14:00:00Z",
    status: "active",
    createdAt: "2024-06-10",
  },
  {
    id: "USR-027",
    name: "Vinod Sharma",
    email: "vinod@dpiit.gov.in",
    role: "superadmin",
    organization: "DPIIT",
    department: "IT Infrastructure",
    lastLogin: "2025-03-06T06:30:00Z",
    status: "active",
    createdAt: "2024-05-01",
  },
  {
    id: "USR-028",
    name: "Tonbo Imaging",
    email: "compliance@tonboimaging.com",
    role: "supplier",
    organization: "Tonbo Imaging",
    department: "Govt Programs",
    lastLogin: "2025-03-05T11:00:00Z",
    status: "active",
    createdAt: "2025-02-15",
  },
  {
    id: "USR-029",
    name: "Anjali Das",
    email: "anjali@cag.gov.in",
    role: "auditor",
    organization: "CAG",
    department: "Compliance Review",
    lastLogin: "2025-03-04T09:30:00Z",
    status: "active",
    createdAt: "2025-01-20",
  },
  {
    id: "USR-030",
    name: "MKU Limited",
    email: "compliance@mku.com",
    role: "supplier",
    organization: "MKU Limited",
    department: "Compliance",
    lastLogin: "2025-03-03T16:00:00Z",
    status: "active",
    createdAt: "2024-12-10",
  },
];

interface MockDataContextType {
  suppliers: Supplier[];
  products: Product[];
  bom: BOMComponent[];
  compliance: ComplianceRecord[];
  alerts: RiskAlert[];
  verificationLogs: VerificationLog[];
  ledger: LedgerEntry[];
  users: PlatformUser[];
  addProduct: (
    p: Omit<Product, "id" | "createdAt" | "status" | "supplierName">,
  ) => void;
  addBOMComponent: (c: Omit<BOMComponent, "id">) => void;
  runDVA: (productId: string) => DVAResult | null;
  runFraudCheck: (productId: string) => FraudAlertType[];
  verifyProduct: (
    productId: string,
    requestedBy: string,
  ) => VerificationLog | null;
  resolveAlert: (alertId: string) => void;
  submitBOM: (productId: string) => void;
  importBOMFromCSV: (
    productId: string,
    rows: {
      name: string;
      origin: string;
      cost: number;
      supplierName: string;
    }[],
  ) => number;
  addUser: (u: Omit<PlatformUser, "id" | "createdAt" | "lastLogin">) => void;
  updateUser: (id: string, updates: Partial<PlatformUser>) => void;
  deleteUser: (id: string) => void;
  addSupplier: (s: Omit<Supplier, "id" | "createdAt">) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
}

const MockDataContext = createContext<MockDataContextType>(
  {} as MockDataContextType,
);

export const MockDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [suppliers, setSuppliers] = useState(MOCK_SUPPLIERS);
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [bom, setBom] = useState(MOCK_BOM);
  const [compliance, setCompliance] = useState(INITIAL_COMPLIANCE);
  const [alerts, setAlerts] = useState<RiskAlert[]>(INITIAL_ALERTS);
  const [verificationLogs, setVerificationLogs] = useState(
    INITIAL_VERIFICATION_LOGS,
  );
  const [ledger, setLedger] = useState<LedgerEntry[]>(getSeedEntries);
  const [users, setUsers] = useState(MOCK_USERS);

  const addLedgerEntry = useCallback(
    (
      event: string,
      entity: string,
      user: string,
      data?: Record<string, unknown>,
    ) => {
      const entry = anchorToLedger(event, entity, user, data);
      setLedger((prev) => [entry, ...prev]);
      return entry;
    },
    [],
  );

  const addProduct = useCallback(
    (p: Omit<Product, "id" | "createdAt" | "status" | "supplierName">) => {
      const id = `PRD-${String(products.length + 1).padStart(3, "0")}`;
      const supplier = suppliers.find((s) => s.id === p.supplierId);
      const newProd: Product = {
        ...p,
        id,
        supplierName: supplier?.name || "Unknown",
        createdAt: new Date().toISOString().split("T")[0],
        status: "draft",
      };
      setProducts((prev) => [...prev, newProd]);
      addLedgerEntry("Product Created", id, p.supplierId, {
        name: p.name,
        category: p.category,
      });
    },
    [products.length, suppliers, addLedgerEntry],
  );

  const addBOMComponent = useCallback(
    (c: Omit<BOMComponent, "id">) => {
      const id = `BOM-${String(bom.length + 1).padStart(3, "0")}`;
      setBom((prev) => [...prev, { ...c, id }]);
      addLedgerEntry("Component Added", c.productId, c.supplierName, {
        name: c.name,
        origin: c.origin,
        cost: c.cost,
      });
    },
    [bom.length, addLedgerEntry],
  );

  const importBOMFromCSV = useCallback(
    (
      productId: string,
      rows: {
        name: string;
        origin: string;
        cost: number;
        supplierName: string;
      }[],
    ): number => {
      let count = 0;
      const newComps: BOMComponent[] = rows.map((r, i) => {
        count++;
        return {
          id: `BOM-${String(bom.length + i + 1).padStart(3, "0")}`,
          productId,
          name: r.name,
          origin: (r.origin.toLowerCase().includes("domestic")
            ? "domestic"
            : "imported") as "domestic" | "imported",
          cost: r.cost,
          supplierName: r.supplierName,
        };
      });
      setBom((prev) => [...prev, ...newComps]);
      addLedgerEntry("BOM Imported (CSV)", productId, "System", {
        components: count,
      });
      return count;
    },
    [bom.length, addLedgerEntry],
  );

  const submitBOM = useCallback(
    (productId: string) => {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, status: "submitted" as const } : p,
        ),
      );
      const comps = bom.filter((b) => b.productId === productId);
      addLedgerEntry("BOM Submitted", productId, "Supplier", {
        components: comps.length,
        totalCost: comps.reduce((s, c) => s + c.cost, 0),
      });
    },
    [bom, addLedgerEntry],
  );

  const runDVA = useCallback(
    (productId: string): DVAResult | null => {
      const comps = bom.filter((b) => b.productId === productId);
      if (comps.length === 0) return null;
      const result = calculateDVA(comps);
      const product = products.find((p) => p.id === productId);
      const supplier = product
        ? suppliers.find((s) => s.id === product.supplierId)
        : null;
      const txEntry = addLedgerEntry("DVA Calculated", productId, "System", {
        dvaScore: result.dvaScore,
        classification: result.classification,
        confidence: result.confidenceScore,
      });

      setCompliance((prev) => {
        const existing = prev.find((c) => c.productId === productId);
        const record: ComplianceRecord = {
          id: existing?.id || `CR-${String(prev.length + 1).padStart(3, "0")}`,
          productId,
          productName: product?.name || productId,
          supplierName: supplier?.name || "Unknown",
          category: product?.category || "Unknown",
          dvaScore: result.dvaScore,
          classification: result.classification,
          confidenceScore: result.confidenceScore,
          riskScore: result.riskScore,
          status:
            result.classification === "Non-Local"
              ? "non-compliant"
              : result.riskScore > 0.3
                ? "under-review"
                : "compliant",
          verifiedAt: new Date().toISOString().split("T")[0],
          blockchainTxHash: txEntry.txHash,
        };
        return existing
          ? prev.map((c) => (c.productId === productId ? record : c))
          : [...prev, record];
      });

      return result;
    },
    [bom, products, suppliers, addLedgerEntry],
  );

  const runFraudCheck = useCallback(
    (productId: string): FraudAlertType[] => {
      const comps = bom.filter((b) => b.productId === productId);
      const product = products.find((p) => p.id === productId);
      if (!product) return [];
      const existing = compliance.find((c) => c.productId === productId);
      const results = runFraudChecks({
        product,
        components: comps,
        previousDva: existing?.dvaScore,
      });

      if (results.length > 0) {
        const newAlerts: RiskAlert[] = results.map((r, i) => ({
          id: `ALT-${String(alerts.length + i + 1).padStart(3, "0")}`,
          productId: product.id,
          productName: product.name,
          supplierName: product.supplierName,
          alertType: r.ruleName,
          severity: r.severity,
          description: r.description,
          details: r.details,
          ruleId: r.ruleId,
          createdAt: new Date().toISOString().split("T")[0],
          resolved: false,
        }));
        setAlerts((prev) => [...newAlerts, ...prev]);
        newAlerts.forEach((a) =>
          addLedgerEntry("Alert Generated", productId, "Fraud Engine", {
            alertType: a.alertType,
            severity: a.severity,
          }),
        );
      }
      return results;
    },
    [bom, products, compliance, alerts.length, addLedgerEntry],
  );

  const verifyProduct = useCallback(
    (productId: string, requestedBy: string): VerificationLog | null => {
      const product = products.find((p) => p.id === productId);
      const supplier = product
        ? suppliers.find((s) => s.id === product.supplierId)
        : null;
      const comps = bom.filter((b) => b.productId === productId);
      if (!product || comps.length === 0) return null;

      const dva = calculateDVA(comps);
      const txEntry = addLedgerEntry(
        "Verification Completed",
        productId,
        requestedBy,
        {
          dvaScore: dva.dvaScore,
          classification: dva.classification,
          confidence: dva.confidenceScore,
        },
      );

      const log: VerificationLog = {
        id: `VL-${String(verificationLogs.length + 1).padStart(3, "0")}`,
        productId,
        productName: product.name,
        supplierName: supplier?.name || "Unknown",
        requestedBy,
        status:
          dva.classification === "Non-Local"
            ? "failed"
            : dva.riskScore > 0.3
              ? "pending"
              : "verified",
        dvaScore: dva.dvaScore,
        confidenceScore: dva.confidenceScore,
        classification: dva.classification,
        riskScore: dva.riskScore,
        blockchainTxHash: txEntry.txHash,
        timestamp: new Date().toISOString(),
      };
      setVerificationLogs((prev) => [log, ...prev]);
      return log;
    },
    [products, suppliers, bom, verificationLogs.length, addLedgerEntry],
  );

  const resolveAlert = useCallback(
    (alertId: string) => {
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a)),
      );
      addLedgerEntry("Alert Resolved", alertId, "Officer");
    },
    [addLedgerEntry],
  );

  const addUser = useCallback(
    (u: Omit<PlatformUser, "id" | "createdAt" | "lastLogin">) => {
      const id = `USR-${String(users.length + 1).padStart(3, "0")}`;
      const newUser: PlatformUser = {
        ...u,
        id,
        createdAt: new Date().toISOString().split("T")[0],
        lastLogin: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, newUser]);
      addLedgerEntry("User Invited", id, "Admin", {
        name: u.name,
        role: u.role,
      });
    },
    [users.length, addLedgerEntry],
  );

  const updateUser = useCallback(
    (id: string, updates: Partial<PlatformUser>) => {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...updates } : u)),
      );
      addLedgerEntry(
        "User Updated",
        id,
        "Admin",
        updates as Record<string, unknown>,
      );
    },
    [addLedgerEntry],
  );

  const deleteUser = useCallback(
    (id: string) => {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      addLedgerEntry("User Deleted", id, "Admin");
    },
    [addLedgerEntry],
  );

  const addSupplier = useCallback(
    (s: Omit<Supplier, "id" | "createdAt">) => {
      const id = `SUP-${String(suppliers.length + 1).padStart(3, "0")}`;
      const newSupplier: Supplier = {
        ...s,
        id,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setSuppliers((prev) => [...prev, newSupplier]);
      addLedgerEntry("Supplier Added", id, "Admin", {
        name: s.name,
        sector: s.sector,
      });
    },
    [suppliers.length, addLedgerEntry],
  );

  const updateSupplier = useCallback(
    (id: string, updates: Partial<Supplier>) => {
      setSuppliers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      );
      addLedgerEntry(
        "Supplier Updated",
        id,
        "Admin",
        updates as Record<string, unknown>,
      );
    },
    [addLedgerEntry],
  );

  const deleteSupplier = useCallback(
    (id: string) => {
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      addLedgerEntry("Supplier Deleted", id, "Admin");
    },
    [addLedgerEntry],
  );

  return (
    <MockDataContext.Provider
      value={{
        suppliers,
        products,
        bom,
        compliance,
        alerts,
        verificationLogs,
        ledger,
        users,
        addProduct,
        addBOMComponent,
        runDVA,
        runFraudCheck,
        verifyProduct,
        resolveAlert,
        submitBOM,
        importBOMFromCSV,
        addUser,
        updateUser,
        deleteUser,
        addSupplier,
        updateSupplier,
        deleteSupplier,
      }}
    >
      {children}
    </MockDataContext.Provider>
  );
};

export const useMockData = () => useContext(MockDataContext);
