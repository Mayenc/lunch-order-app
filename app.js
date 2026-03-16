// const page = document.body.dataset.page

// let orders = []
// let menuLines = []
// let menuImage = null
// let enableOrder = false
// let deadline = "08:50"

// let deviceId = null

// getDeviceId()
// loadStorage()

// /* DEVICE ID */

// function getDeviceId(){

// let id = localStorage.getItem("deviceId")

// if(!id){

// id = "dev_" + Math.random().toString(36).substring(2) + Date.now()

// localStorage.setItem("deviceId",id)

// }

// deviceId = id

// }

// /* STORAGE */

// function loadStorage(){

// const m = localStorage.getItem("menuLines")
// const o = localStorage.getItem("orders")
// const img = localStorage.getItem("menuImage")
// const en = localStorage.getItem("enableOrder")
// const dl = localStorage.getItem("deadline")

// if(m) menuLines = JSON.parse(m)
// if(o) orders = JSON.parse(o)
// if(img) menuImage = img
// if(en) enableOrder = JSON.parse(en)

// if(dl){
// deadline = dl
// }else{
// deadline = "08:50"
// }

// /* USER PAGE */

// if(page==="user"){

// const imgEl = document.getElementById("menuImg")

// if(imgEl && menuImage) imgEl.src = menuImage

// renderDishSelect()
// renderMyHistory()
// checkOrderState()
// renderDeadline()

// }

// /* ADMIN PAGE */

// if(page==="admin"){

// const clearBtn = document.getElementById("clearData")

// if(clearBtn){

// clearBtn.onclick = () => {

// if(!confirm("Clear all data?")) return

// localStorage.clear()

// orders=[]
// menuLines=[]
// menuImage=null
// enableOrder=false
// deadline="08:50"

// location.reload()

// }

// }

// const tabManage = document.getElementById("tabManage")
// const tabOrders = document.getElementById("tabOrders")

// const managePage = document.getElementById("managePage")
// const ordersPage = document.getElementById("ordersPage")

// if(tabManage){

// tabManage.onclick = () => {

// tabManage.classList.add("tabActive")
// tabOrders.classList.remove("tabActive")

// managePage.classList.remove("hidden")
// ordersPage.classList.add("hidden")

// }

// }

// if(tabOrders){

// tabOrders.onclick = () => {

// tabOrders.classList.add("tabActive")
// tabManage.classList.remove("tabActive")

// managePage.classList.add("hidden")
// ordersPage.classList.remove("hidden")

// renderOrders()

// }

// }

// const preview = document.getElementById("preview")

// if(preview && menuImage) preview.src = menuImage

// const enableCheck = document.getElementById("enableOrder")

// if(enableCheck) enableCheck.checked = enableOrder

// const dlInput = document.getElementById("deadline")

// if(dlInput) dlInput.value = deadline

// renderMenuLines()

// }

// }

// function saveStorage(){

// localStorage.setItem("menuLines",JSON.stringify(menuLines))
// localStorage.setItem("orders",JSON.stringify(orders))
// localStorage.setItem("menuImage",menuImage)
// localStorage.setItem("enableOrder",enableOrder)
// localStorage.setItem("deadline",deadline)

// }

// /* ADMIN */

// if(page==="admin"){

// const upload = document.getElementById("menuUpload")

// if(upload){

// upload.onchange=(e)=>{

// const file = e.target.files[0]

// orders=[]

// const reader = new FileReader()

// reader.onload=(x)=>{

// menuImage = x.target.result

// const preview = document.getElementById("preview")

// if(preview) preview.src = menuImage

// scanMenu(file)

// }

// reader.readAsDataURL(file)

// }

// }

// const enableCheck = document.getElementById("enableOrder")

// if(enableCheck){

// enableCheck.onchange=(e)=>{

// enableOrder=e.target.checked
// saveStorage()

// }

// }

// const dlInput = document.getElementById("deadline")

// if(dlInput){

// dlInput.onchange=(e)=>{

// deadline=e.target.value
// saveStorage()
// renderDeadline()

// }

// }

// const addBtn = document.getElementById("addMenuItem")

// if(addBtn){

// addBtn.onclick=()=>{

// menuLines.push("")
// renderMenuLines()

// }

// }

// const saveBtn = document.getElementById("saveMenu")

