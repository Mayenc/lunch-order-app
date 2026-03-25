// const page = document.body.dataset.page

// let orders = []
// let menuLines = []
// let menuImage = null
// let enableOrder = false
// let deadline = "12:00"

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
// deadline = "12:00"
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
// deadline="12:00"

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
// orderId=crypto.randomUUID()
// orders.push({

// orderId:orderId,
// deviceId:deviceId,
// name,
// dish,
// note,
// time:new Date().toLocaleTimeString()

// })

// const now = new Date();
// const vnDate = new Date(now.getTime() + 7 * 60 * 60 * 1000);

// let date_c = vnDate.toISOString().split('T')[0];
// let time_c = vnDate.toISOString().split('T')[1].split('.')[0];
// writeSheet(orderId, deviceId, name, dish, note, date_c, time_c)
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

// async function readSheet(){

//     const res = await fetch("https://script.google.com/macros/s/AKfycbwm8RH1lCFATT2iI058cOozq5ag6g6Z53Budod83ymdeGVJ84E2MSbMjW01iJu6l8m3IQ/exec");
//     const data = await res.json();

//     return data;
// }


// async function writeSheet(orderId, deviceId, name, dish, note, date, time){
//     console.log(date, time)
//     await fetch("https://script.google.com/macros/s/AKfycbwm8RH1lCFATT2iI058cOozq5ag6g6Z53Budod83ymdeGVJ84E2MSbMjW01iJu6l8m3IQ/exec",{
//         method:"POST",
//         mode:"no-cors",
//         body:JSON.stringify({
//             orderId: orderId,
//             deviceId: deviceId,
//             name: name,
//             dish: dish,
//             note: note,
//             date: date,
//             time: time 
//         })
//     });

// }


//------------------------------------------------------------------------------------------------------------------------------------------------
// const page = document.body.dataset.page

// let orders = []
// let menuLines = []
// let menuImage = null
// let enableOrder = false
// let deadline = "12:00"

// let deviceId = null

// getDeviceId()
// loadStorage()
// readSheet()

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
// const img = localStorage.getItem("menuImage")
// const en = localStorage.getItem("enableOrder")
// const dl = localStorage.getItem("deadline")

// if(m) menuLines = JSON.parse(m)
// if(img) menuImage = img
// if(en) enableOrder = JSON.parse(en)

// if(dl){
// deadline = dl
// }else{
// deadline = "12:00"
// }

// /* USER PAGE */

// if(page==="user"){

// const imgEl = document.getElementById("menuImg")

// if(imgEl && menuImage) imgEl.src = menuImage

// renderDishSelect()
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
// deadline="12:00"

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

// orderId=crypto.randomUUID()

// const now = new Date();
// const vnDate = new Date(now.getTime() + 7 * 60 * 60 * 1000);

// let date_c = vnDate.toISOString().split('T')[0];
// let time_c = vnDate.toISOString().split('T')[1].split('.')[0];

// writeSheet(orderId, deviceId, name, dish, note, date_c, time_c)

// alert("Đặt món ăn thành công!")

// readSheet()

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
// <div style="width:100%;display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid #eee;">
// <div>
// <div style="font-weight:600;font-size:15px">${o.dish}</div>
// <div style="font-size:13px;color:#666">${o.note || ""}</div>
// </div>
// <div style="text-align:right">
// <div style="font-size:12px;color:#888;margin-bottom:6px">🕒 ${o.time}</div>
// </div>
// </div>
// `

// box.appendChild(div)

// })

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

// readSheet()

// if(page==="user")
// checkOrderState()

// },5000)

// /* READ SHEET */

// async function readSheet(){

// try{

// const res = await fetch("https://script.google.com/macros/s/AKfycbwm8RH1lCFATT2iI058cOozq5ag6g6Z53Budod83ymdeGVJ84E2MSbMjW01iJu6l8m3IQ/exec")
// const data = await res.json()

// orders = data

// if(page==="admin") renderOrders()
// if(page==="user") renderMyHistory()

// }catch(e){

// console.log("Sheet load error",e)

// }

// }

// /* WRITE SHEET */

// async function writeSheet(orderId, deviceId, name, dish, note, date, time){

// await fetch("https://script.google.com/macros/s/AKfycbwm8RH1lCFATT2iI058cOozq5ag6g6Z53Budod83ymdeGVJ84E2MSbMjW01iJu6l8m3IQ/exec",{

// method:"POST",
// mode:"no-cors",
// body:JSON.stringify({

