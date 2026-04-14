
let users = []
let menuLines = {}
let deviceId = null
let orders = []
let selectedDate = null
let deadline = null


async function init(){
    // await loadConfig()  
    // await loadUsers()
    // await loadMenuFromSheet()
    // getDeviceId()
    // readSheet()

    // renderDateFilter()
    // renderDeadline()        
    // renderOrders()
    try {
        showLoading()

        await Promise.all([
            loadConfig(),
            loadUsers(),
            loadMenuFromSheet()
        ])

        getDeviceId()
        // readSheet()

        renderDateFilter()
        renderDeadline()        
        // renderOrders()

    } catch (err) {
        console.error("Load lỗi:", err)
    } finally {
        hideLoading()
    }
}

init();
function showLoading(text = "Đang xử lý..."){
    const el = document.getElementById("loadingOverlay");
    el.classList.add("active");

    const txt = el.querySelector(".loading-text");
    if(txt) txt.innerText = text;
}
function hideLoading(){
    const el = document.getElementById("loadingOverlay");
    el.classList.remove("active");
}
function showListLoading() {
    const list = document.getElementById('orderList');

    list.innerHTML = `
        <div class="order-loading">
            <div>
                <div class="dots">
                    <span></span><span></span><span></span>
                </div>
                <div style="margin-top:8px;font-size:13px;color:#777">
                    Đang tải đơn...
                </div>
            </div>
        </div>
    `;
}
function getDeviceId(){
let id = localStorage.getItem("deviceId")

if(!id){
id = "dev_" + Math.random().toString(36).substring(2) + Date.now()
localStorage.setItem("deviceId",id)
}

deviceId = id
return deviceId
}
function saveStorage(){
localStorage.setItem("deviceId",deviceId)
localStorage.setItem("menuImage",menuImage)
}

// function renderUserSelect(){
//     const el = document.getElementById("nameSelect")
//     if(!el) return
//     el.innerHTML = `<option value="">— Chọn người đặt —</option>`
//     users.forEach(u => {
//         const opt = document.createElement("option")
//         opt.value = u.id
//         opt.textContent = u.name
//         el.appendChild(opt)
//     })
//     const saved = localStorage.getItem("selectedUser")
//     if(saved){
//         el.value = saved
//         // renderMyHistory()
//     }
//     el.addEventListener("change", function(){
//         localStorage.setItem("selectedUser", this.value)
//         readSheet(this.value);
//     })
//     readSheet(el.value);
// }
let tomSelectInstance = null;

