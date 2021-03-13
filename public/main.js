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
let downloadedOrders = {};

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

//DATES
let today = new Date();
let cutoff = calcCutoff();
//CALCULATE CURRENT WEEK as Week of Monday '##/##/####'
let currentweek = calcCurrentweek();
let nextWeek = calcNextWeek();

let noDataMessage = elt("h1", { id: "no-data-message" }, "No Orders");
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

//TAB BUTTONS
let tabs_div = document.body.appendChild(elt("div", { id: "tabs_div" }));
tabs_div.appendChild(
  elt(
    "button",
    {
      id: "pack_tab",
      onclick: function () {
        show_table("pack_div", this.id);
      },
    },
    "PACK"
  )
);

tabs_div.appendChild(
  elt(
    "button",
    {
      id: "pick_tab",
      onclick: function () {
        show_table("pick_div", this.id);
      },
    },
    "PICK"
  )
);

tabs_div.appendChild(
  elt(
    "button",
    {
      id: "cust_tab",
      onclick: function () {
        show_table("cust_div", this.id);
      },
    },
    "Customer List"
  )
);

tabs_div.appendChild(
  elt(
    "button",
    {
      id: "op_tab",
      onclick: function () {
        show_table("op_div", this.id);
      },
    },
    "Orders - Processing"
  )
);

tabs_div.appendChild(
  elt(
    "button",
    {
      id: "onw_tab",
      onclick: function () {
        show_table("onw_div", this.id);
      },
    },
    "Orders - Next Week"
  )
);

document.body.appendChild(elt("div", { id: "op_div", className: "table" }));
document.body.appendChild(elt("div", { id: "pick_div", className: "table" }));
document.body.appendChild(elt("div", { id: "pack_div", className: "table" }));
document.body.appendChild(elt("div", { id: "onw_div", className: "table" }));
document.body.appendChild(elt("div", { id: "cust_div", className: "table" }));

//STATE LISTENER
db.ref("state").on("value", (snap) => {
  syncDate.innerHTML = "";
  let dos = snap.val().date_orders_synced;
  let dps = snap.val().date_products_synced;
  dos = formatSyncDate(dos);
  dps = formatSyncDate(dps);
  let ols = elt(
    "p",
    { id: "ols" },
    elt(
      "span",
      { className: "last-synced", id: "test" },
      "Orders Last Synced: "
    ),
    elt("span", { className: "last-synced-info" }, `${dos}`)
  );
  let pls = elt(
    "p",
    { id: "pls" },
    elt("span", { className: "last-synced" }, "Products Last Synced: "),
    elt("span", { className: "last-synced-info" }, `${dps}`)
  );
  if (dos) syncDate.appendChild(ols);
  if (dos) syncDate.appendChild(pls);
});

//LISTENER - CURRENT_WEEK_DATA
//How to call only one of these on load and still have both listners?
//need to update weeks node to be 'Deliveries
db.ref(`weeks/${currentweek}`).on("value", (snap) => {
  currentWeekData = snap.val();
  console.log("currentWeekData DOWNLOADED From Firebase: ", currentWeekData);
  gen_tables();
});

//LISTENER - ORDERS_PROCESSING
db.ref("orders_processing").on("value", (snap) => {
  orders_processing = snap.val();
  console.log(
    "orders_processing DOWNLOADED From Firebase: ",
    orders_processing
  );
  gen_tables();
});

function gen_tables() {
  gen_op_table();
  gen_pick_table();
  gen_onw_table();
  gen_pack_table();
  gen_cust_table();
}

//LISTENER - ORDERS NEXT WEEK Do i neeed this?
db.ref("orders_next_week").on("value", (snap) => {
  orders_next_week = snap.val();
  console.log("orders_next_week DOWNLOADED From Firebase: ", orders_next_week);
  gen_tables();
});

