const AWS = require('aws-sdk')

// S3 wraps a service connection to S3
class S3 {
    constructor(config) {
        this.Name = config.Name
        this.Bucket = config.Bucket
    }
    // Ping checks to see if S3 bucket exists
    Ping = () => {
        return new Promise(async (res, rej) => {
            try {
                this.svc = new AWS.S3()
                let r = await this.svc.headBucket({Bucket: this.Bucket}).promise()
                return res(r)
            } catch (e) {
                return rej(e)
            }
        })
    }
}

module.exports = {S3}