// orderId: orderId,
// deviceId: deviceId,
// name: name,
// dish: dish,
// note: note,
// date: date,
// time: time 

// })

// })

// }


// const page = document.body.dataset.page

// let orders = []
// let menuLines = []
// let menuImage = null
// let enableOrder = false
// let deadline = "12:00"
// let selectedDate = null

// let deviceId = null

// getDeviceId()
// loadStorage()
// readSheet()

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
// const img = localStorage.getItem("menuImage")
// const en = localStorage.getItem("enableOrder")
// const dl = localStorage.getItem("deadline")

// if(m) menuLines = JSON.parse(m)
// if(img) menuImage = img
// if(en) enableOrder = JSON.parse(en)

// deadline = dl || "12:00"

// if(page==="user"){
// renderDishSelect()
// checkOrderState()
// renderDeadline()
// }

// }

// /* SAVE */
// function saveStorage(){
// localStorage.setItem("menuLines",JSON.stringify(menuLines))
// localStorage.setItem("menuImage",menuImage)
// localStorage.setItem("enableOrder",enableOrder)
// localStorage.setItem("deadline",deadline)
// }

// /* ================= USER ORDER ================= */

// if(page==="user"){

// const orderBtn = document.getElementById("orderBtn")

// if(orderBtn){

// orderBtn.onclick = async () => {

// if(!enableOrder) return

// const name=document.getElementById("name").value
// const dish=document.getElementById("dishSelect").value
// const note=document.getElementById("note").value

// if(!name || !dish) return alert("Vui lòng nhập đầy đủ thông tin")

// let editId = orderBtn.dataset.editId

// const now = new Date();
// const vnDate = new Date(now.getTime() + 7 * 60 * 60 * 1000);

// let date_c = vnDate.toISOString().split('T')[0];
// let time_c = vnDate.toISOString().split('T')[1].split('.')[0];

// if(editId){
// // UPDATE
// await updateSheet(editId, name, dish, note, date_c, time_c)
// alert("Cập nhật thành công!")

// orderBtn.innerText="Đặt cơm"
// orderBtn.dataset.editId=""

// }else{
// // CREATE
// let orderId=crypto.randomUUID()

// await writeSheet(orderId, deviceId, name, dish, note, date_c, time_c)

// alert("Đặt món ăn thành công!")
// }

// readSheet()

// document.getElementById("dishSelect").value=""
// document.getElementById("note").value=""
// }

// }

// }

// /* ================= HISTORY ================= */

// function renderMyHistory(){

// const box = document.getElementById("myHistory")
// if(!box) return
// // lấy ngày hôm nay
// const now = new Date()
// const vn = new Date(now.getTime() + 7*60*60*1000)
// const today = vn.toISOString().split('T')[0]

// // check điều kiện cho phép edit
// const allowEdit = (selectedDate === today) && isBeforeDeadline()
// box.innerHTML=""

// let myOrders = orders.filter(o => 
// o.deviceId === deviceId &&
// (!selectedDate || o.date === selectedDate)
// )
// console.log(myOrders)
// if(myOrders.length === 0){
// box.innerHTML="<p>Chưa có món nào</p>"
// return
// }
// myOrders.forEach(o => {

// let div = document.createElement("div")

// div.className = "orderItem"

// div.innerHTML = `

// <div style="
// width: 90%;
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

// <div style="text-align:right; margin-right: 8px">

// <div style="font-size:12px;color:#888;margin-bottom:6px">
// 🕒 ${o.date.toString()} ${o.time.toString()}
// </div>

// ${
// allowEdit
// ? `
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
// `
// : ""
// }

// </div>

// </div>
// `

// box.appendChild(div)

// })

// }
// // myOrders.forEach(o => {

// // let div = document.createElement("div")

// // div.className = "orderItem"

// // div.innerHTML = `
// // <div style="display:flex;justify-content:space-between;padding:10px;border-bottom:1px solid #eee;">
// // <div>
// // <b>${o.dish}</b><br>
// // <span>${o.note || ""}</span>
// // </div>

// // <div style="text-align:right">
// // <div style="font-size:12px">${o.time}</div>

// // <button onclick="editOrder('${o.orderId}')">Edit</button>
// // <button onclick="deleteOrder('${o.orderId}')">Delete</button>
// // </div>
// // </div>
// // `

// // box.appendChild(div)

// // })

// // }
// /* ================= CHECK DEALINE ================= */
// function isBeforeDeadline(){