//GENERATE HTML TABLES
//TABLE - ORDERS_PROCESSING
function gen_op_table() {
  document.getElementById("op_div").innerHTML = "";
  if (!orders_processing) {
    console.log("no data here");
    document.getElementById("op_div").appendChild(noDataMessage);
    return;
  }
  console.log("GENERATING orders_processing TABLE");
  let table = elt("table");
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
  for (const order of Object.values(orders_processing)) {
    //make these big ass thingd into functions with props for order.customer_id
    let nextWeekOrderButton = elt("span", null);
    if (orders_next_week[order.number]) {
      console.log("this order is from NEXT WEEK!");
      nextWeekOrderButton = elt(
        "button",
        {
          onclick: function () {
            if (
              confirm(
                "Are you sure you want to remove nw order from this week?"
              )
            ) {
              console.log("remove nw order from this week");
              // set flag on current week to grab into orders_processing
              db.ref(`weeks/${currentweek}/${order.customer_id}`).update({
                bump: false,
              });
              //add to orders_processing, leaving on orders_next_week
              db.ref(`orders_processing/${order.number}`).remove();
            }
          },
        },
        "Remove from this week"
      );
    }
    let orderNumber = elt("div", null, order.number, nextWeekOrderButton);
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
  }
  console.log("op_table", table);
  document.getElementById("op_div").appendChild(table);
}

