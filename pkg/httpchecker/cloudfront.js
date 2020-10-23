const AWS = require('aws-sdk')

// CloudFront wraps a connection to CloudFront
class CloudFront {
    constructor(config) {
        this.Name = config.Name
        this.ID = config.ID
    }
    // Ping checks to see if CloudFront Distribution exists
    Ping = () => {
        return new Promise(async (res, rej) => {
            try {
                this.svc = new AWS.CloudFront()
                let r = await this.svc.getDistribution({Id: this.ID}).promise()
                let ds = r.Distribution.Status
                if (ds !== "Deployed" && ds != "InProgress") {
                    return rej("distribution status:", ds)
                }
                return res(r)
            } catch (e) {
                return rej(e)
            }
        })
    }
}

module.exports = {CloudFront}
