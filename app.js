const rackOptions = [12, 24, 42];

const deviceTypes = [
  "Server",
  "Switch",
  "Firewall",
  "NAS",
  "UPS",
  "PDU",
  "Patch Panel",
  "Router"
];

const cableTypes = ["LAN", "Power", "Fiber", "Console"];
const weightClasses = ["light", "medium", "heavy"];

const deviceTemplates = [
  {
    id: crypto.randomUUID(),
    name: "미니PC 서버",
    type: "Server",
    height: 1,
    power: 65,
    cost: 650000,
    weight: "light",
    cableType: "LAN",
    networkRequired: true,
    powerRequired: true,
    networkTarget: "",
    powerTarget: "",
    actsAsNetworkCore: false,
    actsAsPowerSource: false,
    heatFactor: 1,
    topU: null
  },
  {
    id: crypto.randomUUID(),
    name: "24포트 스위치",
    type: "Switch",
    height: 1,
    power: 30,
    cost: 250000,
    weight: "light",
    cableType: "LAN",
    networkRequired: true,
    powerRequired: true,
    networkTarget: "",
    powerTarget: "",
    actsAsNetworkCore: true,
    actsAsPowerSource: false,
    heatFactor: 1,
    topU: null
  },
  {
    id: crypto.randomUUID(),
    name: "8Bay NAS",
    type: "NAS",
    height: 2,
    power: 80,
    cost: 1800000,
    weight: "medium",
    cableType: "LAN",
    networkRequired: true,
    powerRequired: true,
    networkTarget: "",
    powerTarget: "",
    actsAsNetworkCore: false,
    actsAsPowerSource: false,
    heatFactor: 1.25,
    topU: null
  },
  {
    id: crypto.randomUUID(),
    name: "1500VA UPS",
    type: "UPS",
    height: 2,
    power: 20,
    cost: 420000,
    weight: "heavy",
    cableType: "Power",
    networkRequired: false,
    powerRequired: true,
    networkTarget: "",
    powerTarget: "",
    actsAsNetworkCore: false,
    actsAsPowerSource: true,
    heatFactor: 1.15,
    capacityW: 900,
    batteryWh: 900,
    topU: null
  },
  {
    id: crypto.randomUUID(),
    name: "GPU 서버",
    type: "Server",
    height: 4,
    power: 800,
    cost: 6500000,
    weight: "heavy",
    cableType: "LAN",
    networkRequired: true,
    powerRequired: true,
    networkTarget: "",
    powerTarget: "",
    actsAsNetworkCore: false,
    actsAsPowerSource: false,
    heatFactor: 1.8,
    topU: null
  },
  {
    id: crypto.randomUUID(),
    name: "라우터",
    type: "Router",
    height: 1,
    power: 18,
    cost: 190000,
    weight: "light",
    cableType: "LAN",
    networkRequired: false,
    powerRequired: true,
    networkTarget: "",
    powerTarget: "",
    actsAsNetworkCore: true,
    actsAsPowerSource: false,
    heatFactor: 0.85,
    topU: null
  },
  {
    id: crypto.randomUUID(),
    name: "PDU",
    type: "PDU",
    height: 1,
    power: 10,
    cost: 120000,
    weight: "medium",
    cableType: "Power",
    networkRequired: false,
    powerRequired: true,
    networkTarget: "",
    powerTarget: "",
    actsAsNetworkCore: false,
    actsAsPowerSource: true,
    heatFactor: 0.7,
    capacityW: 2400,
    topU: null
  }
];

const state = {
  rackSize: 24,
  devices: structuredClone(deviceTemplates),
  selectedDeviceId: null,
  draggingDeviceId: null,
  electricityRatePerKwh: 130,
  internetSourceType: "Router"
};

