// 3D Prints — Catalogue Seed Data
db = db.getSiblingDB('catalogue');
db.products.insertMany([
  // HOME
  {sku:'H001',name:'Nordic Vase',description:'Minimal tapered vase for dried flowers, printed in matte PLA. Available in S/M/L.',price:18.99,instock:45,categories:['home']},
  {sku:'H002',name:'Modular Drawer Organizer',description:'Snap-together modular organizer system for kitchen or desk drawers.',price:12.50,instock:30,categories:['home']},
  {sku:'H003',name:'Geometric Wall Hooks',description:'Set of 4 diamond-shaped wall hooks. Strong PLA with wall anchors included.',price:9.99,instock:100,categories:['home']},
  {sku:'H004',name:'Bedside Phone Stand',description:'Angled phone and remote caddy for nightstand. Holds any phone size.',price:7.50,instock:80,categories:['home']},
  {sku:'H005',name:'Succulent Planter Trio',description:'Three self-watering mini planters with drainage holes.',price:14.99,instock:20,categories:['home']},
  {sku:'H006',name:'Layered Lamp Shade',description:'Geometric layered lamp shade for E27 bulbs. Dramatic shadow patterns.',price:24.99,instock:15,categories:['home']},
  // OFFICE
  {sku:'O001',name:'Business Card Display',description:'Angled minimalist card display. Holds up to 30 cards.',price:8.50,instock:60,categories:['office']},
  {sku:'O002',name:'Cable Organizer Clips',description:'Set of 10 desktop cable management clips. Fits 3-8mm cables.',price:6.99,instock:200,categories:['office']},
  {sku:'O003',name:'Monitor Riser Pro',description:'Adjustable monitor stand with 3 height settings and cable pass-through.',price:29.99,instock:15,categories:['office']},
  {sku:'O004',name:'Hex Pen Holder',description:'Honeycomb-pattern desktop pen holder. Holds 15 pens.',price:11.99,instock:40,categories:['office']},
  {sku:'O005',name:'Foldable Laptop Stand',description:'Ventilated foldable laptop stand. Fits 13-17 inch laptops.',price:34.99,instock:10,categories:['office']},
  {sku:'O006',name:'Sticky Note Dispenser',description:'Wall-mounted sticky note dispenser. Fits standard 76x76mm pads.',price:5.99,instock:120,categories:['office']},
  // KIDS
  {sku:'K001',name:'Mini Rocket Ship',description:'Colorful desktop rocket toy with removable astronaut crew. BPA-free PLA. Ages 4+.',price:6.99,instock:75,categories:['kids']},
  {sku:'K002',name:'Dino Name Plate',description:'Personalized dinosaur name tag for bedroom or desk. Ages 3+.',price:9.99,instock:50,categories:['kids']},
  {sku:'K003',name:'Stacking Rings Tower',description:'Classic 7-ring stacking toy. BPA-free PETG. Ages 1+.',price:11.99,instock:30,categories:['kids']},
  {sku:'K004',name:'Geometric Puzzle Set',description:'8-piece 3D geometric puzzle. Trains spatial reasoning. Ages 5+.',price:13.99,instock:25,categories:['kids']},
  {sku:'K005',name:'Poseable Robot Buddy',description:'Articulated tabletop robot with moveable limbs and head. Ages 6+.',price:15.99,instock:40,categories:['kids']},
  {sku:'K006',name:'Marble Run Starter Kit',description:'12-piece modular marble run. Ages 5+.',price:19.99,instock:22,categories:['kids']},
  // INDUSTRIAL
  {sku:'I001',name:'Cable Routing Bracket',description:'M4/M6 wall cable routing bracket 20-pack. UV-resistant ASA.',price:3.99,instock:500,categories:['industrial']},
  {sku:'I002',name:'Pipe Clip Set',description:'15mm and 22mm plumbing pipe clips 20-pack. High-temp PETG rated to 90C.',price:8.99,instock:150,categories:['industrial']},
  {sku:'I003',name:'Project Enclosure Box',description:'IP54-rated electronics enclosure with snap-fit lid. 3 sizes.',price:19.99,instock:35,categories:['industrial']},
  {sku:'I004',name:'Gear and Pulley Kit',description:'12-piece prototyping gear and pulley kit. POM filament.',price:24.99,instock:20,categories:['industrial']},
  {sku:'I005',name:'Raspberry Pi 4 Case',description:'Ventilated case with GPIO cutout, fan mount, and camera slot.',price:12.99,instock:45,categories:['industrial']},
  {sku:'I006',name:'DIN Rail Adapter Set',description:'Universal DIN rail mount adapters for 35mm rails. Set of 4.',price:7.99,instock:80,categories:['industrial']},
  // CUSTOM
  {sku:'C001',name:'Custom Nameplate',description:'Personalized desk nameplate with your name or logo. 3-5 day turnaround.',price:19.99,instock:999,categories:['custom']},
  {sku:'C002',name:'Logo Display Stand',description:'3D printed version of your company or personal logo.',price:34.99,instock:999,categories:['custom']},
  {sku:'C003',name:'Monogram Keychain',description:'Custom initial keychain in any font and color. PLA, PETG, or TPU.',price:7.99,instock:999,categories:['custom']},
  {sku:'C004',name:'Bespoke Bracket',description:'Custom-designed mounting bracket. Submit specs; CAD file included.',price:44.99,instock:999,categories:['custom']}
]);
db.products.createIndex({ name: 'text', description: 'text' });
db.products.createIndex({ sku: 1 }, { unique: true });
