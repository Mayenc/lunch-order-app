


const page = document.body.dataset.page

let orders = []
let menuGroups = {
  "🍚 Cơm": [],
  "🍜 Bún/Phở": [],
  "🥗 Khác": []
}
let menuImage = null
let enableOrder = false
let deadline = "12:00"
let selectedDate = null
let users = []

let deviceId = null

getDeviceId()
loadStorage()
readSheet()

/* DEVICE ID */
function getDeviceId(){
let id = localStorage.getItem("deviceId")

if(!id){
id = "dev_" + Math.random().toString(36).substring(2) + Date.now()
localStorage.setItem("deviceId",id)
}

deviceId = id
return deviceId
}

/* STORAGE */
function loadStorage(){

const img = localStorage.getItem("menuImage")

if(img) menuImage = img

if(page==="user"){
renderDishSelect()
checkOrderState()
renderDeadline()
}

}

/* SAVE */
function saveStorage(){
localStorage.setItem("deviceId",deviceId)
localStorage.setItem("menuImage",menuImage)
}
function detectGroup(name){

  const lower = name.toLowerCase()

  if(/bún|phở|hủ tiếu|miến/.test(lower)){
    return "🍜 Bún/Phở"
  }

  if(/bánh mì|xôi|gỏi|salad|nộm/.test(lower)){
    return "🥗 Khác"
  }

  return "🍚 Cơm"
}
/* ================= USER ORDER ================= */
if(page==="admin"){

const upload = document.getElementById("menuUpload")

if(upload){

upload.onchange=(e)=>{

const file = e.target.files[0]

const reader = new FileReader()

reader.onload=(x)=>{

menuImage = x.target.result

const preview = document.getElementById("preview")

if(preview) preview.src = menuImage

scanMenu(file)

}

reader.readAsDataURL(file)

}

}

const enableCheck = document.getElementById("enableOrder")

if(enableCheck){

enableCheck.onchange=(e)=>{

enableOrder=e.target.checked
saveStorage()

}

}
}

async function scanMenu(file){

document.getElementById("scanLoading").classList.remove("hidden")

const {data:{text}}=await Tesseract.recognize(
file,
'vie',
{langPath:'https://tessdata.projectnaptha.com/4.0.0'}
)

const lines = text
.split("\n")
.map(x=>x.trim())
.filter(x=>x!="")
.map(x=>x.replace(/[^0-9a-zA-ZÀ-ỹ: ]+/g,""))
.map(x=>x.replace(/\s+/g," "))

// 👉 RESET GROUP
menuGroups = {
  "🍚 Cơm": [],
  "🍜 Bún/Phở": [],
  "🥗 Khác": []
}

// 👉 AUTO PHÂN LOẠI
lines.forEach(line=>{
  const g = detectGroup(line)
  menuGroups[g].push(line)
})

// 👉 RENDER
renderMenuLines()
renderDishSelect()

saveStorage()

document.getElementById("scanLoading").classList.add("hidden")

}
if(page==="user"){

const orderBtn = document.getElementById("orderBtn")

if(orderBtn){

orderBtn.onclick = async () => {
showLoading()
if(!enableOrder) return

const userid=document.getElementById("name").value
const name=document.getElementById("name").selectedOptions[0].text
const dish=document.getElementById("dishSelect").value
const note=document.getElementById("note").value

if(!name || !dish) return alert("Vui lòng nhập đầy đủ thông tin")

let editId = orderBtn.dataset.editId

const now = new Date();
const vnDate = new Date(now.getTime() + 7 * 60 * 60 * 1000);

let date_c = vnDate.toISOString().split('T')[0];
let time_c = vnDate.toISOString().split('T')[1].split('.')[0];

if(editId){
// UPDATE
await updateSheet(editId,userid, name, dish, note, date_c, time_c)
alert("Cập nhật thành công!")

orderBtn.innerText="Đặt cơm"
orderBtn.dataset.editId=""

}else{
// CREATE
let orderId=crypto.randomUUID()

await writeSheet(orderId, deviceId,userid, name, dish, note, date_c, time_c)
renderDateFilter()
renderMyHistory()
alert("Đặt món ăn thành công!")
}
hideLoading()
readSheet()

document.getElementById("dishSelect").value=""
document.getElementById("note").value=""


}

}

}

/* ================= HISTORY ================= */

