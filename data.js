// ProcureSys Inventory Module - Mock Database Engine

const DEFAULT_ITEMS = [
  { code: "ITM-0001", name: "Steel Rods", category: "Raw Material", uom: "Kg", warehouse: "Chennai WH", availableQty: 8500, reservedQty: 1000, onHandQty: 9500, status: "In Stock", reorderLevel: 5000, reorderQty: 10000, leadTime: "10 Days", hsnCode: "7214", type: "Buy", description: "High tensile steel rods for reinforcement" },
  { code: "ITM-0002", name: "Bearing 6205", category: "Components", uom: "Nos", warehouse: "Coimbatore WH", availableQty: 120, reservedQty: 30, onHandQty: 150, status: "Low Stock", reorderLevel: 200, reorderQty: 500, leadTime: "5 Days", hsnCode: "8482", type: "Buy", description: "Deep groove ball bearing 6205 standard quality" },
  { code: "ITM-0003", name: "Copper Wire", category: "Raw Material", uom: "Meter", warehouse: "Chennai WH", availableQty: 2000, reservedQty: 500, onHandQty: 2500, status: "In Stock", reorderLevel: 1000, reorderQty: 3000, leadTime: "7 Days", hsnCode: "7408", type: "Buy", description: "Insulated copper wire for power distribution" },
  { code: "ITM-0004", name: "Nut M10", category: "Fasteners", uom: "Nos", warehouse: "Chennai WH", availableQty: 50, reservedQty: 0, onHandQty: 50, status: "Low Stock", reorderLevel: 100, reorderQty: 1000, leadTime: "3 Days", hsnCode: "7318", type: "Buy", description: "Hexagonal steel nuts M10 size" },
  { code: "ITM-0005", name: "Washer 10mm", category: "Fasteners", uom: "Nos", warehouse: "Bangalore WH", availableQty: 0, reservedQty: 0, onHandQty: 0, status: "Out of Stock", reorderLevel: 150, reorderQty: 1500, leadTime: "4 Days", hsnCode: "7318", type: "Buy", description: "Flat metal washers 10mm internal diameter" },
  { code: "ITM-0006", name: "PGR Chips", category: "Electronic", uom: "Nos", warehouse: "Chennai WH", availableQty: 300, reservedQty: 50, onHandQty: 350, status: "In Stock", reorderLevel: 150, reorderQty: 500, leadTime: "12 Days", hsnCode: "8542", type: "Buy", description: "Microcontrollers for power grid management" },
  { code: "ITM-0007", name: "Paint Thinner", category: "Consumables", uom: "Litre", warehouse: "Coimbatore WH", availableQty: 75, reservedQty: 0, onHandQty: 75, status: "In Stock", reorderLevel: 50, reorderQty: 200, leadTime: "6 Days", hsnCode: "3814", type: "Buy", description: "Standard grade solvent thinner for industrial paints" }
];

const DEFAULT_WAREHOUSES = [
  { code: "WH-001", name: "Chennai Warehouse", location: "Chennai, TN", manager: "Ramesh Kumar", totalItems: 820, status: "Active" },
  { code: "WH-002", name: "Coimbatore Warehouse", location: "Coimbatore, TN", manager: "S. Prakash", totalItems: 610, status: "Active" },
  { code: "WH-003", name: "Bangalore Warehouse", location: "Bangalore, KA", manager: "Anita Sharma", totalItems: 540, status: "Active" },
  { code: "WH-004", name: "Hyderabad Warehouse", location: "Hyderabad, TG", manager: "Vikas Reddy", totalItems: 320, status: "Inactive" }
];

