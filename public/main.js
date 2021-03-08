const db = firebase.database();
const orders = {};
// function fetchOrders() {
// const ck = "ck_e7a75e598b9551db54b160750153656c0d985ef1";
// const cs = "cs_b341a298a50106f4756c5b62c03f47b2ea9a1ceb";
let ck = "ck_e7a75e598b9551db54b160750153656c0d985ef1";
let cs = "cs_b341a298a50106f4756c5b62c03f47b2ea9a1ceb";
const websiteURL = "https://nudefoodsmarket.com";
const date = new Date().toISOString;
const apiURL = "/wp-json/wc/v3/";
let url;
url = `${
  websiteURL + apiURL
}orders?consumer_key=${ck}&consumer_secret=${cs}&per_page=100`;
console.log(url);
let productsURL = `${
  websiteURL + apiURL
}products?consumer_key=${ck}&consumer_secret=${cs}&per_page=100`;
let subsURL = `${
  websiteURL + apiURL
}subscriptions?consumer_key=${ck}&consumer_secret=${cs}&per_page=100`;
console.log(url);

// let options = {
//   method: "GET",
//   "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
//   muteHttpExceptions: true,
// };
// asdsa;

// db.ref("admin/auth")
//   .once("value", (snap) => {
//     // console.log(snap);
//     console.log(snap.val());
//     let data = snap.val();
//     return data;
//   })
//   .then((data) => {
//     ck = data.ck;
//     cs = data.cs;
//     console.log(ck, cs);
//     url = `${websiteURL + apiURL}
//     orders?consumer_key=${ck}&consumer_secret=${cs}&per_page=100`;
//     console.log(url);
//   });

document.body.insertBefore(
  elt(
    "button",
    { onclick: () => syncOrders(), id: "sync-products" },
    "Sync Orders (Use Sparingly)"
  ),
  document.body.firstChild
);
document.body.insertBefore(
  elt(
    "button",
    { onclick: () => syncProducts(), id: "sync-products" },
    "Sync Products (Use Sparingly)"
  ),
  document.body.firstChild
);

document.body.appendChild(elt("div", { id: "date_orders_synced" }));
let syncDate = document.getElementById("date_orders_synced");

db.ref("state").on("value", (snap) => {
  syncDate.innerHTML = "";
  let dos = snap.val().date_orders_synced;
  let dps = snap.val().date_products_synced;
  dos = formatSyncDate(dos);
  dps = formatSyncDate(dps);
  if (dos) syncDate.innerHTML = `Orders Last Synced: ${dos} -  `;
  if (dps) syncDate.innerHTML += `Products Last Synced: ${dps}`;

  let date = new Date();
  // let currentWeek =
});

//Initialize db
// db.ref().once('value', (snap) => {

// });

let currentWeekData = {};
let currentweek = "week1";
db.ref(`weeks/${currentweek}`).on("value", (snap) => {
  currentWeekData = snap.val();
  console.log(currentWeekData);
  // console.log(stringifyNotes(currentWeekData[121].notes));
});

function stringifyNotes(notes) {
  if (!notes) return;
  // console.log(notes);
  let string = "";
  for (const value of Object.values(notes)) {
    string += value + ",";
    // console.log(value);
  }
  return string;
}

document.body.appendChild(
  elt("button", { onclick: () => show_table("pack") }, "PACK")
);

document.body.appendChild(
  elt(
    "button",
    { onclick: () => show_table("orders_processing") },
    "Orders - Processing"
  )
);

document.body.appendChild(
  elt("button", { onclick: () => show_table("pick") }, "PICK")
);

document.body.appendChild(
  elt("button", { onclick: () => show_table("cust") }, "Customer List")
);

document.body.appendChild(
  elt(
    "button",
    { onclick: () => show_table("orders_next_week") },
    "Orders - Next Week"
  )
);

db.ref("orders_processing").on("value", (snap) => {
  gen_op_table(snap);
  gen_pick_table(snap);
  gen_pack_table(snap);
  gen_cust_table(snap);
  gen_onw_table(snap);
});