// if(saveBtn){

// saveBtn.onclick=()=>{

// saveStorage()
// alert("Menu saved")

// }

// }

// const exportBtn = document.getElementById("exportTxt")

// if(exportBtn){

// exportBtn.onclick = exportTxt

// }

// }

// /* MENU LINES */

// function renderMenuLines(){

// const box=document.getElementById("menuLines")

// if(!box) return

// box.innerHTML=""

// menuLines.forEach((line,i)=>{

// const div=document.createElement("div")

// div.className="menuLine"

// div.innerHTML=`
// <input value="${line}" onchange="updateLine(${i},this.value)">
// <button onclick="removeLine(${i})">X</button>
// `

// box.appendChild(div)

// })

// }

// function updateLine(i,val){

// menuLines[i]=val
// saveStorage()

// }

// function removeLine(i){

// menuLines.splice(i,1)
// renderMenuLines()
// saveStorage()

// }

// /* USER ORDER */

// if(page==="user"){

// const orderBtn = document.getElementById("orderBtn")

// if(orderBtn){

// orderBtn.onclick = () => {

// if(!enableOrder) return

// const name=document.getElementById("name").value
// const dish=document.getElementById("dishSelect").value
// const note=document.getElementById("note").value

// if(!name || !dish) return alert("Vui lòng nhập đầy đủ thông tin")

// let editId = orderBtn.dataset.editId

// if(editId){

// let existing = orders.find(o=>o.orderId==editId)

// if(existing){

// existing.name=name
// existing.dish=dish
// existing.note=note
// existing.time=new Date().toLocaleTimeString()

// }

// }else{

// orders.push({

// orderId:Date.now(),
// deviceId:deviceId,
// name,
// dish,
// note,
// time:new Date().toLocaleTimeString()

// })

// }

// saveStorage()

// if(editId){
// alert("Cập nhật món ăn thành công!")
// }else{
// alert("Đặt món ăn thành công!")
// }

// orderBtn.innerText="Đặt cơm"
// orderBtn.dataset.editId=""

// renderMyHistory()

// document.getElementById("dishSelect").value=""
// document.getElementById("note").value=""

// }

// }

// }

// /* USER HISTORY */

// function renderMyHistory(){

// const box = document.getElementById("myHistory")

// if(!box) return

// box.innerHTML=""

// let myOrders = orders.filter(o => o.deviceId === deviceId)

// if(myOrders.length === 0){

// box.innerHTML="<p>Chưa có món nào</p>"
// return

// }

// myOrders.forEach(o => {

// let div = document.createElement("div")

// div.className = "orderItem"

// div.innerHTML = `

// <div style="
// width: 100%;
// display:flex;
// justify-content:space-between;
// align-items:center;
// padding:10px;
// border-bottom:1px solid #eee;
// ">

// <div>

// <div style="font-weight:600;font-size:15px">
// ${o.dish}
// </div>

// <div style="font-size:13px;color:#666">
// ${o.note || ""}
// </div>

// </div>

// <div style="text-align:right">

// <div style="font-size:12px;color:#888;margin-bottom:6px">
// 🕒 ${o.time}
// </div>

// <button onclick="editOrder(${o.orderId})"
// style="
// padding:4px 8px;
// margin-right:4px;
// border:none;
// border-radius:4px;
// background:#4ba2bf;
// color:white;
// cursor:pointer;
// font-size:12px;
// ">
// Edit
// </button>

// <button onclick="deleteOrder(${o.orderId})"
// style="
// padding:4px 8px;
// border:none;
// border-radius:4px;
// background:#e74c3c;
// color:white;
// cursor:pointer;
// font-size:12px;
// ">
// Delete
// </button>

// </div>

// </div>
// `

// box.appendChild(div)

// })

// }

// function editOrder(id){

// let o = orders.find(x=>x.orderId==id)

// if(!o) return

// document.getElementById("name").value=o.name
// document.getElementById("dishSelect").value=o.dish
// document.getElementById("note").value=o.note

// const btn=document.getElementById("orderBtn")

// btn.dataset.editId=id
// btn.innerText="Cập nhật món ăn"

// window.scrollTo({top:0,behavior:"smooth"})

// }

// function deleteOrder(id){

// if(!confirm("Bạn có chắc muốn xóa món này?")) return

