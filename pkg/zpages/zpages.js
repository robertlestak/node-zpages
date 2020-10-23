const {HTTP} = require("../httpchecker/httpchecker.js")
const {CloudFront} = require("../httpchecker/cloudfront.js")
const {DynamoDB, Elasticsearch, Redis, SQL} = require("../database/database.js")
const {Rekognition} = require("../awsservices/awsservices.js")
const {S3} = require("../storage/storage.js")

// Response contains an execution response
class Response {
    constructor(Type, Name, Error) {
        this.Type = Type
        this.Name = Name
        this.Error = Error
    }
}

async function pingDriver(d) {
    try {
        let pr = await d.Ping()
        return new Response(d.constructor.name, d.Name, null)
    } catch (e) {
        return new Response(d.constructor.name, d.Name, e)
    }
}

function setStatus(res, status) {
    switch (typeof res.status) {
        case "function":
            res.status(status)
            break
        case "undefined":
            res.statusCode = status
            break
        case "number":
            res.status = status
            break
    }
}

// ZPages contains the config params for health check endpoints
class ZPages {
    constructor(Drivers, Status) {
        this.Drivers = Drivers || []
        this.Status = Status
        this.HTTPHandlers = this.HTTPHandlers.bind(this)
        this.HTTPHandlersKoa = this.HTTPHandlersKoa.bind(this)
        this.Statusz = this.Statusz.bind(this)
    }
    // Ping iterates through all drivers and executes `Ping` method
    // on configured and initialized driver
    // TODO: Convert `Checker` struct to `interface` which implements `Ping` method. Currenly duplicating code.
    async Ping() {
        let res = []
        let pr = []
        for (var i = 0; i < this.Drivers.length; i++) {
            pr.push(pingDriver(this.Drivers[i]))
        }
        try {
           res = Promise.all(pr) 
        } catch(e) {
            res = e
        }
        return res
    }
    // Up exposes the most basic health check endpoint
    // to confirm application is online, but does not check
    // any upstream dependencies
    async Up(req, res) {
        let resp = await this.Ping()
        let err = false
        if (!resp) {
            err = true
            setStatus(res, 503)
            res.write(JSON.stringify(resp))
            res.end()
            return
        }
        for (var i = 0; i < resp.length; i++) {
            if (!resp[i] || resp[i].Error) {
                resp[i].Error = resp[i].Error.toString()
                err = true      
            }
        }
        if (err) {
            setStatus(res, 503)
        }
        res.write(JSON.stringify(resp))
        res.end()
    }
    // Ready exposes the most basic health check endpoint
    // currently wraps Up
    async Ready(req, res) {
        await this.Up(req, res)
    }
    // Live exposes the most basic health check endpoint
    // currently wraps Up
    async Live(req, res) {
        await this.Up(req, res)
    }
    // Version returns the environment variable VERSION
    // if VERSION variable does not exist, throw error
    async Statusz(req, res) {
        if (!this.Status) {
            this.Status = {}
        }
        let v = process.env.VERSION
        if (v !== null && !this.Status.Version) {
            this.Status.Version = v
        }
        let e = process.env.ENV || process.env.ENVIRONMENT
        if (e !== null && !this.Status.Environment) {
            this.Status.Environment = e
        }
        res.write(JSON.stringify(this.Status))
        res.end()
    }

    async handleRoutes(req, res, next) {
        // register health check endpoints
        try {
            switch (req.url) {
                case "/healthz":
                    await this.Up(req, res)
                    break
                case "/livez":
                    await this.Live(req, res)
                    break
                case "/readyz":
                    await this.Ready(req, res)
                    break
                case "/statusz":
                    await this.Statusz(req, res)
                    break
                default:
                    if (typeof next == 'function') { 
                        next() 
                      }
                    return
            }
        } catch (e) {
            setStatus(res, 503)
            res.end()
        }
    }

    // HTTPHandlers registers the default HTTP handlers
    async HTTPHandlers(req, res, next) {
        await this.handleRoutes(req, res, next)
    }

    // HTTPHandlersKoa registers the default HTTP handlers
    async HTTPHandlersKoa(ctx, next) {
        let req = ctx.request
        let res = ctx.response
        res.write = function(i) {
            res.body = i
        }
        res.end = () => {}
        await this.handleRoutes(req, res, next)
    }
}

module.exports = {ZPages, CloudFront, DynamoDB, HTTP, Elasticsearch, Redis, Rekognition, S3, SQL}
