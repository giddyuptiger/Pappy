const db = firebase.database();
let orders = {};
let orders_processing = {};
let currentWeekData = {};
let orders_next_week = {};
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

//CALCULATE CURRENT WEEK as Week of Monday '##/##/####'
let currentweek = calcCurrentweek();

// //GET KEYS
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

//SYNC BUTTONS
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

//SYNC DATES
document.body.appendChild(elt("div", { id: "date_orders_synced" }));
let syncDate = document.getElementById("date_orders_synced");

//STATE LISTENER
db.ref("state").on("value", (snap) => {
  syncDate.innerHTML = "";
  let dos = snap.val().date_orders_synced;
  let dps = snap.val().date_products_synced;
  dos = formatSyncDate(toBoulderTime(dos));
  dps = formatSyncDate(toBoulderTime(dps));
  if (dos) syncDate.innerHTML = `Orders Last Synced: ${dos} -  `;
  if (dps) syncDate.innerHTML += `Products Last Synced: ${dps}`;
});

//LISTENER - CURRENT_WEEK_DATA
//need to update weeks node to be 'Deliveries
db.ref(`weeks/${currentweek}`).on("value", (snap) => {
  currentWeekData = snap.val();
  console.log("currentWeekData DOWBNLOADED From Firebase: ", currentWeekData);
  gen_op_table(snap);
  gen_pick_table(snap);
  gen_pack_table(snap);
  gen_cust_table(snap);
});

//LISTENER - ORDERS_PROCESSING
db.ref("orders_processing").on("value", (snap) => {
  orders_processing = snap.val();
  console.log(
    "orders_processing DOWNLOADED From Firebase: ",
    orders_processing
  );
  gen_op_table(snap);
  gen_pick_table(snap);
  gen_pack_table(snap);
  gen_cust_table(snap);
});

//LISTENER - ORDERS NEXT WEEK Do i neeed this?
db.ref("orders_next_week").on("value", (snap) => {
  orders_next_week = snap.val();
  console.log("orders_next_week DOWNLOADED From Firebase: ", orders_next_week);
  gen_onw_table(orders_next_week);
});

//TAB BUTTONS
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

//DOWNLOAD CSV OF ADDRESS
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

//DATES
let today = new Date();
let cutoff = calcCutoff();

function calcCutoff() {
  let date = new Date();
  toBoulderTime(date);
  if (date.getDay() === 0) date.setDate(date.getDate() - 6);
  else if (date.getDay() === 1) console.log("Today is monday");
  else date.setDate(date.getDate() - date.getDay() - 1);
  date.setHours(14, 0, 0, 0);
  console.log("Cutoff Date was: ", formatSyncDate(date));
  return date;
}

function calcCurrentweek() {
  let date = new Date();
  toBoulderTime(date);
  if (date.getDay() === 0) date.setDate(date.getDate() - 6);
  else if (date.getDay() === 1) console.log("Today is monday");
  else date.setDate(date.getDate() - date.getDay() - 1);
  let month = String(date.getMonth() + 1).padStart(2, "0");
  let dayOfMonth = String(date.getDate()).padStart(2, "0");
  let year = String(date.getFullYear());
  let string = `${month}/${dayOfMonth}/${year}`;
  console.log("Current week: ", string);
  return string;
}

function toBoulderTime(date) {
  date = new Date(date);
  if (date.getTimezoneOffset() != 420) {
    date.setHours(date.getHours() - (date.getTimezoneOffset() - 420) / 60);
  }
  return date;
}