const elements = {
  rackSizeSelect: document.querySelector("#rack-size-select"),
  inventoryList: document.querySelector("#inventory-list"),
  rackGrid: document.querySelector("#rack-grid"),
  cableMap: document.querySelector("#cable-map"),
  rackWarning: document.querySelector("#rack-warning"),
  metricsCards: document.querySelector("#metrics-cards"),
  placementAdvice: document.querySelector("#placement-advice"),
  connectivityWarnings: document.querySelector("#connectivity-warnings"),
  deviceForm: document.querySelector("#device-form"),
  deviceFormEmpty: document.querySelector("#device-form-empty"),
  deviceFormFields: document.querySelector("#device-form-fields"),
  uploadInput: document.querySelector("#upload-input"),
  downloadButton: document.querySelector("#download-button"),
  resetLayoutButton: document.querySelector("#reset-layout-button"),
  duplicateDeviceButton: document.querySelector("#duplicate-device-button"),
  removeDeviceButton: document.querySelector("#remove-device-button"),
  inventoryTemplate: document.querySelector("#inventory-item-template"),
  form: {
    name: document.querySelector("#device-name"),
    type: document.querySelector("#device-type"),
    height: document.querySelector("#device-height"),
    power: document.querySelector("#device-power"),
    cost: document.querySelector("#device-cost"),
    weight: document.querySelector("#device-weight"),
    cableType: document.querySelector("#device-cable"),
    networkRequired: document.querySelector("#device-network-required"),
    powerRequired: document.querySelector("#device-power-required"),
    networkTarget: document.querySelector("#device-network-target"),
    powerTarget: document.querySelector("#device-power-target"),
    actsAsNetworkCore: document.querySelector("#device-acts-network-core"),
    actsAsPowerSource: document.querySelector("#device-acts-power-source")
  }
};

function initialize() {
  populateSelect(elements.rackSizeSelect, rackOptions.map((value) => ({ value, label: `${value}U Rack` })));
  populateSelect(elements.form.type, deviceTypes.map((value) => ({ value, label: value })));
  populateSelect(elements.form.weight, weightClasses.map((value) => ({ value, label: value })));
  populateSelect(elements.form.cableType, cableTypes.map((value) => ({ value, label: value })));

  elements.rackSizeSelect.value = String(state.rackSize);
  elements.rackSizeSelect.addEventListener("change", onRackSizeChange);
  elements.deviceForm.addEventListener("submit", onDeviceSave);
  elements.downloadButton.addEventListener("click", onDownloadLayout);
  elements.uploadInput.addEventListener("change", onUploadLayout);
  elements.resetLayoutButton.addEventListener("click", onResetLayout);
  elements.duplicateDeviceButton.addEventListener("click", onDuplicateDevice);
  elements.removeDeviceButton.addEventListener("click", onRemoveDevice);

  render();
}

function populateSelect(element, options, includeBlank = false) {
  const normalized = includeBlank ? [{ value: "", label: "선택 안 함" }, ...options] : options;
  element.innerHTML = normalized
    .map((option) => `<option value="${option.value}">${option.label}</option>`)
    .join("");
}

function render() {
  renderInventory();
  renderRack();
  renderMetrics();
  renderDeviceForm();
  renderCableMap();
}

function renderInventory() {
  elements.inventoryList.innerHTML = "";

  state.devices.forEach((device) => {
    const fragment = elements.inventoryTemplate.content.cloneNode(true);
    const item = fragment.querySelector(".inventory-item");
    const title = fragment.querySelector("h3");
    const meta = fragment.querySelector(".inventory-meta");
    const selectButton = fragment.querySelector("button");
    const isSelected = device.id === state.selectedDeviceId;

    title.textContent = device.name;
    meta.textContent = `${device.type} · ${device.height}U · ${device.power}W${device.topU ? ` · Rack U${device.topU}` : " · 미배치"}`;
    item.dataset.deviceId = device.id;
    item.classList.toggle("selected", isSelected);

    item.addEventListener("dragstart", (event) => {
      state.draggingDeviceId = device.id;
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", device.id);
      }
    });

    item.addEventListener("dragend", () => {
      state.draggingDeviceId = null;
      renderRack();
    });

    item.addEventListener("click", () => selectDevice(device.id));
    selectButton.addEventListener("click", (event) => {
      event.stopPropagation();
      selectDevice(device.id);
    });

    elements.inventoryList.appendChild(fragment);
  });
}

