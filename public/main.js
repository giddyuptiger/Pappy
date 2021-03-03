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

// document.body.appendChild(
//   elt("button", { onclick: () => syncOrders() }, "Sync Orders (Use Sparingly)")
// );
// document.body.appendChild(
//   elt("button", { onclick: () => syncProducts() }, "Sync Products (Use Sparingly)")
// );

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
  elt("button", { onclick: () => show_table("pack") }, "PACK")
);

document.body.appendChild(
  elt("button", { onclick: () => show_table("cust") }, "Customer List")
);

function show_table(id) {
  console.log(`showing: ${id}`);
  for (const table of classSelect("table")) {
    hide(table);
  }
  show(idSelect(id));
}

// function show_pick() {
//   console.log("show pick");
//   for (const table of classSelect("table")) {
//     hide(table);
//   }
//   show(idSelect("pick"));
// }

// function show_pack() {
//   console.log("show pack");
//   for (const table of classSelect("table")) {
//     hide(table);
//   }
//   show(idSelect("pack"));
// }

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

function make_tr(...td) {
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

db.ref("orders_processing").on("value", (snap) => {
  gen_op_table(snap);
  gen_pick_table(snap);
  gen_pack_table(snap);
  gen_cust_table(snap);
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
// function calcCutoffTime() {
//   console.log("this will calc monday at 2");
//   let date = new Date();
//   let day = date.getDay();
//   console.log(day);
//   cutoffTime = date.toISOString();
// }

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
    row = make_tr(item[0], String(item[1]));
    table.appendChild(row);
  }

  console.log(pick);
  document.body.appendChild(table);
}
function packOrder(id) {
  console.log("packing Order");
}

function packItem(id) {
  console.log("packing item");
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
      // orderItems.push([nme, qty]);
      // let itemObj = {};
      // itemObj[nme] = qty;
      lineItems[key] = { name: nme, quantity: qty };
      // lineItems += `${qty}x ${nme}\n`;
      orderQuantity += qty;
    }
    // console.log(lineItems);
    let itemTable = elt("table", { className: "item-table" });
    for (const value of Object.values(lineItems)) {
      itemTable.appendChild(
        make_tr(
          elt("button", { onclick: () => packItem(this.id) }, "packed"),
          String(value.quantity),
          String(value.name)
        )
      );
      //  console.log(``);
    }
    console.log(itemTable);
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
            elt("button", null),
            String(value.name),
            String(value.quantity)
          )
        );
        console.log(pack[customer_id].lineItems);
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
      "",
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
  ];
  packArray.unshift(headers);
  for (const item of packArray) {
    row = make_tr(
      elt(
        "button",
        {
          onclick: packOrder(this.id),
          id: item[0],
        },
        "Pack"
      ),
      String(item[1]),
      String(item[2]),
      String(item[3]),
      item[4],
      String(item[5])
    );
    table.appendChild(row);
  }

  // console.log(pack);
  document.body.appendChild(table);
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
    row = make_tr(item, String(value));
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
          db.ref("orders").set(orders);
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
          db.ref("products").set(products);
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
