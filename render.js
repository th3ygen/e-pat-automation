const automate = require('./functions/automate');
const { EventEmitter } = require('selenium-webdriver');

const title = 'Starting...';
const progress = {
    val: 0,
    max: 1
};

function start(params, data) {
    automate.start(params, data);
}

function minMaxValidate(range, e) {
    const val = parseInt(e.value);
    if (val < range[0]) {
        e.value = range[0];
    }

    if (val > range[1]) {
        e.value = range[1];
    }

    if (e.id === 'rating_max' && val < $('#rating_min').val()) {
        e.value = $('#rating_min').val();
    }
}

function submitForm() {
    const params = {
        rating: {
            min: parseInt($('#rating_min').val()),
            max: parseInt($('#rating_max').val())
        }
    };

    $('#form').hide();

    $('#spinner').show();
    $('#progress').show();

    $('#title').text(title);

    start(params, data => {
        if (data.type === 'loading' || data.type === 'done') {
            $('#title').text(data.val);

            if (data.type === 'loading') {
                $('#spinner').show(50);
            }
            if (data.type === 'done') {
                $('#spinner').hide(50);
            }
        }

        if (data.type === 'progress') {
            const items = data.val.toString().split('.');

            switch (items[0]) {
                case 'start':
                    progress.val = 0;
                    progress.max = parseInt(items[1]);
                    break;
                case 'increment':
                    progress.val++;

                    const x =  Math.round((progress.val / progress.max) * 100);
                    $('#progressBar').attr('aria-valuenow', x);
                    $('#progressBar').attr('style', `width: ${x}%`);

                    break;
                case 'stop':
                    return;
                default: break;
            }
        }

        if (data.type === 'final') {
            $('#title').text(data.val);
            $('#progress').hide(300);
        }
    });
}

$('#spinner').hide();
$('#progress').hide();