function renderRack() {
  elements.rackGrid.innerHTML = "";

  for (let topU = state.rackSize; topU >= 1; topU -= 1) {
    const occupant = getDeviceStartingAt(topU);
    const coveringDevice = getDeviceCovering(topU);
    const slot = document.createElement("div");
    const hotZone = coveringDevice && isHotDevice(coveringDevice);
    const isAnchor = occupant !== null;

    slot.className = `rack-slot ${coveringDevice ? "occupied-slot" : "empty-slot"}${hotZone ? " hot-zone" : ""}`;
    slot.dataset.topU = String(topU);
    slot.innerHTML = isAnchor
      ? `
        <span class="slot-index">U${topU}</span>
        <div>
          <div class="slot-name">${occupant.name}</div>
          <div class="inventory-meta">${occupant.type} · ${occupant.height}U · ${occupant.power}W</div>
        </div>
        <div class="slot-actions">
          <span class="slot-chip">${occupant.weight}</span>
        </div>
      `
      : `
        <span class="slot-index">U${topU}</span>
        <div>
          <div class="slot-name">${coveringDevice ? `${coveringDevice.name} 연장 구간` : "빈 공간"}</div>
          <div class="inventory-meta">${coveringDevice ? `${coveringDevice.height}U 장비의 점유 영역` : "장비를 여기로 드롭하거나 선택 후 클릭"}</div>
        </div>
        <div>${coveringDevice ? `<span class="slot-chip">in use</span>` : ""}</div>
      `;

    slot.addEventListener("click", () => {
      if (occupant) {
        selectDevice(occupant.id);
        return;
      }

      if (coveringDevice) {
        selectDevice(coveringDevice.id);
        return;
      }

      const selected = getSelectedDevice();
      if (selected && placeDevice(selected.id, topU)) {
        render();
      }
    });

    slot.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (canPlaceDevice(state.draggingDeviceId, topU)) {
        slot.classList.add("drop-target");
      }
    });

    slot.addEventListener("dragleave", () => {
      slot.classList.remove("drop-target");
    });

    slot.addEventListener("drop", (event) => {
      event.preventDefault();
      slot.classList.remove("drop-target");
      const droppedDeviceId = state.draggingDeviceId || event.dataTransfer?.getData("text/plain");
      if (!droppedDeviceId) {
        return;
      }

      const placed = placeDevice(droppedDeviceId, topU);
      if (placed) {
        selectDevice(droppedDeviceId);
      }
      state.draggingDeviceId = null;
      render();
    });

    elements.rackGrid.appendChild(slot);
  }

  const warnings = getPlacementWarnings();
  elements.rackWarning.innerHTML = warnings.length
    ? `<span class="pill warning">주의</span> ${warnings[0]}`
    : `<span class="pill normal">정상</span> 현재 배치는 랙 크기 제한 내에서 동작합니다.`;
}

