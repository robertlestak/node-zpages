const AWS = require('aws-sdk')
const elasticsearch = require('@elastic/elasticsearch')
const redis = require('redis')
const mysql = require('mysql')
const pg = require('pg')
const Connection = require('mysql/lib/Connection')

// SQL wraps a DB connection
class SQL {
    constructor(config) {
        this.Name = config.Name
        this.Driver = config.Driver
        this.Host = config.Host
        this.Username = config.Username
        this.Password = config.Password
        this.Database = config.Database
    }
    // Ping pings a database to confirm it is available
    Ping = () => {
        return new Promise(async (res, rej) => {
            switch (this.Driver) {
                case "mysql":
                    this.svc = mysql.createConnection({
                        host: this.Host.toString().split(":")[0],
                        user: this.Username,
                        password: this.Password,
                        database: this.Database,
                        port: this.Host.toString().split(":")[1],
                    })
                    this.svc.ping(function(e) {
                        if (e) {
                            this.svc.destroy()
                            return rej(e)
                        }
                        this.svc.destroy()
                        return res(null)
                    }.bind(this))
                    break
                case "postgres":
                    this.svc = new pg.Client({
                        host: this.Host.toString().split(":")[0],
                        user: this.Username,
                        password: this.Password,
                        database: this.Database,
                        port: this.Host.toString().split(":")[1],
                    })
                    this.svc.connect()
                    this.svc.query('SELECT NOW()', (err) => {
                        if (err) {
                            return rej(err)
                        }
                        this.svc.end()
                        return res(null)
                      })
                    break
            }
        })
    } 
}

// DynamoDB wraps a service connection to Dynamo
class DynamoDB {
    constructor(config) {
        this.Name = config.Name
        this.Table = config.Table
    }
    // Ping checks to see if DynamoDB table exists
    Ping = () => {
        return new Promise(async (res, rej) => {
            try {
                this.svc = new AWS.DynamoDB()
                let r = await this.svc.describeTable({TableName: this.Table}).promise()
                return res(r)
            } catch (e) {
                return rej(e)
            }
        })
    }
}

// Elasticsearch wraps an elasticsearch connection
class Elasticsearch {
    constructor(config) {
        this.Name = config.Name
        this.Addresses = config.Addresses
        this.Username = config.Username
        this.Password = config.Password
    }
    // Ping checks to see if Elasticsearch is available
    Ping = () => {
        return new Promise(async (res, rej) => {
            let cfg = {nodes: this.Addresses}
            if (this.Username && this.Password) {
                cfg.auth = {
                    username: this.Username,
                    password: this.Password,
                }
            }
            this.svc = new elasticsearch.Client(cfg)
            this.svc.ping({}, function(e) {
                if (e) {
                    return rej(e)
                }
                return res(null)
            })
        })
    }
}

// Redis wraps a redis connection
class Redis {
    constructor(config) {
        this.Name = config.Name
        this.Address = config.Address
        this.Password = config.Password
        this.Database = config.Database
    }
    // Ping checks to see if Redis is available
    Ping = () => {
        return new Promise(async (res, rej) => {
            this.svc = new redis.createClient({
                host: this.Address.toString().split(":")[0],
                port: this.Address.toString().split(":")[1],
                password: this.Password,
                db: this.Database,
            })
            this.svc.ping(function(e) {
                if (e) {
                    return rej(e)
                }
                return res(null)
            })
        })
    }
}

module.exports = {DynamoDB, Elasticsearch, Redis, SQL}