// orders = orders.filter(o => o.orderId != id)

// saveStorage()

// renderMyHistory()

// }

// /* DISH SELECT */

// function renderDishSelect(){

// const select=document.getElementById("dishSelect")

// if(!select) return

// select.innerHTML=""

// menuLines.forEach(d=>{

// const op=document.createElement("option")

// op.value=d
// op.innerText=d

// select.appendChild(op)

// })

// }

// /* ADMIN ORDER LIST */

// function renderOrders(){

// const grid=document.getElementById("summaryGrid")
// const list=document.getElementById("detailList")

// if(!grid) return

// grid.innerHTML=""
// list.innerHTML=""

// let map={}

// orders.forEach(o=>{
// map[o.dish]=(map[o.dish]||0)+1
// })

// for(let dish in map){

// let div=document.createElement("div")

// div.innerHTML=`${dish}<br><b>x${map[dish]}</b>`

// grid.appendChild(div)

// }

// orders.forEach(o=>{

// let item=document.createElement("div")

// item.className="orderItem"

// item.innerHTML=`
// <span><b>${o.name}</b><br>${o.dish}<br>${o.note||""}</span>
// <span>${o.time}</span>
// `

// list.appendChild(item)

// })

// document.getElementById("total").innerText=orders.length

// }

// /* EXPORT TXT */

// function exportTxt(){

// const now = new Date()

// const day = String(now.getDate()).padStart(2,"0")
// const month = String(now.getMonth()+1).padStart(2,"0")
// const year = now.getFullYear()

// let text = `Đơn cơm trưa hôm nay ${day}-${month}-${year}\n\n`

// orders.forEach(o=>{
// text += `${o.name} - ${o.dish} - ${o.note||""}\n`
// })

// const fileName = `lunch_order_${day}-${month}-${year}.txt`

// const blob = new Blob([text],{type:"text/plain"})

// const a=document.createElement("a")

// a.href=URL.createObjectURL(blob)
// a.download=fileName
// a.click()

// }

// /* ORDER STATE */

// function checkOrderState(){

// const overlay=document.getElementById("overlay")
// const text=document.getElementById("overlayText")

// if(!overlay) return

// if(!enableOrder){

// overlay.classList.remove("hidden")
// text.innerText="Đơn hàng mới chưa bắt đầu! Vui lòng đợi!"
// return

// }

// overlay.classList.add("hidden")

// }

// /* DEADLINE TEXT */

// function renderDeadline(){

// const el=document.getElementById("deadlineText")

// if(!el) return

// if(!deadline){

// el.innerText=""
// return

// }

// el.innerText="Thời gian chốt đơn: "+deadline

// }

// /* AUTO REFRESH */

// setInterval(()=>{

// if(page==="user")
// checkOrderState()

// if(page==="admin")
// renderOrders()

// },5000)

// async function scanMenu(file){

// document.getElementById("scanLoading").classList.remove("hidden")

// const {data:{text}}=await Tesseract.recognize(
// file,
// 'vie',
// {langPath:'https://tessdata.projectnaptha.com/4.0.0'}
// )

// menuLines=text
// .split("\n")
// .map(x=>x.trim())
// .filter(x=>x!="")
// .map(x=>x.replace(/[^0-9a-zA-ZÀ-ỹ: ]+/g,""))
// .map(x=>x.replace(/\s+/g," "))

// renderMenuLines()

// saveStorage()

// document.getElementById("scanLoading").classList.add("hidden")

// }
const page = document.body.dataset.page

const API_URL =
"https://script.google.com/macros/s/AKfycbxJ0iPQGpQCqyyg46zvxeAxwsFa875_eoI4NQRiXBxeT-gKWfFrDrr31O4pBqudBoiY/exec"

let orders = []
let menuLines = []
let menuImage = null
let enableOrder = false
let deadline = "08:50"

let deviceId = null

getDeviceId()
loadStorage()

/* DEVICE ID */

function getDeviceId(){

let id = localStorage.getItem("deviceId")

if(!id){

id = "dev_" + Math.random().toString(36).substring(2) + Date.now()

localStorage.setItem("deviceId",id)

}

deviceId = id

}

/* STORAGE LOAD (JSONP) */