// if(!deadline) return true

// const now = new Date()

// const currentTime = now.toTimeString().slice(0,5) // HH:mm
// console.log(currentTime < deadline)
// console.log("current: ", currentTime)
// console.log("dealine: ", deadline)
// return currentTime <= deadline

// }

// /* ================= EDIT ================= */

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

// /* ================= DELETE ================= */

// function deleteOrder(id){

// if(!confirm("Bạn có chắc muốn xóa không?")) return

// deleteSheet(id)

// readSheet()

// }
// /* ================= FILTER DATE ================= */
// function renderDateFilter(){

// const select = document.getElementById("filterDate")
// if(!select) return

// // lấy list date unique
// let dates = [...new Set(orders.map(o => o.date))]

// // sort giảm dần (mới nhất trước)
// dates.sort((a,b)=> b.localeCompare(a))

// select.innerHTML=""

// // default = hôm nay
// const now = new Date()
// const vn = new Date(now.getTime() + 7*60*60*1000)
// const today = vn.toISOString().split('T')[0]

// selectedDate = selectedDate || today

// dates.forEach(d=>{
// const op=document.createElement("option")
// op.value=d
// op.innerText=d

// if(d===selectedDate) op.selected=true

// select.appendChild(op)
// })

// // change event
// select.onchange = (e)=>{
// selectedDate = e.target.value
// renderMyHistory()
// }

// }

// /* ================= DISH ================= */

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

// /* ================= STATE ================= */

// function checkOrderState(){

// const overlay=document.getElementById("overlay")
// const text=document.getElementById("overlayText")

// if(!overlay) return

// if(!enableOrder){
// overlay.classList.remove("hidden")
// text.innerText="Đơn hàng chưa mở!"
// return
// }

// overlay.classList.add("hidden")

// }

// /* ================= DEADLINE ================= */

// function renderDeadline(){
// const el=document.getElementById("deadlineText")
// if(!el) return
// el.innerText="Thời gian chốt đơn: "+deadline
// }

// /* AUTO REFRESH */

// setInterval(()=>{
// readSheet()
// if(page==="user") checkOrderState()
// },5000)

// /* ================= API ================= */

// async function readSheet(){

// try{
// const res = await fetch("https://script.google.com/macros/s/AKfycbx2m3oYjqojlO5UpWd0u7x4Lf2jdAQIo86oi-28bzIaUP12B1JI5xu4jaRgirZrEJ0GZA/exec")
// const data = await res.json()

// orders = data

// if(page==="user") 
// {
//     renderDateFilter()
//     renderMyHistory()
// }

// }catch(e){
// console.log("Sheet error",e)
// }

// }

// async function writeSheet(orderId, deviceId, name, dish, note, date, time){

// await fetch("https://script.google.com/macros/s/AKfycbx2m3oYjqojlO5UpWd0u7x4Lf2jdAQIo86oi-28bzIaUP12B1JI5xu4jaRgirZrEJ0GZA/exec",{
// method:"POST",
// mode:"no-cors",
// body:JSON.stringify({
// action:"create",
// orderId,
// deviceId,
// name,
// dish,
// note,
// date,
// time
// })
// })

// }

// async function updateSheet(orderId, name, dish, note, date, time){

// await fetch("https://script.google.com/macros/s/AKfycbx2m3oYjqojlO5UpWd0u7x4Lf2jdAQIo86oi-28bzIaUP12B1JI5xu4jaRgirZrEJ0GZA/exec",{
// method:"POST",
// mode:"no-cors",
// body:JSON.stringify({
// action:"update",
// orderId,
// name,
// dish,
// note,
// date,
// time
// })
// })

// }

// async function deleteSheet(orderId){

// await fetch("https://script.google.com/macros/s/AKfycbx2m3oYjqojlO5UpWd0u7x4Lf2jdAQIo86oi-28bzIaUP12B1JI5xu4jaRgirZrEJ0GZA/exec",{
// method:"POST",
// mode:"no-cors",
// body:JSON.stringify({
// action:"delete",
// orderId
// })
// })

// }


const page = document.body.dataset.page

let orders = []
let menuLines = []
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

