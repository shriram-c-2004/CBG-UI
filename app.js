// ProcureSys Inventory Module - Application Coordinator

document.addEventListener("DOMContentLoaded", () => {
  // Main state elements
  let activeView = "dashboard";
  let activeDetailItemCode = null;
  let activeRole = "Inventory Team"; // Default simulation role
  let currentTheme = "light";

  // Cache DOM elements
  const breadcrumbTitle = document.getElementById("breadcrumb-title");
  const roleSelectBox = document.getElementById("role-select-box");
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const themeIcon = document.getElementById("theme-icon");
  const themeText = document.getElementById("theme-text");
  const globalSearch = document.getElementById("global-search");

  // =================================================================
  // ========================== VIEW ROUTER ==========================
  // =================================================================

  const views = document.querySelectorAll(".nav-item[data-view]");
  const panels = document.querySelectorAll(".view-panel");
  const inventoryToggleBtn = document.getElementById("inventory-toggle-btn");
  const inventorySubmenu = document.getElementById("inventory-submenu");

  function toggleSubmenu(expand) {
    if (inventorySubmenu && inventoryToggleBtn) {
      if (expand) {
        inventorySubmenu.classList.add("expanded");
        inventoryToggleBtn.classList.add("expanded");
      } else {
        inventorySubmenu.classList.remove("expanded");
        inventoryToggleBtn.classList.remove("expanded");
      }
    }
  }

  function switchView(viewName) {
    activeView = viewName;

    // Toggle sub-menu visibility based on current view prefix
    const isInventoryView = viewName.startsWith("inv-") || 
                            viewName === "inventory-dashboard" || 
                            viewName === "inventory-analytics" || 
                            viewName === "inventory-reports" ||
                            viewName === "audit-log" ||
                            viewName === "item-details";
    toggleSubmenu(isInventoryView);

    // Remove active class from nav items and add to chosen
    views.forEach(item => {
      if (item.getAttribute("data-view") === viewName) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // Toggle panels
    panels.forEach(panel => {
      if (panel.id === viewName) {
        panel.classList.add("active");
      } else {
        if (!panel.id.startsWith("detail-tab-")) {
          panel.classList.remove("active");
        }
      }
    });

    // Update Title & run specific rendering scripts
    let prettyName = viewName.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    
    // Custom label updates for breadcrumbs
    if (viewName === "dashboard") prettyName = "Procurement Overview";
    if (viewName === "inventory-dashboard") prettyName = "Inventory Overview";
    if (viewName === "inv-stock-list") prettyName = "Stock Registry";
    if (viewName === "inv-warehouses") prettyName = "Warehouse Management";
    if (viewName === "inv-transfers") prettyName = "Stock Transfer Management";
    if (viewName === "inv-reservations") prettyName = "Inventory Reservation";
    if (viewName === "inv-alerts") prettyName = "Low Stock Alerts";
    if (viewName === "inv-movements") prettyName = "Stock Movements";
    if (viewName === "inventory-analytics") prettyName = "Inventory Analytics";
    if (viewName === "inventory-reports") prettyName = "Inventory Reports";
    
    breadcrumbTitle.innerText = prettyName;

    if (viewName === "dashboard") {
      renderDashboard();
    } else if (viewName === "vendor-history") {
      renderVendorHistory();
    } else if (viewName === "inventory-dashboard") {
      renderInventoryDashboardOverview();
    } else if (viewName === "inv-stock-list") {
      renderStockRegistry();
    } else if (viewName === "inv-warehouses") {
      renderWarehouseRegistry();
    } else if (viewName === "inv-transfers") {
      renderTransfersRegistry();
    } else if (viewName === "inv-reservations") {
      renderReservationsRegistry();
    } else if (viewName === "inv-alerts") {
      renderAlertsRegistry();
    } else if (viewName === "inv-movements") {
      renderMovementsRegistry();
    } else if (viewName === "inventory-analytics") {
      renderInventoryAnalytics();
    } else if (viewName === "audit-log") {
      renderAuditLogs();
    }
  }

  // Hash change listener
  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.substring(1);
    const validHashes = [
      "dashboard", "vendor-history", "rfq-management", "penalty-module",
      "inventory-dashboard", "inventory-analytics", "inventory-reports",
      "audit-log", "help-center", "settings", "item-details",
      "inv-stock-list", "inv-warehouses", "inv-transfers", "inv-reservations", "inv-alerts", "inv-movements"
    ];
    if (validHashes.includes(hash)) {
      switchView(hash);
    }
  });

  // Handle direct link entry
  const initialHash = window.location.hash.substring(1);
  if (initialHash) {
    switchView(initialHash);
  } else {
    switchView("dashboard");
  }

  // Bind click elements directly for fallback support
  views.forEach(item => {
    item.addEventListener("click", () => {
      const view = item.getAttribute("data-view");
      if (view) switchView(view);
    });
  });

  // Bind toggle action
  if (inventoryToggleBtn) {
    inventoryToggleBtn.addEventListener("click", () => {
      const isExpanded = inventorySubmenu.classList.contains("expanded");
      toggleSubmenu(!isExpanded);
      if (!isExpanded) {
        window.location.hash = "#inventory-dashboard";
      }
    });
  }


  // =================================================================
  // ==================== ROLE SECURITY (RBAC) =======================
  // =================================================================

  roleSelectBox.addEventListener("change", (e) => {
    activeRole = e.target.value;
    showToast(`Role simulator swapped to: ${activeRole}`, "warning");
    db.logAudit("Simulator", "Role Swapped", `Swapped role to ${activeRole}`);
    
    // Refresh current views to lock/unlock inputs or actions
    switchView(activeView);
    if (activeView === "item-details") {
      showItemDetails(activeDetailItemCode);
    }
  });

  // Security check function
  function checkPermission(action) {
    if (activeRole === "Supplier") {
      showToast("Access Denied: Suppliers cannot modify inventory parameters.", "danger");
      return false;
    }
    if (activeRole === "Sourcing Team" && action !== "CheckAvailability") {
      showToast("Access Denied: Sourcing Team only has read-only access to stock checks.", "danger");
      return false;
    }
    if (activeRole === "Finance Team" && (action === "CreateTransfer" || action === "CreateReservation" || action === "VerifyStock" || action === "EditStock")) {
      showToast("Access Denied: Finance Team has read-only access to financial reports and stock valuations.", "danger");
      return false;
    }
    return true;
  }

  // =================================================================
  // ==================== THEME CONTROLLER ===========================
  // =================================================================

  themeToggleBtn.addEventListener("click", () => {
    if (currentTheme === "light") {
      document.documentElement.setAttribute("data-theme", "dark");
      currentTheme = "dark";
      themeIcon.innerHTML = `<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 7a5 5 0 100 10 5 5 0 000-10z" stroke-linecap="round" stroke-linejoin="round"/>`;
      themeText.innerText = "Light Mode";
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      currentTheme = "light";
      themeIcon.innerHTML = `<path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>`;
      themeText.innerText = "Dark Mode";
    }
    db.logAudit("Simulator", "Theme Swapped", `Swapped visual theme to ${currentTheme}`);
    // Redraw charts since text colors or grid colors might need updating
    switchView(activeView);
  });

  // =================================================================
  // ========================== UTILITIES ============================
  // =================================================================

  function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let svgIcon = "";
    if (type === "success") {
      svgIcon = `<svg viewBox="0 0 24 24" style="stroke: #10B981; fill: none; width: 16px; height: 16px; stroke-width: 2.5px;"><path d="M5 13l4 4L19 7"/></svg>`;
    } else if (type === "danger") {
      svgIcon = `<svg viewBox="0 0 24 24" style="stroke: #EF4444; fill: none; width: 16px; height: 16px; stroke-width: 2.5px;"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
    } else {
      svgIcon = `<svg viewBox="0 0 24 24" style="stroke: #F59E0B; fill: none; width: 16px; height: 16px; stroke-width: 2.5px;"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
    }

    toast.innerHTML = `${svgIcon}<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) reverse forwards";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Format currency
  function formatCurrency(val) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
  }

  // Global search filtering
  globalSearch.addEventListener("keyup", (e) => {
    const q = e.target.value.toLowerCase();
    
    // Auto shift search targets based on active view
    if (activeView === "vendor-history") {
      renderVendorHistory(q);
    } else if (activeView === "inv-stock-list") {
      renderStockRegistry(q);
    } else if (activeView === "inv-warehouses") {
      renderWarehouseRegistry(q);
    } else if (activeView === "inv-movements") {
      renderMovementsRegistry(q);
    } else if (activeView === "inv-transfers") {
      renderTransfersRegistry(q);
    } else if (activeView === "inv-reservations") {
      renderReservationsRegistry(q);
    }
  });

  // =================================================================
  // ==================== RENDERING SCRIPTS ==========================
  // =================================================================

  // --- 1. Main General Dashboard ---
  function renderDashboard() {
    // Recalculate Metrics
    const items = db.getItems();
    let totalInvVal = 0;
    let totalStockCount = 0;
    let lowStockItems = 0;
    let criticalStockItems = 0;

    items.forEach(i => {
      totalInvVal += i.availableQty * (i.category === "Electronic" ? 150 : i.category === "Components" ? 45 : 12);
      totalStockCount += i.availableQty;
      if (i.status === "Low Stock") lowStockItems++;
      if (i.status === "Out of Stock") criticalStockItems++;
    });

    document.getElementById("dashboard-inv-val").innerText = formatCurrency(totalInvVal);

    // Render Main Donut Chart
    const totalItems = items.length;
    document.getElementById("donut-center-count").innerText = totalItems;
    
    const availableCount = items.filter(i => i.status === "In Stock").length;
    const lowCount = lowStockItems;
    const critCount = criticalStockItems;

    const donut = document.getElementById("dash-donut-chart");
    if (donut) {
      const circumference = 2 * Math.PI * 60; // 377
      const availPct = availableCount / totalItems;
      const lowPct = lowCount / totalItems;
      const critPct = critCount / totalItems;

      const segAvail = document.getElementById("donut-seg-available");
      const segLow = document.getElementById("donut-seg-low");
      const segCrit = document.getElementById("donut-seg-critical");

      let offset = 0;
      segAvail.style.strokeDasharray = `${availPct * circumference} ${circumference}`;
      segAvail.style.strokeDashoffset = -offset;
      
      offset += availPct * circumference;
      segLow.style.strokeDasharray = `${lowPct * circumference} ${circumference}`;
      segLow.style.strokeDashoffset = -offset;

      offset += lowPct * circumference;
      segCrit.style.strokeDasharray = `${critPct * circumference} ${circumference}`;
      segCrit.style.strokeDashoffset = -offset;
    }

    // Spend Analytics Line Chart (SVG implementation)
    const lineChartContainer = document.getElementById("spend-chart-container");
    if (lineChartContainer) {
      const dataPoints = [35000, 48000, 42000, 65000, 58000, 72000, 95000, 84000, 110000, 95000, 125000, 142000];
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      let width = lineChartContainer.clientWidth || 400;
      let height = 220;
      let padding = 40;

      let maxVal = Math.max(...dataPoints) * 1.1;
      let minVal = 0;

      let points = dataPoints.map((val, idx) => {
        let x = padding + (idx / (dataPoints.length - 1)) * (width - padding * 2);
        let y = height - padding - ((val - minVal) / (maxVal - minVal)) * (height - padding * 2);
        return { x, y, val, month: months[idx] };
      });

      let pathD = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        let cpX1 = points[i-1].x + (points[i].x - points[i-1].x) / 3;
        let cpY1 = points[i-1].y;
        let cpX2 = points[i-1].x + 2 * (points[i].x - points[i-1].x) / 3;
        let cpY2 = points[i].y;
        pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
      }

      let areaD = `${pathD} L ${points[points.length-1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

      let gridLines = "";
      for (let j = 0; j <= 4; j++) {
        let y = padding + (j / 4) * (height - padding * 2);
        let gridVal = maxVal - (j / 4) * (maxVal - minVal);
        gridLines += `
          <line class="grid-line" x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}"></line>
          <text class="axis-text" x="${padding - 8}" y="${y + 4}" text-anchor="end">${Math.round(gridVal / 1000)}k</text>
        `;
      }

      let monthLabels = points.map(p => `
        <text class="axis-text" x="${p.x}" y="${height - 10}" text-anchor="middle">${p.month}</text>
      `).join("");

      let pointCircles = points.map(p => `
        <circle class="chart-point" cx="${p.x}" cy="${p.y}" r="4" 
                onmouseover="showChartTooltip(evt, '${p.month}', ${p.val})" 
                onmouseout="hideChartTooltip()"></circle>
      `).join("");

      lineChartContainer.innerHTML = `
        <svg class="line-chart-svg">
          <defs>
            <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#5B6EF5" />
              <stop offset="100%" stop-color="#6D5EF6" />
            </linearGradient>
            <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#5B6EF5" stop-opacity="0.25" />
              <stop offset="100%" stop-color="#5B6EF5" stop-opacity="0.00" />
            </linearGradient>
          </defs>
          ${gridLines}
          ${monthLabels}
          <path class="line-chart-area" d="${areaD}"></path>
          <path class="line-chart-path" d="${pathD}"></path>
          ${pointCircles}
        </svg>
        <div class="chart-tooltip" id="dashboard-chart-tooltip"></div>
      `;
    }
  }

  // --- 2. Vendor History Table ---
  function renderVendorHistory(searchQuery = "") {
    const vendors = db.getVendors();
    const tbody = document.getElementById("vendor-table-body");
    const statusFilter = document.getElementById("vendor-status-filter").value;

    let filtered = vendors.filter(v => {
      const matchSearch = v.name.toLowerCase().includes(searchQuery) || v.rfq.toLowerCase().includes(searchQuery);
      const matchStatus = statusFilter === "All" || v.status === statusFilter;
      return matchSearch && matchStatus;
    });

    tbody.innerHTML = "";
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 32px; color:var(--text-muted);">No vendors match current criteria.</td></tr>`;
      return;
    }

    filtered.forEach(v => {
      const tr = document.createElement("tr");
      
      let statusClass = "badge-pending";
      if (v.status === "Approved") statusClass = "badge-approved";
      if (v.status === "Completed") statusClass = "badge-completed";
      if (v.status === "Rejected") statusClass = "badge-rejected";

      tr.innerHTML = `
        <td><strong>${v.id}</strong></td>
        <td>${v.name}</td>
        <td><span style="font-family: monospace;">${v.rfq}</span></td>
        <td>${v.category}</td>
        <td>${v.date}</td>
        <td><span class="badge ${statusClass}">${v.status}</span></td>
        <td><strong>$${Number(v.amount.replace(/,/g, '')).toLocaleString()}</strong></td>
        <td>
          <div class="action-btns">
            <button class="action-icon-btn" title="View Quote Details"><svg viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg></button>
            <button class="action-icon-btn" title="More Actions"><svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg></button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  document.getElementById("vendor-status-filter").addEventListener("change", () => renderVendorHistory());
  document.getElementById("export-vendors-btn").addEventListener("click", () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["ID,Vendor,RFQ Reference,Category,Date,Status,Amount"].join(",") + "\n"
      + db.getVendors().map(v => `${v.id},"${v.name}",${v.rfq},${v.category},${v.date},${v.status},${v.amount}`).join("\n");
    triggerDownload(csvContent, "VendorQuotesExport.csv");
  });

  // --- 4. Allocated Inventory Dashboard Overview (8.1) ---
  function renderInventoryDashboardOverview() {
    const items = db.getItems();
    const movements = db.getMovements();

    // Calculations
    let totalSKUs = items.length;
    let totalUnits = 0;
    let totalValue = 0;
    let lowStockCount = 0;
    let outStockCount = 0;

    items.forEach(i => {
      totalUnits += i.availableQty;
      totalValue += i.availableQty * (i.category === "Electronic" ? 150 : i.category === "Components" ? 45 : 12);
      if (i.status === "Low Stock") lowStockCount++;
      if (i.status === "Out of Stock") outStockCount++;
    });

    document.getElementById("lbl-total-skus").innerText = totalSKUs;
    document.getElementById("lbl-total-units").innerText = totalUnits.toLocaleString();
    document.getElementById("lbl-total-val").innerText = formatCurrency(totalValue);
    document.getElementById("lbl-low-stock-count").innerText = lowStockCount;

    // Donut chart drawing
    document.getElementById("inv-donut-count").innerText = totalSKUs;
    document.getElementById("count-instock").innerText = items.filter(i => i.status === "In Stock").length;
    document.getElementById("count-lowstock").innerText = lowStockCount;
    document.getElementById("count-outstock").innerText = outStockCount;

    const donut = document.getElementById("inv-donut-chart");
    if (donut) {
      const circ = 2 * Math.PI * 60;
      const inStockPct = items.filter(i => i.status === "In Stock").length / totalSKUs;
      const lowPct = lowStockCount / totalSKUs;
      const outPct = outStockCount / totalSKUs;

      const segIn = document.getElementById("inv-seg-instock");
      const segLow = document.getElementById("inv-seg-lowstock");
      const segOut = document.getElementById("inv-seg-outstock");

      let offset = 0;
      segIn.style.strokeDasharray = `${inStockPct * circ} ${circ}`;
      segIn.style.strokeDashoffset = -offset;

      offset += inStockPct * circ;
      segLow.style.strokeDasharray = `${lowPct * circ} ${circ}`;
      segLow.style.strokeDashoffset = -offset;

      offset += lowPct * circ;
      segOut.style.strokeDasharray = `${outPct * circ} ${circ}`;
      segOut.style.strokeDashoffset = -offset;
    }

    // Value by Category Bar Chart
    const barContainer = document.getElementById("category-bar-chart-container");
    if (barContainer) {
      const categories = ["Raw Material", "Components", "Fasteners", "Electronic", "Consumables"];
      const catVal = categories.map(cat => {
        let sum = 0;
        items.filter(i => i.category === cat).forEach(i => {
          sum += i.availableQty * (cat === "Electronic" ? 150 : cat === "Components" ? 45 : 12);
        });
        return sum;
      });

      const maxVal = Math.max(...catVal) * 1.1 || 1000;
      let bars = categories.map((cat, idx) => {
        const pct = (catVal[idx] / maxVal) * 100;
        const color = cat === "Raw Material" ? "#5B6EF5" : cat === "Components" ? "#10B981" : cat === "Electronic" ? "#8B5CF6" : "#6366F1";
        return `
          <div style="display:flex; flex-direction:column; align-items:center; flex:1; gap:8px;">
            <div style="flex:1; width:24px; background-color:var(--border-color); border-radius:4px; display:flex; align-items:flex-end;">
              <div style="height:${pct}%; width:100%; background-color:${color}; border-radius:4px; transition: height 0.8s ease;" title="${formatCurrency(catVal[idx])}"></div>
            </div>
            <span style="font-size:10px; font-weight:600; color:var(--text-muted); text-align:center; height:24px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${cat.split(" ")[0]}</span>
          </div>
        `;
      }).join("");

      barContainer.innerHTML = `<div style="display:flex; height:180px; width:100%; gap:20px; align-items:stretch; padding-top:16px;">${bars}</div>`;
    }

    // Render 5 Recent Movements
    const movementsTbody = document.getElementById("recent-movements-tbody");
    movementsTbody.innerHTML = "";
    movements.slice(0, 5).forEach(m => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${m.date}</td>
        <td><strong>${m.item}</strong></td>
        <td>${m.warehouse}</td>
        <td><span class="badge ${m.type === "GRN" ? "badge-approved" : m.type === "Issue" ? "badge-rejected" : "badge-in-transit"}">${m.type}</span></td>
        <td style="color: ${m.qty < 0 ? "var(--danger)" : "var(--success)"}; font-weight: 600;">
          ${m.qty > 0 ? "+" : ""}${m.qty.toLocaleString()} ${m.uom}
        </td>
        <td><span style="font-family:monospace;">${m.ref}</span></td>
      `;
      movementsTbody.appendChild(tr);
    });

    // Render Top Low Stock Items
    const criticalTbody = document.getElementById("critical-items-tbody");
    criticalTbody.innerHTML = "";
    const lowStockList = items.filter(i => i.status === "Low Stock" || i.status === "Out of Stock").slice(0, 5);
    
    if (lowStockList.length === 0) {
      criticalTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 16px; color:var(--text-muted);">All items have standard stock levels.</td></tr>`;
    } else {
      lowStockList.forEach(i => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong>${i.name}</strong></td>
          <td>${i.warehouse}</td>
          <td style="font-weight: 700; color: var(--danger);">${i.availableQty.toLocaleString()} ${i.uom}</td>
          <td>${i.reorderLevel.toLocaleString()} ${i.uom}</td>
          <td><span class="badge ${i.status === "Out of Stock" ? "badge-out-of-stock" : "badge-low-stock"}">${i.status}</span></td>
        `;
        criticalTbody.appendChild(tr);
      });
    }
  }

  // --- Sub-panel B: Stock Registry List ---
  function renderStockRegistry(searchQuery = "") {
    const items = db.getItems();
    const tbody = document.getElementById("stock-table-body");
    const catFilter = document.getElementById("stock-category-filter").value;
    const statFilter = document.getElementById("stock-status-filter").value;

    let filtered = items.filter(i => {
      const matchSearch = i.name.toLowerCase().includes(searchQuery) || i.code.toLowerCase().includes(searchQuery) || i.warehouse.toLowerCase().includes(searchQuery);
      const matchCat = catFilter === "All" || i.category === catFilter;
      const matchStat = statFilter === "All" || i.status === statFilter;
      return matchSearch && matchCat && matchStat;
    });

    tbody.innerHTML = "";
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding: 32px; color:var(--text-muted);">No stock registry entries matches.</td></tr>`;
      document.getElementById("stock-pagination-info").innerText = "Showing 0 of 0 items";
      return;
    }

    document.getElementById("stock-pagination-info").innerText = `Showing 1 to ${filtered.length} of ${filtered.length} items`;

    filtered.forEach(i => {
      const tr = document.createElement("tr");
      let badgeClass = "badge-in-stock";
      if (i.status === "Low Stock") badgeClass = "badge-low-stock";
      if (i.status === "Out of Stock") badgeClass = "badge-out-of-stock";

      tr.innerHTML = `
        <td><a href="#item-details" style="font-weight: 700; text-decoration: none; color: var(--primary);" onclick="showItemDetails('${i.code}')">${i.code}</a></td>
        <td><strong>${i.name}</strong></td>
        <td>${i.category}</td>
        <td>${i.uom}</td>
        <td>${i.warehouse}</td>
        <td>${i.availableQty.toLocaleString()}</td>
        <td style="color:var(--text-muted);">${i.reservedQty.toLocaleString()}</td>
        <td style="font-weight: 600;">${i.onHandQty.toLocaleString()}</td>
        <td><span class="badge ${badgeClass}">${i.status}</span></td>
        <td style="text-align: right;">
          <div class="action-btns" style="justify-content: flex-end;">
            <button class="action-icon-btn" title="Inspect / View Details" onclick="showItemDetails('${i.code}')">
              <svg viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </button>
            <button class="action-icon-btn" title="Verify Stock" onclick="openVerifyModal('${i.code}')">
              <svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </button>
            <button class="action-icon-btn" title="Edit Item Properties" onclick="openEditItemModal('${i.code}')">
              <svg viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button class="action-icon-btn delete-btn" title="Remove SKU" onclick="deleteStockItem('${i.code}')">
              <svg viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  document.getElementById("stock-category-filter").addEventListener("change", () => renderStockRegistry());
  document.getElementById("stock-status-filter").addEventListener("change", () => renderStockRegistry());
  
  document.getElementById("export-stock-btn").addEventListener("click", () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Code,Name,Category,UOM,Warehouse,Available,Reserved,OnHand,Status"].join(",") + "\n"
      + db.getItems().map(i => `${i.code},"${i.name}",${i.category},${i.uom},"${i.warehouse}",${i.availableQty},${i.reservedQty},${i.onHandQty},${i.status}`).join("\n");
    triggerDownload(csvContent, "StockInventoryRegistry.csv");
  });

  window.deleteStockItem = (code) => {
    if (!checkPermission("EditStock")) return;
    if (confirm(`Are you sure you want to delete item ${code}? This is irreversible.`)) {
      const success = db.deleteItem(code, activeRole);
      if (success) {
        showToast(`Deleted ${code} successfully`, "danger");
        renderStockRegistry();
      }
    }
  };

  // --- Sub-panel C: Warehouse registries ---
  function renderWarehouseRegistry(searchQuery = "") {
    const whs = db.getWarehouses();
    const items = db.getItems();
    const tbody = document.getElementById("warehouse-table-body");
    tbody.innerHTML = "";
    
    let filtered = whs.filter(w => w.name.toLowerCase().includes(searchQuery) || w.code.toLowerCase().includes(searchQuery) || w.location.toLowerCase().includes(searchQuery));

    filtered.forEach(w => {
      const whSKUs = items.filter(i => i.warehouse.toLowerCase().includes(w.name.split(" ")[0].toLowerCase())).length;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${w.code}</strong></td>
        <td><strong>${w.name}</strong></td>
        <td>${w.location}</td>
        <td>${w.manager}</td>
        <td><strong>${whSKUs} SKUs</strong></td>
        <td><span class="badge ${w.status === "Active" ? "badge-approved" : "badge-cancelled"}">${w.status}</span></td>
        <td style="text-align: right;">
          <button class="action-icon-btn" title="View details"><svg viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg></button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // --- Sub-panel D: Stock Transfers registries & form wizard ---
  function renderTransfersRegistry() {
    const transfers = db.getTransfers();
    const tbody = document.getElementById("transfer-table-body");
    tbody.innerHTML = "";

    transfers.forEach(t => {
      const tr = document.createElement("tr");
      let statusClass = "badge-pending";
      if (t.status === "Completed") statusClass = "badge-completed";
      if (t.status === "In Transit") statusClass = "badge-in-transit";
      if (t.status === "Cancelled") statusClass = "badge-cancelled";

      let actionButtons = "";
      if (t.status === "Pending Approval") {
        actionButtons = `
          <button class="btn btn-secondary btn-sm" style="padding:4px 8px; font-size:11px;" onclick="handleTransferApproval('${t.code}', 'approve')">Approve</button>
          <button class="action-icon-btn delete-btn" title="Reject" onclick="handleTransferApproval('${t.code}', 'cancel')">
            <svg viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        `;
      } else if (t.status === "In Transit") {
        actionButtons = `
          <button class="btn btn-primary btn-sm" style="padding:4px 8px; font-size:11px;" onclick="handleTransferApproval('${t.code}', 'complete')">Receive</button>
          <button class="action-icon-btn delete-btn" title="Cancel Shipment" onclick="handleTransferApproval('${t.code}', 'cancel')">
            <svg viewBox="0 0 24 24"><path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
          </button>
        `;
      } else {
        actionButtons = `<span style="color:var(--text-muted); font-size:11px;">Archived</span>`;
      }

      tr.innerHTML = `
        <td><strong>${t.code}</strong></td>
        <td>${t.date}</td>
        <td>${t.fromWH}</td>
        <td>${t.toWH}</td>
        <td><span class="badge ${statusClass}">${t.status}</span></td>
        <td style="text-align: right; display:flex; justify-content:flex-end; gap:6px; align-items:center;">${actionButtons}</td>
      `;
      tbody.appendChild(tr);
    });

    initTransferWizardSelectors();
  }

  window.handleTransferApproval = (code, action) => {
    if (!checkPermission("EditStock")) return;
    
    if (action === "approve") {
      const res = db.approveTransfer(code, activeRole);
      if (res.success) {
        showToast(`Stock transfer ${code} approved and dispatched!`, "success");
      } else {
        showToast(`Approval failed: ${res.msg}`, "danger");
      }
    } else if (action === "complete") {
      const success = db.completeTransfer(code, activeRole);
      if (success) {
        showToast(`Stock transfer ${code} completed and inventory loaded!`, "success");
      }
    } else if (action === "cancel") {
      const success = db.cancelTransfer(code, activeRole);
      if (success) {
        showToast(`Transfer ${code} cancelled and stock returned.`, "warning");
      }
    }
    renderTransfersRegistry();
  };

  // Transfer Wizard steps management
  let wizardCurrentStep = 1;
  const wizardForm = document.getElementById("transfer-wizard-form");
  const wizardSteps = document.querySelectorAll(".wizard-step-content");
  const wizardNodes = document.querySelectorAll(".step-node");
  const wizardProgressBar = document.getElementById("wizard-progress");
  const wizardNextBtn = document.getElementById("wizard-next-btn");
  const wizardPrevBtn = document.getElementById("wizard-prev-btn");

  function renderWizardStep(step) {
    wizardCurrentStep = step;
    
    wizardSteps.forEach(ws => {
      if (Number(ws.getAttribute("data-step")) === step) ws.classList.add("active");
      else ws.classList.remove("active");
    });

    wizardNodes.forEach(node => {
      const nodeStep = Number(node.getAttribute("data-step"));
      node.classList.remove("active", "completed");
      if (nodeStep === step) node.classList.add("active");
      else if (nodeStep < step) node.classList.add("completed");
    });

    const pct = ((step - 1) / 2) * 100;
    wizardProgressBar.style.width = `${pct}%`;

    wizardPrevBtn.style.visibility = step === 1 ? "hidden" : "visible";
    wizardNextBtn.innerText = step === 3 ? "Submit Transfer" : "Next";
  }

  // Next click wizard
  wizardNextBtn.addEventListener("click", () => {
    if (!checkPermission("CreateTransfer")) return;

    if (wizardCurrentStep === 1) {
      const fromWHSelect = wizardForm.querySelector("[name='fromWH']");
      const toWHSelect = wizardForm.querySelector("[name='toWH']");
      const dateSelect = wizardForm.querySelector("[name='transferDate']");
      const bySelect = wizardForm.querySelector("[name='requestedBy']");
      
      let stepValid = true;
      [fromWHSelect, toWHSelect, dateSelect, bySelect].forEach(input => {
        const error = Validator.validateField(input);
        if (error) {
          Validator.showError(input, error);
          stepValid = false;
        }
      });

      if (!stepValid) return;
      
      seedTransferItemsDropdown(fromWHSelect.value);
      renderWizardStep(2);

    } else if (wizardCurrentStep === 2) {
      const rowSelects = wizardForm.querySelectorAll(".item-select");
      const rowInputs = wizardForm.querySelectorAll(".qty-input");
      let stepValid = true;
      
      if (rowSelects.length === 0) {
        showToast("Please add at least one item row to transfer.", "danger");
        return;
      }

      rowSelects.forEach((sel, idx) => {
        const input = rowInputs[idx];
        const errorSelect = Validator.validateField(sel);
        const errorInput = Validator.validateField(input);

        if (errorSelect) { Validator.showError(sel, errorSelect); stepValid = false; }
        if (errorInput) { Validator.showError(input, errorInput); stepValid = false; }

        if (!errorSelect && !errorInput) {
          const itemCode = sel.value;
          const transferQty = Number(input.value);
          const item = db.getItemByCode(itemCode);
          if (item && item.availableQty < transferQty) {
            Validator.showError(input, `Insufficient stock! Only ${item.availableQty} ${item.uom} available.`);
            stepValid = false;
          }
        }
      });

      if (!stepValid) return;

      document.getElementById("review-from").innerText = wizardForm.querySelector("[name='fromWH']").value;
      document.getElementById("review-to").innerText = wizardForm.querySelector("[name='toWH']").value;
      document.getElementById("review-date").innerText = wizardForm.querySelector("[name='transferDate']").value;
      document.getElementById("review-by").innerText = wizardForm.querySelector("[name='requestedBy']").value;

      const reviewItemsList = document.getElementById("review-items-list");
      reviewItemsList.innerHTML = "";
      rowSelects.forEach((sel, idx) => {
        const item = db.getItemByCode(sel.value);
        const qty = rowInputs[idx].value;
        reviewItemsList.innerHTML += `<li>${item.name} (${qty} ${item.uom})</li>`;
      });

      renderWizardStep(3);

    } else if (wizardCurrentStep === 3) {
      const fromWH = wizardForm.querySelector("[name='fromWH']").value;
      const toWH = wizardForm.querySelector("[name='toWH']").value;
      const date = wizardForm.querySelector("[name='transferDate']").value;
      const by = wizardForm.querySelector("[name='requestedBy']").value;
      const remarks = wizardForm.querySelector("[name='remarks']").value;
      
      const itemsList = [];
      const rowSelects = wizardForm.querySelectorAll(".item-select");
      const rowInputs = wizardForm.querySelectorAll(".qty-input");
      rowSelects.forEach((sel, idx) => {
        const item = db.getItemByCode(sel.value);
        itemsList.push({ name: item.name, qty: Number(rowInputs[idx].value) });
      });

      const res = db.addTransfer({
        date,
        fromWH,
        toWH,
        items: itemsList,
        remarks
      }, by);

      if (res.success) {
        showToast(`Stock transfer ${res.code} proposed successfully! Pending approval.`, "success");
        wizardForm.reset();
        document.getElementById("transfer-items-container").innerHTML = `
          <div class="transfer-item-row">
            <select class="form-control item-select" required><option value="">Choose item...</option></select>
            <input type="number" class="form-control qty-input" placeholder="Qty" min="1" required>
            <button type="button" class="action-icon-btn delete-btn" style="height:38px; border:1px solid var(--border-color);" onclick="removeTransferItemRow(this)">
              <svg viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        `;
        renderWizardStep(1);
        renderTransfersRegistry();
      }
    }
  });

  wizardPrevBtn.addEventListener("click", () => {
    if (wizardCurrentStep > 1) {
      renderWizardStep(wizardCurrentStep - 1);
    }
  });

  function initTransferWizardSelectors() {
    const dateInput = wizardForm.querySelector("[name='transferDate']");
    if (dateInput) {
      const today = new Date();
      dateInput.value = today.toISOString().split("T")[0];
    }
  }

  function seedTransferItemsDropdown(sourceWH) {
    const items = db.getItems().filter(i => i.warehouse === sourceWH);
    const selectOptions = `<option value="">Choose item...</option>` + 
      items.map(i => `<option value="${i.code}">${i.name} (Avail: ${i.availableQty} ${i.uom})</option>`).join("");
    
    wizardForm.querySelectorAll(".item-select").forEach(sel => {
      sel.innerHTML = selectOptions;
    });
  }

  document.getElementById("add-transfer-item-btn").addEventListener("click", () => {
    const container = document.getElementById("transfer-items-container");
    const firstRowOptions = container.querySelector(".item-select").innerHTML;

    const row = document.createElement("div");
    row.className = "transfer-item-row";
    row.innerHTML = `
      <select class="form-control item-select" required>${firstRowOptions}</select>
      <input type="number" class="form-control qty-input" placeholder="Qty" min="1" required>
      <button type="button" class="action-icon-btn delete-btn" style="height:38px; border:1px solid var(--border-color);" onclick="removeTransferItemRow(this)">
        <svg viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
      </button>
    `;
    container.appendChild(row);
  });

  window.removeTransferItemRow = (btn) => {
    const row = btn.parentNode;
    const container = document.getElementById("transfer-items-container");
    if (container.querySelectorAll(".transfer-item-row").length > 1) {
      row.remove();
    } else {
      showToast("At least one item line must remain in the transfer log.", "warning");
    }
  };

  // --- Sub-panel E: Reservations Registry ---
  function renderReservationsRegistry(searchQuery = "") {
    const reservations = db.getReservations();
    const tbody = document.getElementById("reservation-table-body");
    tbody.innerHTML = "";

    let filtered = reservations.filter(r => r.item.toLowerCase().includes(searchQuery) || r.code.toLowerCase().includes(searchQuery) || r.ref.toLowerCase().includes(searchQuery));

    filtered.forEach(r => {
      const tr = document.createElement("tr");
      let badgeClass = "badge-pending";
      if (r.status === "Active") badgeClass = "badge-approved";
      if (r.status === "Completed") badgeClass = "badge-completed";
      if (r.status === "Cancelled") badgeClass = "badge-cancelled";

      let actionHtml = "";
      if (r.status === "Pending Approval") {
        actionHtml = `
          <button class="btn btn-secondary btn-sm" style="padding:4px 8px; font-size:11px;" onclick="handleReservationApproval('${r.code}', 'approve')">Allocate</button>
          <button class="action-icon-btn delete-btn" title="Cancel" onclick="handleReservationApproval('${r.code}', 'cancel')">
            <svg viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        `;
      } else if (r.status === "Active") {
        actionHtml = `
          <button class="btn btn-danger btn-sm" style="padding:4px 8px; font-size:11px;" onclick="handleReservationApproval('${r.code}', 'cancel')">Release</button>
        `;
      } else {
        actionHtml = `<span style="color:var(--text-muted); font-size:11px;">Completed</span>`;
      }

      tr.innerHTML = `
        <td><strong>${r.code}</strong></td>
        <td>${r.date}</td>
        <td><strong>${r.item}</strong></td>
        <td><span style="font-family: monospace;">${r.ref}</span></td>
        <td>${r.warehouse}</td>
        <td><strong>${r.qty.toLocaleString()} ${r.uom}</strong></td>
        <td><span class="badge ${badgeClass}">${r.status}</span></td>
        <td style="text-align: right; display:flex; justify-content:flex-end; gap:6px; align-items:center;">${actionHtml}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  window.handleReservationApproval = (code, action) => {
    if (!checkPermission("EditStock")) return;

    if (action === "approve") {
      const res = db.approveReservation(code, activeRole);
      if (res.success) {
        showToast(`Stock allocated successfully for Reservation ${code}!`, "success");
      } else {
        showToast(`Allocation failed: ${res.msg}`, "danger");
      }
    } else if (action === "cancel") {
      db.cancelReservation(code, activeRole);
      showToast(`Reservation ${code} released/cancelled.`, "warning");
    }
    renderReservationsRegistry();
  };

  // --- Sub-panel F: Stock Movements registries ---
  function renderMovementsRegistry() {
    const movements = db.getMovements();
    const tbody = document.getElementById("movement-table-body");
    const typeFilter = document.getElementById("movement-type-filter").value;
    tbody.innerHTML = "";

    let filtered = movements.filter(m => {
      const matchType = typeFilter === "All" || m.type === typeFilter;
      return matchType;
    });

    filtered.forEach(m => {
      const tr = document.createElement("tr");
      let typeBadge = "badge-approved";
      if (m.type === "Issue") typeBadge = "badge-rejected";
      if (m.type === "Transfer") typeBadge = "badge-in-transit";
      if (m.type === "Adjustment") typeBadge = "badge-pending";

      tr.innerHTML = `
        <td>${m.date}</td>
        <td><span class="badge ${typeBadge}">${m.type}</span></td>
        <td><span style="font-family: monospace;">${m.ref}</span></td>
        <td><strong>${m.item}</strong></td>
        <td>${m.warehouse}</td>
        <td style="color: ${m.qty < 0 ? "var(--danger)" : "var(--success)"}; font-weight: 600;">
          ${m.qty > 0 ? "+" : ""}${m.qty.toLocaleString()}
        </td>
        <td>${m.uom}</td>
        <td>${m.user}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  document.getElementById("movement-type-filter").addEventListener("change", () => renderMovementsRegistry());
  document.getElementById("movement-filter-btn").addEventListener("click", () => renderMovementsRegistry());

  // --- Sub-panel G: Alerts Registry ---
  function renderAlertsRegistry() {
    const items = db.getItems();
    const tbody = document.getElementById("alerts-table-body");
    tbody.innerHTML = "";

    const alertItems = items.filter(i => i.status === "Low Stock" || i.status === "Out of Stock");

    if (alertItems.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 32px; color:var(--text-muted);">No low stock items. All thresholds satisfied.</td></tr>`;
      return;
    }

    alertItems.forEach(i => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong style="color:var(--primary);">${i.code}</strong></td>
        <td><strong>${i.name}</strong></td>
        <td>${i.warehouse}</td>
        <td style="font-weight: 700; color: var(--danger);">${i.availableQty.toLocaleString()} ${i.uom}</td>
        <td><strong>${i.reorderLevel.toLocaleString()} ${i.uom}</strong></td>
        <td><span class="badge ${i.status === "Out of Stock" ? "badge-out-of-stock" : "badge-low-stock"}">${i.status}</span></td>
        <td style="text-align: right;">
          <button class="btn btn-secondary btn-sm" style="padding:4px 8px; font-size:11px;" onclick="openAlertConfigModal('${i.code}')">Adjust Rule</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // --- 5. Allocated Item Details view ---
  function showItemDetails(itemCode) {
    activeDetailItemCode = itemCode;
    window.location.hash = "#item-details";
    switchView("item-details");

    const item = db.getItemByCode(itemCode);
    if (!item) return;

    document.getElementById("details-item-name").innerText = item.name;
    document.getElementById("details-item-code").innerText = item.code;
    document.getElementById("details-item-category").innerText = item.category;
    document.getElementById("details-item-uom").innerText = item.uom;
    document.getElementById("details-item-hsn").innerText = item.hsnCode;

    const statusBadge = document.getElementById("details-item-status");
    statusBadge.className = "badge";
    if (item.status === "In Stock") statusBadge.classList.add("badge-in-stock");
    if (item.status === "Low Stock") statusBadge.classList.add("badge-low-stock");
    if (item.status === "Out of Stock") statusBadge.classList.add("badge-out-of-stock");
    statusBadge.innerText = item.status;

    const imgContainer = document.getElementById("details-img-container");
    let svgIcon = "";
    if (item.category === "Raw Material") {
      svgIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>`;
    } else if (item.category === "Components") {
      svgIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`;
    } else {
      svgIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`;
    }
    imgContainer.innerHTML = svgIcon;

    document.getElementById("details-item-description").innerText = item.description || "No description provided.";
    const specList = document.getElementById("details-spec-list");
    specList.innerHTML = `
      <div class="spec-item"><span class="spec-lbl">Category Classification</span><span class="spec-val">${item.category}</span></div>
      <div class="spec-item"><span class="spec-lbl">Standard Lead Time</span><span class="spec-val">${item.leadTime}</span></div>
      <div class="spec-item"><span class="spec-lbl">HSN Customs Code</span><span class="spec-val">${item.hsnCode}</span></div>
      <div class="spec-item"><span class="spec-lbl">Replenishment Logic</span><span class="spec-val">${item.type} (Sourcing Type)</span></div>
    `;

    document.getElementById("details-sum-onhand").innerText = item.onHandQty.toLocaleString();
    document.getElementById("details-sum-available").innerText = item.availableQty.toLocaleString();
    document.getElementById("details-sum-reserved").innerText = item.reservedQty.toLocaleString();
    document.getElementById("details-sum-reorder").innerText = item.reorderLevel.toLocaleString();
    document.getElementById("details-sum-reorderqty").innerText = item.reorderQty.toLocaleString();
    document.getElementById("details-sum-leadtime").innerText = item.leadTime;

    const whTbody = document.getElementById("details-warehouse-tbody");
    whTbody.innerHTML = `
      <tr>
        <td><strong>${item.warehouse}</strong> (Primary)</td>
        <td><strong>${item.availableQty.toLocaleString()} ${item.uom}</strong></td>
        <td>${item.reservedQty.toLocaleString()} ${item.uom}</td>
        <td><span class="badge badge-approved">Active</span></td>
      </tr>
    `;

    const historyTbody = document.getElementById("details-history-tbody");
    historyTbody.innerHTML = "";
    const movements = db.getMovements().filter(m => m.item.toLowerCase() === item.name.toLowerCase());
    
    if (movements.length === 0) {
      historyTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:16px; color:var(--text-muted);">No transaction logs for this item.</td></tr>`;
    } else {
      movements.forEach(m => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${m.date}</td>
          <td><span class="badge ${m.type === "GRN" ? "badge-approved" : m.type === "Issue" ? "badge-rejected" : "badge-in-transit"}">${m.type}</span></td>
          <td><span style="font-family:monospace;">${m.ref}</span></td>
          <td>${m.warehouse}</td>
          <td style="color:${m.qty < 0 ? "var(--danger)" : "var(--success)"}; font-weight:600;">
            ${m.qty > 0 ? "+" : ""}${m.qty.toLocaleString()}
          </td>
          <td>${m.user}</td>
        `;
        historyTbody.appendChild(tr);
      });
    }
  }

  // Handle back button on item details
  document.getElementById("back-to-stock-btn").addEventListener("click", () => {
    switchView("inv-stock-list");
  });

  const detailTabs = document.querySelectorAll(".card-tab-btn[data-detail-tab]");
  detailTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      detailTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      
      const tabName = tab.getAttribute("data-detail-tab");
      const panels = document.querySelectorAll("#item-details .tab-panel");
      panels.forEach(p => {
        if (p.id === `detail-tab-${tabName}`) p.classList.add("active");
        else p.classList.remove("active");
      });
    });
  });

  window.showItemDetails = showItemDetails;

  // --- 6. Allocated Inventory Analytics Dashboard (SVG Charts) ---
  function renderInventoryAnalytics() {
    const items = db.getItems();

    // A. Category Distribution Chart (Donut)
    const donutContainer = document.getElementById("analytics-category-donut-container");
    if (donutContainer) {
      const categories = ["Raw Material", "Components", "Fasteners", "Electronic", "Consumables"];
      const counts = categories.map(cat => items.filter(i => i.category === cat).length);
      const total = counts.reduce((a, b) => a + b, 0) || 1;

      const circumference = 2 * Math.PI * 60;
      const colors = ["#5B6EF5", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"];
      let offset = 0;
      let svgSegments = "";
      
      categories.forEach((cat, idx) => {
        const pct = counts[idx] / total;
        if (pct > 0) {
          svgSegments += `
            <circle class="donut-segment" cx="80" cy="80" r="60" stroke="${colors[idx]}" 
                    style="stroke-dasharray: ${pct * circumference} ${circumference}; stroke-dashoffset: ${-offset};"></circle>
          `;
          offset += pct * circumference;
        }
      });

      let legendHtml = categories.map((cat, idx) => `
        <div class="legend-item">
          <div class="legend-lbl-wrap">
            <span class="legend-dot" style="background-color: ${colors[idx]};"></span>
            <span>${cat}</span>
          </div>
          <span class="legend-val">${counts[idx]} ${counts[idx] === 1 ? 'item' : 'items'} (${Math.round((counts[idx]/total)*100)}%)</span>
        </div>
      `).join("");

      donutContainer.innerHTML = `
        <svg class="donut-svg" viewBox="0 0 160 160" style="width:140px; height:140px;">
          <circle class="donut-segment" cx="80" cy="80" r="60" stroke="#E5E7EB" style="stroke-dasharray: ${circumference} ${circumference}; stroke-dashoffset: 0;"></circle>
          ${svgSegments}
        </svg>
        <div class="donut-legend">${legendHtml}</div>
      `;
    }

    // B. Valuation trends area chart
    const valuationContainer = document.getElementById("analytics-valuation-trend-container");
    if (valuationContainer) {
      const valuationHistory = [120000, 135000, 115000, 150000, 145000, 160000, 185400];
      const dates = ["Nov 25", "Dec 25", "Jan 26", "Feb 26", "Mar 26", "Apr 26", "May 26"];

      let width = valuationContainer.clientWidth || 400;
      let height = 220;
      let padding = 45;

      let maxVal = Math.max(...valuationHistory) * 1.1;
      let minVal = 0;

      let points = valuationHistory.map((val, idx) => {
        let x = padding + (idx / (valuationHistory.length - 1)) * (width - padding * 2);
        let y = height - padding - ((val - minVal) / (maxVal - minVal)) * (height - padding * 2);
        return { x, y, val, label: dates[idx] };
      });

      let pathD = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        let cpX1 = points[i-1].x + (points[i].x - points[i-1].x) / 3;
        let cpY1 = points[i-1].y;
        let cpX2 = points[i-1].x + 2 * (points[i].x - points[i-1].x) / 3;
        let cpY2 = points[i].y;
        pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
      }

      let areaD = `${pathD} L ${points[points.length-1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

      let gridLines = "";
      for (let j = 0; j <= 3; j++) {
        let y = padding + (j / 3) * (height - padding * 2);
        let gridVal = maxVal - (j / 3) * (maxVal - minVal);
        gridLines += `
          <line class="grid-line" x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}"></line>
          <text class="axis-text" x="${padding - 8}" y="${y + 4}" text-anchor="end">$${Math.round(gridVal / 1000)}k</text>
        `;
      }

      let dateLabels = points.map(p => `
        <text class="axis-text" x="${p.x}" y="${height - 10}" text-anchor="middle">${p.label}</text>
      `).join("");

      valuationContainer.innerHTML = `
        <svg class="line-chart-svg" style="width:100%;">
          <defs>
            <linearGradient id="val-area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#10B981" stop-opacity="0.3" />
              <stop offset="100%" stop-color="#10B981" stop-opacity="0.0" />
            </linearGradient>
          </defs>
          ${gridLines}
          ${dateLabels}
          <path class="line-chart-area" d="${areaD}" fill="url(#val-area-grad)"></path>
          <path class="line-chart-path" d="${pathD}" stroke="#10B981" stroke-width="3" fill="none"></path>
        </svg>
      `;
    }

    // C. Lead Time performance (Days) - Bar chart
    const leadtimeContainer = document.getElementById("analytics-leadtime-bar-container");
    if (leadtimeContainer) {
      const items = db.getItems();
      let width = leadtimeContainer.clientWidth || 400;
      let height = 220;
      let padding = 45;

      const data = items.map(i => {
        const days = parseInt(i.leadTime);
        return { name: i.name, days };
      });

      let maxDays = Math.max(...data.map(d => d.days)) * 1.1 || 15;
      
      let bars = data.map((d, idx) => {
        let x = padding + (idx / (data.length)) * (width - padding * 2) + 10;
        let barWidth = ((width - padding * 2) / data.length) - 15;
        let barHeight = (d.days / maxDays) * (height - padding * 2);
        let y = height - padding - barHeight;
        
        return `
          <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="#8B5CF6" rx="4" title="${d.days} Days"></rect>
          <text class="axis-text" x="${x + barWidth/2}" y="${height - 15}" text-anchor="middle" style="font-size: 8px;">${d.name.split(" ")[0]}</text>
          <text class="axis-text" x="${x + barWidth/2}" y="${y - 6}" text-anchor="middle" font-weight="bold">${d.days}d</text>
        `;
      }).join("");

      leadtimeContainer.innerHTML = `
        <svg class="line-chart-svg" style="width:100%;">
          <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="var(--border-color)" stroke-width="2"></line>
          ${bars}
        </svg>
      `;
    }

    // D. Warehouse efficiency levels
    const efficiencyContainer = document.getElementById("analytics-warehouse-efficiency-container");
    if (efficiencyContainer) {
      const whs = db.getWarehouses();
      const items = db.getItems();

      let linesHtml = whs.map(w => {
        const whSKUs = items.filter(i => i.warehouse.toLowerCase().includes(w.name.split(" ")[0].toLowerCase())).length;
        const capacityPct = Math.min(100, Math.round((whSKUs / 10) * 100));

        let progressColor = "var(--primary)";
        if (capacityPct > 80) progressColor = "var(--danger)";
        else if (capacityPct > 50) progressColor = "var(--warning)";

        return `
          <div style="margin-bottom: 12px;">
            <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
              <strong>${w.name}</strong>
              <span>${capacityPct}% Storage Utilized</span>
            </div>
            <div style="height:8px; width:100%; background-color:var(--border-color); border-radius:4px; overflow:hidden;">
              <div style="height:100%; width:${capacityPct}%; background-color:${progressColor}; border-radius:4px;"></div>
            </div>
          </div>
        `;
      }).join("");

      efficiencyContainer.innerHTML = `<div style="display:flex; flex-direction:column; width:100%; padding-top:16px;">${linesHtml}</div>`;
    }
  }

  // --- 7. Allocated Inventory Reports ---
  document.getElementById("btn-generate-report").addEventListener("click", () => {
    const reportType = document.getElementById("report-type-select").value;
    const warehouse = document.getElementById("report-wh-select").value;
    const previewPanel = document.getElementById("report-preview-panel");
    const previewTitle = document.getElementById("report-preview-title");
    const previewContent = document.getElementById("report-preview-content");

    previewPanel.style.display = "block";
    previewTitle.innerText = `${reportType} - Generating...`;
    previewContent.innerHTML = `
      <div style="text-align:center; padding: 40px; color:var(--text-muted);">
        <svg viewBox="0 0 100 100" style="width: 48px; height: 48px; fill: none; stroke: var(--primary); stroke-width: 6; stroke-linecap: round; animation: rotate 1s linear infinite; margin-bottom:12px;">
          <circle cx="50" cy="50" r="40" stroke-dasharray="160 100" />
        </svg>
        <p>Assembling inventory ledger details and querying databases...</p>
      </div>
      <style>
        @keyframes rotate { to { transform: rotate(360deg); } }
      </style>
    `;
    
    previewPanel.scrollIntoView({ behavior: "smooth" });

    setTimeout(() => {
      previewTitle.innerText = `${reportType} (${warehouse})`;
      const items = db.getItems();
      let tableRows = "";
      
      if (reportType === "Stock Valuation Report") {
        let totalVal = 0;
        let filtered = items.filter(i => warehouse === "All" || i.warehouse === warehouse);
        
        filtered.forEach(i => {
          const valMultiplier = i.category === "Electronic" ? 150 : i.category === "Components" ? 45 : 12;
          const val = i.availableQty * valMultiplier;
          totalVal += val;
          tableRows += `
            <tr>
              <td><strong>${i.code}</strong></td>
              <td>${i.name}</td>
              <td>${i.warehouse}</td>
              <td>${i.availableQty.toLocaleString()} ${i.uom}</td>
              <td>$${valMultiplier}</td>
              <td><strong>${formatCurrency(val)}</strong></td>
            </tr>
          `;
        });
        
        previewContent.innerHTML = `
          <table class="enterprise-table" style="font-size:12px;">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Item Name</th>
                <th>Warehouse</th>
                <th>Qty</th>
                <th>Cost Price</th>
                <th>Valuation</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
              <tr style="background-color:rgba(91,110,245,0.08); font-weight:bold;">
                <td colspan="5" style="text-align:right;">Total Inventory Valuation:</td>
                <td>${formatCurrency(totalVal)}</td>
              </tr>
            </tbody>
          </table>
        `;
      } else if (reportType === "Low Stock Report") {
        let filtered = items.filter(i => (warehouse === "All" || i.warehouse === warehouse) && (i.status === "Low Stock" || i.status === "Out of Stock"));
        
        if (filtered.length === 0) {
          previewContent.innerHTML = `<div style="text-align:center; padding: 24px; color:var(--success); font-weight:600;">No low stock alerts in selected warehouse.</div>`;
          return;
        }

        filtered.forEach(i => {
          tableRows += `
            <tr>
              <td><strong>${i.code}</strong></td>
              <td>${i.name}</td>
              <td>${i.warehouse}</td>
              <td style="color:var(--danger); font-weight:bold;">${i.availableQty.toLocaleString()}</td>
              <td>${i.reorderLevel.toLocaleString()}</td>
              <td>${i.leadTime}</td>
            </tr>
          `;
        });

        previewContent.innerHTML = `
          <table class="enterprise-table" style="font-size:12px;">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Item Name</th>
                <th>Warehouse</th>
                <th>Available</th>
                <th>Reorder Threshold</th>
                <th>Lead Time</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        `;
      } else {
        let filtered = items.filter(i => warehouse === "All" || i.warehouse === warehouse);
        filtered.forEach(i => {
          tableRows += `
            <tr>
              <td><strong>${i.code}</strong></td>
              <td>${i.name}</td>
              <td>${i.category}</td>
              <td>${i.warehouse}</td>
              <td>${i.availableQty.toLocaleString()} ${i.uom}</td>
              <td>${i.status}</td>
            </tr>
          `;
        });
        
        previewContent.innerHTML = `
          <table class="enterprise-table" style="font-size:12px;">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Item Name</th>
                <th>Category</th>
                <th>Warehouse</th>
                <th>Available Qty</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        `;
      }

      db.logAudit(activeRole, "Report Generated", `Generated report type "${reportType}" for ${warehouse}.`);
    }, 1200);
  });

  window.triggerReportDownload = (reportName) => {
    showToast(`Preparing download package for ${reportName}...`, "warning");
    setTimeout(() => {
      const csvContent = "data:text/csv;charset=utf-8," 
        + ["Item Code,Item Name,Warehouse,Available Quantity,Status"].join(",") + "\n"
        + db.getItems().map(i => `${i.code},"${i.name}","${i.warehouse}",${i.availableQty},${i.status}`).join("\n");
      triggerDownload(csvContent, `${reportName.replace(/\s+/g, "_")}.csv`);
    }, 1000);
  };

  document.getElementById("btn-export-pdf").addEventListener("click", () => {
    window.print();
  });

  // --- 8. Audit Logs View ---
  function renderAuditLogs() {
    const audits = db.getAudits();
    const container = document.getElementById("audit-list-container");
    container.innerHTML = "";

    audits.forEach(a => {
      const item = document.createElement("div");
      item.className = "audit-item";
      item.innerHTML = `
        <div class="audit-meta-line">
          <span>User: <strong>${a.user}</strong></span>
          <span>${a.timestamp}</span>
        </div>
        <div class="audit-action">${a.action}</div>
        <div class="audit-detail">${a.detail}</div>
      `;
      container.appendChild(item);
    });
  }

  document.getElementById("clear-audit-btn").addEventListener("click", () => {
    if (confirm("Clear all simulated audit records?")) {
      db.saveAudits([]);
      renderAuditLogs();
      showToast("Activity audit trails wiped clean.", "warning");
    }
  });

  // =================================================================
  // ===================== MODALS MANAGEMENT =========================
  // =================================================================

  const overlays = document.querySelectorAll(".modal-overlay");
  const cancelBtns = document.querySelectorAll(".modal-cancel-btn, .modal-close-btn");

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("active");
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("active");
    }
  }

  cancelBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const overlay = btn.closest(".modal-overlay");
      if (overlay) {
        overlay.classList.remove("active");
      }
    });
  });

  // A. Add Item Modal Trigger
  const btnAddItemModal = document.getElementById("btn-add-item-modal");
  const itemForm = document.getElementById("item-form");

  if (btnAddItemModal) {
    btnAddItemModal.addEventListener("click", () => {
      if (!checkPermission("EditStock")) return;
      itemForm.reset();
      itemForm.querySelector("[name='isEdit']").value = "false";
      itemForm.querySelector("[name='itemCode']").readOnly = false;
      document.getElementById("item-modal-title").innerText = "Register New Stock Item";
      openModal("modal-item");
    });
  }

  itemForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!checkPermission("EditStock")) return;

    if (!Validator.validateForm(itemForm)) {
      showToast("Validation failed. Please correct form entries.", "danger");
      return;
    }

    const isEdit = itemForm.querySelector("[name='isEdit']").value === "true";
    const itemData = {
      code: itemForm.querySelector("[name='itemCode']").value.trim(),
      name: itemForm.querySelector("[name='itemName']").value.trim(),
      category: itemForm.querySelector("[name='category']").value,
      uom: itemForm.querySelector("[name='uom']").value,
      warehouse: itemForm.querySelector("[name='warehouse']").value,
      availableQty: Number(itemForm.querySelector("[name='availableQty']").value),
      reorderLevel: Number(itemForm.querySelector("[name='reorderLevel']").value),
      reorderQty: Number(itemForm.querySelector("[name='reorderQty']").value),
      leadTime: itemForm.querySelector("[name='leadTime']").value.trim(),
      hsnCode: itemForm.querySelector("[name='hsnCode']").value.trim(),
      type: itemForm.querySelector("[name='type']").value,
      description: itemForm.querySelector("[name='description']").value.trim()
    };

    if (isEdit) {
      db.updateItem(itemData, activeRole);
      showToast(`Item details for ${itemData.code} updated!`);
      if (activeView === "item-details" && activeDetailItemCode === itemData.code) {
        showItemDetails(itemData.code);
      }
    } else {
      const res = db.addItem(itemData, activeRole);
      if (res.success) {
        showToast(`Registered SKU code ${itemData.code} successfully!`);
      } else {
        showToast(`Registration failed: ${res.msg}`, "danger");
        return;
      }
    }

    closeModal("modal-item");
    renderStockRegistry();
  });

  window.openEditItemModal = (code) => {
    if (!checkPermission("EditStock")) return;
    const item = db.getItemByCode(code);
    if (!item) return;

    itemForm.reset();
    itemForm.querySelector("[name='isEdit']").value = "true";
    
    const codeInput = itemForm.querySelector("[name='itemCode']");
    codeInput.value = item.code;
    codeInput.readOnly = true;

    itemForm.querySelector("[name='itemName']").value = item.name;
    itemForm.querySelector("[name='category']").value = item.category;
    itemForm.querySelector("[name='uom']").value = item.uom;
    itemForm.querySelector("[name='warehouse']").value = item.warehouse;
    itemForm.querySelector("[name='availableQty']").value = item.availableQty;
    itemForm.querySelector("[name='reorderLevel']").value = item.reorderLevel;
    itemForm.querySelector("[name='reorderQty']").value = item.reorderQty;
    itemForm.querySelector("[name='leadTime']").value = item.leadTime;
    itemForm.querySelector("[name='hsnCode']").value = item.hsnCode;
    itemForm.querySelector("[name='type']").value = item.type;
    itemForm.querySelector("[name='description']").value = item.description || "";

    document.getElementById("item-modal-title").innerText = `Edit Item: ${code}`;
    openModal("modal-item");
  };

  document.getElementById("edit-item-details-btn").addEventListener("click", () => {
    if (activeDetailItemCode) {
      window.openEditItemModal(activeDetailItemCode);
    }
  });

  // B. Verify Stock Modal
  let verifyTargetCode = null;
  const verifyForm = document.getElementById("verify-form");

  window.openVerifyModal = (code) => {
    if (!checkPermission("VerifyStock")) return;
    verifyTargetCode = code;
    const item = db.getItemByCode(code);
    if (!item) return;

    verifyForm.reset();
    verifyForm.querySelector("[name='verifiedQty']").value = item.availableQty;
    verifyForm.querySelector("[name='damageLogged']").value = 0;
    
    openModal("modal-verify");
  };

  document.getElementById("verify-stock-btn").addEventListener("click", () => {
    if (activeDetailItemCode) {
      window.openVerifyModal(activeDetailItemCode);
    }
  });

  verifyForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!checkPermission("VerifyStock") || !verifyTargetCode) return;

    if (!Validator.validateForm(verifyForm)) {
      showToast("Validation failed. Please correct details.", "danger");
      return;
    }

    const verifiedQty = Number(verifyForm.querySelector("[name='verifiedQty']").value);
    const qualityStatus = verifyForm.querySelector("[name='qualityStatus']").value;
    const damageLogged = Number(verifyForm.querySelector("[name='damageLogged']").value);
    const notes = verifyForm.querySelector("[name='notes']").value.trim();

    if (damageLogged > verifiedQty) {
      showToast("Damage quantity cannot exceed total verified quantity.", "danger");
      return;
    }

    if ((qualityStatus === "Fail" || damageLogged > 0) && notes.length < 5) {
      showToast("Detailed notes required for failed quality or damages logs.", "danger");
      return;
    }

    const success = db.verifyStock(verifyTargetCode, verifiedQty, qualityStatus, damageLogged, notes, activeRole);
    if (success) {
      showToast(`Verification logs filed for SKU ${verifyTargetCode}!`, "success");
      closeModal("modal-verify");
      
      if (activeView === "item-details") showItemDetails(verifyTargetCode);
      if (activeView === "inv-stock-list") renderStockRegistry();
    }
  });

  // C. Create Warehouse modal
  const btnAddWHModal = document.getElementById("btn-add-wh-modal");
  const warehouseForm = document.getElementById("warehouse-form");

  if (btnAddWHModal) {
    btnAddWHModal.addEventListener("click", () => {
      if (!checkPermission("EditStock")) return;
      warehouseForm.reset();
      openModal("modal-warehouse");
    });
  }

  warehouseForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!checkPermission("EditStock")) return;

    if (!Validator.validateForm(warehouseForm)) return;

    const whData = {
      code: warehouseForm.querySelector("[name='warehouseCode']").value.trim(),
      name: warehouseForm.querySelector("[name='warehouseName']").value.trim(),
      location: warehouseForm.querySelector("[name='location']").value.trim(),
      manager: warehouseForm.querySelector("[name='manager']").value.trim(),
      status: warehouseForm.querySelector("[name='status']").value
    };

    const res = db.addWarehouse(whData, activeRole);
    if (res.success) {
      showToast(`Warehouse ${whData.code} created!`);
      closeModal("modal-warehouse");
      renderWarehouseRegistry();
    } else {
      showToast(res.msg, "danger");
    }
  });

  // D. Create Reservation modal
  const btnAddResModal = document.getElementById("btn-add-res-modal");
  const resForm = document.getElementById("reservation-form");
  const resItemSelect = document.getElementById("res-item-select");
  const resWHSelect = document.getElementById("res-wh-select");
  const resAvailabilityTip = document.getElementById("res-availability-tip");

  if (btnAddResModal) {
    btnAddResModal.addEventListener("click", () => {
      if (!checkPermission("CreateReservation")) return;
      resForm.reset();
      
      const items = db.getItems();
      const uniqueNames = [...new Set(items.map(i => i.name))];
      resItemSelect.innerHTML = `<option value="">Choose item...</option>` + 
        uniqueNames.map(name => `<option value="${name}">${name}</option>`).join("");
      
      resWHSelect.innerHTML = `<option value="">Choose item first</option>`;
      resAvailabilityTip.innerText = "";
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      resForm.querySelector("[name='date']").value = tomorrow.toISOString().split("T")[0];

      openModal("modal-reservation");
    });
  }

  resItemSelect.addEventListener("change", () => {
    const itemName = resItemSelect.value;
    if (!itemName) {
      resWHSelect.innerHTML = `<option value="">Choose item first</option>`;
      resAvailabilityTip.innerText = "";
      return;
    }

    const matching = db.getItems().filter(i => i.name === itemName);
    resWHSelect.innerHTML = matching.map(i => `<option value="${i.warehouse}">${i.warehouse} (Avail: ${i.availableQty} ${i.uom})</option>`).join("");
    
    const selectedItem = matching[0];
    resAvailabilityTip.innerText = `Maximum stock allocation: ${selectedItem.availableQty} ${selectedItem.uom}`;
  });

  resForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!checkPermission("CreateReservation")) return;

    if (!Validator.validateForm(resForm)) return;

    const resData = {
      date: resForm.querySelector("[name='date']").value,
      item: resItemSelect.value,
      ref: resForm.querySelector("[name='ref']").value.trim(),
      warehouse: resWHSelect.value,
      qty: Number(resForm.querySelector("[name='qty']").value)
    };

    const resResult = db.addReservation(resData, activeRole);
    if (resResult.success) {
      showToast(`Reservation proposed: ${resResult.code}! Pending allocation approval.`, "success");
      closeModal("modal-reservation");
      renderReservationsRegistry();
    } else {
      showToast(resResult.msg, "danger");
    }
  });

  // E. Configure Alert Rules Modal
  const btnAlertRuleModal = document.getElementById("btn-alert-rule-modal");
  const alertRuleForm = document.getElementById("alert-rule-form");
  const alertItemSelect = document.getElementById("alert-item-select");

  if (btnAlertRuleModal) {
    btnAlertRuleModal.addEventListener("click", () => {
      if (!checkPermission("EditStock")) return;
      alertRuleForm.reset();

      const items = db.getItems();
      alertItemSelect.innerHTML = `<option value="">Choose item...</option>` + 
        items.map(i => `<option value="${i.code}">${i.code} - ${i.name} (${i.warehouse})</option>`).join("");

      openModal("modal-alert-rule");
    });
  }

  window.openAlertConfigModal = (code) => {
    if (!checkPermission("EditStock")) return;
    const item = db.getItemByCode(code);
    if (!item) return;

    alertRuleForm.reset();
    alertItemSelect.innerHTML = `<option value="${item.code}">${item.code} - ${item.name} (${item.warehouse})</option>`;
    alertItemSelect.value = item.code;
    
    alertRuleForm.querySelector("[name='reorderLevel']").value = item.reorderLevel;
    alertRuleForm.querySelector("[name='reorderQty']").value = item.reorderQty;
    
    openModal("modal-alert-rule");
  };

  alertRuleForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!checkPermission("EditStock")) return;

    if (!Validator.validateForm(alertRuleForm)) return;

    const itemCode = alertItemSelect.value;
    const level = Number(alertRuleForm.querySelector("[name='reorderLevel']").value);
    const qty = Number(alertRuleForm.querySelector("[name='reorderQty']").value);

    const item = db.getItemByCode(itemCode);
    if (item) {
      item.reorderLevel = level;
      item.reorderQty = qty;
      db.updateItem(item, activeRole);
      showToast(`Low stock alert rules for ${item.code} updated!`, "success");
      closeModal("modal-alert-rule");
      renderAlertsRegistry();
    }
  });

  // Setup validation listeners for forms
  Validator.setupRealtimeValidation(itemForm);
  Validator.setupRealtimeValidation(verifyForm);
  Validator.setupRealtimeValidation(warehouseForm);
  Validator.setupRealtimeValidation(resForm);
  Validator.setupRealtimeValidation(alertRuleForm);
  Validator.setupRealtimeValidation(wizardForm);

  // Initial runs
  switchView(activeView);
});