function loadStorage(){

const script=document.createElement("script")

script.src = API_URL + "?action=load&callback=loadDataCallback"

document.body.appendChild(script)

}

function loadDataCallback(data){

menuLines = data.menu || []
orders = data.orders || []
menuImage = data.image || null
enableOrder = data.enableOrder || false
deadline = data.deadline || "08:50"

/* USER PAGE */

if(page==="user"){

const imgEl = document.getElementById("menuImg")

if(imgEl && menuImage) imgEl.src = menuImage

renderDishSelect()
renderMyHistory()
checkOrderState()
renderDeadline()

}

/* ADMIN PAGE */

if(page==="admin"){

const preview = document.getElementById("preview")

if(preview && menuImage) preview.src = menuImage

const enableCheck = document.getElementById("enableOrder")

if(enableCheck) enableCheck.checked = enableOrder

const dlInput = document.getElementById("deadline")

if(dlInput) dlInput.value = deadline

renderMenuLines()
renderOrders()

}

}

/* STORAGE SAVE */

function saveStorage(){

fetch(API_URL,{

method:"POST",

body:JSON.stringify({

action:"save",
menuLines:menuLines,
menuImage:menuImage,
enableOrder:enableOrder,
deadline:deadline

})

})

}

/* SYNC ORDERS */

function syncOrders(){

fetch(API_URL,{

method:"POST",

body:JSON.stringify({

action:"syncOrders",
orders:orders

})

})

}

/* ADMIN */

