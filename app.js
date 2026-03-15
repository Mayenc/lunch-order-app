const page = document.body.dataset.page

let orders = []
let menuLines = []
let menuImage = null
let enableOrder = false
let deadline = "08:50"

loadStorage()

/* STORAGE */

function loadStorage(){

const m = localStorage.getItem("menuLines")
const o = localStorage.getItem("orders")
const img = localStorage.getItem("menuImage")
const en = localStorage.getItem("enableOrder")
const dl = localStorage.getItem("deadline")

if(m) menuLines = JSON.parse(m)
if(o) orders = JSON.parse(o)
if(img) menuImage = img
if(en) enableOrder = JSON.parse(en)
if (dl) {
deadline = dl
} else {
deadline = "08:50"
}

if(page==="user"){
document.getElementById("menuImg").src = menuImage
renderDishSelect()
checkOrderState()
renderDeadline()
}
if(page==="admin"){
const clearBtn = document.getElementById("clearData")

if(clearBtn){

clearBtn.onclick = () => {

if(!confirm("Clear all data?")) return

localStorage.clear()

orders = []
menuLines = []
menuImage = null
enableOrder = false
deadline = "08:50"

location.reload()

}

}
const tabManage = document.getElementById("tabManage")
const tabOrders = document.getElementById("tabOrders")

const managePage = document.getElementById("managePage")
const ordersPage = document.getElementById("ordersPage")

tabManage.onclick = () => {

tabManage.classList.add("tabActive")
tabOrders.classList.remove("tabActive")

managePage.classList.remove("hidden")
ordersPage.classList.add("hidden")

}

tabOrders.onclick = () => {

tabOrders.classList.add("tabActive")
tabManage.classList.remove("tabActive")

managePage.classList.add("hidden")
ordersPage.classList.remove("hidden")

renderOrders()

}

}
if(page==="admin"){

document.getElementById("preview").src = menuImage
document.getElementById("enableOrder").checked = enableOrder

if(deadline)
document.getElementById("deadline").value = deadline

renderMenuLines()
}

}

function saveStorage(){

localStorage.setItem("menuLines",JSON.stringify(menuLines))
localStorage.setItem("orders",JSON.stringify(orders))
localStorage.setItem("menuImage",menuImage)
localStorage.setItem("enableOrder",enableOrder)
localStorage.setItem("deadline",deadline)

}

/* ADMIN */

if(page==="admin"){

document.getElementById("menuUpload").onchange=(e)=>{

const file = e.target.files[0]
orders=[]

const reader = new FileReader()

reader.onload=(x)=>{

menuImage=x.target.result
document.getElementById("preview").src=menuImage

scanMenu(file)

}

reader.readAsDataURL(file)

}

document.getElementById("enableOrder").onchange=(e)=>{

enableOrder=e.target.checked
saveStorage()

}

document.getElementById("deadline").onchange=(e)=>{

deadline=e.target.value
saveStorage()
renderDeadline()
}

document.getElementById("addMenuItem").onclick=()=>{

menuLines.push("")
renderMenuLines()

}

document.getElementById("saveMenu").onclick=()=>{

saveStorage()
alert("Menu saved")

}

document.getElementById("exportTxt").onclick=exportTxt

}

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

/* USER */

if(page==="user"){

document.getElementById("orderBtn").onclick=()=>{

if(!enableOrder) return

const name=document.getElementById("name").value
const dish=document.getElementById("dishSelect").value
const note=document.getElementById("note").value

if(!name||!dish) return alert("Vui lòng nhập đầy đủ thông tin")

let now=new Date()

if(deadline){

let today=now.toISOString().split("T")[0]
let deadlineTime=new Date(today+"T"+deadline)

// if(now>deadlineTime){
// alert("Ordering time expired")
// return
// }

}

orders.push({

name,
dish,
note,
time:new Date().toLocaleTimeString()

})

saveStorage()

alert("Đặt món ăn thành công!")

}

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

/* ORDER LIST */

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

let text = `Đơm cơm trưa hôm nay ${day}-${month}-${year}\n\n`

orders.forEach(o=>{

text += `${o.name} - ${o.dish} - ${o.note || ""}\n`

})

const fileName = `lunch_order_${day}-${month}-${year}.txt`

/* DOWNLOAD */

const blob = new Blob([text], { type:"text/plain" })

const a = document.createElement("a")

a.href = URL.createObjectURL(blob)

a.download = fileName

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

if(!deadline){

overlay.classList.add("hidden")
return

}

let now=new Date()
let today=now.toISOString().split("T")[0]

let deadlineTime=new Date(today+"T"+deadline)

// if(now>deadlineTime){

// overlay.classList.remove("hidden")
// text.innerText="Ordering time expired"

// }
// else{

// overlay.classList.add("hidden")

// }

}

setInterval(()=>{

if(page==="user")
checkOrderState()

if(page==="admin")
renderOrders()

},5000)
function renderDeadline(){

const el = document.getElementById("deadlineText")

if(!el) return

if(!deadline){

el.innerText = ""

return
}

el.innerText = "Thời gian chốt đơn: " + deadline

}