function renderMyHistory(){

const box = document.getElementById("myHistory")
if(!box) return
// lấy ngày hôm nay
const now = new Date()
const vn = new Date(now.getTime() + 7*60*60*1000)
const today = vn.toISOString().split('T')[0]
const selectedUserId = document.getElementById("name")?.value
console.log("select user: ", selectedUserId)
// check điều kiện cho phép edit
const currentDeviceId = getDeviceId()
box.innerHTML=""
console.log("order render: ", orders)
let myOrders = orders.filter(o => 
o.userId.toString() === selectedUserId.toString() &&
(!selectedDate || o.date === selectedDate)
)
console.log(myOrders)
if(myOrders.length === 0){
box.innerHTML="<p>Chưa có món nào</p>"
return
}
myOrders.forEach(o => {
const allowEdit = (selectedDate === today) && isBeforeDeadline() && o.deviceId === currentDeviceId
let div = document.createElement("div")

div.className = "orderItem"

div.innerHTML = `

<div style="
width: 90%;
display:flex;
justify-content:space-between;
align-items:center;
padding:10px;
border-bottom:1px solid #eee;
">

<div>

<div style="font-weight:600;font-size:15px">
${o.dish}
</div>

<div style="font-size:13px;color:#666">
${o.note || ""}
</div>

</div>

<div style="text-align:right; margin-right: 8px">

<div style="font-size:12px;color:#888;margin-bottom:6px">
🕒 ${o.time.toString()}
</div>

${
allowEdit
? `
<button onclick="editOrder('${o.orderId}')"
style="
padding:4px 8px;
margin-right:4px;
border:none;
border-radius:4px;
background:#4ba2bf;
color:white;
cursor:pointer;
font-size:12px;
">
Edit
</button>

<button onclick="deleteOrder('${o.orderId}')"
style="
padding:4px 8px;
border:none;
border-radius:4px;
background:#e74c3c;
color:white;
cursor:pointer;
font-size:12px;
">
Delete
</button>
`
: ""
}

</div>

</div>
`

box.appendChild(div)

})

}
/* ================= EDIT ================= */

function editOrder(id){

let o = orders.find(x=>x.orderId==id)
if(!o) return

document.getElementById("name").value=o.userId
document.getElementById("dishSelect").value=o.dish
document.getElementById("note").value=o.note

const btn=document.getElementById("orderBtn")

btn.dataset.editId=id
btn.innerText="Cập nhật món ăn"

window.scrollTo({top:0,behavior:"smooth"})
}

/* ================= DELETE ================= */

function deleteOrder(id){

if(!confirm("Bạn có chắc muốn xóa không?")) return

deleteSheet(id)

readSheet()

}
/* ================= ADMIN ORDER ================= */

function renderOrders(){

const grid=document.getElementById("summaryGrid")
const list=document.getElementById("detailList")

if(!grid) return

grid.innerHTML=""
list.innerHTML=""

// 👉 lọc theo ngày (admin cũng dùng selectedDate)
let filtered = selectedDate
? orders.filter(o => o.date === selectedDate)
: orders

// SUMMARY
let map={}

filtered.forEach(o=>{
map[o.dish]=(map[o.dish]||0)+1
})

for(let dish in map){

let div=document.createElement("div")

div.innerHTML=`${dish}<br><b>x${map[dish]}</b>`

grid.appendChild(div)

}

// DETAIL
filtered.forEach(o=>{

let item=document.createElement("div")

item.className="orderItem"

item.innerHTML=`
<span><b>${o.name}</b><br>${o.dish}<br>${o.note||""}</span>
<span>${o.time}</span>
`

list.appendChild(item)

})

document.getElementById("total").innerText=filtered.length

}

/* ================= FILTER DATE ================= */

function renderDateFilter(){

    const select = document.getElementById("filterDate")
    if(!select) return

    let dates = [...new Set(orders.map(o => o.date))]

    const now = new Date()
    const vn = new Date(now.getTime() + 7*60*60*1000)
    const today = vn.toISOString().split('T')[0]

    if (!dates.includes(today)) {
        dates.push(today)
    }

    dates.sort((a,b)=> b.localeCompare(a))

    select.innerHTML=""

    selectedDate = today

    dates.forEach(d=>{
        const op=document.createElement("option")
        op.value=d
        op.innerText=d

        if(d===selectedDate) op.selected=true

        select.appendChild(op)
    })

    select.onchange = (e)=>{
        selectedDate = e.target.value

        if(page==="user") renderMyHistory()
        if(page==="admin") renderOrders()
    }
}

/* ================= CHECK DEADLINE ================= */

