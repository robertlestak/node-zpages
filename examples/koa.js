const Koa = require('koa')
const zpages = require("../index.js")

function main() {
    // create koa app
    let app = new Koa()
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
    app.use(z.HTTPHandlersKoa)
    //z.HTTPHandlers(app)
    const port = 8080
    // start application
    app.listen(port, () => {
      console.log(`listening on :${port}`)
    })
}

main()