function renderUserSelect(){
    const el = document.getElementById("nameSelect")
    if(!el) return

    if (tomSelectInstance) {
        tomSelectInstance.destroy();
        tomSelectInstance = null;
    }

    el.innerHTML = `<option value="">— Chọn người đặt —</option>`

    users.forEach(u => {
        const opt = document.createElement("option")
        opt.value = u.id
        opt.textContent = u.name
        el.appendChild(opt)
    })

    tomSelectInstance = new TomSelect(el, {
        create: false,
        allowEmptyOption: true,
        placeholder: "— Chọn người đặt —",
        maxOptions: 1000,
        searchField: ["text"],
        highlight: true,
        openOnFocus: true,
        hideSelected: true,
        onItemAdd: function(value) {
            this.blur(); 
        },
        onFocus: function() {
            this.setTextboxValue("");
        },
        onType: function(str) {
            const item = this.control.querySelector('.item');
            if (item) {
                item.style.display = str.length ? 'none' : '';
            }
        }
    })

    const saved = localStorage.getItem("selectedUser")
    if(saved){
        tomSelectInstance.setValue(saved)
    }

    el.addEventListener("change", function(){
        localStorage.setItem("selectedUser", this.value)
        readSheet(this.value);
    })

    readSheet(el.value);
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
function renderDishSelect() {
    const select = document.getElementById("foodSelect");
    if (!select) return;

    select.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.innerText = "— Chọn món —";
    defaultOption.selected = true;
    defaultOption.disabled = true; 
    select.appendChild(defaultOption);

    Object.keys(menuLines).forEach(groupName => {
        const optgroup = document.createElement("optgroup");
        optgroup.label = groupName;

        menuLines[groupName].forEach(dish => {
            const option = document.createElement("option");
            option.value = dish;
            option.innerText = dish;
            optgroup.appendChild(option);
        });

        select.appendChild(optgroup);
    });
}
async function loadMenuFromSheet(){

    const now = new Date()
    const vn = new Date(now.getTime() + 7*60*60*1000)
    const today = vn.toISOString().split('T')[0]

    try{

        const url = `https://script.google.com/macros/s/AKfycbwFvi0n2mszdHsn5C_HRn544L28U1hBM8cicXv3NVl4LwA8WQf2j45XL5mQFlYhEch4rQ/exec?action=loadMenu&date=${today}`

        const res = await fetch(url)

        const data = await res.json()
        console.log("menu: ", data)
        menuLines = data || []

        renderDishSelect()

    }catch(e){
        console.log("Load menu error", e)
    }
}


function renderDateFilter(){
    const now = new Date()
    const vn = new Date(now.getTime() + 7*60*60*1000)
    const today = vn.toISOString().split('T')[0]
    selectedDate = today
}
function isBeforeDeadline(){

if(!deadline) return true

const now = new Date()
const currentTime = now.toTimeString().slice(0,5)

return currentTime <= deadline

}
function fmtRenderDealine(data){
    return data.split(':').slice(0, 2).join(':')
}
function renderDeadline(){
const el=document.getElementById("deadlineInput")
if(!el) return
el.innerText= fmtRenderDealine(deadline)
}
const NAMES = users;
const FOODS = menuLines;
//   = 
//   {
//     '🍚 Cơm': ['Tép rim thịt','Cá nục kho măng','Bạch tuộc xào sả tế','Thịt kho đậu hũ','Chay: gỏi ngó sen'],
//     '🍜 Bún/Phở': ['Bún măng vịt'],
//     '🥗 Khác': ['Miến gà xé'],
//   };
  const COLORS = [
    'linear-gradient(135deg,#E8572A,#F5A623)',
    'linear-gradient(135deg,#3DAA6E,#56D18A)',
    'linear-gradient(135deg,#6C63FF,#A78BFA)',
    'linear-gradient(135deg,#E91E8C,#FF6B9D)',
    'linear-gradient(135deg,#00BCD4,#4DD0E1)',
    'linear-gradient(135deg,#FF5722,#FF9800)',
  ];

//   let orders = JSON.parse(localStorage.getItem('lunchV3') || '[]');
  let currentFilter = 'today';
  let editingId = null;

//   let deadlineTime = localStorage.getItem('lunchDeadlineV3') || fmtRenderDealine(deadline);
  let deadlineTime = localStorage.getItem('lunchDeadlineV3') || null;

  document.getElementById('deadlineInput').value = deadlineTime;
  document.getElementById('deadlineInput').addEventListener('change', function() {
    deadlineTime = this.value;
    localStorage.setItem('lunchDeadlineV3', deadlineTime);
    updateDeadline();
    renderOrders();
  });

  function getDeadlineDT() {
    const [h,m] = deadlineTime.split(':').map(Number);
    const d = new Date(); d.setHours(h,m,0,0); return d;
  }
  function isPastDeadline() { return new Date() > getDeadlineDT(); }
  function isEditable(order) {
    const now = new Date();
    const vn = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const today = vn.toISOString().split('T')[0];
    // const orderDate = new Date(order.time);
    // const sameDay = orderDate.toDateString() === new Date().toDateString();
    // return sameDay && !isPastDeadline();
    const currentDeviceId = getDeviceId();
    const editable =
        order.date === today &&
        isBeforeDeadline() &&
        order.deviceId === currentDeviceId;
    return editable;
  }

  function updateDeadline() {
    const past = isPastDeadline();
    const status = document.getElementById('deadlineStatus');
    const label = document.getElementById('deadlineLabel');
    const countdown = document.getElementById('countdown');
    const btn = document.getElementById('btnOrder');

    status.className = 'deadline-status ' + (past ? 'closed' : 'open');
    label.textContent = past ? 'Đã đóng' : 'Đang mở';

    if (past) {
      countdown.textContent = `Đã kết thúc lúc ${deadlineTime}`;
      btn.disabled = true;
      btn.innerHTML = '🔒 Hết giờ đặt cơm';
    } else {
      const diff = getDeadlineDT() - new Date();
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      countdown.textContent = mins > 60
        ? `Còn ${Math.floor(mins/60)}h ${mins%60}p`
        : mins > 0 ? `Còn ${mins}p ${secs}s` : `Còn ${secs}s`;
      btn.disabled = false;
      btn.innerHTML = 'Đặt ngay';
    }
  }

//   setInterval(() => { updateDeadline(); renderOrders(); }, 1000);
//   updateDeadline();
    let countdownInterval = null;

    function startCountdown(){
        if(countdownInterval) return; // tránh bị gọi nhiều lần

        updateDeadline(); // chạy 1 lần trước
        renderOrders()
        countdownInterval = setInterval(() => {
            updateDeadline();
           
        }, 1000);
    }

  function getInitial(name) { const p = name.trim().split(' '); return p[p.length-1][0].toUpperCase(); }
  function getColor(name) { let h=0; for(let c of name) h=(h*31+c.charCodeAt(0))%COLORS.length; return COLORS[h]; }
  function fmtTime(iso) { return new Date(iso).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}); }
  function fmtDate(iso) { return new Date(iso).toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'}); }
  function isToday(iso) { return new Date(iso).toDateString() === new Date().toDateString(); }
  function isThisWeek(iso) {
    const d=new Date(iso), t=new Date();
    const sw=new Date(t); sw.setDate(t.getDate()-t.getDay()+1); sw.setHours(0,0,0,0);
    const ew=new Date(sw); ew.setDate(sw.getDate()+6); ew.setHours(23,59,59,999);
    return d>=sw && d<=ew;
  }
  function isSameDate(iso, ds) { return new Date(iso).toISOString().slice(0,10)===ds; }

  function nameOpts(selectedId = '') {
    return `<option value="">— Chọn tên —</option>` + 
        users.map(u =>
            `<option value="${u.id}" ${u.id == selectedId ? 'selected' : ''}>
                ${u.name}
            </option>`
        ).join('');
  }
  function foodOpts(selectedDish = '') {
        return `<option value="">— Chọn món —</option>` +
            Object.entries(menuLines).map(([group, items]) =>
                `<optgroup label="${group}">
                    ${items.map(d =>
                        `<option value="${d}" ${d === selectedDish ? 'selected' : ''}>
                            ${d}
                        </option>`
                    ).join('')}
                </optgroup>`
            ).join('');
    }
  const selStyle = `style="width:100%;padding:12px 36px 12px 16px;border:2px solid var(--border);border-radius:10px;font-family:'Quicksand',sans-serif;font-size:0.9rem;font-weight:600;color:var(--text);background:var(--bg) url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22 viewBox=%220 0 12 8%22%3E%3Cpath d=%22M1 1l5 5 5-5%22 stroke=%22%239E8070%22 stroke-width=%222%22 fill=%22none%22 stroke-linecap=%22round%22/%3E%3C/svg%3E') no-repeat right 14px center;appearance:none;outline:none;cursor:pointer;"`;

  function getFiltered() {
    // const dv = document.getElementById('dateFilter').value;
    // if (dv && currentFilter==='date') return orders.filter(o=>isSameDate(o.time,dv));
    if (currentFilter==='today') return orders.filter(o=>isToday(o.time));
    if (currentFilter==='week') return orders.filter(o=>isThisWeek(o.time));
    return orders;
  }
    function confirmDelete(id){
        deleteIdTemp = id;
        document.getElementById("confirmModal").style.display = "flex";
    }

    function confirmYes(){
        if(deleteIdTemp){
            deleteOrder(deleteIdTemp);
        }
        closeModal();
    }

    function confirmNo(){
        closeModal();
    }

    function closeModal(){
        deleteIdTemp = null;
        document.getElementById("confirmModal").style.display = "none";
    }
//   function renderOrders() {
//     const list = document.getElementById('orderList');
//     const sumEl = document.getElementById('summary');

//     const selectedUserId = document.getElementById("nameSelect")?.value;

//     const filtered = orders.filter(o =>
//         o.userId?.toString() === selectedUserId?.toString() &&
//         (!selectedDate || o.date === selectedDate)
//     );

//     // Summary
//     const fc = {};
//     filtered.forEach(o => {
//         fc[o.dish] = (fc[o.dish] || 0) + 1;
//     });

//     sumEl.innerHTML = filtered.length
//         ? `<span class="badge">${filtered.length} suất</span>`
//         : '';

//     if (!filtered.length) {
//         list.innerHTML = `
//             <div class="empty-state">
//                 <p>Chưa có đơn nào</p>
//             </div>`;
//         return;
//     }

//     const sorted = [...filtered].sort((a, b) => new Date(b.time) - new Date(a.time));

//     list.innerHTML = sorted.map(o => {

//         const currentDeviceId = getDeviceId();

//         const editable =
//             o.date === new Date().toISOString().split('T')[0] &&
//             isBeforeDeadline() &&
//             o.deviceId === currentDeviceId;
//         const now = new Date()
//         const vn = new Date(now.getTime() + 7*60*60*1000)
//         const today = vn.toISOString().split('T')[0]
//         const editing = editingId === o.orderId;
//         let lockMsg = '';
//         if (!editable) {
//             lockMsg = today
//             ? `<div class="lock-badge">🔒 Không thể chỉnh sửa</div>`
//             : `<div class="lock-badge">🔒 Chỉ sửa đơn trong ngày</div>`;
//         }

//         return `
//             <div class="order-block">
//             <div class="order-item${editable?'':' locked'}${editing?' editing':''}" id="item-${o.orderId}">
//                 <div class="order-info">
//                 <div class="order-name">${o.name}</div>
//                 <div class="order-food">${o.dish}</div>
//                 ${o.note ? `<div class="order-note">${o.note}</div>` : ''}
//                 ${lockMsg}
//                 </div>
//                 <div>
//                 <div class="order-meta">
//                     <div class="order-time">${o.time}</div>
//                     <div class="order-date-text">${o.date}</div>
//                 </div>
//                 <div class="order-actions">
//                     <button class="btn-act edit" onclick="startEdit('${o.orderId}')" ${editable?'':'disabled'} title="${editable?'Chỉnh sửa':'Đã khoá - qua deadline'}">✏️</button>
//                     <button class="btn-act del" onclick="confirmDelete('${o.orderId}')" ${editable?'':'disabled'} title="${editable?'Xóa':'Đã khoá - qua deadline'}">✕</button>
//                 </div>
//                 </div>
//             </div>
//             <div class="edit-panel${editing?' visible':''}" id="panel-${o.orderId}">
//             <div class="edit-grid">
//                 <div class="form-group">
//                     <label>Tên người đặt</label>
//                     <select id="en-${o.orderId}" ${selStyle}>${nameOpts(o.userId)}</select>
//                 </div>
//                 <div class="form-group">
//                     <label>Món ăn</label>
//                     <select id="ef-${o.orderId}" ${selStyle}>${foodOpts(o.dish)}</select>
//                 </div>
//                 <div class="form-group full">
//                     <label>Ghi chú</label>
//                     <input type="text" id="eo-${o.orderId}" value="${o.note||''}" placeholder="Ghi chú..." style="width:100%;padding:12px 16px;border:2px solid var(--border);border-radius:10px;font-family:'Quicksand',sans-serif;font-size:0.9rem;font-weight:600;color:var(--text);background:var(--bg);outline:none;">
//                 </div>
//                 </div>
//                 <div class="edit-actions">
//                 <button class="btn-save" onclick="saveEdit('${o.orderId}')">💾 Lưu thay đổi</button>
//                 <button class="btn-cancel-edit" onclick="cancelEdit()">Hủy</button>
//                 </div>
//             </div>
//             </div>`;
//         }).join('');
//   }
  function renderOrders() {
        
        const list = document.getElementById('orderList');
        const sumEl = document.getElementById('summary');
        const selectedUserId = document.getElementById("nameSelect")?.value;

        const now = new Date();
        const vn = new Date(now.getTime() + 7 * 60 * 60 * 1000);
        const today = vn.toISOString().split('T')[0];

        // 👉 tính đầu tuần (thứ 2)
        const firstDayOfWeek = new Date(vn);
        const day = firstDayOfWeek.getDay() || 7;
        firstDayOfWeek.setDate(firstDayOfWeek.getDate() - day + 1);
        const weekStart = firstDayOfWeek.toISOString().split('T')[0];

        // ✅ FILTER (user + today/week)
        const filtered = orders.filter(o => {

            // luôn filter theo user
            const matchUser =
                o.userId?.toString() === selectedUserId?.toString();

            if (!matchUser) return false;

            if (currentFilter === 'today') {
                return o.date === today;
            }

            if (currentFilter === 'week') {
                return o.date >= weekStart && o.date <= today;
            }

            return true;
        });
        
        // ✅ SUMMARY
        const fc = {};
        filtered.forEach(o => {
            fc[o.dish] = (fc[o.dish] || 0) + 1;
        });

        // sumEl.innerHTML = filtered.length
        //     ? `<span class="badge">${filtered.length} suất</span>`
        //     : '';
        if (sumEl) {

            if (!filtered.length) {
                sumEl.innerHTML = '';
            }

            sumEl.innerHTML = `
                    <div class="total"><span class="badge" style="background:linear-gradient(135deg,#3DAA6E,#56D18A)">${filtered.length} suất</span></div>
            `;
        }

        // ❌ EMPTY
        if (!filtered.length) {
            list.innerHTML = `
                <div class="empty-state">
                    <p>Chưa có đơn nào</p>
                </div>`;
            return;
        }

        // ✅ SORT mới nhất lên trên
        // const sorted = [...filtered]
        //     .sort((a, b) => new Date(b.time) - new Date(a.time));
        const sorted = [...filtered].sort((a, b) => {

            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);

            return dateB - dateA; // mới nhất lên trên
        });

        // ✅ RENDER
        list.innerHTML = sorted.map(o => {

            const currentDeviceId = getDeviceId();

            const editable =
                o.date === today &&
                isBeforeDeadline() &&
                o.deviceId === currentDeviceId;

            const editing = editingId === o.orderId;

            let lockMsg = '';
            if (!editable) {
                lockMsg = `<div class="lock-badge">🔒 Không thể chỉnh sửa</div>`;
            }

            return `
            <div class="order-block">

                <div class="order-item${editable?'':' locked'}${editing?' editing':''}" id="item-${o.orderId}">
                    
                    <div class="order-info">
                        <div class="order-name">${o.name}</div>
                        <div class="order-food">${o.dish}</div>
                        ${o.note ? `<div class="order-note">${o.note}</div>` : ''}
                        ${lockMsg}
                    </div>

                    <div>
                        <div class="order-meta">
                            <div class="order-time">${o.time}</div>
                            <div class="order-date-text">${o.date}</div>
                        </div>

                        <div class="order-actions">
                            <button class="btn-act edit"
                                onclick="startEdit('${o.orderId}')"
                                ${editable?'':'disabled'}>
                                ✏️
                            </button>

                            <button class="btn-act del"
                                onclick="confirmDelete('${o.orderId}')"
                                ${editable?'':'disabled'}>
                                ✕
                            </button>
                        </div>
                    </div>
                </div>

                <!-- EDIT PANEL -->
                <div class="edit-panel${editing?' visible':''}" id="panel-${o.orderId}">
                    
                    <div class="edit-grid">

                        <div class="form-group">
                            <label>Tên người đặt</label>
                            <select id="en-${o.orderId}">
                                ${nameOpts(o.userId)}
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Món ăn</label>
                            <select id="ef-${o.orderId}">
                                ${foodOpts(o.dish)}
                            </select>
                        </div>

                        <div class="form-group full">
                            <label>Ghi chú</label>
                            <input type="text"
                                id="eo-${o.orderId}"
                                value="${o.note||''}"
                                placeholder="Ghi chú...">
                        </div>

                    </div>

                    <div class="edit-actions">
                        <button class="btn-save"
                            onclick="saveEdit('${o.orderId}')">
                            💾 Lưu
                        </button>

                        <button class="btn-cancel-edit"
                            onclick="cancelEdit()">
                            Hủy
                        </button>
                    </div>

                </div>

            </div>
            `;
        }).join('');
    }

  async function placeOrder() {
    showLoading()
    const now = new Date();
    const vnDate = new Date(now.getTime() + 7 * 60 * 60 * 1000);

    let date_c = vnDate.toISOString().split('T')[0];
    let time_c = vnDate.toISOString().split('T')[1].split('.')[0];

    if (isPastDeadline()) { showToast('⏰ Đã qua deadline, không thể đặt thêm!','error'); return; }
    const userid = document.getElementById("nameSelect").value;
    const name = document.getElementById("nameSelect").selectedOptions[0].text;
    const food = document.getElementById('foodSelect').value;
    const note = document.getElementById('noteInput').value.trim();
    if (!name) { shake('nameSelect'); showToast('Vui lòng chọn đầy đủ thông tin!','error'); return; }
    if (!food) { shake('foodSelect'); showToast('Vui lòng chọn đầy đủ thông tin!','error'); return; }
    const order = { id: Date.now().toString(), name, food, note, time: new Date().toISOString() };
    orders.unshift(order);
    save();
    let orderId=crypto.randomUUID()
    await writeSheet(orderId, deviceId,userid, name, food, note, date_c, time_c)
    document.getElementById('foodSelect').value = '';
    document.getElementById('noteInput').value = '';
    hideLoading()
    showToast(`✅ ${name} đã đặt ${food}!`, 'success');
    if (!['today','week'].includes(currentFilter)) {
      setFilter('today', document.querySelectorAll('.filter-btn')[0]);
    } else { renderOrders(); }
  }

  function startEdit(id) {
    const o = orders.find(x=>x.orderId===id);
    if (!o || !isEditable(o)) { showToast('🔒 Đã qua deadline, không thể chỉnh sửa!','error'); return; }
    editingId = id;
    renderOrders();
    setTimeout(() => {
    const p = document.getElementById('panel-'+id);
    if (p) p.scrollIntoView({ behavior:'smooth', block:'nearest' });
    }, 50);
  }

  function cancelEdit() { editingId = null; renderOrders(); }

  async function saveEdit(id) {
    showLoading()
    const now = new Date();
    const vnDate = new Date(now.getTime() + 7 * 60 * 60 * 1000);

    let date_c = vnDate.toISOString().split('T')[0];
    let time_c = vnDate.toISOString().split('T')[1].split('.')[0];
    const o = orders.find(x=>x.orderId===id);
    if (!o || !isEditable(o)) { showToast('🔒 Đã qua deadline!','error'); return; }
    const userid = document.getElementById('en-'+id).value;
    const name = document.getElementById('en-'+id).selectedOptions[0].text;
    // const name = document.getElementById('en-'+id).value;
    const dish = document.getElementById('ef-'+id).value;
    const note = document.getElementById('eo-'+id).value.trim();
    if (!name || !dish) { showToast('⚠️ Vui lòng chọn đầy đủ thông tin!','error'); return; }
    o.name = name; o.dish = dish; o.note = note;
    editingId = null;
    await updateSheet(id,userid, name, dish, note, date_c, time_c)
    save(); renderOrders();
    hideLoading()
    showToast('✏️ Đã cập nhật đơn thành công!','info');
  }

  function deleteOrder(id) {
    showLoading()
    const o = orders.find(x=>x.orderId===id);
    if (!o || !isEditable(o)) { showToast('🔒 Đã qua deadline, không thể xóa!','error'); return; }
    const el = document.getElementById('item-'+id);
    if (el) {
      el.style.transition = 'opacity 0.3s, transform 0.3s';
      el.style.opacity = '0'; el.style.transform = 'translateX(20px)';
    }
    setTimeout(() => {
      orders = orders.filter(x=>x.orderId!==id);
      save(); renderOrders();
    }, 300);
    deleteSheet(id, o.userId)
    hideLoading()
    showToast('✅ Xóa thành công!','success'); return;
  }

  function setFilter(type, btn) {
    currentFilter = type;
    document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    renderOrders();
  }

  function filterByDate(val) {
    if (!val) return;
    currentFilter = 'date';
    document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
    renderOrders();
  }

  function save() { localStorage.setItem('lunchV3', JSON.stringify(orders)); }

  function showToast(msg, type='success') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = `toast ${type} show`;
    clearTimeout(t._t);
    t._t = setTimeout(()=>t.classList.remove('show'), 3000);
  }

  function shake(id) {
    const el = document.getElementById(id);
    el.style.borderColor = '#E8572A';
    el.style.boxShadow = '0 0 0 3px rgba(232,87,42,0.2)';
    setTimeout(()=>{ el.style.borderColor=''; el.style.boxShadow=''; }, 1500);
  }

  // Seed demo
  if (!orders.length) {
    const now = new Date();
    [
      {name:'Nguyễn Văn An', food:'Cơm sườn nướng', note:'thêm dưa cải', off:5},
      {name:'Trần Thị Bình', food:'Phở bò tái chín', note:'ít bánh, nhiều nước', off:12},
      {name:'Lê Hoàng Cường', food:'Bún bò Huế', note:'', off:20},
      {name:'Phạm Thị Dung', food:'Cơm gà chiên nước mắm', note:'không hành', off:35},
    ].forEach(d => {
      orders.push({ id:(Date.now()+Math.random()).toString(), name:d.name, food:d.food, note:d.note, time:new Date(now-d.off*60000).toISOString() });
    });
    save();
  }

  renderOrders();

  /* ================= API ================= */