//TABLE - ORDERS_NEXT_WEEK
function gen_onw_table() {
  document.getElementById("onw_div").innerHTML = "";
  console.log("generating Orders_Next_week table");
  if (!orders_next_week) {
    document.getElementById("onw_div").appendChild(noDataMessage);
    return;
  }
  // if (!snap) return;
  let orders = orders_next_week;
  console.log(orders);
  let table = elt("table");
  // table.className = "table";
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
          onclick: function () {
            if (
              confirm(
                `Are you sure you want to bump ${order.billing.first_name} ${order.billing.last_name}'s order for next week to be fulfilled this week?`
              )
            ) {
              console.log("bump order to this week");
              // set flag on current week to grab into orders_processing
              db.ref(`weeks/${currentweek}/${order.customer_id}`).update({
                bump: true,
              });
              //add to orders_processing, leaving on orders_next_week
              db.ref(`orders_next_week/${order.number}`).once(
                "value",
                (snap) => {
                  db.ref(`orders_processing/${order.number}`).set(snap.val());
                }
              );
              // db.ref(`orders_next_week/${order.number}`).remove()
              //add to this week, leaving on next week
              db.ref(`weeks/${nextWeek}/${order.customer_id}`).once(
                "value",
                (snap) => {
                  db.ref(`weeks/${currentweek}/${order.customer_id}`).set(
                    snap.val()
                  );
                }
              );
            }
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
  document.getElementById("onw_div").appendChild(table);
}

//TABLE - PICK TABLE
function gen_pick_table() {
  document.getElementById("pick_div").innerHTML = "";
  console.log("generating Pick Table");
  if (!orders_processing) {
    // console.log("no data here");
    document.getElementById("op_div").appendChild(noDataMessage);
    return;
  }
  // if (!orders_processing) return;
  // if (!snap) return;
  let orders = orders_processing;
  let pick = {};
  let table = elt("table");
  // table.className = "table";
  table.id = "pick";
  table.appendChild(make_tr({ class: "header_tr" }, "", "Product", "Quantity"));
  let row;
  //CREATE PICK OBJECT
  for (const order of Object.values(orders)) {
    // console.log(new Date(order.date_created));
    // console.log(order.date_created);
    // console.log("looking through order#", order.number);
    for (const item of Object.values(order.line_items)) {
      // if (!pick.[item.name]) Object.assign(pickitem.[item.name])
      // console.log(item.name, item.quantity);
      // console.log(item.name, item.quantity, item.price, item.product_id);
      if (item.price == "0") continue;
      // let product_id = item.product_id;
      // let nme = item.name;
      // let qty = item.quantity;
      let itemObj = {
        name: item.name,
        // id: product_id,
        quantity: item.quantity,
      };
      // itemObj[nme] = qty;
      // console.log(itemObj);
      if (!pick.hasOwnProperty(item.product_id)) {
        pick[item.product_id] = itemObj;
        // console.log("added to pick: ", pick[item.product_id]);
        // Object.assign(pick, itemObj);
      } else {
        // console.log("before qty", pick[item.product_id][quantity]);
        pick[item.product_id][quantity] += itemObj.quantity;
        // console.log("after qty", pick[item.product_id][quantity]);
      }
    }
  }
  //CREATE AND SORT PICK ARRAY
  let pickArray = [];
  for (const [item, value] of Object.entries(pick)) {
    // console.log(item, value);
    pickArray.push([item, value.name, value.quantity]);
  }
  pickArray.sort(sortMultiCols(1));
  // let headers = ["Product", "Quantity"];
  // pickArray.unshift(headers);
  for (const item of pickArray) {
    // console.log(item);
    row = make_tr(
      {
        className:
          currentWeekData.pickList &&
          currentWeekData.pickList[item[0]] &&
          currentWeekData.pickList[item[0]].picked
            ? "picked"
            : "",
      },
      elt(
        "button",
        {
          onclick: function () {
            pickItem(item[0]);
          },
        },
        "Picked"
      ),
      item[1],
      String(item[2])
    );
    table.appendChild(row);
  }
  console.log("pick: ", pick);
  document.getElementById("pick_div").appendChild(table);
}

//TABLE - PACK TABLE
function gen_pack_table() {
  document.getElementById("pack_div").innerHTML = "";
  console.log("generating pack table");
  // if (!orders_processing) return;
  if (!orders_processing) {
    console.log("no data here");
    document.getElementById("op_div").appendChild(noDataMessage);
    return;
  }
  // if (!snap) return;
  // let orders = orders_processing;
  let table = elt("table");
  // table.className = "table";
  table.id = "pack";
  let row;
  table.appendChild(
    make_tr(
      { class: "header_tr" },
      "",
      "First Name",
      "Last Name",
      "Total Quantity",
      "Items",
      "Price",
      "Address",
      "Route",
      "Week's Notes"
    )
  );
  let packObject = {};
  for (const order of Object.values(orders_processing)) {
    const customer_id = order.customer_id;
    // addresses.push({ addresses: address(order.billing) });
    let orderQuantity = 0;
    // let lineItems = {};
    //create items object
    let theseItems = {};
    for (const item of Object.values(order.line_items)) {
      theseItems[item.product_id] = {
        name: item.name,
        quantity: item.quantity,
        class: "class TBD here",
        // product_id: value.product_id,
      };
      orderQuantity += item.quantity;
    }
    //if customer_id already has order on pack list then add items to existing items Object.assign()
    if (packObject[customer_id]) {
      Object.assign(pack[customer_id].lineItems, theseItems);
    } else {
      let route, note;
      if (currentWeekData[customer_id]) {
        route = currentWeekData[customer_id].route;
        note = stringifyNotes(currentWeekData[customer_id].notes);
        console.log(route, note);
      }
      //add order to pack list if not already exists
      packObject[customer_id] = {
        first_name: order.billing.first_name,
        last_name: order.billing.last_name,
        address: address(order.billing),
        lineItems: theseItems,
        quantity: orderQuantity,
        total: order.total,
        customer_note: order.customer_note,
        route: route,
        notes: note,
      };
    }
  }
  console.log(packObject);
  let packArray = [];
  for (const [customer_id, item] of Object.entries(packObject)) {
    console.log(
      customer_id,
      item.first_name,
      item.last_name,
      item.quantity,
      item.lineItems,
      item.total,
      item.address,
      item.customer_note,
      item.route,
      item.notes
    );
    packArray.push([
      customer_id,
      item.first_name,
      item.last_name,
      item.quantity,
      item.lineItems,
      item.total,
      item.address,
      item.customer_note,
      item.route,
      item.notes,
    ]);
  }
  // console.log(packArray);
  for (order of packArray) {
    console.log(order[0]);
    let packOrderButton = elt(
      "button",
      {
        onclick: function () {
          packOrder(this.id);
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
            console.log(`${order[0]}/route`);
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
    let itemTable = elt("table", { className: "item-table" });
    for (const [id, value] of Object.entries(order[4])) {
      let thisbutton = elt(
        "button",
        {
          id: order[0],
          onclick: function () {
            packItem(this.id, id);
          },
        },
        "packed"
      );
      itemTable.appendChild(
        make_tr(
          null,
          thisbutton,
          String(value.quantity),
          String(value.name),
          String(value.class)
        )
      );
    }
    row = make_tr(
      null,
      packOrderButton,
      String(order[1]),
      String(order[2]),
      String(order[3]),
      itemTable,
      String(order[5]),
      String(order[6]),
      routeBox,
      noteBox,
      String(order[0])
    );
    table.appendChild(row);
  }
  document.getElementById("pack_div").appendChild(table);
}

//OLD TABLE - PACK TABLE OLD
function gen_pack_table_old() {
  console.log("generating Pack Table");
  // if (!snap) return;
  let orders = orders_processing;
  let pack = {};
  let table = elt("table");
  // table.className = "table";
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
function gen_cust_table() {
  document.getElementById("cust_div").innerHTML = "";
  console.log("generating cust Table");
  if (!orders_processing) {
    console.log("no data here");
    document.getElementById("op_div").appendChild(noDataMessage);
    return;
  }
  let table = elt("table");
  table.id = "cust";
  let row;
  let cust = {};
  for (const order of Object.values(orders_processing)) {
    let customer_id = order.customer_id;
    if (!cust.hasOwnProperty(customer_id)) {
      cust[customer_id] = {
        email: order.billing.email,
        phone: order.billing.phone,
        first_name: order.billing.first_name,
        last_name: order.billing.last_name,
        address: address(order.billing),
      };
    } else {
      console.log("not first order for customer");
    }
  }
  for (const [item, value] of Object.entries(cust)) {
    // console.log(item, value);
    row = make_tr(
      { id: `cust-${item}-tr` },
      value.first_name,
      value.last_name,
      value.address
    );
    table.appendChild(row);
  }
  console.log(cust);
  document.getElementById("cust_div").appendChild(table);
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

function calcCutoff() {
  let date = new Date();
  toBoulderTime(date);
  if (date.getDay() === 1) console.log("Today is monday");
  else if (date.getDay() === 0) date.setDate(date.getDate() - 6);
  else date.setDate(date.getDate() - (date.getDay() - 1));
  date.setHours(14, 0, 0, 0);
  console.log("Cutoff Date was: ", formatSyncDate(date));
  return date;
}

function calcCurrentweek() {
  let date = new Date();
  toBoulderTime(date);
  //get last monday
  if (date.getDay() === 1) console.log("Today is monday");
  else if (date.getDay() === 0) date.setDate(date.getDate() + 1);
  else date.setDate(date.getDate() - (date.getDay() - 1));
  let month = String(date.getMonth() + 1).padStart(2, "0");
  let dayOfMonth = String(date.getDate()).padStart(2, "0");
  let year = String(date.getFullYear());
  let string = `${month}-${dayOfMonth}-${year}`;
  console.log("Current week: ", string);
  return string;
}

function calcNextWeek() {
  let date = new Date();
  toBoulderTime(date);
  if (date.getDay() === 1) date.setDate(date.getDate() + 7);
  else if (date.getDay() === 0) date.setDate(date.getDate() + 1);
  else date.setDate(date.getDate() + 7 - (date.getDay() - 1));
  let month = String(date.getMonth() + 1).padStart(2, "0");
  let dayOfMonth = String(date.getDate()).padStart(2, "0");
  let year = String(date.getFullYear());
  let string = `${month}-${dayOfMonth}-${year}`;
  console.log("Next week: ", string);
  return string;
}

function toBoulderTime(date) {
  date = new Date(date);
  if (date.getTimezoneOffset() != 420) {
    date.setHours(date.getHours() - (date.getTimezoneOffset() - 420) / 60);
  }
  return date;
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
  console.log("picking item", item_id);
  // console.log(currentWeekData.pickList);
  // console.log(currentWeekData.pickList[item_id]);
  // console.log(currentWeekData.pickList[item_id].picked);

  db.ref(`weeks/${currentweek}/pickList/${item_id}`).update({
    picked:
      currentWeekData.pickList &&
      currentWeekData.pickList[item_id] &&
      currentWeekData.pickList[item_id].picked
        ? false
        : true,
  });
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
          currentWeekData[order.customer_id] &&
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

function show_table(id, tabId) {
  console.log(`showing: ${id}`);
  console.log(classSelect("table"));
  for (const table of classSelect("table")) {
    // console.log(table.classList);
    // console.log(table.className);
    hide(table);
  }
  document.getElementById("pack_tab").className = "";
  document.getElementById("pick_tab").className = "";
  document.getElementById("cust_tab").className = "";
  document.getElementById("op_tab").className = "";
  document.getElementById("onw_tab").className = "";
  document.getElementById(tabId).className = "active_tab";
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

function sortMultiCols(firstColToSort, secondColToSort) {
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
  let month = String(date.getMonth() + 1);
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