function gen_op_table(snap) {
  console.log("loading Orders");
  // if (snap.exists()) {
  //   return;
  // }
  if (!snap) return;
  let orders = snap.val();
  let table = elt("table");
  table.className = "table";
  table.id = "orders_processing";
  let row;
  table.appendChild(
    make_tr(
      null,
      "Order #",
      "First",
      "Last",
      "Address",
      "Phone",
      "Email",
      "Note",
      "Total"
    )
  );
  for (const order of Object.values(orders)) {
    row = make_tr(
      null,
      order.number,
      order.billing.first_name,
      order.billing.last_name,
      address(order.billing),
      order.billing.phone,
      order.billing.email,
      order.customer_note,
      // items(order.line_items),
      // totalqty(order.line_items),
      order.total
    );
    table.appendChild(row);
  }
  document.body.appendChild(table);
}

function gen_onw_table(snap) {
  if (!snap) return;
  let orders = snap.val();
  let table = elt("table");
  table.className = "table";
  table.id = "orders_processing";
  let row;
  table.appendChild(
    make_tr(
      null,
      "Order #",
      "First",
      "Last",
      "Address",
      "Phone",
      "Email",
      "Note",
      "Total"
    )
  );
  for (const order of Object.values(orders)) {
    row = make_tr(
      null,
      order.number,
      order.billing.first_name,
      order.billing.last_name,
      address(order.billing),
      order.billing.phone,
      order.billing.email,
      order.customer_note,
      // items(order.line_items),
      // totalqty(order.line_items),
      order.total
    );
    table.appendChild(row);
  }
  document.body.appendChild(table);
}

let cutoffTime = new Date().toISOString();
let cutOffDate = function (adate) {
  if (adate.getDay() === 0) adate.setDate(adate.getDate() - 6);
  else if (adate.getDay() === 1) console.log("today is monday");
  else adate.setDate(adate.getDate() - adate.getDay() - 1);
  return date;
};

function gen_pick_table(snap) {
  console.log("generating Pick Table");
  if (!snap) return;
  let orders = snap.val();
  let pick = {};
  let table = elt("table");
  table.className = "table";
  table.id = "pick";
  let row;
  for (const order of Object.values(orders)) {
    // console.log(new Date(order.date_created));
    // console.log(order.date_created);
    if (order.date_created > cutoffTime) continue;
    for (const item of Object.values(order.line_items)) {
      // if (!pick.[item.name]) Object.assign(pickitem.[item.name])
      // console.log(item.name, item.quantity);
      if (item.price == "0") continue;
      let nme = item.name;
      let qty = item.quantity;
      let itemObj = {};
      itemObj[nme] = qty;
      // console.log(itemObj);
      if (!pick.hasOwnProperty(item.name)) Object.assign(pick, itemObj);
      else pick[item.name] += item.quantity;
    }
  }
  let pickArray = [];
  for (const [item, value] of Object.entries(pick)) {
    // console.log(item, value);
    pickArray.push([item, value]);
  }
  pickArray.sort(sortFunction);
  let headers = ["Product", "Quantity"];
  pickArray.unshift(headers);
  for (const item of pickArray) {
    row = make_tr(null, item[0], String(item[1]));
    table.appendChild(row);
  }

  console.log(pick);
  document.body.appendChild(table);
}

let orders_processing_meta = {};
let pick_meta = {};
get_meta();
function get_meta() {
  console.log("getting meta");
  db.ref("pick_meta").once("value", (snap) => {
    pick_meta = snap.val();
  });
  db.ref("orders_processing_meta").once("value", (snap) => {
    orders_processing_meta = snap.val();
  });
  console.log(pick_meta);
  console.log(orders_processing_meta);
}

function packOrder(id) {
  console.log("packing Order");
  console.log(id);
  db.ref(`${currentWeekData}/${id}`).set({ packed: true });
}

function packItem(id) {
  console.log("packing item");
  console.log(id);
  db.ref(`${currentWeekData}/${id}/items`).set({ packed: true });
}

