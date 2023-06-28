// var myHeaders = new Headers();
// myHeaders.append("Content-Type", "application/json");

var raw = JSON.stringify({
    "method": "getCurrentTxL1GasFees",
    "id": 1,
    "jsonrpc": "2.0"
});
var requestOptions = {
    method: 'POST',
    headers: ["Content-Type", "application/json"],
    body: raw,
    redirect: 'follow'
};

fetch("https://goerli-rollup.arbitrum.io/rpc", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));