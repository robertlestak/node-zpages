const AWS = require('aws-sdk')

// Rekognition wraps a service connection to Rekognition
class Rekognition {
    constructor(config) {
        this.Name = config.Name
    }
    // Ping checks to see if Rekognition API responds
    Ping = () => {
        return new Promise(async (res, rej) => {
            try {
                this.svc = new AWS.Rekognition()
                let r = await this.svc.describeProjects({MaxResults: 1}).promise()
                return res(r)
            } catch (e) {
                return rej(e)
            }
        })
    }
}

module.exports = {Rekognition}
