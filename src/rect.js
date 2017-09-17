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