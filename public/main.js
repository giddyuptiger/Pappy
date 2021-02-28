const db = firebase.database();
const orders = {};
// function fetchOrders() {
// const ck = "ck_e7a75e598b9551db54b160750153656c0d985ef1";
// const cs = "cs_b341a298a50106f4756c5b62c03f47b2ea9a1ceb";
let ck, cs;
const websiteURL = "https://nudefoodsmarket.com";
const date = new Date().toISOString;
const apiURL = "/wp-json/wc/v3/";
const url =
  websiteURL +
  apiURL +
  "orders" +
  "?consumer_key=" +
  ck +
  "&consumer_secret=" +
  cs +
  "&per_page=100";

// let options = {
//   method: "GET",
//   "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
//   muteHttpExceptions: true,
// };
console.log(url);
// asdsa;

db.ref("admin/auth").once("value", (snap) => {
  // console.log(snap);
  let data = snap.val();
  ck = data.ck;
  cs = data.cs;
});

function elt(type, props, ...children) {
  let element = document.createElement(type);
  if (props) Object.assign(element, props);
  for (let child of children) {
    if (typeof child != "string") element.appendChild(child);
    else element.appendChild(document.createTextNode(child));
  }
  return element;
}

document.body.appendChild(
  elt(
    "button",
    { onclick: () => console.log("it worked") },
    "Update (Use Sparingly)"
  )
);

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

db.ref("orders").on("value", (snap) => {
  let orders = snap.val();
  let table = elt("table");
  let row;
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
});

// function updateDataFromWC() {
//   let pages = 0;
//   fetch(url).then((response) => {
//     // const apiPromises = [];
//     //get page count and replace the i<=3 below
//     pages = response.headers["X-WP-TotalPages"];
//     console.log(response.headers);
//     console.log(response.headers["Date"]);
//     console.log(pages);
//     for (let i = 1; i <= 3; i++) {
//       let pageURL = url + "&page=" + i;
//       fetch(pageURL)
//         .then((response) => {
//           return response.json();
//         })
//         .then((data) => {
//           console.log(data);
//           for (const value of Object.values(data)) {
//             orders[value.number] = value;
//           }
//           db.ref("orders").set(orders);
//         })
//         .catch((err) => {
//           console.log(err);
//         });
//     }
//   });
// }

// const http = new XMLHttpRequest();
// http.open("GET", url);
// http.send();
// http.onreadystatechange = (e) => {
//   console.log(http.responseText);
// };
// };
