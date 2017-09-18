var Rect = require('./rect');

function Util()
{
    this.contourSteps = 10;
    this.contourNodeExtend = 120;

    this.computeBounds = function(nodes) {
        var r = new Rect();
        for (var i in nodes) {
            var d = nodes[i];
            r.addToBounds({x:d.x,y:d.y,width:d.width * 0.5,height:d.height});
        }
        return r;
    }

    this._getContour = function(contour, node, mode) {
        var s = (node.width + this.contourNodeExtend) / this.contourSteps;
        for(var i=0;i<(s+1);i++) {
            var x = (node.x + (s * i)) / this.contourSteps;
            x = Math.floor(x);

            var value;
            if (mode == 0) {
                // lower contour
                value = node.y + node.height;
                if (contour[x] == undefined) {
                    contour[x] = value;
                }
                if (contour[x] < value) {
                    contour[x] = value;
                }
            } else {
                // upper contour
                value = node.y;
                if (contour[x] == undefined) {
                    contour[x] = value;
                }
                if (contour[x] > value) {
                    contour[x] = value;
                }
            }

        }

        for(var j in node.children) {
            var child = node.children[j];
            this._getContour(contour, child, mode);
        }
    };

    this.getUpperContour = function(node, cc) {
        var contour = cc;
        if (cc == undefined)
            contour = [];
        this._getContour(contour, node, 1);
        return contour;
    };

    this.getLowerContour = function(node, cc) {
        var contour = cc;
        if (cc == undefined)
            contour = [];
        this._getContour(contour, node, 0);
        return contour;
    };

    this._fillContourGap = function(contour) {
        var i,previ,j;
        for(i in contour) {
            if (previ != undefined) {
                var val = contour[previ];
                for(j=previ;j<i;j++) {
                    if (contour[j] == undefined) {
                        contour[j] = val;
                    }
                }
            }
            previ = i;
        }
    };

    this.compareContours = function(upper, lower) {
        this._fillContourGap(upper);
        this._fillContourGap(lower);

        // first key
        var f1,f2;
        for(var i in upper) {
            f1 = i;
            break;
        }

        var min;
        for(i=f1;;i++) {
            var u = upper[i];
            var l = lower[i];

            if (u == undefined || l == undefined)
                break;

            var diff = l - u;
            if (min == undefined || min > diff)
                min = diff;
        }

        return min;
    };

    this.moveTree = function(node, dx, dy) {
        node.x += dx;
        node.y += dy;
        
        // console.log(node.data.name + ' (' + node.x + ',' + node.y + ')');

        for(var i in node.children) {
            var child = node.children[i];
            this.moveTree(child, dx, dy);
        }
    };

    this._flipHorizontally = function(node, rootx) {
        node.x = rootx - node.x;
        for(var i in node.children) {
            this._flipHorizontally(node.children[i], rootx);
        }
    };

    this.flipHorizontally = function(node) {
        for(var i in node.children) {
            this._flipHorizontally(node.children[i], 0);
        }
    };
}

module.exports = new Util();