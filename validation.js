// ProcureSys Inventory Module - Universal Input Validation Engine

const Validator = {
  // Check if input value matches pattern and returns error message or null
  validateField(input) {
    const value = input.value.trim();
    const name = input.getAttribute("name");
    
    // Clear previous error state
    input.classList.remove("input-error", "input-success");
    const existingError = input.parentNode.querySelector(".error-feedback");
    if (existingError) {
      existingError.remove();
    }

    if (input.hasAttribute("required") && !value) {
      return "This field is required.";
    }

    // Custom rules based on name or input data attributes
    if (value) {
      switch (name) {
        case "itemCode":
          if (!/^ITM-\d{4}$/.test(value)) {
            return "Item Code must follow the pattern ITM-XXXX (e.g., ITM-0002).";
          }
          break;
        case "warehouseCode":
          if (!/^WH-\d{3}$/.test(value)) {
            return "Warehouse Code must follow the pattern WH-XXX (e.g., WH-001).";
          }
          break;
        case "hsnCode":
          if (!/^\d{4,8}$/.test(value)) {
            return "HSN Code must be a number containing between 4 and 8 digits.";
          }
          break;
        case "itemName":
        case "warehouseName":
        case "requestedBy":
        case "manager":
          if (value.length < 3) {
            return `${input.placeholder || "Field"} must be at least 3 characters.`;
          }
          break;
        case "availableQty":
        case "verifiedQty":
        case "damageLogged":
        case "reorderLevel":
          const numVal = Number(value);
          if (isNaN(numVal) || numVal < 0) {
            return "Quantity must be a positive number or zero.";
          }
          break;
        case "reorderQty":
        case "qty":
          const positiveVal = Number(value);
          if (isNaN(positiveVal) || positiveVal <= 0) {
            return "Quantity must be greater than zero.";
          }
          break;
        case "leadTime":
          if (!/^\d+\s+(Days|Weeks|Months)$/i.test(value)) {
            return "Enter a valid lead time format (e.g., '5 Days', '2 Weeks').";
          }
          break;
        case "toWH":
          const fromWHSelect = input.form.querySelector("[name='fromWH']");
          if (fromWHSelect && fromWHSelect.value === value) {
            return "Destination warehouse cannot be the same as source warehouse.";
          }
          break;
      }
    }

    // Add success styling if valid
    if (value) {
      input.classList.add("input-success");
    }
    return null;
  },

  // Show inline error bubble
  showError(input, message) {
    input.classList.add("input-error");
    input.classList.remove("input-success");
    
    // Check if error bubble already exists
    let errorDiv = input.parentNode.querySelector(".error-feedback");
    if (!errorDiv) {
      errorDiv = document.createElement("div");
      errorDiv.className = "error-feedback";
      input.parentNode.appendChild(errorDiv);
    }
    errorDiv.innerText = message;
    
    // Add visual shake to field to draw attention
    input.classList.add("shake-animation");
    setTimeout(() => {
      input.classList.remove("shake-animation");
    }, 400);
  },

  // Hook validation to all fields inside a form
  setupRealtimeValidation(form) {
    const inputs = form.querySelectorAll("input, select, textarea");
    inputs.forEach(input => {
      // Validate on focusout or change
      const handler = () => {
        const error = this.validateField(input);
        if (error) {
          this.showError(input, error);
        }
      };
      
      input.addEventListener("blur", handler);
      input.addEventListener("change", handler);
      
      // Clean up error state immediately when typing starts
      input.addEventListener("input", () => {
        input.classList.remove("input-error");
        const existingError = input.parentNode.querySelector(".error-feedback");
        if (existingError) {
          existingError.remove();
        }
      });
    });
  },

  // Full validation check before submission
  validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll("input, select, textarea");
    
    inputs.forEach(input => {
      const error = this.validateField(input);
      if (error) {
        this.showError(input, error);
        isValid = false;
      }
    });

    return isValid;
  }
};

window.Validator = Validator;
