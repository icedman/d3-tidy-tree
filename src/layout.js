var Rect = require('./rect');
var Util = require('./util');

function Layout() {

    this.viewType = 'tree';
    this.compressTree = true;
    this.centerNodeOverChildren = true;
    this.parentChildSeparation = 100;
    this.direction = -1;
    this.tryToBalanceTree = false;
    this.cacheContour = true;

    // match contour
    this._thirdWalk = function(node) {

        Util.contourNodeExtend = this.parentChildSeparation;

        var upperContour = [];
        var previousSibling;
        var previousSiblings = [];
        for(var i in node.children) {
            var c = node.children[i];

            this._thirdWalk(c);

            if (previousSibling != undefined) {

                if (previousSibling.upperContour) {
                    Util.mergeUpperContours(previousSibling.upperContour, upperContour);
                    Util.shallowContourQuery = true;
                    Util.getLowerContour(previousSibling, upperContour, true);
                    Util.shallowContourQuery = false;
                } else {

                    // upper contour is it's bottom
                    Util.getLowerContour(previousSibling, upperContour);

                    // upperContour = [];
                    // for(var ps in previousSiblings) {
                    //     Util.getLowerContour(previousSiblings[ps], upperContour);
                    // }

                }

                var lowerContour = Util.getUpperContour(c);
                
                // console.log(previousSibling.data.name);
                // console.log(c.data.name);

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
                        Util.moveTree(c, 0, -min/1.5);
                    }
                    
                }

            }

            previousSibling = c;
            previousSiblings.push(c);
        }

        // save contour for parent's
        // achieve linear time?
        if (this.cacheContour) {
            if  (previousSibling) {
                Util.getLowerContour(previousSibling, upperContour);
            }
            node.upperContour = upperContour;
        }
    };

    // position the nodes based intial layout
    this._secondWalk = function(node, x, y) {

        // root
        if (node.parent == undefined) {
            node.rx = 0;
            node.ry = 0;
        }

        node.x = node.rx + x;
        node.y = node.ry + y;
        var px = node.x + node.width;
        var py = node.y;

        var offY = 0;
        if  (node.height > node.childrenBounds.height) {
            offY = (node.height/2 - node.childrenBounds.height/2);
        }

        // compute relative x,y of children
        for(var i in node.children) {
            var child = node.children[i];
            this._secondWalk(child, 
                px + this.parentChildSeparation,
                py + offY);
        }

        if (this.centerNodeOverChildren) {
            node.y += ((node.bounds.height/2) - (node.height/2));
        }
    };

    // initial layout
    this._firstWalk = function(node) {

        node.direction = this.direction;
        node.upperContour = undefined;

        var bounds = new Rect();
        bounds.addToBounds({x:0,y:0,width:node.width,height:node.height});

        var childrenBounds = new Rect();
        
        // modify these according to layout pref
        var offsetX = 0;
        var offsetY = 0;
        var paddingX = 0;
        var paddingY = 0;

        var dx = offsetX;
        var dy = offsetY;

        // compute relative x,y of children
        for(var i in node.children) {
            var child = node.children[i];

            this._firstWalk(child);

            child.rx = dx;
            child.ry = dy;

            // compute child bounds (including its descendants up to the leaves)
            bounds.addToBounds({x:dx,y:dy,width:child.bounds.width,height:child.bounds.height});
            childrenBounds.addToBounds({x:dx,y:dy,width:child.bounds.width,height:child.bounds.height});

            dy += (child.bounds.height + paddingY);
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

        if (this.direction == -1) {
            Util.flipHorizontally(node);
        }
        
        node.viewType = 'tree';
    };

    this.mindmap = function(node) {

        var children = node.children;

        if (node.left == undefined) {
            var left = [];
            var right = [];
            for(var i in node.children) {
                if (i % 2) {
                    left.push(node.children[i]);
                } else {
                    right.push(node.children[i]);
                }
            }
            node.left = left;
            node.right = right;
        }

        this.direction = -1;
        node.children = node.left;
        this.tree(node);
        Util.moveTree(node, node.width, 0);

        var x = node.x;
        var y = node.y;

        this.direction = 1;
        node.children = node.right;
        this.tree(node);

        node.children = children;

        // todo balance!
        node.y = (node.y + y)/2;

        Util.moveTree(node, -node.x, -node.y);

        node.viewType = 'mindmap';
    };

    this.run = function(node) {
        // Util.visits = 0;
        // console.time();

        switch(this.viewType) {
            case 'mindmap':
                this.mindmap(node);
                break;
            case 'tree':
            default:
                this.tree(node);
                break;
        }
        // console.timeEnd();
        // console.log(Util.visits);
    };
}

module.exports = Layout;