function renderMetrics() {
  const summary = calculateSummary();

  elements.metricsCards.innerHTML = [
    {
      label: "총 소비전력",
      value: `${summary.totalPower}W`,
      tone: summary.totalPower > summary.powerCapacity ? "danger" : summary.totalPower > summary.powerCapacity * 0.8 ? "warning" : "normal",
      detail: `PDU 허용량 ${summary.powerCapacity}W`
    },
    {
      label: "월 예상 전기요금",
      value: `${summary.monthlyCost.toLocaleString("ko-KR")}원`,
      tone: summary.monthlyCost > 150000 ? "warning" : "normal",
      detail: `kWh 단가 ${state.electricityRatePerKwh}원 가정`
    },
    {
      label: "발열 상태",
      value: summary.heatStatus.label,
      tone: summary.heatStatus.tone,
      detail: `${summary.totalHeatBtu.toFixed(0)} BTU/h`
    },
    {
      label: "남은 U 공간",
      value: `${summary.remainingU}U`,
      tone: summary.remainingU <= 2 ? "warning" : "normal",
      detail: `총 ${state.rackSize}U 중 ${summary.usedU}U 사용`
    },
    {
      label: "UPS 예상 런타임",
      value: summary.upsRuntimeMinutes ? `${summary.upsRuntimeMinutes}분` : "미산정",
      tone: summary.upsRuntimeMinutes !== null && summary.upsRuntimeMinutes < 15 ? "danger" : "normal",
      detail: summary.upsLoadText
    },
    {
      label: "예산 합계",
      value: `${summary.totalCost.toLocaleString("ko-KR")}원`,
      tone: summary.totalCost > 3000000 ? "warning" : "normal",
      detail: `장비 ${summary.placedDevices.length}대 배치`
    }
  ]
    .map((metric) => `
      <article class="metric-card">
        <span>${metric.label}</span>
        <strong>${metric.value}</strong>
        <div class="metric-tone ${metric.tone}">${metric.detail}</div>
      </article>
    `)
    .join("");

  renderList(elements.placementAdvice, summary.placementAdvice, "현재 배치는 기본 권장 조건을 만족합니다.");
  renderList(elements.connectivityWarnings, summary.connectivityWarnings, "네트워크/전원 연결 경고가 없습니다.");
}

function renderCableMap() {
  const placedDevices = getPlacedDevices();
  const width = 760;
  const height = 220;

  if (!placedDevices.length) {
    elements.cableMap.innerHTML = `
      <text x="24" y="40" class="cable-node-label">배치된 장비가 없습니다.</text>
      <text x="24" y="62" class="cable-node-meta">장비를 랙에 배치하면 네트워크/전원 연결선이 여기에 표시됩니다.</text>
    `;
    return;
  }

  const sortedDevices = [...placedDevices].sort((left, right) => getCableOrder(left) - getCableOrder(right));
  const columns = Math.min(4, sortedDevices.length);
  const rows = Math.ceil(sortedDevices.length / columns);
  const xGap = width / (columns + 1);
  const yGap = height / (rows + 1);
  const nodeWidth = 140;
  const nodeHeight = 42;
  const positions = new Map();

  sortedDevices.forEach((device, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const centerX = xGap * (column + 1);
    const centerY = yGap * (row + 1);
    positions.set(device.id, { x: centerX, y: centerY });
  });

  const links = [];
  sortedDevices.forEach((device) => {
    if (device.networkTarget && positions.has(device.networkTarget)) {
      links.push(buildCablePath(positions.get(device.id), positions.get(device.networkTarget), "network"));
    }
    if (device.powerTarget && positions.has(device.powerTarget)) {
      links.push(buildCablePath(positions.get(device.id), positions.get(device.powerTarget), "power"));
    }
  });

  const nodes = sortedDevices.map((device) => {
    const position = positions.get(device.id);
    return `
      <g transform="translate(${position.x - nodeWidth / 2} ${position.y - nodeHeight / 2})">
        <rect rx="14" ry="14" width="${nodeWidth}" height="${nodeHeight}" class="cable-node"></rect>
        <text x="12" y="18" class="cable-node-label">${escapeXml(device.name)}</text>
        <text x="12" y="33" class="cable-node-meta">${escapeXml(device.type)} · U${device.topU} · ${device.cableType}</text>
      </g>
    `;
  });

  elements.cableMap.innerHTML = `
    <defs>
      <marker id="arrow-network" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
        <path d="M0,0 L0,6 L8,3 z" fill="rgba(83, 212, 199, 0.9)"></path>
      </marker>
      <marker id="arrow-power" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
        <path d="M0,0 L0,6 L8,3 z" fill="rgba(244, 178, 102, 0.9)"></path>
      </marker>
    </defs>
    ${links.join("")}
    ${nodes.join("")}
  `;
}