function isBeforeDeadline(){

if(!deadline) return true

const now = new Date()
const currentTime = now.toTimeString().slice(0,5)

return currentTime <= deadline

}

/* ================= DEADLINE ================= */

function renderDeadline(){
const el=document.getElementById("deadlineText")
if(!el) return
el.innerText="Thời gian chốt đơn: "+deadline.split(':').slice(0, 2).join(':')
}

/* AUTO REFRESH */

setInterval(()=>{
// readSheet()
if(page==="user") checkOrderState()
},5000)
/* ================= DISH ================= */

function renderDishSelect(){

const select=document.getElementById("dishSelect")
if(!select) return

select.innerHTML=""

// 👉 render theo group
Object.keys(menuGroups).forEach(group => {

  const optGroup = document.createElement("optgroup")
  optGroup.label = group

  menuGroups[group].forEach(d=>{

    const op=document.createElement("option")
    op.value=d
    op.innerText=d

    optGroup.appendChild(op)
  })

  select.appendChild(optGroup)

})

}

/* ================= CHECK ORDER ================= */
function checkOrderState(){
const buttonOrder=document.getElementById("orderBtn")
// const text=document.getElementById("msgDealineOrder")

// if(buttonOrder.disabled) return

if(!enableOrder){
buttonOrder.disabled = true;
buttonOrder.innerText= "Đơn hàng mới chưa mở!";
buttonOrder.style.backgroundColor = "gray";
buttonOrder.style.cursor = "not-allowed";
buttonOrder.style.opacity = "0.6";
// text.classList.remove("hidden")
// text.innerText="Đơn hàng chưa mở!"
return
}

// text.classList.add("hidden")
buttonOrder.style.backgroundColor = "black";
buttonOrder.style.cursor = "pointer";
buttonOrder.innerText= "Đặt cơm";
buttonOrder.style.opacity = "1";
buttonOrder.disabled = false;

}

/* ================= ADMIN TAB SWITCH ================= */
if(page === "admin"){

    const tabManage = document.getElementById("tabManage")
    const tabOrders = document.getElementById("tabOrders")

    const managePage = document.getElementById("managePage")
    const ordersPage = document.getElementById("ordersPage")

    if(tabManage && tabOrders){

        tabManage.onclick = () => {
            tabManage.classList.add("tabActive")
            tabOrders.classList.remove("tabActive")

            managePage.classList.remove("hidden")
            ordersPage.classList.add("hidden")
        }

        tabOrders.onclick = () => {
            tabOrders.classList.add("tabActive")
            tabManage.classList.remove("tabActive")

            ordersPage.classList.remove("hidden")
            managePage.classList.add("hidden")

            renderAdminDateFilter()
            renderAdminOrders()
        }
    }
}

/* ================= ADMIN ORDER ================= */

function renderAdminOrders(){

    const summaryGrid = document.getElementById("summaryGrid")
    const detailList = document.getElementById("detailList")
    const totalEl = document.getElementById("total")

    if(!summaryGrid || !detailList) return

    // lọc theo ngày hiện tại
    const now = new Date()
    const vn = new Date(now.getTime() + 7*60*60*1000)
    const today = vn.toISOString().split('T')[0]

    let filterDate = selectedDate

    // nếu chưa có thì default hôm nay
    if(!filterDate){
        const now = new Date()
        const vn = new Date(now.getTime() + 7*60*60*1000)
        filterDate = vn.toISOString().split('T')[0]
    }

    let todayOrders = orders.filter(o => o.date === filterDate)

    // ===== SUMMARY =====
    let map = {}

    todayOrders.forEach(o=>{
        if(!map[o.dish]) map[o.dish] = 0
        map[o.dish]++
    })
    currentSummary = map
    summaryGrid.innerHTML = ""

    Object.keys(map).forEach(dish=>{
        let div = document.createElement("div")
        div.className = "gridItem"
        div.innerHTML = `
            <b>${dish}</b><br>
            x ${map[dish]} 
        `
        summaryGrid.appendChild(div)
    })

    // ===== TOTAL =====
    totalEl.innerText = todayOrders.length

    // ===== DETAIL =====
    detailList.innerHTML = ""

    todayOrders.forEach(o=>{
        let div = document.createElement("div")
        div.className = "orderItem"

        div.innerHTML = `
                <div style="
                width: 90%;
                display:flex;
                justify-content:space-between;
                align-items:center;
                padding:10px;
                border-bottom:1px solid #eee;
                ">

                <div>
                <div style="font-weight:600;font-size:15px">
                ${o.name}
                </div>
                <div style="font-weight:400;font-size:14px">
                ${o.dish}
                </div>

                <div style="font-size:13px;color:#666">
                ${o.note || ""}
                </div>

                </div>

                <div style="text-align:right; margin-right: 8px">

                <div style="font-size:12px;color:#888;margin-bottom:6px">
                🕒 ${o.time.toString()}
                </div>
            </div>
           
        `

        detailList.appendChild(div)
    })

}

