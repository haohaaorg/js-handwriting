

var delay = (function () {
    var timer = 0;
    return function (callback, ms) {
        clearTimeout(timer);
        timer = setTimeout(callback, ms);
    };
})()

function Handrec($canvas, $output, $reset, $predict) {
    this.$canvas = $canvas;
    this.$output = $output;
    this.$reset = $reset;
    this.$predict = $predict;
    this.ctx = $canvas.getContext('2d');
    this.init();
    this.reset();
}

Handrec.prototype = {

    debounce: function(callback, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(function () { callback.apply(this, args); }, wait);
        };
    },


    selectToInput:function(that){
        const allDiv      = document.querySelectorAll("#output div");
        const resultInput = document.querySelector(".result-input");
        let _this = that;
        allDiv.forEach(each=>{
            each.addEventListener('click',()=>{
                const res = each.querySelector('.result');
                resultInput.value = resultInput.value+res.innerText;
                _this.reset();
            })
        })
    },
      

    init: function() {
        this.$canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.$canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.$canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.$reset.addEventListener('click', this.reset.bind(this));
    },

    reset: function() {
        this.res = '';
        this.traced = false;
        this.ctx.clearRect(0, 0, this.$canvas.width, this.$canvas.height);
        this.$output.innerText = '';
    },

    onMouseDown: function(evt) {
        this.traced = true;

        var x = evt.pageX - this.$canvas.offsetLeft;
        var y = evt.pageY - this.$canvas.offsetTop;

        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    },

    onMouseUp: function(evt) {
        this.traced = false;
        delay(()=>{
            this.prediction(this);
        },1500)
    },

    onMouseMove: function(evt) {
        if (!this.traced) return;
        var x = evt.pageX - this.$canvas.offsetLeft;
        var y = evt.pageY - this.$canvas.offsetTop;
        this.ctx.lineTo(x, y);
        this.ctx.lineWidth = 8;
        this.ctx.stroke();
    },

    prediction: async(that) => {
        let _this = that;
        const modelURL = "model/model.json";
        const metadataURL = "model/metadata.json";
        let canvas = document.querySelector("#board");
  
        // load model        
        const model = await tmImage.load(modelURL, metadataURL);

        // create image obj
        const image   = new Image();
         image.onload = async () => {


           const imageToDataUri = (img, width, height) => {

                // create an off-screen canvas
                let canvas = document.createElement('canvas'),
                    ctx = canvas.getContext('2d');
            
            
                // set its dimension to target size
                canvas.width = width;
                canvas.height = height;
            
                // canvas with white background
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            
                // draw source image into the off-screen canvas:
                ctx.drawImage(img, 0, 0, width, height);
            
                // encode image to data-uri with base64 version of compressed image
                return canvas;
            }

            const resized_image = imageToDataUri(image,96,96);
            const predictions = await model.predict(resized_image);
            // document.querySelector('.preview').src = resized_image.toDataURL('image/jpg');
            const res = predictions.sort((a,b)=>b.probability - a.probability);
            const closest = res.slice(0,3);
            const shanScript = {
                ka:'ၵ',
                kha:'ၶ',
                nga:'င',
                ja:'ၸ',
                hsa:'သ',
                nya:'ၺ',
                ta:'တ',
                hta:'ထ',
                na:'ၼ',
                pa:'ပ',
                pha:'ၽ',
                fa:'ၾ',
                ma:'မ',
                ya:'ယ',
                ra:'ရ',
                la:'လ',
                wa:'ဝ',
                ha:'ႁ',
                aa:'ဢ'
            }
            let result = closest.map(e=>{
                return `<div class="text-center border-1 m-2"> <h3 class="result">${shanScript[e.className]}</h3></div>`;
            })
            document.querySelector('#output').innerHTML = result.join('');

            _this.selectToInput(_this);

         }
         image.src = canvas.toDataURL("image/jpg");
    }
};