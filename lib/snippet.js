const chalk = require('chalk');

module.exports =  {
    sleep: (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    rnd: (min, max) => {
        return Math.random() * (max - min) + min;
    },
    getTypeDefaultValue: (type) => {
        let val = null;

        if (type === 'number') {
            val = 0;
        }
        if (type === 'boolean') {
            val = false;
        }
        if (type === 'string') {
            val = '';
        }

        return val;
    },
    defaultifyObjectValues: (obj) => {
        Object.keys(obj).forEach(e => {
            let el = obj[e];
            const t = typeof el;

            if (t === 'object') {
                el = Snippet.defaultifyObjectValues(el);
            } else {
                obj[e] = Snippet.getTypeDefaultValue(t);
            }
        });

        return new Promise(resolve => ( resolve(obj) ));
    },
    log: (status, header, message) => {
        let h = '';

        switch (status) {
            case 'success':
                h = chalk.green(`[${header}]`);
                break;
            case 'warning':
                h = chalk.yellow(`[${header}]`);
                break;
            case 'error':
                h = chalk.red(`[${header}]`);
                break;
            default:
                h = chalk.magenta(`[${header}]`);
                break;
        }

        console.log(h, message);
    }
};