/* ================= ADMIN DATE FILTER ================= */

function renderAdminDateFilter(){
    const select = document.getElementById("adminFilterDate")
    if(!select) return

    // lấy list ngày unique từ orders
    let dates = [...new Set(orders.map(o => o.date))]

    // sort giảm dần
    dates.sort((a,b)=> b.localeCompare(a))

    select.innerHTML = ""

    // mặc định hôm nay
    const now = new Date()
    const vn = new Date(now.getTime() + 7*60*60*1000)
    const today = vn.toISOString().split('T')[0]
    console.log(today)
    // nếu chưa chọn thì set hôm nay
    if(!selectedDate) selectedDate = today

    dates.forEach(d=>{
        const op = document.createElement("option")
        op.value = d
        op.innerText = d

        if(d === selectedDate) op.selected = true

        select.appendChild(op)
    })

    // change event
    select.onchange = (e)=>{
        selectedDate = e.target.value
        renderAdminOrders()
    }

}
/* ================= COPY SUMMARY ================= */

function copySummary(){

    if(!currentSummary || Object.keys(currentSummary).length === 0){
        alert("Không có dữ liệu để copy")
        return
    }

    let text = "🍱 Tổng đơn hôm nay:\n\n"

    Object.keys(currentSummary).forEach(dish=>{
        text += `- ${dish}: ${currentSummary[dish]} suất\n`
    })

    const total = Object.values(currentSummary)
        .reduce((a,b)=>a+b,0)

    text += `\n👉 Tổng: ${total} suất`

    navigator.clipboard.writeText(text)
        .then(()=>{
            alert("Đã copy!")
        })
        .catch(()=>{
            alert("Copy thất bại")
        })
}
/* ================= INIT COPY BUTTON ================= */

if(page === "admin"){

    const copyBtn = document.getElementById("copySummary")

    if(copyBtn){
        copyBtn.onclick = copySummary
    }

}

/* ================= EXPORT TXT ================= */

