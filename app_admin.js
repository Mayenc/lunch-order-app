/* =========================================================
   ADMIN APP LOGIC
========================================================= */

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwFvi0n2mszdHsn5C_HRn544L28U1hBM8cicXv3NVl4LwA8WQf2j45XL5mQFlYhEch4rQ/exec"

let orders = []
let users = []
let menuGroups = {
  "🍚 Cơm": [],
  "🍜 Bún/Phở": [],
  "🥗 Khác": []
}
let menuImage = null
let deviceId = null

let currentMode = "day"        // "day" | "week"
let selectedDate = null        // for day mode
let weekOffset = 0             // for week mode (0 = current week)
let unitPrice = 35000
let currentSummaryText = ""    // text used by the copy button
let currentFiltered = []       // orders currently shown, used by export

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", () => {
  getDeviceId()
  initTabs()
  initMenuHandlers()
  initOrdersHandlers()
  initClearButton()

  const savedPrice = localStorage.getItem("adminUnitPrice")
  if (savedPrice) unitPrice = parseInt(savedPrice, 10) || 35000
  const priceInput = document.getElementById("unitPrice")
  if (priceInput) priceInput.value = unitPrice

  loadConfig()
  loadUsers()
  loadMenuAdminFromSheet()
  readSheet()
})

/* ================= DEVICE ID ================= */

function getDeviceId(){
  let id = localStorage.getItem("deviceId")
  if(!id){
    id = "dev_" + Math.random().toString(36).substring(2) + Date.now()
    localStorage.setItem("deviceId", id)
  }
  deviceId = id
  return deviceId
}

/* ================= LOADING / TOAST ================= */

function showLoading(text = "Đang xử lý..."){
  const el = document.getElementById("loadingOverlay")
  if(!el) return
  el.classList.add("active")
  const txt = el.querySelector(".loading-text")
  if(txt) txt.innerText = text
}
function hideLoading(){
  const el = document.getElementById("loadingOverlay")
  if(el) el.classList.remove("active")
}
function showToast(msg, type = "success"){
  const t = document.getElementById("toast")
  if(!t){ alert(msg); return }
  t.textContent = msg
  t.className = `toast ${type} show`
  clearTimeout(t._t)
  t._t = setTimeout(() => t.classList.remove("show"), 3000)
}

/* ================= DATE HELPERS (VN time) ================= */

function todayVN(){
  const now = new Date()
  const vn = new Date(now.getTime() + 7 * 60 * 60 * 1000)
  return vn.toISOString().split("T")[0]
}
function nowTimeVN(){
  const now = new Date()
  const vn = new Date(now.getTime() + 7 * 60 * 60 * 1000)
  return vn.toISOString().split("T")[1].split(".")[0]
}
function mondayOf(dateStr){
  const d = new Date(dateStr + "T00:00:00")
  const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1)
  return d
}
function addDays(date, n){
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}
function toISO(d){ return d.toISOString().split("T")[0] }
function fmtDMY(d){
  const dd = String(d.getDate()).padStart(2,"0")
  const mm = String(d.getMonth()+1).padStart(2,"0")
  return `${dd}/${mm}`
}
function fmtMoney(n){
  return n.toLocaleString("vi-VN") + "đ"
}

/* ================= TABS (with #hash persistence) ================= */

function initTabs(){
  const tabManage = document.getElementById("tabManage")
  const tabOrders = document.getElementById("tabOrders")
  const managePage = document.getElementById("managePage")
  const ordersPage = document.getElementById("ordersPage")

  function activate(tab, pushHash = true){
    const isOrders = tab === "orders"

    tabManage.classList.toggle("active", !isOrders)
    tabOrders.classList.toggle("active", isOrders)

    managePage.classList.toggle("hidden", isOrders)
    ordersPage.classList.toggle("hidden", !isOrders)

    if(pushHash) location.hash = isOrders ? "#orders" : "#manage"

    if(isOrders) renderAdminOrders()
  }

  tabManage.onclick = () => activate("manage")
  tabOrders.onclick = () => activate("orders")

  window.addEventListener("hashchange", () => {
    activate(location.hash === "#orders" ? "orders" : "manage", false)
  })

  // restore tab from hash on load/refresh
  activate(location.hash === "#orders" ? "orders" : "manage", false)
}

/* ================= CLEAR DATA ================= */

function initClearButton(){
  const btn = document.getElementById("clearData")
  if(!btn) return
  btn.onclick = () => {
    if(!confirm("Xóa toàn bộ dữ liệu cục bộ (ảnh menu đã lưu) trên thiết bị này?")) return
    localStorage.removeItem("menuImage")
    localStorage.removeItem("adminUnitPrice")
    showToast("Đã xóa dữ liệu cục bộ", "info")
    setTimeout(() => location.reload(), 600)
  }
}

