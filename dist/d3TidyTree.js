/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

function Rect(r) {

    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;

    if (r !== undefined) {
        this.setRect(r);
    }

    this.setRect = function(r) {
        this.x = r.x;
        this.y = r.y;
        this.width = r.width;
        this.height = r.height;
    }

    this.expandRect = function(size) {
        this.x -= size;
        this.width += (size*2);
        this.y -= size;
        this.height += (size*2);
    }

    this.addToBounds = function(r) {

        if (this.x == 0 && this.y == 0 && this.width == 0 && this.height == 0) {
            this.x = r.x;
            this.y = r.y;
            this.width = r.width;
            this.height = r.height;
            return;
        }

        var x0 = this.x;
        var y0 = this.y;
        var x1 = this.x + this.width;
        var y1 = this.y + this.height;

        if (x0 > r.x)
            x0 = r.x;
        if (y0 > r.y)
            y0 = r.y;
        if (x1 < r.x + r.width)
            x1 = r.x + r.width;
        if (y1 < r.y + r.height)
            y1 = r.y + r.height;

        this.x = x0;
        this.y = y0;
        this.width = x1 - this.x;
        this.height = y1 - this.y;
    }

    this.reset = function() {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
    }

    this.pointInRect = function(px, py) {
        if (px < this.x || px > this.x + this.width || py < this.y || py > this.y + this.height)
            return false;
        return true;
    }
}

module.exports = Rect;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var Rect = __webpack_require__(0);

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
}

module.exports = new Util();

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {


d3TidyTree = {
    Layout: __webpack_require__(3),
    Rect: __webpack_require__(0),
    Util: __webpack_require__(1)
}

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var Rect = __webpack_require__(0);
var Util = __webpack_require__(1);

function Layout() {

    this.compressTree = true;

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
                    Util.moveTree(c, 0, -min/2);
                    for(j in previousSiblings) {
                        Util.moveTree(previousSiblings[j], 0, min/2);
                    }
                    for(j in upperContour) {
                        upperContour[j] = upperContour[j] + min/2;
                    }
                }
            }

            previousSibling = c;
            previousSiblings.push(c);
        }
        
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

        node.x += (this.deltaX * ((node.bounds.width/2) - (node.width/2)));
        node.y += (this.deltaY * ((node.bounds.height/2) - (node.height/2)));
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

            // console.log(child.data.name + ' ' + child.bounds.height);

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

/***/ })
/******/ ]);