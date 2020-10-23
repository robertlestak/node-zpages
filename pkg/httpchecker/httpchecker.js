const fetch = require('node-fetch')

// HTTP wraps a basic HTTP checker
class HTTP {
    constructor(config) {
        this.Name = config.Name
        this.Address = config.Address
        this.Method = config.Method
        this.Body = config.Body
        this.StatusCodes = config.StatusCodes
    }
    // Ping connects to a HTTP endpoint and checks if the status code is in the defined list
    Ping = () => {
        return new Promise((res, rej) => {
            fetch(this.Address, {
                method: this.Method,
                body: this.Body,
            })
            .then(r => {
                if (this.StatusCodes.indexOf(r.status) !== -1) {
                    return res(r.status)
                } else {
                    return rej(`status code error. Expected one of ${this.StatusCodes}, got ${r.status}`)
                }
            })
            .catch(err => {
                return rej(err)
            })
        })
    }
}

module.exports = {HTTP}
