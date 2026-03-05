let products = JSON.parse(localStorage.getItem("products")) || [];
let sales = JSON.parse(localStorage.getItem("sales")) || [];
let currentDay = parseInt(localStorage.getItem("currentDay")) || 1;
let currentView="card";

document.getElementById("currentDay").innerText = currentDay;

function save(){
  localStorage.setItem("products",JSON.stringify(products));
  localStorage.setItem("sales",JSON.stringify(sales));
  localStorage.setItem("currentDay",currentDay);
}

function addProduct(){
  let name=document.getElementById("pname").value;
  let costp=parseFloat(document.getElementById("cost").value);
  let salep=parseFloat(document.getElementById("sale").value);
  let stockp=parseInt(document.getElementById("stock").value)||0;
  if(!name||!costp||!salep) return alert("Fill all fields");
  products.push({name,costp,salep,stock:stockp,sold:0});
  save();
  refreshView();
}

function refreshView(){
  if(currentView==="table") showTableView();
  else renderProducts();
  renderDailyRecords();
  document.getElementById("currentDay").innerText=currentDay;
}

function renderProducts(){
  currentView="card";
  let list=document.getElementById("productList");
  list.innerHTML="";
  products.forEach((p,i)=>{
    let div=document.createElement("div");
    div.className="card";
    div.innerHTML=`
      <b>${p.name}</b><br>
      Cost: ${p.costp} | Sale: ${p.salep}<br>
      Sold: ${p.sold} | Stock: ${p.stock}<br>
      <div class="product-buttons">
        <button onclick="increase(${i})">+</button>
        <button onclick="decrease(${i})">-</button>
      </div>
    `;
    list.appendChild(div);
  });
  updateDashboard();
}

function showTableView(){
  currentView="table";
  let list=document.getElementById("productList");
  list.innerHTML="";
  if(products.length===0){ list.innerHTML="<div class='card'>No Products</div>"; return; }
  let table=document.createElement("table");
  let header=`<tr style="background:#2c3e50;color:white;">
    <th>Name</th><th>Cost</th><th>Sale</th><th>Sold</th><th>Stock</th><th>Action</th>
  </tr>`;
  let rows="";
  products.forEach((p,i)=>{
    rows+=`<tr>
      <td>${p.name}</td><td>${p.costp}</td><td>${p.salep}</td>
      <td>${p.sold}</td><td>${p.stock}</td>
      <td><button onclick="increase(${i})">+</button>
          <button onclick="decrease(${i})">-</button></td>
    </tr>`;
  });
  table.innerHTML=header+rows;
  list.appendChild(table);
  updateDashboard();
}

function increase(i){
  let p=products[i];
  if(p.stock>0 && p.sold>=p.stock){ alert("Out of stock!"); return; }
  p.sold++;
  let today=new Date().toISOString().split("T")[0];
  sales.push({date:today,sale:p.salep,profit:(p.salep-p.costp),day:currentDay});
  save(); refreshView();
}

function decrease(i){
  let p=products[i];
  if(p.sold>0){
    p.sold--;
    for(let j=sales.length-1;j>=0;j--){
      if(sales[j].sale===p.salep && sales[j].day===currentDay){
        sales.splice(j,1); break;
      }
    }
    save(); refreshView();
  }
}

function updateDashboard(){
  let todaySaleValue=0, overallSale=0, overallProfit=0;
  sales.forEach(s=>{
    overallSale+=s.sale; overallProfit+=s.profit;
    if(s.day===currentDay) todaySaleValue+=s.sale;
  });
  document.getElementById("todaySale").innerText=todaySaleValue;
  document.getElementById("overallSale").innerText=overallSale;
  document.getElementById("overallProfit").innerText=overallProfit;
}

function clearDashboard(){
  if(confirm("Clear dashboard?")){
    products.forEach(p=>p.sold=0); // Sirf dashboard reset
    save(); refreshView();
  }
}

function nextDay(){
  if(confirm("Start next day?")){
    currentDay++; products.forEach(p=>p.sold=0); save(); refreshView();
  }
}

function toggleMode(){ document.body.classList.toggle("dark"); }
function searchProduct(){
  let value=document.getElementById("searchBox").value.toLowerCase();
  let filtered=products.filter(p=>p.name.toLowerCase().includes(value));
  let list=document.getElementById("productList"); list.innerHTML="";
  filtered.forEach((p)=>{
    let div=document.createElement("div");
    div.className="card";
    div.innerHTML=`<b>${p.name}</b><br> Cost: ${p.costp} | Sale: ${p.salep}<br> Sold: ${p.sold} | Stock: ${p.stock}`;
    list.appendChild(div);
  });
}

function renderDailyRecords(){
  let container=document.getElementById("dailyRecords"); container.innerHTML="";
  let days=[...new Set(sales.map(s=>s.day))];
  if(days.length===0){ container.innerHTML="<div class='card'>No sales yet</div>"; return; }
  let table=document.createElement("table");
  table.innerHTML="<tr><th>Day</th><th>Total Sale</th><th>Total Profit</th></tr>";
  days.forEach(day=>{
    let daySales=sales.filter(s=>s.day===day);
    let totalSale=0, totalProfit=0;
    daySales.forEach(s=>{ totalSale+=s.sale; totalProfit+=s.profit; });
    let row=document.createElement("tr");
    row.innerHTML=`<td>Day ${day}</td><td>${totalSale}</td><td>${totalProfit}</td>`;
    table.appendChild(row);
  });
  container.appendChild(table);
}

function exportCSV(){
  if(products.length===0){ alert("No Data"); return; }
  let csv="Name,Cost,Sale,Sold,Stock,Day\n";
  products.forEach(p=>{ sales.filter(s=>s.sale===p.salep).forEach(s=>{
    csv+=`${p.name},${p.costp},${p.salep},${p.sold},${p.stock},${s.day}\n`;
  }); });
  let blob=new Blob([csv],{type:"text/csv"});
  let link=document.createElement("a"); link.href=URL.createObjectURL(blob);
  link.download="GM_Auto_Sales_Data.csv"; link.click();
}

function takeScreenshot(){
  html2canvas(document.body).then(canvas=>{
    let link=document.createElement("a"); link.download="GM_Sales_System.png";
    link.href=canvas.toDataURL(); link.click();
  });
}

function printPage(){ window.print(); }

refreshView();
