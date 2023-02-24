'use strict';

/**
* --------------------------------
* Function JS
* --------------------------------
*/

class fn {
    static htmlOnClick() {
        console.log('htmlOnClick!');
    }
}

class Parent {
    constructor(width, height, text) {
        this.width = width || 10;
        this.height = height || 10;
        this.text = text;
        
    }

    calc() {
        return this.width + this.height;
    }

    get test() {
        return 'Parent!';
    }

    get calcResult() {
        return this.calc();
    }
}

class Children extends Parent {
    log() {
        return 'Log!';
    }

    calc() {
        return super.calc();
    }
}