//GENERATE HTML TABLES
//TABLE - ORDERS_PROCESSING
function gen_op_table() {
  if (!orders_processing) return;
  console.log("generating Orders- Processing Table");
  // if (snap.exists()) {
  //   return;
  // }
  // if (!snap) return;
  let orders = orders_processing;
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

//TABLE - ORDERS_NEXT_WEEK
function gen_onw_table() {
  console.log("generating Orders_Next_week table");
  if (!orders_next_week) return;
  // if (!snap) return;
  let orders = orders_next_week;
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

//TABLE - PICK TABLE
function gen_pick_table() {
  console.log("generating Pick Table");
  if (!orders_processing) return;
  // if (!snap) return;
  let orders = orders_processing;
  let pick = {};
  let table = elt("table");
  table.className = "table";
  table.id = "pick";
  let row;
  for (const order of Object.values(orders)) {
    // console.log(new Date(order.date_created));
    // console.log(order.date_created);
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

//TABLE - PACK TABLE
function gen_pack_table() {
  console.log("generating pack table");
  if (!orders_processing) return;
  // if (!snap) return;
  let orders = orders_processing;
  let table = elt("table");
  table.className = "table";
  table.id = "pack";
  let row;
  for (const order of Object.values(orders)) {
    const customer_id = order.customer_id;
    addresses.push({ addresses: address(order.billing) });
    let orderQuantity = 0;
    let lineItems = {};
    //create items object
    let theseItems = {};
    for (const [key, value] of Object.entries(order)) {
      theseItems[key] = {
        name: value.name,
        quantity: value.quantity,
        product_id: value.product_id,
      };
      orderQuantity += value.quantity;
    }
    //if customer_id already has order on pack list then add items to existing items Object.assign()
    if (pack[customer_id]) {
      Object.assign(pack[customer_id].items, theseItems);
    }
    //add order to pack list if not already exists
    pack[customer_id] = {
      first_name: order.billing.first_name,
      last_name: order.billing.last_name,
      address: address(order.billing),
      lineItems: theseItems,
      quantity: orderQuantity,
      total: order.total,
      customer_note: order.customer_note,
      route: "No Route Yet",
      notes: "",
    };
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

//OLD TABLE - PACK TABLE OLD
function gen_pack_table_old() {
  console.log("generating Pack Table");
  // if (!snap) return;
  let orders = orders_processing;
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

//TABLE - CUST TABLE
function gen_cust_table(snap) {
  console.log("generating cust Table");
  if (!orders_processing) return;
  // if (!snap) return;
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

// let orders_processing_meta = {};
// let pick_meta = {};
// get_meta();
// function get_meta() {
//   console.log("getting meta");
//   db.ref("pick_meta").once("value", (snap) => {
//     pick_meta = snap.val();
//   });
//   db.ref("orders_processing_meta").once("value", (snap) => {
//     orders_processing_meta = snap.val();
//   });
//   console.log(pick_meta);
//   console.log(orders_processing_meta);
// }

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

function syncOrders() {
  console.log("SYNCING ORDERS BIG UPLOAD (FREE)");
  dateLastSynced = new Date();
  let pages = 0;
  let downloadedOrders = {};
  fetch(url).then((response) => {
    const apiPromises = [];
    //get page count and replace the i<=3 below
    pages = response.headers["X-WP-TotalPages"];
    console.log(response.headers);
    console.log(response.headers["Date"]);
    console.log(pages);
    for (let i = 1; i <= 3; i++) {
      let pageURL = url + "&page=" + i;
      apiPromises.push(
        fetch(pageURL)
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            console.log("got page from Woo");
            for (const value of Object.values(data)) {
              downloadedOrders[value.number] = value;
            }
          })
          .catch((err) => {
            console.log(err);
          })
      );
    }
    Promise.all(apiPromises).then(() => {
      console.log(downloadedOrders);
      db.ref("orders").update(downloadedOrders);
      db.ref("state").update({
        date_orders_synced: { ".sv": "timestamp" },
      });
      generate_orders_processing(downloadedOrders);
      alert("Done Syncing Orders");
    });
  });
}

function syncProducts() {
  const products = {};
  console.log("SYNCING PRODUCTS BIG UPLOAD (FREE)");
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

// db.ref("orders").once("value", (snap) => {
//   generate_orders_processing(snap);
// });
function generate_orders_processing(downloadedOrders) {
  // db.ref("orders").once("value", (snap) => {
  // console.log("DOWNLOADING ORDERS (EXPENSIVE)");
  const orders_processing = {};
  const orders_next_week = {};
  console.log("creating processing orders list"); //FIX:shouldn't have to recreate and rewrite this on every page open
  // let orders = snap.val();
  for (const order of Object.values(downloadedOrders)) {
    let createdDate = new Date(order.date_created);
    if (order.status == "processing") {
      if (
        createdDate < cutoff ||
        (currentWeekData != undefined &&
          currentWeekData[order.customer_id].bump)
      ) {
        orders_processing[order.number] = order;
        // console.log(order.number, " this week");
      } else {
        orders_next_week[order.number] = order;
        // console.log(order.number, " next week");
      }
    }
  }
  console.log("orders_processing: ");
  console.log(orders_processing);
  console.log("\norders_next_week: ");
  console.log(orders_next_week);
  db.ref("orders_processing").set(orders_processing);
  db.ref("orders_next_week").set(orders_next_week);
  console.log("SET NEW ORDERS_PROCESSING AND NEXT WEEK");
  // });
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

// function gen_pick() {}

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
  //DATE
  let dayow = days[date.getDay()];
  let month = String(date.getMonth() + 1).padStart(2, "0");
  let day = String(date.getDate()).padStart(2, "0");
  //TIME
  let hours = date.getHours();
  let minutes = String(date.getMinutes()).padStart(2, "0");
  let a_p = "am";
  if (hours > 12) {
    a_p = "pm";
    hours -= 12;
  }
  let time = hours + ":" + minutes + a_p;
  //ASSEMBLE
  let string = `${month}/${day} ${dayow} ${time}`;
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