function exportTxtFile(){

    if(!orders || orders.length === 0){
        alert("Không có dữ liệu")
        return
    }

    // lấy ngày đang filter
    let filterDate = selectedDate

    if(!filterDate){
        const now = new Date()
        const vn = new Date(now.getTime() + 7*60*60*1000)
        filterDate = vn.toISOString().split('T')[0]
    }

    let data = orders.filter(o => o.date === filterDate)

    if(data.length === 0){
        alert("Không có đơn trong ngày này")
        return
    }

    // build text
    let text = `🍱 DANH SÁCH ĐẶT CƠM (${filterDate})\n\n`

    data.forEach((o, index)=>{
        text += `${index+1}. ${o.name} - ${o.dish}`
        if(o.note) text += ` (${o.note})`
        text += `\n`
    })

    text += `\n👉 Tổng: ${data.length} suất`

    // tạo file
    const blob = new Blob([text], { type: "text/plain;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `orders_${filterDate}.txt`
    a.click()

    URL.revokeObjectURL(url)
}

/* ================= INIT EXPORT ================= */

if(page === "admin"){

    const exportBtn = document.getElementById("exportTxt")

    if(exportBtn){
        exportBtn.onclick = exportTxtFile
    }

}

const saveBtn = document.getElementById("saveMenu")
if(saveBtn){
    saveBtn.onclick = saveMenuToSheet
}

function renderMenuLines(){

const box=document.getElementById("menuLines")
if(!box) return

box.innerHTML=""

// 👉 render theo group
Object.keys(menuGroups).forEach(group => {

  const section = document.createElement("div")

  section.innerHTML = `<h4>${group}</h4>`

  menuGroups[group].forEach((item,index)=>{

    const div=document.createElement("div")
    div.className="menuLine"

    div.innerHTML=`
    <input value="${item}" onchange="updateLine('${group}',${index},this.value)">

    <button onclick="moveItem('${group}',${index},'🍚 Cơm')">🍚</button>
    <button onclick="moveItem('${group}',${index},'🍜 Bún/Phở')">🍜</button>
    <button onclick="moveItem('${group}',${index},'🥗 Khác')">🥗</button>

    <button onclick="removeLine('${group}',${index})">X</button>
    `

    section.appendChild(div)
  })

  // ADD BUTTON
  const addBtn = document.createElement("button")
  addBtn.innerText = "+ Add"
  addBtn.onclick = ()=>{
    menuGroups[group].push("")
    renderMenuLines()
  }

  section.appendChild(addBtn)

  box.appendChild(section)

})

}

const addBtn = document.getElementById("addMenuItem")

if(addBtn){

addBtn.onclick=()=>{
  // 👉 mặc định add vào cơm
  menuGroups["🍚 Cơm"].push("")
  renderMenuLines()
}

}
function updateLine(group,i,val){
  menuGroups[group][i]=val
}

function removeLine(group,i){
  menuGroups[group].splice(i,1)
  renderMenuLines()
}

function moveItem(fromGroup,index,toGroup){

  if(fromGroup===toGroup) return

  const item = menuGroups[fromGroup][index]

  menuGroups[fromGroup].splice(index,1)
  menuGroups[toGroup].push(item)

  renderMenuLines()
  renderDishSelect()
}
function renderUserSelect(){

    const el = document.getElementById("name")
    if(!el) return

    el.innerHTML = `<option value="">-- Chọn người đặt --</option>`

    users.forEach(u => {

        const opt = document.createElement("option")

        opt.value = u.id
        opt.textContent = u.name

        el.appendChild(opt)
    })

    // 🔥 load lại user đã chọn
    const saved = localStorage.getItem("selectedUser")
    if(saved){
        el.value = saved
        renderMyHistory()
    }

    // 🔥 lưu khi user đổi
    el.addEventListener("change", function(){
        localStorage.setItem("selectedUser", this.value)
    })
}

const selectedId = document.getElementById("name").value

const name = users.find(u => u.id === selectedId)?.name || ""

/* ================= AUTO REFRESH ================= */

setInterval(()=>{
// readSheet()
if(page==="user") checkOrderState()
},5000)

/* ================= API ================= */

async function readSheet(){

try{

const res = await fetch("https://script.google.com/macros/s/AKfycbwFvi0n2mszdHsn5C_HRn544L28U1hBM8cicXv3NVl4LwA8WQf2j45XL5mQFlYhEch4rQ/exec?action=loadOrders")
const data = await res.json()
console.log("data order: ",data)
orders = data

// 🔥 FIX QUAN TRỌNG
if(page==="user"){
    renderDateFilter()
    renderMyHistory()
}

if(page==="admin"){
    loadMenuAdminFromSheet()
    renderAdminDateFilter()
    renderAdminOrders()
}

}catch(e){
console.log("Sheet error",e)
}

}

/* ================= WRITE ================= */

async function writeSheet(orderId, deviceId, userId, name, dish, note, date, time){

await fetch("https://script.google.com/macros/s/AKfycbwFvi0n2mszdHsn5C_HRn544L28U1hBM8cicXv3NVl4LwA8WQf2j45XL5mQFlYhEch4rQ/exec",{
method:"POST",
mode:"no-cors",
body:JSON.stringify({
action:"create",
orderId,
deviceId,
userId,
name,
dish,
note,
date,
time
})
})

}

async function updateSheet(orderId, userId, name, dish, note, date, time){

await fetch("https://script.google.com/macros/s/AKfycbwFvi0n2mszdHsn5C_HRn544L28U1hBM8cicXv3NVl4LwA8WQf2j45XL5mQFlYhEch4rQ/exec",{
method:"POST",
mode:"no-cors",
body:JSON.stringify({
action:"update",
orderId,
userId,
name,
dish,
note,
date,
time
})
})

}

async function deleteSheet(orderId){
showLoading()
await fetch("https://script.google.com/macros/s/AKfycbwFvi0n2mszdHsn5C_HRn544L28U1hBM8cicXv3NVl4LwA8WQf2j45XL5mQFlYhEch4rQ/exec",{
method:"POST",
mode:"no-cors",
body:JSON.stringify({
action:"delete",
orderId
})
})
readSheet()
hideLoading()
}

async function saveMenuToSheet(){

    const now = new Date()
    const vn = new Date(now.getTime() + 7*60*60*1000)
    const today = vn.toISOString().split('T')[0]

    // await fetch("https://script.google.com/macros/s/AKfycbwFvi0n2mszdHsn5C_HRn544L28U1hBM8cicXv3NVl4LwA8WQf2j45XL5mQFlYhEch4rQ/exec",{
    //     method:"POST",
    //     mode:"no-cors",
    //     body: JSON.stringify({
    //         action:"saveMenu",
    //         date: today,
    //         menu: menuLines
    //     })
    // })
    // saveMenu()
    // alert("Menu đã lưu!")

    const enableOrder = document.getElementById("enableOrder").checked
    const deadline = document.getElementById("deadline").value

    // ===== SAVE MENU (cũ của bạn) =====
    await fetch("https://script.google.com/macros/s/AKfycbwFvi0n2mszdHsn5C_HRn544L28U1hBM8cicXv3NVl4LwA8WQf2j45XL5mQFlYhEch4rQ/exec", {
        method: "POST",
        mode:"no-cors",
        body: JSON.stringify({
            action: "saveMenu",
            date: today,
            menu: menuGroups 
        })
    })

    // ===== SAVE CONFIG (THÊM) =====
    await fetch("https://script.google.com/macros/s/AKfycbwFvi0n2mszdHsn5C_HRn544L28U1hBM8cicXv3NVl4LwA8WQf2j45XL5mQFlYhEch4rQ/exec", {
        method: "POST",
        mode:"no-cors",
        body: JSON.stringify({
            action: "saveConfig",
            enableOrder: enableOrder,
            deadline: deadline
        })
    })

    alert("Saved!")
}

async function loadMenuFromSheet(){

    const now = new Date()
    const vn = new Date(now.getTime() + 7*60*60*1000)
    const today = vn.toISOString().split('T')[0]

    try{

        const url = `https://script.google.com/macros/s/AKfycbwFvi0n2mszdHsn5C_HRn544L28U1hBM8cicXv3NVl4LwA8WQf2j45XL5mQFlYhEch4rQ/exec?action=loadMenu&date=${today}`

        const res = await fetch(url)

        const data = await res.json()

        menuGroups = data || {
        "🍚 Cơm": [],
        "🍜 Bún/Phở": [],
        "🥗 Khác": []
        }

        renderDishSelect()

    }catch(e){
        console.log("Load menu error", e)
    }
}

async function loadMenuAdminFromSheet(dateParam = null){

    const now = new Date()
    const vn = new Date(now.getTime() + 7*60*60*1000)
    const today = vn.toISOString().split('T')[0]

    const date = dateParam || today

    try{

        const url = `https://script.google.com/macros/s/AKfycbwFvi0n2mszdHsn5C_HRn544L28U1hBM8cicXv3NVl4LwA8WQf2j45XL5mQFlYhEch4rQ/exec?action=loadMenu&date=${today}`

        const res = await fetch(url)
        const data = await res.json()

        // 🔥 GÁN LẠI MENU
        menuGroups = data || {
            "🍚 Cơm": [],
            "🍜 Bún/Phở": [],
            "🥗 Khác": []
            }
        console.log("menu group:", data)
        if(typeof renderDishSelect === "function"){
            renderDishSelect()
        }

        if(typeof renderMenuLines === "function"){
            renderMenuLines()
        }

    }catch(e){
        console.log("Load menu error", e)
    }
}

async function loadConfig(){

    try{

        const res = await fetch(`https://script.google.com/macros/s/AKfycbwFvi0n2mszdHsn5C_HRn544L28U1hBM8cicXv3NVl4LwA8WQf2j45XL5mQFlYhEch4rQ/exec?action=loadConfig`)
        const data = await res.json()

        console.log("config:", data)

        enableOrder = data.enableOrder
        deadline = data.deadline

        // ===== ADMIN UI =====
        const chk = document.getElementById("enableOrder")
        const dl = document.getElementById("deadline")

        if(chk) chk.checked = enableOrder
        if(dl) dl.value = deadline

        // ===== USER UI =====
        if(typeof renderDeadline === "function"){
            renderDeadline()
        }

        if(typeof checkOrderState === "function"){
            checkOrderState()
        }

    }catch(e){
        console.log("Load config error", e)
    }
}

async function loadUsers(){

    try{

        const res = await fetch(`https://script.google.com/macros/s/AKfycbwFvi0n2mszdHsn5C_HRn544L28U1hBM8cicXv3NVl4LwA8WQf2j45XL5mQFlYhEch4rQ/exec?action=loadUsers`)
        const data = await res.json()
        console.log("data user: ", data)
        users = data || []

        renderUserSelect()

    }catch(e){
        console.log("Load users error", e)
    }
}