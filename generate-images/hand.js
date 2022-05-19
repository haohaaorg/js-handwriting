function Handrec($canvas, $output, $reset) {
    this.$canvas = $canvas;
    this.$output = $output;
    this.$reset = $reset;
    this.ctx = $canvas.getContext('2d');
    this.init();
    this.reset();
}

Handrec.prototype = {

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
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.$canvas.width, this.$canvas.height);
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
        // this.prediction(this);
    },

    onMouseMove: function(evt) {
        if (!this.traced) return;
        var x = evt.pageX - this.$canvas.offsetLeft;
        var y = evt.pageY - this.$canvas.offsetTop;
        this.ctx.lineTo(x, y);
        this.ctx.lineWidth = 8;
        this.ctx.stroke();
    },

    imageToDataUri : (img, width, height) => {

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
    },

    prediction: async(that) => {
        const modelURL = "model/model.json";
        const metadataURL = "model/metadata.json";
  
        // load model        
        const model = await tmImage.load(modelURL, metadataURL);

        // create image obj
        const image   = new Image();
         image.onload = async () => {
             const resized_image = that.imageToDataUri(image,96,96);
            const predictions = await model.predict(resized_image);
            // document.querySelector('.preview').src = resized_image.toDataURL('image/jpg');
            const res = predictions.sort((a,b)=>b.probability - a.probability);
            document.querySelector('#output').innerHTML = res[0].className;
         }
         image.src = that.$canvas.toDataURL("image/jpg");
    }
};