const DEFAULT_MOVEMENTS = [
  { date: "14 May 2025", type: "GRN", ref: "GRN-2025-145", item: "Steel Rods", warehouse: "Chennai WH", qty: 1000, uom: "Kg", user: "John Doe" },
  { date: "14 May 2025", type: "Issue", ref: "PO-2025-057", item: "Bearing 6205", warehouse: "Coimbatore WH", qty: -200, uom: "Nos", user: "S. Prakash" },
  { date: "13 May 2025", type: "Transfer", ref: "TRF-2025-021", item: "Copper Wire", warehouse: "Chennai WH", qty: -500, uom: "Meter", user: "Ramesh Kumar" },
  { date: "12 May 2025", type: "Adjustment", ref: "ADJ-2025-011", item: "Nut M10", warehouse: "Chennai WH", qty: -20, uom: "Nos", user: "Anita Sharma" },
  { date: "11 May 2025", type: "GRN", ref: "GRN-2025-133", item: "PGR Chips", warehouse: "Chennai WH", qty: 300, uom: "Nos", user: "John Doe" }
];

const DEFAULT_RESERVATIONS = [
  { code: "RSV-2025-045", date: "14 May 2025", item: "Steel Rods", ref: "PO-2025-058", warehouse: "Chennai WH", qty: 1000, uom: "Kg", status: "Active" },
  { code: "RSV-2025-044", date: "14 May 2025", item: "Copper Wire", ref: "PO-2025-112", warehouse: "Chennai WH", qty: 500, uom: "Meter", status: "Active" },
  { code: "RSV-2025-043", date: "13 May 2025", item: "Bearing 6205", ref: "PO-2025-057", warehouse: "Coimbatore WH", qty: 30, uom: "Nos", status: "Active" },
  { code: "RSV-2025-042", date: "12 May 2025", item: "Nut M10", ref: "WO-2025-110", warehouse: "Chennai WH", qty: 100, uom: "Nos", status: "Completed" },
  { code: "RSV-2025-041", date: "10 May 2025", item: "Washer 10mm", ref: "WO-2025-053", warehouse: "Bangalore WH", qty: 200, uom: "Nos", status: "Cancelled" }
];

const DEFAULT_TRANSFERS = [
  { code: "TRF-2025-021", date: "13 May 2025", fromWH: "Chennai WH", toWH: "Coimbatore WH", status: "In Transit" },
  { code: "TRF-2025-020", date: "12 May 2025", fromWH: "Bangalore WH", toWH: "Chennai WH", status: "Completed" },
  { code: "TRF-2025-019", date: "10 May 2025", fromWH: "Coimbatore WH", toWH: "Bangalore WH", status: "Completed" },
  { code: "TRF-2025-018", date: "08 May 2025", fromWH: "Chennai WH", toWH: "Bangalore WH", status: "Cancelled" }
];

const DEFAULT_VENDORS = [
  { id: "VND-001", name: "Acme Steel Corp", rfq: "RFQ-2025-08", category: "Raw Materials", date: "2025-05-12", status: "Completed", amount: "45,200.00" },
  { id: "VND-002", name: "SKF Bearings Ltd", rfq: "RFQ-2025-12", category: "Components", date: "2025-05-14", status: "Approved", amount: "12,500.00" },
  { id: "VND-003", name: "Apex Electrics", rfq: "RFQ-2025-19", category: "Electricals", date: "2025-05-10", status: "Pending", amount: "8,900.00" },
  { id: "VND-004", name: "Fastener World", rfq: "RFQ-2025-02", category: "Fasteners", date: "2025-05-09", status: "Rejected", amount: "1,200.00" },
  { id: "VND-005", name: "Sigma Chemicals", rfq: "RFQ-2025-15", category: "Consumables", date: "2025-05-11", status: "Approved", amount: "3,450.00" }
];

const DEFAULT_AUDIT_LOGS = [
  { timestamp: "2026-07-03 07:15:00", user: "Ramesh Kumar", action: "Database Initialized", detail: "Loaded default inventory data elements successfully." },
  { timestamp: "2026-07-03 07:22:15", user: "S. Prakash", action: "Stock Level Checked", detail: "Checked Bearing 6205 availability for order verification." }
];

