// Create a tag in the right namespace
function SVG(tag) {
   return document.createElementNS('http://www.w3.org/2000/svg', tag);
}

$.widget( "voyce.svgprogress", {
 
    // Default options.
    options: {
        height: 100,
        max : 100,
        value : 0,
    },
 
    _create: function() {
        // Set the standard classes.
        // this.element
        //      .addClass("ui-widget ui-widget-content");

        // The SVG parent container.
        this.container = $(SVG("svg"))
            .appendTo(this.element)
            //.attr("width", "100%")
            .attr("height", this.options.height);
        
        // The arc path.
        this.path = $(SVG("path"))
            .appendTo(this.container)
            .attr("class","svgprogress")
            .attr("height", "100%");

        // Display a text version of the progress
        // as a percentage.
        this.txt = $(SVG("text"))
             .appendTo(this.container)
             .attr("class","progresstext")
             .attr("x", this.options.height/2)
             .attr("y", this.options.height/2)
             .attr("text-anchor", "middle")
             .attr("alignment-baseline", "middle");

        this.oldValue = 0;
        this._refreshValue(this.oldValue);
    },

    _destroy: function() {
        this.element
            .removeClass("ui-widget ui-widget-content");
        this.container
            .remove();
    },

    // Acts as setter and getter, give us a chance to
    // clamp the value and update.
    value: function( newValue ) {
        if ( newValue === undefined ) {
            return this.options.value;
        }
        this.oldValue = this.options.value;
        this.options.value = this._constrain(newValue);
        this._refreshValue();
    },

    _constrain: function(value) {
        return Math.max(0, Math.min(value, this.options.max));
    },

    _refreshValue : function() {
        var height = this.options.height;

        // Create an SVG path data string
        var generatePath = function(max, from, to, progress){
            var centre = height / 2;
            var radius = height * 0.8 / 2; // Leave a bit of surrounding space
            var startY = centre - radius;
    
            var value = from + ((to - from) * progress);

            var deg = Math.min(((value/max) * 360), 359.9);
            // Subtract 90, because we want to start from the top
            // not the RHS
            var radians = Math.PI*(deg - 90)/180;
            var endx = centre + radius * Math.cos(radians);
            var endy = centre + radius * Math.sin(radians);
            var isLargeArc = deg > 180 ? 1 : 0;  

            return "M"+centre+","+startY+" A"+radius+","+radius+" 0 "+isLargeArc+",1 "+endx+","+endy;
        };

        var initial_ts = new Date().getTime();
        var duration = 125; // Run for 1/8th second
        var handle = 0;
        // Capture instance variable values
        var vfrom = this.oldValue;
        var vto = this.options.value;
        var max = this.options.max;
        var path = this.path;

        // Callback for each animation frame
        var draw = function() {
            var progress = (Date.now() - initial_ts)/duration;
            if (isNaN(vfrom))
                vfrom = vto;
            if (progress >= 1) {
                window.cancelAnimationFrame(handle);
            } else {
                var newPath = generatePath(max, vfrom, vto, progress);
                path.attr("d", newPath);
                handle = window.requestAnimationFrame(draw);
            }
        };
        draw();

        // Set textual version of progress too
        this.txt.text(Math.round((vto/max)*100) + '%');
    }
 
});