function renderList(container, items, emptyText) {
  container.innerHTML = items.length
    ? items.map((item) => `<li>${item}</li>`).join("")
    : `<li>${emptyText}</li>`;
}

function renderDeviceForm() {
  const selected = getSelectedDevice();
  const options = state.devices.map((device) => ({ value: device.id, label: device.name }));

  populateSelect(elements.form.networkTarget, options, true);
  populateSelect(elements.form.powerTarget, options, true);

  if (!selected) {
    elements.deviceFormEmpty.hidden = false;
    elements.deviceFormFields.hidden = true;
    return;
  }

  elements.deviceFormEmpty.hidden = true;
  elements.deviceFormFields.hidden = false;

  elements.form.name.value = selected.name;
  elements.form.type.value = selected.type;
  elements.form.height.value = String(selected.height);
  elements.form.power.value = String(selected.power);
  elements.form.cost.value = String(selected.cost);
  elements.form.weight.value = selected.weight;
  elements.form.cableType.value = selected.cableType;
  elements.form.networkRequired.checked = selected.networkRequired;
  elements.form.powerRequired.checked = selected.powerRequired;
  elements.form.networkTarget.value = selected.networkTarget || "";
  elements.form.powerTarget.value = selected.powerTarget || "";
  elements.form.actsAsNetworkCore.checked = selected.actsAsNetworkCore;
  elements.form.actsAsPowerSource.checked = selected.actsAsPowerSource;
}

function onRackSizeChange(event) {
  state.rackSize = Number(event.target.value);
  state.devices.forEach((device) => {
    if (device.topU && !canPlaceDevice(device.id, device.topU)) {
      device.topU = null;
    }
  });
  render();
}

function onDeviceSave(event) {
  event.preventDefault();
  const selected = getSelectedDevice();

  if (!selected) {
    return;
  }

  selected.name = elements.form.name.value.trim() || selected.name;
  selected.type = elements.form.type.value;
  selected.height = clamp(Number(elements.form.height.value) || 1, 1, 8);
  selected.power = Math.max(0, Number(elements.form.power.value) || 0);
  selected.cost = Math.max(0, Number(elements.form.cost.value) || 0);
  selected.weight = elements.form.weight.value;
  selected.cableType = elements.form.cableType.value;
  selected.networkRequired = elements.form.networkRequired.checked;
  selected.powerRequired = elements.form.powerRequired.checked;
  selected.networkTarget = elements.form.networkTarget.value;
  selected.powerTarget = elements.form.powerTarget.value;
  selected.actsAsNetworkCore = elements.form.actsAsNetworkCore.checked;
  selected.actsAsPowerSource = elements.form.actsAsPowerSource.checked;

  if (selected.topU && !canPlaceDevice(selected.id, selected.topU)) {
    selected.topU = null;
  }

  render();
}

function onDuplicateDevice() {
  const selected = getSelectedDevice();
  if (!selected) {
    return;
  }

  const clone = {
    ...structuredClone(selected),
    id: crypto.randomUUID(),
    name: `${selected.name} 복제`,
    topU: null,
    networkTarget: "",
    powerTarget: ""
  };

  state.devices.push(clone);
  selectDevice(clone.id);
  render();
}

function onRemoveDevice() {
  const selected = getSelectedDevice();
  if (!selected) {
    return;
  }

  state.devices = state.devices.filter((device) => device.id !== selected.id);
  state.devices.forEach((device) => {
    if (device.networkTarget === selected.id) {
      device.networkTarget = "";
    }
    if (device.powerTarget === selected.id) {
      device.powerTarget = "";
    }
  });

  state.selectedDeviceId = null;
  render();
}