/* ================= MENU GROUP HELPERS ================= */

function detectGroup(name){
  const lower = name.toLowerCase()
  if(/bún|phở|hủ tiếu|miến/.test(lower)) return "🍜 Bún/Phở"
  if(/bánh mì|xôi|gỏi|salad|nộm/.test(lower)) return "🥗 Khác"
  return "🍚 Cơm"
}

/* ================= MENU IMAGE UPLOAD + OCR ================= */

function initMenuHandlers(){
  const upload = document.getElementById("menuUpload")
  if(upload){
    upload.onchange = (e) => {
      const file = e.target.files[0]
      if(!file) return
      const reader = new FileReader()
      reader.onload = (x) => {
        menuImage = x.target.result
        const preview = document.getElementById("preview")
        if(preview) preview.src = menuImage
        scanMenu(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const addBtn = document.getElementById("addMenuItem")
  if(addBtn){
    addBtn.onclick = () => {
      menuGroups["🍚 Cơm"].push("")
      renderMenuLines()
    }
  }

  const saveBtn = document.getElementById("saveMenu")
  if(saveBtn){
    saveBtn.onclick = saveMenuToSheet
  }
}

async function scanMenu(file){
  const loadingEl = document.getElementById("scanLoading")
  if(loadingEl) loadingEl.classList.remove("hidden")

  try{
    const { data: { text } } = await Tesseract.recognize(
      file, "vie", { langPath: "https://tessdata.projectnaptha.com/4.0.0" }
    )

    const lines = text
      .split("\n")
      .map(x => x.trim())
      .filter(x => x !== "")
      .map(x => x.replace(/[^0-9a-zA-ZÀ-ỹ: ]+/g, ""))
      .map(x => x.replace(/\s+/g, " "))

    menuGroups = { "🍚 Cơm": [], "🍜 Bún/Phở": [], "🥗 Khác": [] }
    lines.forEach(line => menuGroups[detectGroup(line)].push(line))

    renderMenuLines()
    renderAdminAddFoodSelect()
    localStorage.setItem("menuImage", menuImage)
  }catch(e){
    console.log("OCR error", e)
    showToast("Quét thực đơn thất bại", "error")
  }finally{
    if(loadingEl) loadingEl.classList.add("hidden")
  }
}

/* ================= MENU LINES EDITOR ================= */

function renderMenuLines(){
  const box = document.getElementById("menuLines")
  if(!box) return
  box.innerHTML = ""

  Object.keys(menuGroups).forEach(group => {
    const section = document.createElement("div")
    section.className = "menu-group"

    const title = document.createElement("div")
    title.className = "menu-group-title"
    title.innerText = group
    section.appendChild(title)

    menuGroups[group].forEach((item, index) => {
      const row = document.createElement("div")
      row.className = "menu-item-row"
      row.innerHTML = `
        <input type="text" value="${item.replace(/"/g,'&quot;')}" onchange="updateLine('${group}',${index},this.value)">
        <button class="grp-btn" title="Chuyển vào Cơm" onclick="moveItem('${group}',${index},'🍚 Cơm')">🍚</button>
        <button class="grp-btn" title="Chuyển vào Bún/Phở" onclick="moveItem('${group}',${index},'🍜 Bún/Phở')">🍜</button>
        <button class="grp-btn" title="Chuyển vào Khác" onclick="moveItem('${group}',${index},'🥗 Khác')">🥗</button>
        <button class="grp-btn remove" title="Xóa" onclick="removeLine('${group}',${index})">✕</button>
      `
      section.appendChild(row)
    })

    const addBtn = document.createElement("button")
    addBtn.className = "menu-group-add"
    addBtn.innerText = "+ Thêm món vào " + group
    addBtn.onclick = () => { menuGroups[group].push(""); renderMenuLines() }
    section.appendChild(addBtn)

    box.appendChild(section)
  })
}

function updateLine(group, i, val){ menuGroups[group][i] = val }

function removeLine(group, i){
  menuGroups[group].splice(i, 1)
  renderMenuLines()
  renderAdminAddFoodSelect()
}

function moveItem(fromGroup, index, toGroup){
  if(fromGroup === toGroup) return
  const item = menuGroups[fromGroup][index]
  menuGroups[fromGroup].splice(index, 1)
  menuGroups[toGroup].push(item)
  renderMenuLines()
  renderAdminAddFoodSelect()
}

/* ================= SAVE MENU / CONFIG ================= */

async function saveMenuToSheet(){
  showLoading("Đang lưu thực đơn...")
  try{
    const today = todayVN()
    const enableOrder = document.getElementById("enableOrder").checked
    const deadline = document.getElementById("deadline").value

    await fetch(APPS_SCRIPT_URL, {
      method: "POST", mode: "no-cors",
      body: JSON.stringify({ action: "saveMenu", date: today, menu: menuGroups })
    })

    await fetch(APPS_SCRIPT_URL, {
      method: "POST", mode: "no-cors",
      body: JSON.stringify({ action: "saveConfig", enableOrder, deadline })
    })

    showToast("Đã lưu thực đơn!", "success")
  }catch(e){
    console.log("Save menu error", e)
    showToast("Lưu thất bại", "error")
  }finally{
    hideLoading()
  }
}

async function loadMenuAdminFromSheet(){
  const today = todayVN()
  try{
    const url = `${APPS_SCRIPT_URL}?action=loadMenu&date=${today}`
    const res = await fetch(url)
    const data = await res.json()

    menuGroups = data || { "🍚 Cơm": [], "🍜 Bún/Phở": [], "🥗 Khác": [] }

    renderMenuLines()
    renderAdminAddFoodSelect()
  }catch(e){
    console.log("Load menu error", e)
  }
}

async function loadConfig(){
  try{
    const res = await fetch(`${APPS_SCRIPT_URL}?action=loadConfig`)
    const data = await res.json()

    const chk = document.getElementById("enableOrder")
    const dl = document.getElementById("deadline")

    if(chk) chk.checked = !!data.enableOrder
    if(dl) dl.value = data.deadline || ""
  }catch(e){
    console.log("Load config error", e)
  }
}

async function loadUsers(){
  try{
    const res = await fetch(`${APPS_SCRIPT_URL}?action=loadUsers`)
    const data = await res.json()
    users = data || []
    renderAdminAddUserSelect()
  }catch(e){
    console.log("Load users error", e)
  }
}

/* ================= ORDERS TAB: INIT ================= */

function initOrdersHandlers(){
  const modeDay = document.getElementById("modeDay")
  const modeWeek = document.getElementById("modeWeek")
  const dayControls = document.getElementById("dayControls")
  const weekControls = document.getElementById("weekControls")

  modeDay.onclick = () => {
    currentMode = "day"
    modeDay.classList.add("active")
    modeWeek.classList.remove("active")
    dayControls.classList.remove("hidden")
    weekControls.classList.add("hidden")
    renderAdminOrders()
  }
  modeWeek.onclick = () => {
    currentMode = "week"
    modeWeek.classList.add("active")
    modeDay.classList.remove("active")
    weekControls.classList.remove("hidden")
    dayControls.classList.add("hidden")
    renderAdminOrders()
  }

  document.getElementById("prevWeek").onclick = () => { weekOffset--; renderAdminOrders() }
  document.getElementById("nextWeek").onclick = () => { weekOffset++; renderAdminOrders() }

  const priceInput = document.getElementById("unitPrice")
  if(priceInput){
    priceInput.addEventListener("input", () => {
      unitPrice = parseInt(priceInput.value, 10) || 0
      localStorage.setItem("adminUnitPrice", unitPrice)
      renderAdminOrders()
    })
  }

  const copyBtn = document.getElementById("copySummary")
  if(copyBtn) copyBtn.onclick = copySummary

  const exportBtn = document.getElementById("exportTxt")
  if(exportBtn) exportBtn.onclick = exportTxtFile

  const addBtn = document.getElementById("adminAddOrderBtn")
  if(addBtn) addBtn.onclick = adminAddOrder

  const dateInput = document.getElementById("adminAddDate")
  if(dateInput) dateInput.value = todayVN()
}

/* ================= ADMIN: ADD ORDER FOR SOMEONE ELSE ================= */

async function adminAddOrder(){
  const userSel = document.getElementById("adminAddUser")
  const foodSel = document.getElementById("adminAddFood")
  const noteInput = document.getElementById("adminAddNote")
  const dateInput = document.getElementById("adminAddDate")

  const userId = userSel.value
  const name = userSel.selectedOptions[0] ? userSel.selectedOptions[0].text : ""
  const dish = foodSel.value
  const note = noteInput.value.trim()
  const date = dateInput.value || todayVN()

  if(!userId){ showToast("Vui lòng chọn người đặt!", "error"); return }
  if(!dish){ showToast("Vui lòng chọn món ăn!", "error"); return }

  showLoading("Đang thêm đơn...")
  try{
    const orderId = crypto.randomUUID()
    await writeSheet(orderId, deviceId, userId, name, dish, note, date, nowTimeVN())

    foodSel.value = ""
    noteInput.value = ""

    await readSheet()
    showToast(`Đã thêm ${dish} cho ${name}!`, "success")
  }catch(e){
    console.log("Admin add order error", e)
    showToast("Thêm đơn thất bại", "error")
  }finally{
    hideLoading()
  }
}

/* ================= SELECTS (add-for-other form) ================= */

function renderAdminAddUserSelect(){
  const el = document.getElementById("adminAddUser")
  if(!el) return
  el.innerHTML = `<option value="">— Chọn tên —</option>`
  users.forEach(u => {
    const opt = document.createElement("option")
    opt.value = u.id
    opt.textContent = u.name
    el.appendChild(opt)
  })
}

function renderAdminAddFoodSelect(){
  const el = document.getElementById("adminAddFood")
  if(!el) return
  el.innerHTML = `<option value="">— Chọn món —</option>`
  Object.keys(menuGroups).forEach(group => {
    const optGroup = document.createElement("optgroup")
    optGroup.label = group
    menuGroups[group].forEach(d => {
      if(!d) return
      const op = document.createElement("option")
      op.value = d
      op.innerText = d
      optGroup.appendChild(op)
    })
    el.appendChild(optGroup)
  })
}

/* ================= DATE FILTER (day mode) ================= */

function renderAdminDateFilter(){
  const select = document.getElementById("adminFilterDate")
  if(!select) return

  let dates = [...new Set(orders.map(o => o.date))]
  const today = todayVN()
  if(!dates.includes(today)) dates.push(today)
  dates.sort((a,b) => b.localeCompare(a))

  if(!selectedDate) selectedDate = today

  select.innerHTML = ""
  dates.forEach(d => {
    const op = document.createElement("option")
    op.value = d
    op.innerText = d
    if(d === selectedDate) op.selected = true
    select.appendChild(op)
  })

  select.onchange = (e) => {
    selectedDate = e.target.value
    renderAdminOrders()
  }
}

/* ================= RENDER ORDERS (day / week) ================= */

function renderAdminOrders(){
  const summaryGrid = document.getElementById("summaryGrid")
  const detailList = document.getElementById("detailList")
  const totalEl = document.getElementById("total")
  const totalMoneyEl = document.getElementById("totalMoney")

  if(!summaryGrid || !detailList) return

  renderAdminDateFilter()

  let filtered = []
  let weekStart = null, weekEnd = null

  if(currentMode === "day"){
    const filterDate = selectedDate || todayVN()
    filtered = orders.filter(o => o.date === filterDate)
  }else{
    const base = mondayOf(todayVN())
    const start = addDays(base, weekOffset * 7)
    const end = addDays(start, 6)
    weekStart = toISO(start)
    weekEnd = toISO(end)

    filtered = orders.filter(o => o.date >= weekStart && o.date <= weekEnd)

    const label = document.getElementById("weekLabel")
    if(label) label.innerText = `${fmtDMY(start)} - ${fmtDMY(end)}`
  }

  currentFiltered = filtered

  // ===== TOTALS =====
  const total = filtered.length
  const totalMoney = total * (unitPrice || 0)
  if(totalEl) totalEl.innerText = total
  if(totalMoneyEl) totalMoneyEl.innerText = fmtMoney(totalMoney)

  // ===== SUMMARY =====
  summaryGrid.innerHTML = ""

  if(filtered.length === 0){
    summaryGrid.innerHTML = `<div class="empty-summary">Chưa có đơn nào</div>`
    currentSummaryText = currentMode === "day"
      ? `🍱 Tổng hợp đơn ngày ${selectedDate}:\n\nChưa có đơn nào.`
      : `🍱 Tổng hợp đơn tuần ${weekStart} - ${weekEnd}:\n\nChưa có đơn nào.`
  }else if(currentMode === "day"){
    // dish -> qty
    const map = {}
    filtered.forEach(o => { map[o.dish] = (map[o.dish] || 0) + 1 })

    Object.keys(map).forEach(dish => {
      const div = document.createElement("div")
      div.className = "summary-dish-item"
      div.innerHTML = `<span class="dish-name">${dish}</span><span class="dish-qty">x${map[dish]}</span>`
      summaryGrid.appendChild(div)
    })

    let text = `🍱 Tổng hợp đơn ngày ${selectedDate}:\n\n`
    Object.keys(map).forEach(dish => { text += `- ${dish}: ${map[dish]} suất\n` })
    text += `\n👉 Tổng: ${total} suất`
    text += `\n💰 Tổng tiền: ${fmtMoney(totalMoney)}`
    currentSummaryText = text

  }else{
    // week mode: group by user -> {dish: qty}
    const byUser = {}
    filtered.forEach(o => {
      const key = o.userId || o.name
      if(!byUser[key]) byUser[key] = { name: o.name, dishes: {}, total: 0 }
      byUser[key].dishes[o.dish] = (byUser[key].dishes[o.dish] || 0) + 1
      byUser[key].total++
    })

    const sortedUsers = Object.values(byUser).sort((a,b) => a.name.localeCompare(b.name, 'vi'))

    sortedUsers.forEach(u => {
      const block = document.createElement("div")
      block.className = "summary-user-block"

      const dishLines = Object.keys(u.dishes)
        .map(dish => `<div class="dish-line"><span>${dish}</span><span>x${u.dishes[dish]}</span></div>`)
        .join("")

      block.innerHTML = `
        <div class="summary-user-name">👤 ${u.name}<span class="u-total">${u.total} suất</span></div>
        <div class="summary-user-dishes">${dishLines}</div>
      `
      summaryGrid.appendChild(block)
    })

    let text = `🍱 Tổng hợp đơn tuần ${weekStart} - ${weekEnd}:\n\n`
    sortedUsers.forEach(u => {
      text += `👤 ${u.name}:\n`
      Object.keys(u.dishes).forEach(dish => { text += `  - ${dish} x${u.dishes[dish]}\n` })
      text += `\n`
    })
    text += `👉 Tổng: ${total} suất`
    text += `\n💰 Tổng tiền: ${fmtMoney(totalMoney)}`
    currentSummaryText = text
  }

  // ===== DETAIL LIST =====
  detailList.innerHTML = ""

  if(filtered.length === 0){
    detailList.innerHTML = `<div class="empty-summary">Chưa có đơn nào</div>`
  }else{
    const sorted = [...filtered].sort((a,b) => {
      const da = new Date(`${a.date}T${a.time || "00:00:00"}`)
      const db = new Date(`${b.date}T${b.time || "00:00:00"}`)
      return db - da
    })

    sorted.forEach(o => {
      const div = document.createElement("div")
      div.className = "detail-item"
      div.innerHTML = `
        <div class="di-info">
          <div class="di-name">${o.name}</div>
          <div class="di-dish">${o.dish}</div>
          ${o.note ? `<div class="di-note">${o.note}</div>` : ""}
        </div>
        <div class="di-meta">
          <div class="di-time">🕒 ${o.time || ""}</div>
          <div class="di-date">${o.date || ""}</div>
        </div>
      `
      detailList.appendChild(div)
    })
  }
}

/* ================= COPY SUMMARY ================= */

function copySummary(){
  if(!currentSummaryText){ showToast("Không có dữ liệu để copy", "error"); return }

  navigator.clipboard.writeText(currentSummaryText)
    .then(() => showToast("Đã copy tổng hợp!", "success"))
    .catch(() => showToast("Copy thất bại", "error"))
}

/* ================= EXPORT TXT ================= */

function exportTxtFile(){
  if(!currentFiltered || currentFiltered.length === 0){
    showToast("Không có dữ liệu để xuất", "error")
    return
  }

  let text = currentSummaryText + "\n\n---- CHI TIẾT ----\n\n"

  const sorted = [...currentFiltered].sort((a,b) => {
    const da = new Date(`${a.date}T${a.time || "00:00:00"}`)
    const db = new Date(`${b.date}T${b.time || "00:00:00"}`)
    return da - db
  })

  sorted.forEach((o, index) => {
    text += `${index+1}. [${o.date}] ${o.name} - ${o.dish}`
    if(o.note) text += ` (${o.note})`
    text += `\n`
  })

  const blob = new Blob([text], { type: "text/plain;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = currentMode === "day"
    ? `orders_${selectedDate}.txt`
    : `orders_week_${toISO(addDays(mondayOf(todayVN()), weekOffset*7))}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

/* ================= API ================= */

async function readSheet(){
  try{
    const res = await fetch(`${APPS_SCRIPT_URL}?action=loadOrders`)
    const data = await res.json()
    orders = data || []
    renderAdminOrders()
  }catch(e){
    console.log("Sheet error", e)
  }
}

async function writeSheet(orderId, deviceId, userId, name, dish, note, date, time){
  await fetch(APPS_SCRIPT_URL, {
    method: "POST", mode: "no-cors",
    body: JSON.stringify({ action: "create", orderId, deviceId, userId, name, dish, note, date, time })
  })
}
