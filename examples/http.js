const http = require('http')
const zpages = require("../index.js")

function main() {
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
    z.Status = function() {
      return {
        "Arbitrary": "data",
        "Foo": "bar",
        "Time": new Date(),
      }
    }
    // register handlers with app
    //z.HTTPHandlers(app)
    const port = 8080
    // start application
    http.createServer((req, res) => {
      // app handlers...
      // register handlers with app
      z.HTTPHandlers(req, res)
    }).listen(port, "0.0.0.0", () => {
      console.log(`listening on :${port}`)
    })
}

main()