menuLines.forEach(d=>{
const op=document.createElement("option")
op.value=d
op.innerText=d
select.appendChild(op)
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

const addBtn = document.getElementById("addMenuItem")

if(addBtn){

addBtn.onclick=()=>{

menuLines.push("")
renderMenuLines()

}

}
function updateLine(i,val){

menuLines[i]=val

}
function removeLine(i){

menuLines.splice(i,1)
renderMenuLines()

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

const res = await fetch("https://script.google.com/macros/s/AKfycbx2m3oYjqojlO5UpWd0u7x4Lf2jdAQIo86oi-28bzIaUP12B1JI5xu4jaRgirZrEJ0GZA/exec?action=loadOrders")
const data = await res.json()
console.log("data order: ",data)
orders = data

// 🔥 FIX QUAN TRỌNG
if(page==="user"){
    renderDateFilter()
    renderMyHistory()
}

if(page==="admin"){
    // loadMenuAdminFromSheet()
    renderAdminDateFilter()
    renderAdminOrders()
}

}catch(e){
console.log("Sheet error",e)
}

}

/* ================= WRITE ================= */

async function writeSheet(orderId, deviceId, userId, name, dish, note, date, time){

await fetch("https://script.google.com/macros/s/AKfycbx2m3oYjqojlO5UpWd0u7x4Lf2jdAQIo86oi-28bzIaUP12B1JI5xu4jaRgirZrEJ0GZA/exec",{
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

await fetch("https://script.google.com/macros/s/AKfycbx2m3oYjqojlO5UpWd0u7x4Lf2jdAQIo86oi-28bzIaUP12B1JI5xu4jaRgirZrEJ0GZA/exec",{
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
await fetch("https://script.google.com/macros/s/AKfycbx2m3oYjqojlO5UpWd0u7x4Lf2jdAQIo86oi-28bzIaUP12B1JI5xu4jaRgirZrEJ0GZA/exec",{
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

    // await fetch("https://script.google.com/macros/s/AKfycbx2m3oYjqojlO5UpWd0u7x4Lf2jdAQIo86oi-28bzIaUP12B1JI5xu4jaRgirZrEJ0GZA/exec",{
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
    await fetch("https://script.google.com/macros/s/AKfycbx2m3oYjqojlO5UpWd0u7x4Lf2jdAQIo86oi-28bzIaUP12B1JI5xu4jaRgirZrEJ0GZA/exec", {
        method: "POST",
        mode:"no-cors",
        body: JSON.stringify({
            action: "saveMenu",
            date: today,
            menu: menuLines
        })
    })

    // ===== SAVE CONFIG (THÊM) =====
    await fetch("https://script.google.com/macros/s/AKfycbx2m3oYjqojlO5UpWd0u7x4Lf2jdAQIo86oi-28bzIaUP12B1JI5xu4jaRgirZrEJ0GZA/exec", {
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

        const url = `https://script.google.com/macros/s/AKfycbx2m3oYjqojlO5UpWd0u7x4Lf2jdAQIo86oi-28bzIaUP12B1JI5xu4jaRgirZrEJ0GZA/exec?action=loadMenu&date=${today}`

        const res = await fetch(url)

        const data = await res.json()

        menuLines = data || []

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

        const url = `https://script.google.com/macros/s/AKfycbx2m3oYjqojlO5UpWd0u7x4Lf2jdAQIo86oi-28bzIaUP12B1JI5xu4jaRgirZrEJ0GZA/exec?action=loadMenu&date=${today}`

        const res = await fetch(url)
        const data = await res.json()

        // 🔥 GÁN LẠI MENU
        menuLines = data || []

        console.log("menuLines:", menuLines)

        // 👇 USER
        if(typeof renderDishSelect === "function"){
            renderDishSelect()
        }

        // 👇 ADMIN (QUAN TRỌNG)
        if(typeof renderMenuLines === "function"){
            renderMenuLines()
        }

    }catch(e){
        console.log("Load menu error", e)
    }
}

async function loadConfig(){

    try{

        const res = await fetch(`https://script.google.com/macros/s/AKfycbx2m3oYjqojlO5UpWd0u7x4Lf2jdAQIo86oi-28bzIaUP12B1JI5xu4jaRgirZrEJ0GZA/exec?action=loadConfig`)
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

        const res = await fetch(`https://script.google.com/macros/s/AKfycbx2m3oYjqojlO5UpWd0u7x4Lf2jdAQIo86oi-28bzIaUP12B1JI5xu4jaRgirZrEJ0GZA/exec?action=loadUsers`)
        const data = await res.json()
        console.log("data user: ", data)
        users = data || []

        renderUserSelect()

    }catch(e){
        console.log("Load users error", e)
    }
}