function onDownloadLayout() {
  const payload = JSON.stringify({ rackSize: state.rackSize, devices: state.devices }, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "rackops-layout.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

function onUploadLayout(event) {
  const [file] = event.target.files;
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      if (!Array.isArray(parsed.devices) || !rackOptions.includes(parsed.rackSize)) {
        throw new Error("invalid-payload");
      }

      state.rackSize = parsed.rackSize;
      state.devices = parsed.devices.map((device) => ({ ...device, id: device.id || crypto.randomUUID() }));
      state.selectedDeviceId = state.devices[0]?.id ?? null;
      elements.rackSizeSelect.value = String(state.rackSize);
      render();
    } catch (error) {
      window.alert("JSON 형식이 올바르지 않습니다.");
    }
  };

  reader.readAsText(file, "utf-8");
  event.target.value = "";
}

function onResetLayout() {
  state.devices = structuredClone(deviceTemplates);
  state.selectedDeviceId = null;
  render();
}

function selectDevice(deviceId) {
  state.selectedDeviceId = deviceId;
  renderInventory();
  renderDeviceForm();
}

function getPlacedDevices() {
  return state.devices.filter((device) => device.topU !== null);
}

function getSelectedDevice() {
  return state.devices.find((device) => device.id === state.selectedDeviceId) || null;
}

function getDeviceStartingAt(topU) {
  return state.devices.find((device) => device.topU === topU) || null;
}

function getDeviceCovering(topU) {
  return state.devices.find((device) => {
    if (!device.topU) {
      return false;
    }
    const bottomU = device.topU - device.height + 1;
    return topU <= device.topU && topU >= bottomU;
  }) || null;
}

function canPlaceDevice(deviceId, topU) {
  const device = state.devices.find((candidate) => candidate.id === deviceId);

  if (!device) {
    return false;
  }

  const bottomU = topU - device.height + 1;
  if (topU > state.rackSize || bottomU < 1) {
    return false;
  }

  return !state.devices.some((candidate) => {
    if (candidate.id === device.id || !candidate.topU) {
      return false;
    }

    const candidateBottom = candidate.topU - candidate.height + 1;
    const overlaps = topU >= candidateBottom && bottomU <= candidate.topU;
    return overlaps;
  });
}

function placeDevice(deviceId, topU) {
  if (!canPlaceDevice(deviceId, topU)) {
    return false;
  }

  const device = state.devices.find((candidate) => candidate.id === deviceId);
  device.topU = topU;
  return true;
}

function getPlacementWarnings() {
  const warnings = [];
  const placedDevices = getPlacedDevices();
  const heavyHighDevices = placedDevices.filter((device) => device.weight === "heavy" && device.topU > Math.ceil(state.rackSize * 0.5));
  const topHeat = placedDevices.filter((device) => isHotDevice(device) && device.topU > Math.ceil(state.rackSize * 0.66));

  if (heavyHighDevices.length) {
    warnings.push(`${heavyHighDevices.map((device) => device.name).join(", ")} 장비는 하단 배치가 권장됩니다.`);
  }
  if (topHeat.length >= 2) {
    warnings.push("상단에 고발열 장비가 집중되어 있습니다.");
  }
  if (!placedDevices.length) {
    warnings.push("아직 랙에 배치된 장비가 없습니다.");
  }

  return warnings;
}

