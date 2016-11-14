module.exports = class Squad {
    constructor(color, units) {
        this.squadColor = color;
        this.squadUnits = [...units];
    }

    get color() {
        return this.squadColor;
    }

    get units() {
        return this.squadUnits;
    }
};