function gen_pack_table(snap) {
  console.log("generating Pack Table");
  if (!snap) return;
  let orders = snap.val();
  let pack = {};
  let table = elt("table");
  table.className = "table";
  table.id = "pack";
  let row;
  for (const order of Object.values(orders)) {
    const customer_id = order.customer_id;
    let orderQuantity = 0;
    // let orderItems = [];
    let lineItems = {};
    for (const [key, value] of Object.entries(order.line_items)) {
      // if (!pick.[item.name]) Object.assign(pickitem.[item.name])
      // console.log(item.name, item.quantity);
      // console.log(item.price);
      // console.log(`${key}:  ${value}`);
      let nme = value.name;
      let qty = value.quantity;
      let id = value.product_id;
      // orderItems.push([nme, qty]);
      // let itemObj = {};
      // itemObj[nme] = qty;
      lineItems[key] = { name: nme, quantity: qty, id: id };
      // lineItems += `${qty}x ${nme}\n`;
      orderQuantity += qty;
    }
    // console.log(lineItems);
    let itemTable = elt("table", { className: "item-table" });
    for (const value of Object.values(lineItems)) {
      let thisbutton = elt(
        "button",
        {
          id: `${customer_id}/${value.id}`,
          onclick: function () {
            packItem(this.id);
          },
        },
        "packed"
      );
      itemTable.appendChild(
        make_tr(null, thisbutton, String(value.quantity), String(value.name))
      );
      //  console.log(``);
    }
    // console.log(itemTable);
    // if (false /*email exists already on another order*/) {
    //   order[email].lineItems += lineItems;
    // }
    if (!pack.hasOwnProperty(order.customer_id)) {
      pack[order.customer_id] = {
        first_name: order.billing.first_name,
        last_name: order.billing.last_name,
        address: address(order.billing),
        // order.billing.phone,
        // order.customer_id,
        note: order.customer_note,
        lineItems: itemTable,
        quantity: orderQuantity,
        total: order.total,
        //total quantity
      };
    } else {
      for (const value of Object.values(lineItems)) {
        // itemTable.appendChild(make_tr(key, value));
        pack[customer_id].lineItems.appendChild(
          make_tr(
            null,
            elt("button", null),
            String(value.name),
            String(value.quantity)
          )
        );
        // console.log(pack[customer_id].lineItems);
        //  console.log(``);
      }
      let oldLineItems = pack[order.customer_id].lineItems;
      let oldQuantity = pack[order.customer_id].quantity;
      // console.log("old and new", oldLineItems);
      pack[order.customer_id].lineItems = oldLineItems + lineItems;
      pack[order.customer_id].quantity += orderQuantity;
      // console.log(pack[order.customer_id].lineItems);
    }
  }
  let packArray = [];

  for (const [customer_id, customer] of Object.entries(pack)) {
    let route;
    let note;
    // console.log(currentWeekData[]);
    if (currentWeekData[customer_id]) {
      console.log("here");
      route = currentWeekData[customer_id].route;
      note = stringifyNotes(currentWeekData[customer_id].notes);
      console.log(route, note);
    }
    // console.log(customer.lineItems);
    // console.log(item, value);
    let line = [
      customer_id,
      customer.first_name,
      customer.last_name,
      customer.quantity,
      customer.lineItems,
      "",
      customer.address,
      route,
      note,
    ];
    packArray.push(line);
  }
  packArray.sort(sortFunction);
  let headers = [
    "Packed?",
    "First",
    "Last",
    "Quantity",
    "Product",
    "Class",
    "Address",
    "Route",
    "Note",
  ];
  packArray.unshift(headers);
  for (const order of packArray) {
    // let orderNote = notes[customer_id]
    row = make_tr(
      null,
      elt(
        "button",
        {
          onclick: function () {
            packOrder(this.id);
          },
          id: order[0],
        },
        "Pack"
      ),
      String(order[1]),
      String(order[2]),
      String(order[3]),
      order[4],
      String(order[5]),
      String(order[6]),
      elt(
        "div",
        null,
        elt("p", null, String(order[7])),
        elt("input", { id: `${order[0]}/route` }),
        elt(
          "button",
          {
            onclick: function () {
              submitRoute(`${order[0]}/route`);
            },
          },
          "Submit Note"
        )
      ),
      elt(
        "div",
        null,
        elt("p", null, String(order[8])),
        elt("input", { id: `${order[0]}/notes` }),
        elt(
          "button",
          {
            onclick: function () {
              submitNote(`${order[0]}/notes`);
            },
          },
          "Submit Note"
        )
      )
    );

    if (order[1] === "First") {
      row = make_tr(
        "Packed?",
        String(order[0]),
        String(order[1]),
        String(order[2]),
        String(order[3]),
        String(order[4]),
        String(order[5]),
        String(order[6]),
        String(order[7]),
        String(order[8])
      );
    }
    table.appendChild(row);
  }

  // console.log(pack);
  document.body.appendChild(table);
}