// async function readSheet(){

// try{

// const res = await fetch("https://script.google.com/macros/s/AKfycbwFvi0n2mszdHsn5C_HRn544L28U1hBM8cicXv3NVl4LwA8WQf2j45XL5mQFlYhEch4rQ/exec?action=loadOrders")
// const data = await res.json()
// console.log("data order: ",data)
// orders = data
// renderOrders()
// }catch(e){
// console.log("Sheet error",e)
// }

// }
async function readSheet(userId = '') {
    try {

        showListLoading(); 

        let url = "https://script.google.com/macros/s/AKfycbwFvi0n2mszdHsn5C_HRn544L28U1hBM8cicXv3NVl4LwA8WQf2j45XL5mQFlYhEch4rQ/exec?action=loadOrders";

        if (userId) {
            url += `&userId=${userId}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        console.log("data order: ", data);

        orders = data;
        renderOrders();

    } catch (e) {
        console.log("Sheet error", e);
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
readSheet(userId)
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
readSheet(userId)
}

async function deleteSheet(orderId, userId){

await fetch("https://script.google.com/macros/s/AKfycbwFvi0n2mszdHsn5C_HRn544L28U1hBM8cicXv3NVl4LwA8WQf2j45XL5mQFlYhEch4rQ/exec",{
method:"POST",
mode:"no-cors",
body:JSON.stringify({
action:"delete",
orderId
})
})
readSheet(userId)

}
async function loadConfig(){

    try{

        const res = await fetch(`https://script.google.com/macros/s/AKfycbwFvi0n2mszdHsn5C_HRn544L28U1hBM8cicXv3NVl4LwA8WQf2j45XL5mQFlYhEch4rQ/exec?action=loadConfig`)
        const data = await res.json()

        console.log("config:", data)
        deadline = data.deadline
        deadlineTime = fmtRenderDealine(data.deadline)  

        document.getElementById('deadlineInput').value = deadlineTime

        startCountdown()  
        const dl = document.getElementById("deadline")
        if(dl) dl.value = deadline

        // ===== USER UI =====
        if(typeof renderDeadline === "function"){
            renderDeadline()
        }

    }catch(e){
        console.log("Load config error", e)
    }
}
