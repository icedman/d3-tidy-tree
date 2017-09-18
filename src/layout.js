var Rect = require('./rect');
var Util = require('./util');

function Layout() {

    this.compressTree = true;
    this.centerNodeOverChildren = true;
    this.tryToBalanceTree = true;

    // todo remove this delta thingy (just post-process -- rotate)
    this.deltaX = 0;
    this.deltaY = this.deltaX ? 0 : 1;

    // todo remove this direction thingy (just post-process -- mirroring)
    this.direction = 1;

    // parentChild separtion
    this.parentChildSeparation = 100;

    // match contour
    this._thirdWalk = function(node) {

        Util.contourNodeExtend = this.parentChildSeparation / 4;

        var upperContour = [];
        var previousSibling;
        var previousSiblings = [];
        for(var i in node.children) {
            var c = node.children[i];

            this._thirdWalk(c);

            if (previousSibling != undefined) {

                // upper contour is it's bottom
                Util.getLowerContour(previousSibling, upperContour);
                
                // for(var j in previousSiblings) {
                //     Util.getUpperContour(previousSiblings[j], upperContour);
                // }

                var lowerContour = Util.getUpperContour(c);
                
                var min = Util.compareContours(upperContour, lowerContour);
                if (min > 0) {

                    if (this.tryToBalanceTree) {
                        Util.moveTree(c, 0, -min/2);
                        for(j in previousSiblings) {
                            Util.moveTree(previousSiblings[j], 0, min/2);
                        }
                        for(j in upperContour) {
                            upperContour[j] = upperContour[j] + min/2;
                        }
                    } else {

                        Util.moveTree(c, 0, -min);
                    }
                    
                }

            }

            previousSibling = c;
            previousSiblings.push(c);
        }

        // todo save contour for parent's use?
        // achieve linear time?
    };

    // position the nodes based intial layout
    this._secondWalk = function(node, x, y) {

        // root
        if (node.parent == undefined) {
            node.rx = 0;
            node.ry = 0;
        }

        node.direction = this.direction;

        node.x = node.rx + x;
        node.y = node.ry + y;
        node.px = node.x + (node.width * this.direction * this.deltaY);
        node.py = node.y + (node.height * this.direction * this.deltaX);

        var offX = 0;
        var offX = 0;
        if  (node.width > node.childrenBounds.width) {
            offX = this.deltaX * (node.width/2 - node.childrenBounds.height/2);
        }

        var offY = 0;
        if  (node.height > node.childrenBounds.height) {
            offY = this.deltaY * (node.height/2 - node.childrenBounds.height/2);
        }

        // compute relative x,y of children
        for(var i in node.children) {
            var child = node.children[i];
            this._secondWalk(child, 
                node.px + (this.parentChildSeparation *this.direction * this.deltaY) + offX,
                node.py + (this.parentChildSeparation *this.direction * this.deltaX) + offY);
        }

        if (this.centerNodeOverChildren) {
            node.x += (this.deltaX * ((node.bounds.width/2) - (node.width/2)));
            node.y += (this.deltaY * ((node.bounds.height/2) - (node.height/2)));
        }
    };

    // initial layout
    this._firstWalk = function(node) {

        node.direction = this.direction;

        var bounds = new Rect();
        bounds.addToBounds({x:0,y:0,width:node.width,height:node.height});

        var childrenBounds = new Rect();
        
        // modify these according to layout pref
        var offsetX = 0;
        var offsetY = 0;
        var paddingX = 0;
        var paddingY = 0;

        var dx = offsetX * this.deltaX;
        var dy = offsetY * this.deltaY;

        // compute relative x,y of children
        for(var i in node.children) {
            var child = node.children[i];

            this._firstWalk(child);

            child.rx = dx;
            child.ry = dy;

            // compute child bounds (including its descendants up to the leaves)
            bounds.addToBounds({x:dx,y:dy,width:child.bounds.width,height:child.bounds.height});
            childrenBounds.addToBounds({x:dx,y:dy,width:child.bounds.width,height:child.bounds.height});

            dx += this.deltaX * (child.bounds.width + paddingX);
            dy += this.deltaY * (child.bounds.height + paddingY);
        }

        node.bounds = { x:bounds.x, y:bounds.y, width: bounds.width, height: bounds.height };
        node.childrenBounds = { x:childrenBounds.x, y:childrenBounds.y, width: childrenBounds.width, height: childrenBounds.height };
    };

    this.tree = function(node) {

        this._firstWalk(node);
        this._secondWalk(node, 0, 0);

        if (this.compressTree)
            this._thirdWalk(node);

        // move root back to zero
        Util.moveTree(node, -node.x, -node.y);
    };
}

module.exports = Layout;