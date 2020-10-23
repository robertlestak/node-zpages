const express = require('express')
const zpages = require("../index.js")

function main() {
    // create express app
    const app = express()
    // init healthz
    var z = new zpages.ZPages()
    // create health check drivers
    var d = new zpages.HTTP({
      Name: "google.com", 
      Address: "https://google.com", 
      Method: "GET", 
      StatusCodes: [200, 301, 302],
    })
    // register drivers with healthz
    z.Drivers = [d]
    z.Status = {
      "Arbitrary": "data",
      "Foo": "bar",
    }
    // register handlers with app
    app.use(z.HTTPHandlers)
    // start application
    const port = 8080
    app.listen(port, () => {
      console.log(`listening on :${port}`)
    })
}

main()
