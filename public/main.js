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
  dos = formatSyncDate(toBoulderTime(dos));
  dps = formatSyncDate(toBoulderTime(dps));
  if (dos) syncDate.innerHTML = `Orders Last Synced: ${dos} -  `;
  if (dps) syncDate.innerHTML += `Products Last Synced: ${dps}`;

  // let date = new Date();
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

document.body.appendChild(
  elt("button", { onclick: () => show_table("pack") }, "PACK")
);

document.body.appendChild(
  elt("button", { onclick: () => show_table("pick") }, "PICK")
);

document.body.appendChild(
  elt(
    "button",
    { onclick: () => show_table("orders_processing") },
    "Orders - Processing"
  )
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

// document.body.appendChild(
//   elt(
//     "button",
//     {
//       onclick: function () {
//         downloadAddresses();
//       },
//     },
//     "Download Addresses CSV"
//   )
// );

function downloadAddresses() {
  console.log("downloading address in CSV");
  let date = new Date();
  date = formatSyncDate(date);
  // console.log(date);
  let addresses;
  db.ref("orders_processing").once("value", (snap) => {
    let = snap.val();
  });
  // addresses = formatData(addresses);
  exportCSVFile(null, addresses, `Addresses ${date}`);
}

let orders_processing = {};
db.ref("orders_processing").on("value", (snap) => {
  orders_processing = snap.val();
  console.log("orders processing from firebase: ", orders_processing);
  gen_op_table(snap);
  gen_pick_table(snap);
  gen_pack_table(snap);
  gen_cust_table(snap);
});

db.ref("orders_next_week").on("value", (snap) => {
  if (snap.exists()) gen_onw_table(snap);
});

function gen_op_table(snap) {
  console.log("generating Orders- Processing Table");
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
  console.log("generating Orders_Next_week table");
  // if (!snap) return;
  let orders = snap.val();
  console.log(orders);
  let table = elt("table");
  table.className = "table";
  table.id = "orders_next_week";
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
    let orderNumber = elt(
      "div",
      null,
      order.number,
      elt(
        "button",
        {
          onclick: () => {
            console.log("bump order to this week");
            db.ref(`weeks/${currentweek}/${order.customer_id}`).set({
              bump: true,
            });
          },
        },
        "Add to this week"
      )
    );
    row = make_tr(
      null,
      orderNumber,
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
    // console.log(row);
  }
  console.log(table);
  document.body.appendChild(table);
}

let today = new Date();
let cutoff = calcCutoff();

function calcCutoff() {
  let date = new Date();
  console.log(date);
  if (date.getDay() === 0) date.setDate(date.getDate() - 6);
  else if (date.getDay() === 1) console.log("Today is monday");
  else date.setDate(date.getDate() - date.getDay() - 1);
  date.setHours(14, 0, 0, 0);
  toBoulderTime(date);
  console.log(date);
  return date;
}

function toBoulderTime(date) {
  date = new Date(date);
  if (date.getTimezoneOffset() != 420) {
    date.setHours(date.getHours() - (date.getTimezoneOffset() - 420) / 60);
  }
  return date;
}

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
    let created = new Date(order.date_created);

    if (created > cutoff) {
      console.log("too old");
      continue;
    }
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
  let headers = ["", "Product", "Quantity"];
  pickArray.unshift(headers);
  for (const item of pickArray) {
    row = make_tr(
      null,
      elt(
        "button",
        {
          onclick: function () {
            pickItem();
          },
        },
        "Picked"
      ),
      item[0],
      String(item[1])
    );
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
  db.ref(`weeks/${currentweek}/${id}`).update({ packed: true });
}

function packItem(customer_id, item_id) {
  console.log("packing item:");
  console.log(customer_id, item_id);
  db.ref(`weeks/${currentweek}/${customer_id}/items/${item_id}`).update({
    packed: true,
  });
}

function pickItem(item_id) {
  console.log("picking item");
  db.ref(`weeks/${currentweek}/pickList/${item_id}`).update({ picked: true });
}

let addresses = [];

let pack = {};

function gen_pack_table(snap) {
  console.log("generating pack table");
  if (!snap) return;
  let orders = snap.val();
  let table = elt("table");
  table.className = "table";
  table.id = "pack";
  let row;
  for (const order of Object.values(orders)) {
    const customer_id = order.customer_id;
    addresses.push({ addresses: address(order.billing) });
    let orderQuantity = 0;
    let lineItems = {};
  }

  if (currentWeekData[customer_id]) {
    route = currentWeekData[customer_id].route;
    note = stringifyNotes(currentWeekData[customer_id].notes);
    console.log(route, note);
  }
  let packOrderButton = elt(
    "button",
    {
      onclick: function () {
        packOrder(order[0]);
      },
      id: order[0],
    },
    "Pack"
  );
  let routeBox = elt(
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
  );
  let noteBox = elt(
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
  );
  row = make_tr(
    props,
    packOrderButton,
    String(order[1]),
    String(order[2]),
    String(order[3]),
    order[4],
    String(order[5]),
    String(order[6]),
    routeBox,
    noteBox
  );
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
    addresses.push({ address: address(order.billing) });
    // console.log(addresses);

    // if (pack.hasOwnProperty(order.customer_id)) {
    //   console.log("second order for customer");
    //   console.log(pack[customer_id].lineItems);
    //   let newItemsList = pack[customer_id];
    // let oldLineItems = pack[order.customer_id].lineItems;
    // let oldQuantity = pack[order.customer_id].quantity;

    // console.log(pack[order.customer_id].lineItems);
    // let oldItems = {};
    // oldItems = pack[order.customer_id].lineItems;
    // console.log(oldItems);
    // for (const value of Object.values(lineItems)) {
    //   oldItems.appendChild(
    //     make_tr(
    //       null,
    //       elt("button", null),
    //       String(value.name),
    //       String(value.quantity)
    //     )j
    //   );
    //   console.log(oldItems);
    //   pack[order.customer_id].lineItems = oldItems;
    //   // console.log(pack[customer_id].lineItems);
    //   //  console.log(``);
    // }
    // // console.log("old and new", oldLineItems);
    // pack[order.customer_id].lineItems = oldLineItems + lineItems;
    // pack[order.customer_id].quantity += orderQuantity;
    // console.log(pack[order.customer_id].lineItems);
    // }

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
            packItem(customer_id, value.id);
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
      // console.log("second order for customer");
      // console.log(pack[order.customer_id].lineItems);
      // let oldItems = {};
      // oldItems = pack[order.customer_id].lineItems;
      // console.log(oldItems);
      // for (const value of Object.values(lineItems)) {
      //   oldItems.appendChild(
      //     make_tr(
      //       null,
      //       elt("button", null),
      //       String(value.name),
      //       String(value.quantity)
      //     )
      //   );
      //   console.log(oldItems);
      //   pack[order.customer_id].lineItems = oldItems;
      //   // console.log(pack[customer_id].lineItems);
      //   //  console.log(``);
      // }
      // let oldLineItems = pack[order.customer_id].lineItems;
      // let oldQuantity = pack[order.customer_id].quantity;
      // // console.log("old and new", oldLineItems);
      // pack[order.customer_id].lineItems = oldLineItems + lineItems;
      // pack[order.customer_id].quantity += orderQuantity;
      // // console.log(pack[order.customer_id].lineItems);
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
  let currentWeekData1;
  db.ref(`weeks/${currentweek}`).once("value", (snap) => {
    currentWeekData1 = snap.val();
  });
  for (const order of packArray) {
    let props = { class: "r" };
    if (currentWeekData1[order[0]]) {
      props = { class: currentWeekData1[order[0]].packed ? "packed" : "ss" };
    }
    // let orderNote = notes[customer_id]
    let packOrderButton = elt(
      "button",
      {
        onclick: function () {
          packOrder(order[0]);
        },
        id: order[0],
      },
      "Pack"
    );
    let routeBox = elt(
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
    );
    let noteBox = elt(
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
    );
    row = make_tr(
      props,
      packOrderButton,
      String(order[1]),
      String(order[2]),
      String(order[3]),
      order[4],
      String(order[5]),
      String(order[6]),
      routeBox,
      noteBox
    );
    // row.class = currentWeekData1[order[0]].packed ? "packed" : "";

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
          alert("done syncing");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
}
console.log("done running");

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

// function oops() {
//   db.ref("orders").on("value", (snap) => {
//     snap.val();
//     let yes;
//     // db.ref(`weeks/${currentweek}`).on("value", () => {
//     //   yes = false;
//     // });
//     console.log("oopsing");
//     if (yes) generate_orders_processing(snap);
//     console.log("done opopsing");
//   });
// }

// db.ref("orders").once("value", (snap) => {
//   generate_orders_processing(snap);
// });
function generate_orders_processing() {
  db.ref("orders").once("value", (snap) => {
    const orders_processing = {};
    const orders_next_week = {};
    console.log("creating processing orders list"); //FIX:shouldn't have to recreate and rewrite this on every page open
    let orders = snap.val();
    for (const order of Object.values(orders)) {
      // console.log(order.status);

      let createdDate = new Date(order.date_created);
      if (order.status == "processing") {
        if (createdDate < cutoff || currentWeekData[order.customer_id].bump) {
          orders_processing[order.number] = order;
          // console.log(order.number, " this week");
        } else {
          orders_next_week[order.number] = order;
          // console.log(order.number, " next week");
        }
      }
    }
    console.log(orders_processing, orders_next_week);
    db.ref("orders_processing").set(orders_processing);
    db.ref("orders_next_week").set(orders_next_week);
  });
}

// function generate_orders_processing(snap) {
//   const orders_processing = {};
//   const orders_next_week = {};
//   console.log("creating processing + next weeks orders lists"); //FIX:shouldn't have to recreate and rewrite this on every page open
//   let orders = snap.val();
//   console.log(orders);
//   for (const order of Object.values(orders)) {
//     // console.log(order.status);
//     let createdDate = new Date(order.date_created);
//     if (order.status == "processing") {
//       if (currentWeekData) {
//         // console.log(currentWeekData);
//         if (currentWeekData.currentweek)
//           console.log(currentWeekData[order.customer_id].bump);
//       }
//     }
//     if (createdDate < cutoff || currentWeekData[order.customer_id].bump) {
//       orders_processing[order.number] = order;
//       // console.log(order.number, " this week");
//     } else {
//       orders_next_week[order.number] = order;
//       // console.log(order.number, " next week");
//     }
//   }
//   // console.log(orders_processing);
//   // console.log(orders_next_week);
//   db.ref("orders_processing").set(orders_processing);
//   db.ref("orders_next_week").set(orders_next_week);
// }

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
    row.appendChild(elt("td", props, cell));
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

function stringifyNotes(notes) {
  if (!notes) return;
  // console.log(notes);
  let string = "";
  for (const value of Object.values(notes)) {
    string += value + ", ";
    // console.log(value);
  }
  return string;
}

function formatSyncDate(date) {
  date = new Date(date);
  let dayow = days[date.getDay()];
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let time =
    (date.getHours() > 12 ? date.getHours() - 12 : date.getHours()) +
    ":" +
    date.getMinutes();

  let a_p = "am";
  if (date.getHours() > 12) a_p = "pm";
  let string = `${month}/${day} ${dayow} ${time}${a_p}`;
  return string;
}

function convertToCSV(objArray) {
  console.log(objArray);
  var array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
  var str = "";

  for (var i = 0; i < array.length; i++) {
    var line = "";
    for (var index in array[i]) {
      if (line != "") line += ",";

      line += array[i][index];
    }

    str += line + "\r\n";
  }

  // console.log(str);
  return str;
}

function formatData(data) {
  var itemsFormatted = [];
  itemsNotFormatted.forEach((item) => {
    itemsFormatted.push({
      // model: item.model.replace(/,/g, ""), // remove commas to avoid errors,
      // chargers: item.chargers,
      // cases: item.cases,
      // earphones: item.earphones,
      date: item.date,
      hours: toHours(item.hours),
      starttime: item.starttime ? timeFromUnix(item.starttime) : "",
      stoptime: item.stoptime ? timeFromUnix(item.stoptime) : "",
      // notes: item.notes,
    });
  });
  console.log(itemsFormatted);
  return itemsFormatted;
}

function exportCSVFile(headers, items, fileTitle) {
  if (headers) {
    items.unshift(headers);
  }

  // Convert Object to JSON
  var jsonObject = JSON.stringify(items);

  var csv = this.convertToCSV(jsonObject);

  var exportedFilenmae = fileTitle + ".csv" || "export.csv";

  var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, exportedFilenmae);
  } else {
    var link = document.createElement("a");
    if (link.download !== undefined) {
      // feature detection
      // Browsers that support HTML5 download attribute
      var url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", exportedFilenmae);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
  // console.log("csv downloaded I think");
  //clear itemsFormatted
  itemsFormatted = [];
  hide(invoiceModal);
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