function submitNote(id) {
  const note = document.getElementById(id).value;
  // console.log("note")/;
  db.ref(`weeks/${currentweek}/${id}`).push(note);
}
function submitRoute(id) {
  const route = document.getElementById(id).value;
  // console.log("note")/;
  db.ref(`weeks/${currentweek}/${id}`).set(route);
}

function gen_cust_table(snap) {
  console.log("generating cust Table");

  if (!snap) return;
  let orders = snap.val();
  let pick = {};
  let table = elt("table");
  table.className = "table";
  table.id = "cust";
  let row;
  for (const order of Object.values(orders)) {
    for (const item of Object.values(order.line_items)) {
      // if (!pick.[item.name]) Object.assign(pickitem.[item.name])
      // console.log(item.name, item.quantity);
      let nme = item.name;
      let qty = item.quantity;
      let itemObj = {};
      itemObj[nme] = qty;
      // console.log(itemObj);
      if (!pick.hasOwnProperty(item.name)) Object.assign(pick, itemObj);
      else pick[item.name] += item.quantity;
    }
  }
  for (const [item, value] of Object.entries(pick)) {
    // console.log(item, value);
    row = make_tr(null, item, String(value));
    table.appendChild(row);
  }
  console.log(pick);
  document.body.appendChild(table);
}

// function addItem(name, quantity) {
//   if (!item.name) Object.assign(pick);
// }
// function addItem(name, quantity) {
//   if (!item.name) Object.assign(pick);
// }

// function gen_pack_table(snap) {
//   console.log("Generating Pack Table");
//   if (!snap) return;
//   let orders = snap.val();
//   let table = elt("table");
//   table.className = "table";
//   table.id = "orders_processing";
//   let row;
//   for (const order of Object.values(orders)) {
//     row = make_tr(
//       order.number,
//       order.billing.first_name,
//       order.billing.last_name,
//       address(order.billing),
//       order.billing.phone,
//       order.billing.email,
//       order.customer_note,
//       // items(order.line_items),
//       // totalqty(order.line_items),
//       order.total
//     );
//     table.appendChild(row);
//   }
//   document.body.appendChild(table);
// }