if(page==="admin"){

const upload = document.getElementById("menuUpload")

if(upload){

upload.onchange=(e)=>{

const file = e.target.files[0]

orders=[]

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

const dlInput = document.getElementById("deadline")

if(dlInput){

dlInput.onchange=(e)=>{

deadline=e.target.value
saveStorage()
renderDeadline()

}

}

const addBtn = document.getElementById("addMenuItem")

if(addBtn){

addBtn.onclick=()=>{

menuLines.push("")
renderMenuLines()

}

}

const saveBtn = document.getElementById("saveMenu")

if(saveBtn){

saveBtn.onclick=()=>{

saveStorage()
syncOrders()

alert("Menu saved")

}

}

const exportBtn = document.getElementById("exportTxt")

if(exportBtn){

exportBtn.onclick = exportTxt

}

}

/* MENU LINES */

function renderMenuLines(){

const box=document.getElementById("menuLines")

if(!box) return

box.innerHTML=""

menuLines.forEach((line,i)=>{

const div=document.createElement("div")

div.className="menuLine"

div.innerHTML=`
<input value="${line}" onchange="updateLine(${i},this.value)">
<button onclick="removeLine(${i})">X</button>
`

box.appendChild(div)

})

}

function updateLine(i,val){

menuLines[i]=val
saveStorage()

}

function removeLine(i){

menuLines.splice(i,1)
renderMenuLines()
saveStorage()

}

/* USER ORDER */

if(page==="user"){

const orderBtn = document.getElementById("orderBtn")

if(orderBtn){

orderBtn.onclick = () => {

if(!enableOrder) return

const name=document.getElementById("name").value
const dish=document.getElementById("dishSelect").value
const note=document.getElementById("note").value

if(!name || !dish) return alert("Vui lòng nhập đầy đủ thông tin")

let editId = orderBtn.dataset.editId

if(editId){

let existing = orders.find(o=>o.orderId==editId)

if(existing){

existing.name=name
existing.dish=dish
existing.note=note
existing.time=new Date().toLocaleTimeString()

}

}else{

orders.push({

orderId:Date.now(),
deviceId:deviceId,
name,
dish,
note,
time:new Date().toLocaleTimeString()

})

}

saveStorage()
syncOrders()

if(editId){
alert("Cập nhật món ăn thành công!")
}else{
alert("Đặt món ăn thành công!")
}

orderBtn.innerText="Đặt cơm"
orderBtn.dataset.editId=""

renderMyHistory()

document.getElementById("dishSelect").value=""
document.getElementById("note").value=""

}

}

}

/* USER HISTORY */

function renderMyHistory(){

const box = document.getElementById("myHistory")

if(!box) return

box.innerHTML=""

let myOrders = orders.filter(o => o.deviceId === deviceId)

if(myOrders.length === 0){

box.innerHTML="<p>Chưa có món nào</p>"
return

}

myOrders.forEach(o => {

let div = document.createElement("div")

div.className = "orderItem"

div.innerHTML = `
<div style="display:flex;justify-content:space-between;padding:10px;border-bottom:1px solid #eee;">
<div>
<div style="font-weight:600">${o.dish}</div>
<div style="font-size:13px;color:#666">${o.note||""}</div>
</div>

<div>

<div style="font-size:12px;color:#888">🕒 ${o.time}</div>

<button onclick="editOrder(${o.orderId})">Edit</button>
<button onclick="deleteOrder(${o.orderId})">Delete</button>

</div>

</div>
`

box.appendChild(div)

})

}

function editOrder(id){

let o = orders.find(x=>x.orderId==id)

if(!o) return

document.getElementById("name").value=o.name
document.getElementById("dishSelect").value=o.dish
document.getElementById("note").value=o.note

const btn=document.getElementById("orderBtn")

btn.dataset.editId=id
btn.innerText="Cập nhật món ăn"

window.scrollTo({top:0,behavior:"smooth"})

}

function deleteOrder(id){

if(!confirm("Bạn có chắc muốn xóa món này?")) return

orders = orders.filter(o => o.orderId != id)

saveStorage()
syncOrders()

renderMyHistory()

}

/* DISH SELECT */

function renderDishSelect(){

const select=document.getElementById("dishSelect")

if(!select) return

select.innerHTML=""

menuLines.forEach(d=>{

const op=document.createElement("option")

op.value=d
op.innerText=d

select.appendChild(op)

})

}

/* ADMIN ORDER LIST */

function renderOrders(){

const grid=document.getElementById("summaryGrid")
const list=document.getElementById("detailList")

if(!grid) return

grid.innerHTML=""
list.innerHTML=""

let map={}

orders.forEach(o=>{
map[o.dish]=(map[o.dish]||0)+1
})

for(let dish in map){

let div=document.createElement("div")

div.innerHTML=`${dish}<br><b>x${map[dish]}</b>`

grid.appendChild(div)

}

orders.forEach(o=>{

let item=document.createElement("div")

item.className="orderItem"

item.innerHTML=`
<span><b>${o.name}</b><br>${o.dish}<br>${o.note||""}</span>
<span>${o.time}</span>
`

list.appendChild(item)

})

document.getElementById("total").innerText=orders.length

}

/* EXPORT TXT */

function exportTxt(){

const now = new Date()

const day = String(now.getDate()).padStart(2,"0")
const month = String(now.getMonth()+1).padStart(2,"0")
const year = now.getFullYear()

let text = `Đơn cơm trưa hôm nay ${day}-${month}-${year}\n\n`

orders.forEach(o=>{
text += `${o.name} - ${o.dish} - ${o.note||""}\n`
})

const fileName = `lunch_order_${day}-${month}-${year}.txt`

const blob = new Blob([text],{type:"text/plain"})

const a=document.createElement("a")

a.href=URL.createObjectURL(blob)
a.download=fileName
a.click()

}

/* ORDER STATE */

function checkOrderState(){

const overlay=document.getElementById("overlay")
const text=document.getElementById("overlayText")

if(!overlay) return

if(!enableOrder){

overlay.classList.remove("hidden")
text.innerText="Đơn hàng mới chưa bắt đầu! Vui lòng đợi!"
return

}

overlay.classList.add("hidden")

}

/* DEADLINE TEXT */

function renderDeadline(){

const el=document.getElementById("deadlineText")

if(!el) return

el.innerText="Thời gian chốt đơn: "+deadline

}

/* AUTO REFRESH */

setInterval(()=>{

loadStorage()

},10000)

/* OCR */

async function scanMenu(file){

document.getElementById("scanLoading").classList.remove("hidden")

const {data:{text}}=await Tesseract.recognize(
file,
'vie',
{langPath:'https://tessdata.projectnaptha.com/4.0.0'}
)

menuLines=text
.split("\n")
.map(x=>x.trim())
.filter(x=>x!="")
.map(x=>x.replace(/[^0-9a-zA-ZÀ-ỹ: ]+/g,""))
.map(x=>x.replace(/\s+/g," "))

renderMenuLines()

saveStorage()

document.getElementById("scanLoading").classList.add("hidden")

}