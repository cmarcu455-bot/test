/**
 * Generates Apartment_Sales_Test_Data.xlsx for testing the PWA.
 * Run: node scripts/generate-test-excel.mjs
 */
import * as XLSX from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, '..', 'Apartment_Sales_Test_Data.xlsx');

const apartments = [
  { apartment_number: '101', bedroom_type: 2, base_price: 425000, parking_spots: 1, available: 'Yes' },
  { apartment_number: '102', bedroom_type: 2, base_price: 430000, parking_spots: 1, available: 'Yes' },
  { apartment_number: '201', bedroom_type: 3, base_price: 575000, parking_spots: 2, available: 'Yes' },
  { apartment_number: '202', bedroom_type: 3, base_price: 580000, parking_spots: 2, available: 'No' },
  { apartment_number: '301', bedroom_type: 1, base_price: 325000, parking_spots: 1, available: 'Yes' },
  { apartment_number: '302', bedroom_type: 1, base_price: 335000, parking_spots: 0, available: 'Yes' },
  { apartment_number: '401', bedroom_type: 2, base_price: 450000, parking_spots: 2, available: 'Yes' },
  { apartment_number: '402', bedroom_type: 2, base_price: 455000, parking_spots: 1, available: 'Yes' },
  { apartment_number: '501', bedroom_type: 3, base_price: 620000, parking_spots: 2, available: 'Yes' },
];

const stylingOptions = [
  { option_category: 'Flooring', option_choice: 'Standard Laminate', upcharge: 0, description: 'Included in base package' },
  { option_category: 'Flooring', option_choice: 'Premium Hardwood', upcharge: 8500, description: 'Oak finish throughout living areas' },
  { option_category: 'Flooring', option_choice: 'Polished Concrete', upcharge: 4200, description: 'Modern industrial look' },
  { option_category: 'Kitchen', option_choice: 'Standard Cabinets', upcharge: 0, description: 'White shaker style' },
  { option_category: 'Kitchen', option_choice: 'Quartz Countertops', upcharge: 5500, description: 'Upgrade counters and backsplash' },
  { option_category: 'Kitchen', option_choice: 'Chef Package', upcharge: 12000, description: 'Premium appliances + island' },
  { option_category: 'Bathroom', option_choice: 'Standard Tile', upcharge: 0, description: 'Ceramic wall and floor' },
  { option_category: 'Bathroom', option_choice: 'Spa Package', upcharge: 6800, description: 'Rain shower + heated floors' },
  { option_category: 'Paint', option_choice: 'Builder White', upcharge: 0, description: 'Single neutral color' },
  { option_category: 'Paint', option_choice: 'Custom Color Package', upcharge: 2200, description: 'Up to 3 accent walls' },
  { option_category: 'Fixtures', option_choice: 'Standard Chrome', upcharge: 0, description: 'Included hardware' },
  { option_category: 'Fixtures', option_choice: 'Brushed Gold', upcharge: 3100, description: 'Premium fixture set' },
];

const buyers = [
  { buyer_id: 'B001', name: 'Maria Chen', email: 'maria.chen@example.com', phone: '555-0101', apartment_number: '101', approval_status: 'Pending', approval_notes: '', approval_date: '', contract_signed: 'No' },
  { buyer_id: 'B002', name: 'James Wilson', email: 'james.w@example.com', phone: '555-0102', apartment_number: '201', approval_status: 'Approved', approval_notes: 'Financing pre-approved', approval_date: '2025-05-10', contract_signed: 'Yes' },
  { buyer_id: 'B003', name: 'Sofia Rodriguez', email: 'sofia.r@example.com', phone: '555-0103', apartment_number: '301', approval_status: 'Pending', approval_notes: '', approval_date: '', contract_signed: 'No' },
  { buyer_id: 'B004', name: 'David Kim', email: 'david.kim@example.com', phone: '555-0104', apartment_number: '401', approval_status: 'Rejected', approval_notes: 'Credit review incomplete', approval_date: '2025-05-08', contract_signed: 'No' },
  { buyer_id: 'B005', name: 'Emily Thompson', email: 'emily.t@example.com', phone: '555-0105', apartment_number: '501', approval_status: 'Approved', approval_notes: 'VIP client — expedite', approval_date: '2025-05-15', contract_signed: 'No' },
];

const buyerSelections = [
  { buyer_id: 'B001', option_category: 'Flooring', option_choice: 'Premium Hardwood', upcharge: 8500, selection_date: '2025-05-01', option_notes: 'Delivery in 3 weeks' },
  { buyer_id: 'B001', option_category: 'Kitchen', option_choice: 'Quartz Countertops', upcharge: 5500, selection_date: '2025-05-01', option_notes: '' },
  { buyer_id: 'B002', option_category: 'Kitchen', option_choice: 'Chef Package', upcharge: 12000, selection_date: '2025-04-20', option_notes: 'Include wine fridge' },
  { buyer_id: 'B002', option_category: 'Bathroom', option_choice: 'Spa Package', upcharge: 6800, selection_date: '2025-04-20', option_notes: '' },
  { buyer_id: 'B002', option_category: 'Fixtures', option_choice: 'Brushed Gold', upcharge: 3100, selection_date: '2025-04-22', option_notes: '' },
  { buyer_id: 'B003', option_category: 'Flooring', option_choice: 'Standard Laminate', upcharge: 0, selection_date: '2025-05-12', option_notes: '' },
  { buyer_id: 'B003', option_category: 'Paint', option_choice: 'Custom Color Package', upcharge: 2200, selection_date: '2025-05-12', option_notes: 'Navy accent in bedroom' },
  { buyer_id: 'B005', option_category: 'Flooring', option_choice: 'Polished Concrete', upcharge: 4200, selection_date: '2025-05-14', option_notes: '' },
  { buyer_id: 'B005', option_category: 'Kitchen', option_choice: 'Chef Package', upcharge: 12000, selection_date: '2025-05-14', option_notes: 'Penthouse unit' },
  { buyer_id: 'B005', option_category: 'Bathroom', option_choice: 'Spa Package', upcharge: 6800, selection_date: '2025-05-14', option_notes: '' },
];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(apartments), 'Apartments');
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(stylingOptions), 'Styling_Options');
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(buyers), 'Buyers');
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(buyerSelections), 'Buyer_Selections');
XLSX.writeFile(wb, outPath);
console.log('Created:', outPath);