function syncOrders() {
  console.log("syncing orders");
  dateLastSynced = new Date();
  let pages = 0;
  fetch(url).then((response) => {
    // const apiPromises = [];
    //get page count and replace the i<=3 below
    pages = response.headers["X-WP-TotalPages"];
    console.log(response.headers);
    console.log(response.headers["Date"]);
    console.log(pages);
    for (let i = 1; i <= 3; i++) {
      let pageURL = url + "&page=" + i;
      fetch(pageURL)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          console.log(data);
          for (const value of Object.values(data)) {
            orders[value.number] = value;
          }
          db.ref("orders").update(orders);
          db.ref("state").update({
            date_orders_synced: { ".sv": "timestamp" },
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
}

function syncProducts() {
  const products = {};
  console.log("syncing products");
  //do this to get product tags for class
  dateLastSynced = new Date();
  let pages = 0;
  fetch(productsURL).then((response) => {
    // const apiPromises = [];
    //get page count and replace the i<=3 below
    pages = response.headers["X-WP-TotalPages"];
    console.log(response.headers);
    console.log(response.headers["Date"]);
    console.log(pages);
    for (let i = 1; i <= 3; i++) {
      let pageURL = productsURL + "&page=" + i;
      fetch(pageURL)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          console.log(data);
          for (const value of Object.values(data)) {
            products[value.id] = value;
          }
          db.ref("products").update(products);
          db.ref("state").update({
            date_products_synced: { ".sv": "timestamp" },
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
}

function generate_orders_processing() {
  db.ref("orders").once("value", (snap) => {
    const orders_processing = {};
    console.log("creating processing orders list"); //FIX:shouldn't have to recreate and rewrite this on every page open
    let orders = snap.val();
    for (const order of Object.values(orders)) {
      console.log(order.status);

      if (order.status == "processing") orders_processing[order.number] = order;
    }
    console.log(orders_processing);
    db.ref("orders_processing").set(orders_processing);
  });
}

function gen_pick() {}

function show_table(id) {
  console.log(`showing: ${id}`);
  for (const table of classSelect("table")) {
    hide(table);
  }
  show(idSelect(id));
}

function idSelect(id) {
  return document.getElementById(id);
}

function classSelect(class_name) {
  return document.getElementsByClassName(class_name);
}

function show(element) {
  element.style.display = "block";
}

function hide(element) {
  element.style.display = "none";
}

let ordersTable = elt(
  "table",
  null,
  elt("tr", null, elt("td", null, "1"), elt("td", null, "2"))
);

function make_tr(props, ...td) {
  let row = elt("tr", null);
  for (let cell of td) {
    row.appendChild(elt("td", null, cell));
  }
  return row;
}
// function make_tr2(...td) {
//   let row = elt("tr", null);
//   for (let cell of td) {
//     row.appendChild(elt(cell[1] ? "td" : cell[1], null, cell[0]));
//   }
//   return row;
// }

function address(address) {
  return (
    address.address_1 +
    "\n" +
    address.city +
    " " +
    address.state +
    " " +
    address.postcode
  );
}

function items(line_items) {
  let list;
  for (let item of line_items) {
    list += item.name + "\n";
  }
  return list;
}

function totalqty(items) {
  let totalqty = 0;
  for (let item of items) {
    totalqty += item.quantity;
  }
}

function elt(type, props, ...children) {
  let element = document.createElement(type);
  if (props) Object.assign(element, props);
  for (let child of children) {
    // console.log(typeof child);
    if (typeof child != "string") element.appendChild(child);
    else element.appendChild(document.createTextNode(child));
  }
  return element;
}
// const http = new XMLHttpRequest();
// http.open("GET", url);
// http.send();
// http.onreadystatechange = (e) => {
//   console.log(http.responseText);
// };
// };

function sortFunction(a, b) {
  if (a[0] === b[0]) {
    return 0;
  } else {
    return a[0] < b[0] ? -1 : 1;
  }
}

function sort2DArr(firstColToSort, secondColToSort) {
  return function sort(a, b) {
    if (a[firstColToSort] === b[firstColToSort]) {
      return a[secondColToSort] < b[secondColToSort]
        ? -1
        : a[secondColToSort] > b[secondColToSort]
        ? 1
        : 0;
    } else {
      return a[firstColToSort] < b[firstColToSort] ? -1 : 1;
    }
  };
}

function formatSyncDate(date) {
  date = new Date(date);
  let dayow = das[date.getDay()];
  let month = mons[date.getMonth()];
  let day = date.getDay();
  let time =
    (date.getHours() > 12 ? date.getHours() - 12 : date.getHours()) +
    ":" +
    date.getMinutes();

  let a_p = "am";
  if (date.getHours() > 12) a_p = "pm";
  let string = `${dayow} ${month} ${day} ${time}${a_p}`;
  return string;
}

const mons = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const das = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
