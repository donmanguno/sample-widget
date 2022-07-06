'use strict';

class Widget {
    constructor (initDelay) {
        this.popDelay = 1000;
        this.popTimeout = undefined;
        this.customerId = undefined;
        this.CONST = {LOCALHOST: 'LOCALHOST', CCTDI: 'CCTDI'}
        this.popMethod = this.CONST.LOCALHOST
        setTimeout(this.init.bind(this), initDelay);
    }

    init () {
        lpTag.agentSDK.init({
            visitorFocusedCallback: this.visitorFocusedCallback.bind(this),
            visitorBlurredCallback: this.visitorBlurredCallback.bind(this)
        });
        this.visitorFocusedCallback();
    }

    // promisify the SDK "get" method
    getPromise (path) {
        return new Promise((resolve, reject) => {
            lpTag.agentSDK.get(path, data => resolve(data), error => reject(error))
        })
    }

    // focus gained
    async visitorFocusedCallback () {
        let customerId = this.customerId || await this.getPromise('authenticatedData.customerDetails.customerId')
        // convert the customerId into a card number
        let cardNumber = getCCFromID(customerId)
        let URI

        if (this.popMethod === this.CONST.LOCALHOST) {
            URI = `http://localhost:8000/EchoWithGet?s=abcd-${cardNumber}-efgh`
            this.popTimeout = setTimeout(() => fetch(URI).catch(e => console.error(e.message)), this.popDelay)
        }

        if (this.popMethod === this.CONST.CCTDI) {
            URI = 'cctdi://appName'
            this.popTimeout = setTimeout(() => window.location.assign(URI), this.popDelay)
        }

    };

    // focus lost
    async visitorBlurredCallback () {
        clearTimeout(this.popTimeout)
    };
}

async function getCCFromID(id) {
    // do stuff
    return '4519031432969112'
}

let widget = new Widget(250);