function calculateSummary() {
  const placedDevices = getPlacedDevices();
  const usedU = placedDevices.reduce((sum, device) => sum + device.height, 0);
  const remainingU = Math.max(0, state.rackSize - usedU);
  const totalPower = placedDevices.reduce((sum, device) => sum + device.power, 0);
  const totalCost = placedDevices.reduce((sum, device) => sum + device.cost, 0);
  const totalHeatBtu = placedDevices.reduce((sum, device) => sum + device.power * 3.412 * (device.heatFactor || 1), 0);
  const powerSources = placedDevices.filter((device) => device.actsAsPowerSource);
  const networkCores = placedDevices.filter((device) => device.actsAsNetworkCore);
  const powerCapacity = powerSources.reduce((sum, device) => sum + (device.capacityW || 0), 0);
  const monthlyCost = Math.round((totalPower / 1000) * 24 * 30 * state.electricityRatePerKwh);
  const ups = placedDevices.find((device) => device.type === "UPS");
  const protectedLoad = placedDevices
    .filter((device) => device.powerTarget === ups?.id)
    .reduce((sum, device) => sum + device.power, 0);
  const upsRuntimeMinutes = ups && protectedLoad > 0
    ? Math.max(1, Math.round(((ups.batteryWh || 0) / protectedLoad) * 60))
    : null;

  const heatStatus = totalHeatBtu > 9000
    ? { label: "위험", tone: "danger" }
    : totalHeatBtu > 4500
      ? { label: "주의", tone: "warning" }
      : { label: "정상", tone: "normal" };

  const placementAdvice = getPlacementWarnings();
  const connectivityWarnings = [];

  placedDevices.forEach((device) => {
    if (device.networkRequired && !device.networkTarget) {
      connectivityWarnings.push(`${device.name} 장비가 네트워크에 연결되지 않았습니다.`);
    }
    if (device.powerRequired && !device.powerTarget && device.type !== "UPS" && device.type !== "PDU") {
      connectivityWarnings.push(`${device.name} 장비에 전원 공급 대상이 지정되지 않았습니다.`);
    }
  });

  if (networkCores.length === 0) {
    connectivityWarnings.push("스위치/코어 네트워크 장비가 없습니다.");
  }

  if (placedDevices.some((device) => device.type === "Server") && !networkCores.length) {
    connectivityWarnings.push("서버가 연결될 네트워크 코어가 없습니다.");
  }

  const router = placedDevices.find((device) => device.type === state.internetSourceType);
  const firewall = placedDevices.find((device) => device.type === "Firewall");
  if (router && firewall && router.networkTarget !== firewall.id) {
    connectivityWarnings.push("인터넷 라인이 방화벽을 거치지 않습니다.");
  }

  if (powerCapacity > 0 && totalPower > powerCapacity) {
    connectivityWarnings.push(`전력 사용량이 전원 장치 허용량을 ${totalPower - powerCapacity}W 초과했습니다.`);
  }

  if (ups && ups.capacityW && protectedLoad > ups.capacityW) {
    connectivityWarnings.push(`UPS 보호 부하가 허용 용량을 ${protectedLoad - ups.capacityW}W 초과했습니다.`);
  }

  return {
    placedDevices,
    usedU,
    remainingU,
    totalPower,
    totalCost,
    totalHeatBtu,
    powerCapacity,
    monthlyCost,
    upsRuntimeMinutes,
    upsLoadText: ups ? `UPS 보호 부하 ${protectedLoad}W / 용량 ${(ups.capacityW || 0)}W` : "UPS 미배치",
    heatStatus,
    placementAdvice,
    connectivityWarnings
  };
}

function isHotDevice(device) {
  return device.power >= 250 || ["NAS", "UPS"].includes(device.type);
}

function getCableOrder(device) {
  const order = {
    Router: 0,
    Firewall: 1,
    Switch: 2,
    "Patch Panel": 3,
    Server: 4,
    NAS: 5,
    UPS: 6,
    PDU: 7
  };

  return order[device.type] ?? 9;
}

function buildCablePath(from, to, kind) {
  const controlX = (from.x + to.x) / 2;
  const path = `M ${from.x} ${from.y} C ${controlX} ${from.y}, ${controlX} ${to.y}, ${to.x} ${to.y}`;
  const className = kind === "power" ? "cable-link-power" : "cable-link-network";
  const marker = kind === "power" ? "arrow-power" : "arrow-network";
  return `<path d="${path}" class="${className}" marker-end="url(#${marker})"></path>`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

initialize();