class MockDB {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem("ps_items")) {
      localStorage.setItem("ps_items", JSON.stringify(DEFAULT_ITEMS));
      localStorage.setItem("ps_warehouses", JSON.stringify(DEFAULT_WAREHOUSES));
      localStorage.setItem("ps_movements", JSON.stringify(DEFAULT_MOVEMENTS));
      localStorage.setItem("ps_reservations", JSON.stringify(DEFAULT_RESERVATIONS));
      localStorage.setItem("ps_transfers", JSON.stringify(DEFAULT_TRANSFERS));
      localStorage.setItem("ps_vendors", JSON.stringify(DEFAULT_VENDORS));
      localStorage.setItem("ps_audits", JSON.stringify(DEFAULT_AUDIT_LOGS));
    }
  }

  getItems() {
    return JSON.parse(localStorage.getItem("ps_items"));
  }

  getItemByCode(code) {
    return this.getItems().find(i => i.code === code);
  }

  saveItems(items) {
    localStorage.setItem("ps_items", JSON.stringify(items));
  }

  getWarehouses() {
    return JSON.parse(localStorage.getItem("ps_warehouses"));
  }

  saveWarehouses(wh) {
    localStorage.setItem("ps_warehouses", JSON.stringify(wh));
  }

  getMovements() {
    return JSON.parse(localStorage.getItem("ps_movements"));
  }

  saveMovements(mov) {
    localStorage.setItem("ps_movements", JSON.stringify(mov));
  }

  getReservations() {
    return JSON.parse(localStorage.getItem("ps_reservations"));
  }

  saveReservations(res) {
    localStorage.setItem("ps_reservations", JSON.stringify(res));
  }

  getTransfers() {
    return JSON.parse(localStorage.getItem("ps_transfers"));
  }

  saveTransfers(trsf) {
    localStorage.setItem("ps_transfers", JSON.stringify(trsf));
  }

  getVendors() {
    return JSON.parse(localStorage.getItem("ps_vendors"));
  }

  saveVendors(v) {
    localStorage.setItem("ps_vendors", JSON.stringify(v));
  }

  getAudits() {
    return JSON.parse(localStorage.getItem("ps_audits"));
  }

  saveAudits(a) {
    localStorage.setItem("ps_audits", JSON.stringify(a));
  }

  logAudit(user, action, detail) {
    const audits = this.getAudits();
    const now = new Date();
    const timestamp = now.getFullYear() + '-' + 
                      String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                      String(now.getDate()).padStart(2, '0') + ' ' + 
                      String(now.getHours()).padStart(2, '0') + ':' + 
                      String(now.getMinutes()).padStart(2, '0') + ':' + 
                      String(now.getSeconds()).padStart(2, '0');
    audits.unshift({ timestamp, user, action, detail });
    this.saveAudits(audits);
  }

  // Update product details and recalculate status badge
  updateItem(updatedItem, user = "System") {
    const items = this.getItems();
    const idx = items.findIndex(i => i.code === updatedItem.code);
    if (idx !== -1) {
      // Recalculate stock status based on rules
      const total = updatedItem.availableQty + updatedItem.reservedQty;
      updatedItem.onHandQty = total;
      if (updatedItem.availableQty <= 0) {
        updatedItem.status = "Out of Stock";
      } else if (updatedItem.availableQty < updatedItem.reorderLevel) {
        updatedItem.status = "Low Stock";
      } else {
        updatedItem.status = "In Stock";
      }

      items[idx] = { ...items[idx], ...updatedItem };
      this.saveItems(items);
      this.logAudit(user, "Item Updated", `${updatedItem.code} (${updatedItem.name}) details edited.`);
      return true;
    }
    return false;
  }

  // Verification & Update Log (FR-05)
  verifyStock(code, verifiedQty, qualityStatus, damageLogged, notes, user) {
    const items = this.getItems();
    const item = items.find(i => i.code === code);
    if (!item) return false;

    const originalQty = item.availableQty;
    const diff = verifiedQty - originalQty;

    // Adjust quantities
    item.availableQty = verifiedQty;
    if (damageLogged > 0) {
      item.availableQty = Math.max(0, item.availableQty - damageLogged);
    }
    item.onHandQty = item.availableQty + item.reservedQty;

    // Recalculate status
    if (item.availableQty <= 0) {
      item.status = "Out of Stock";
    } else if (item.availableQty < item.reorderLevel) {
      item.status = "Low Stock";
    } else {
      item.status = "In Stock";
    }

    this.saveItems(items);

    // Create movement
    if (diff !== 0) {
      this.addMovement(
        "Adjustment",
        `VER-ADJ-${Math.floor(1000 + Math.random() * 9000)}`,
        item.name,
        item.warehouse,
        diff,
        item.uom,
        user
      );
    }

    if (damageLogged > 0) {
      this.addMovement(
        "Adjustment",
        `DMG-ADJ-${Math.floor(1000 + Math.random() * 9000)}`,
        item.name,
        item.warehouse,
        -damageLogged,
        item.uom,
        user
      );
    }

    this.logAudit(user, "Stock Verified", `Verified ${item.code}. Qty Change: ${diff}. Quality: ${qualityStatus}. Damages: ${damageLogged}. Notes: ${notes}`);
    return true;
  }

  // Create new inventory item
  addItem(item, user) {
    const items = this.getItems();
    // Validate uniqueness
    if (items.some(i => i.code.toLowerCase() === item.code.toLowerCase())) {
      return { success: false, msg: "Item Code already exists." };
    }

    item.reservedQty = 0;
    item.onHandQty = item.availableQty;
    if (item.availableQty <= 0) {
      item.status = "Out of Stock";
    } else if (item.availableQty < item.reorderLevel) {
      item.status = "Low Stock";
    } else {
      item.status = "In Stock";
    }

    items.push(item);
    this.saveItems(items);

    // Create positive adjustment movement as initial inventory
    if (item.availableQty > 0) {
      this.addMovement(
        "GRN",
        `INIT-${Math.floor(1000 + Math.random() * 9000)}`,
        item.name,
        item.warehouse,
        item.availableQty,
        item.uom,
        user
      );
    }

    this.logAudit(user, "Item Added", `New item ${item.code} (${item.name}) registered in ${item.warehouse}.`);
    return { success: true };
  }

  // Delete item
  deleteItem(code, user) {
    const items = this.getItems();
    const filtered = items.filter(i => i.code !== code);
    if (filtered.length !== items.length) {
      this.saveItems(filtered);
      this.logAudit(user, "Item Deleted", `Removed item ${code} from system database.`);
      return true;
    }
    return false;
  }

  // Add Warehouse
  addWarehouse(wh, user) {
    const warehouses = this.getWarehouses();
    if (warehouses.some(w => w.code.toLowerCase() === wh.code.toLowerCase())) {
      return { success: false, msg: "Warehouse Code already exists." };
    }
    wh.totalItems = 0;
    warehouses.push(wh);
    this.saveWarehouses(warehouses);
    this.logAudit(user, "Warehouse Created", `New warehouse ${wh.code} (${wh.name}) created in ${wh.location}`);
    return { success: true };
  }

  // Create Reservation (FR-04)
  addReservation(res, user) {
    const reservations = this.getReservations();
    const items = this.getItems();
    const item = items.find(i => i.name.toLowerCase() === res.item.toLowerCase());

    if (!item) {
      return { success: false, msg: "Item not found in inventory." };
    }

    if (item.availableQty < res.qty) {
      return { success: false, msg: `Insufficient stock. Only ${item.availableQty} ${item.uom} available.` };
    }

    // Reservation starts as "Pending Approval"
    res.code = `RSV-2025-${Math.floor(100 + Math.random() * 900)}`;
    res.status = "Pending Approval";
    res.uom = item.uom;

    reservations.unshift(res);
    this.saveReservations(reservations);
    this.logAudit(user, "Reservation Requested", `${res.code} created for ${res.qty} ${res.uom} of ${res.item}. Status: Pending.`);
    return { success: true, code: res.code };
  }

  // Approve Reservation Workflow
  approveReservation(code, user) {
    const reservations = this.getReservations();
    const res = reservations.find(r => r.code === code);
    if (!res || res.status !== "Pending Approval") return false;

    const items = this.getItems();
    const item = items.find(i => i.name.toLowerCase() === res.item.toLowerCase() && i.warehouse === res.warehouse);

    if (!item) return { success: false, msg: "Item or warehouse mismatch." };
    if (item.availableQty < res.qty) return { success: false, msg: "Insufficient stock available to approve allocation." };

    // Deduct available, add to reserved
    item.availableQty -= res.qty;
    item.reservedQty += res.qty;
    res.status = "Active";

    this.saveItems(items);
    this.saveReservations(reservations);
    this.logAudit(user, "Reservation Approved", `Approved reservation ${code}. Reserved ${res.qty} units of ${res.item}.`);
    return { success: true };
  }

  // Reject/Cancel Reservation
  cancelReservation(code, user) {
    const reservations = this.getReservations();
    const res = reservations.find(r => r.code === code);
    if (!res) return false;

    if (res.status === "Active") {
      // Release reservation
      const items = this.getItems();
      const item = items.find(i => i.name.toLowerCase() === res.item.toLowerCase() && i.warehouse === res.warehouse);
      if (item) {
        item.availableQty += res.qty;
        item.reservedQty = Math.max(0, item.reservedQty - res.qty);
        this.saveItems(items);
      }
    }

    res.status = "Cancelled";
    this.saveReservations(reservations);
    this.logAudit(user, "Reservation Cancelled", `Cancelled reservation ${code}. Stock released if allocated.`);
    return true;
  }

  // Add Stock Transfer (FR-07)
  addTransfer(trsf, user) {
    const transfers = this.getTransfers();
    trsf.code = `TRF-2025-${Math.floor(100 + Math.random() * 900)}`;
    trsf.status = "Pending Approval";
    transfers.unshift(trsf);
    this.saveTransfers(transfers);

    this.logAudit(user, "Transfer Proposed", `${trsf.code} created from ${trsf.fromWH} to ${trsf.toWH}. Status: Pending.`);
    return { success: true, code: trsf.code };
  }

  // Approve Stock Transfer Workflow
  approveTransfer(code, user) {
    const transfers = this.getTransfers();
    const trsf = transfers.find(t => t.code === code);
    if (!trsf || trsf.status !== "Pending Approval") return { success: false, msg: "Invalid or inactive transfer." };

    // Process actual inventory shifts
    const items = this.getItems();
    // Locate target items to move
    // Note: Since this is a prototype, we move the item matching the transfer items list if present.
    // In our transfer form, we will collect items. We will assume the items are detailed in trsf.items.
    if (trsf.items && Array.isArray(trsf.items)) {
      for (const tItem of trsf.items) {
        // Find source item
        const sourceItem = items.find(i => i.name.toLowerCase() === tItem.name.toLowerCase() && i.warehouse.toLowerCase() === trsf.fromWH.toLowerCase());
        if (!sourceItem || sourceItem.availableQty < tItem.qty) {
          return { success: false, msg: `Insufficient quantity for item ${tItem.name} at source warehouse.` };
        }
      }

      // Perform transaction
      for (const tItem of trsf.items) {
        const sourceItem = items.find(i => i.name.toLowerCase() === tItem.name.toLowerCase() && i.warehouse.toLowerCase() === trsf.fromWH.toLowerCase());
        
        // Deduct from source
        sourceItem.availableQty -= tItem.qty;
        sourceItem.onHandQty = sourceItem.availableQty + sourceItem.reservedQty;
        // Recalculate source status
        if (sourceItem.availableQty <= 0) sourceItem.status = "Out of Stock";
        else if (sourceItem.availableQty < sourceItem.reorderLevel) sourceItem.status = "Low Stock";
        else sourceItem.status = "In Stock";

        // Add to destination (find or create)
        let destItem = items.find(i => i.name.toLowerCase() === tItem.name.toLowerCase() && i.warehouse.toLowerCase() === trsf.toWH.toLowerCase());
        if (!destItem) {
          destItem = {
            code: `ITM-${Math.floor(1000 + Math.random() * 9000)}`,
            name: sourceItem.name,
            category: sourceItem.category,
            uom: sourceItem.uom,
            warehouse: trsf.toWH,
            availableQty: tItem.qty,
            reservedQty: 0,
            onHandQty: tItem.qty,
            status: "In Stock",
            reorderLevel: sourceItem.reorderLevel,
            reorderQty: sourceItem.reorderQty,
            leadTime: sourceItem.leadTime,
            hsnCode: sourceItem.hsnCode,
            type: sourceItem.type,
            description: sourceItem.description
          };
          if (destItem.availableQty < destItem.reorderLevel) destItem.status = "Low Stock";
          items.push(destItem);
        } else {
          destItem.availableQty += tItem.qty;
          destItem.onHandQty = destItem.availableQty + destItem.reservedQty;
          if (destItem.availableQty < destItem.reorderLevel) destItem.status = "Low Stock";
          else destItem.status = "In Stock";
        }

        // Add movements
        this.addMovement("Transfer", code, sourceItem.name, trsf.fromWH, -tItem.qty, sourceItem.uom, user);
        this.addMovement("Transfer", code, destItem.name, trsf.toWH, tItem.qty, destItem.uom, user);
      }
    }

    trsf.status = "In Transit";
    this.saveItems(items);
    this.saveTransfers(transfers);
    this.logAudit(user, "Transfer Approved", `Transfer ${code} approved and marked In Transit. Items moved.`);
    return { success: true };
  }

  // Complete Transfer
  completeTransfer(code, user) {
    const transfers = this.getTransfers();
    const trsf = transfers.find(t => t.code === code);
    if (!trsf || trsf.status !== "In Transit") return false;

    trsf.status = "Completed";
    this.saveTransfers(transfers);
    this.logAudit(user, "Transfer Completed", `Transfer ${code} arrived at target and completed.`);
    return true;
  }

  // Cancel Transfer
  cancelTransfer(code, user) {
    const transfers = this.getTransfers();
    const trsf = transfers.find(t => t.code === code);
    if (!trsf) return false;

    if (trsf.status === "In Transit") {
      // Revert stock changes
      const items = this.getItems();
      if (trsf.items && Array.isArray(trsf.items)) {
        for (const tItem of trsf.items) {
          // Revert source
          const sourceItem = items.find(i => i.name.toLowerCase() === tItem.name.toLowerCase() && i.warehouse.toLowerCase() === trsf.fromWH.toLowerCase());
          if (sourceItem) {
            sourceItem.availableQty += tItem.qty;
            sourceItem.onHandQty = sourceItem.availableQty + sourceItem.reservedQty;
            if (sourceItem.availableQty < sourceItem.reorderLevel) sourceItem.status = "Low Stock";
            else sourceItem.status = "In Stock";
          }
          // Revert destination
          const destItem = items.find(i => i.name.toLowerCase() === tItem.name.toLowerCase() && i.warehouse.toLowerCase() === trsf.toWH.toLowerCase());
          if (destItem) {
            destItem.availableQty = Math.max(0, destItem.availableQty - tItem.qty);
            destItem.onHandQty = destItem.availableQty + destItem.reservedQty;
            if (destItem.availableQty <= 0) destItem.status = "Out of Stock";
            else if (destItem.availableQty < destItem.reorderLevel) destItem.status = "Low Stock";
            else destItem.status = "In Stock";
          }
        }
        this.saveItems(items);
      }
    }

    trsf.status = "Cancelled";
    this.saveTransfers(transfers);
    this.logAudit(user, "Transfer Cancelled", `Cancelled stock transfer ${code}.`);
    return true;
  }

  addMovement(type, ref, item, warehouse, qty, uom, user) {
    const movements = this.getMovements();
    const now = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const date = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

    movements.unshift({
      date,
      type,
      ref,
      item,
      warehouse,
      qty,
      uom,
      user
    });
    this.saveMovements(movements);
  }

  // Availability check helper (FR-04)
  checkAvailability(itemName, reqQty) {
    const items = this.getItems();
    const matching = items.filter(i => i.name.toLowerCase() === itemName.toLowerCase());
    if (matching.length === 0) return { available: false, totalAvailable: 0, warehouses: [] };

    let totalAvailable = 0;
    const warehouses = matching.map(i => {
      totalAvailable += i.availableQty;
      return {
        warehouse: i.warehouse,
        available: i.availableQty,
        reserved: i.reservedQty,
        status: i.status
      };
    });

    return {
      available: totalAvailable >= reqQty,
      totalAvailable,
      warehouses
    };
  }
}

const db = new MockDB();
window.db = db; // Export to window scope for easy global access
