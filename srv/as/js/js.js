'use strict'

class Workers {
    static async fetchJSON(url) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.overrideMimeType("application/json");
            xhr.open('GET', url, true);

            xhr.addEventListener('readystatechange', function () {
                if (xhr.readyState == 4 && xhr.status == "200") {
                    resolve(JSON.parse(xhr.responseText));
                }
            });

            xhr.send(null);
        })
    }

    static async decodeImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.addEventListener('load', async function () {
                if (typeof img.decode === 'function') { // wait up for the image to be ready to render
                    try {
                        await img.decode();
                    } catch (err) {
                        console.error(err);
                    }
                }

                resolve(img);
            });

            img.src = url;
        });
    }

    static returnAnimationEvent() { // ripped from https://stackoverflow.com/questions/5023514/how-do-i-normalize-css3-animation-functions-across-browsers/9090128#9090128
        var a;
        var el = document.createElement('fugazi');
        var animations = {
            "animation": "animationend",
            "OAnimation": "oAnimationEnd",
            "MozAnimation": "animationend",
            "WebkitAnimation": "webkitAnimationEnd"
        };

        for (a in animations) {
            if (el.style[a] !== undefined) {
                return animations[a];
            }
        }
    }
}

class Canvas {
    constructor(id) {
        this.el = document.getElementById(id);
        this.ctx = this.el.getContext("2d");

        const rect = this.el.getBoundingClientRect();
        this.el.width = rect.width;
        this.el.height = rect.height;

        this.scale = {
            x: 2,
            y: 2
        }
    }

    clear() {
        this.ctx.clearRect(0, 0, this.el.width, this.el.height);
    }
}

const anim = {
    opts: {
        frameSpeed: 20, // ms between frames
        fadeSpeed: 120 // ms spent fading a frame in
    },

    init: async function () {
        this.imgs.pcb = await Workers.decodeImage('/as/img/m6428-pcb.png'); // decode pcb first before animation

        this.canvases.pcb.ctx.drawImage( // draw blank pcb
            this.imgs.pcb,
            0, 0,
            this.canvases.pcb.el.width, this.canvases.pcb.el.height
        );

        this.scale = this.imgs.pcb.width / this.canvases.pcb.el.width;

        this.canvases.pcb.el.classList.replace('hide', 'enter'); // trigger canvas entrance

        let [ss, json] = await Promise.all([ // we wait for the spritesheet to decode, the json to be fetched and the canvas to finish it's entrance animation
            Workers.decodeImage('/as/img/sprite-comp.png'),
            Workers.fetchJSON('/as/d/spritesheet.json'),
            new Promise((resolve, reject) => {
                this.canvases.pcb.el.addEventListener(Workers.returnAnimationEvent(), function () { resolve(); }, false);
            })
        ])

        this.imgs.spritesheet = ss;
        this.map = json;

        this.then = Date.now();
        this.initiated = this.then;

        this.completed = 0; // frames finished animating

        window.requestAnimationFrame(() => { this.render() });
    },

    render: function () {
        let now = Date.now();
        let delta = (now - this.then);
        this.then = now;
        let elapsed = now - this.initiated;

        let frame = Math.floor(elapsed / this.opts.frameSpeed);

        this.canvases.components.clear();

        for (let i = this.completed; i < frame; i++) {
            let start = i * this.opts.frameSpeed;
            let pos = (elapsed - start) / this.opts.fadeSpeed;
            let alpha = pos < 1 ? pos : 1 // determine alpha of component based on elapsed animation time

            this.canvases.components.ctx.globalAlpha = alpha;

            if (i < this.map.length) {
                let sprite = this.map[i];

                this.canvases.components.ctx.drawImage(
                    this.imgs.spritesheet,
                    sprite.x, sprite.y,
                    sprite.w, sprite.h,
                    sprite.sx / this.scale, sprite.sy / this.scale,
                    sprite.w / this.scale, sprite.h / this.scale
                );
            }

            if (alpha == 1) { // move component to static canvas if alpha = 1
                this.completed = i + 1;

                this.canvases.pcb.ctx.drawImage(
                    this.canvases.components.el,
                    0, 0,
                    this.canvases.pcb.el.width, this.canvases.pcb.el.height
                );
                this.canvases.components.clear();
            }
        }

        if (this.map.length > this.completed) window.requestAnimationFrame(() => { this.render() });
    },

    imgs: {},

    canvases: {
        pcb: new Canvas('pcb'),
        components: new Canvas('components')
    }
}

window.addEventListener('load', e => {
    anim.init();
});