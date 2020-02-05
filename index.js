"use strict";

function objkeys(obj) {
    var data = [];
    for(var key in obj)
        data.push(key);
    return data;
}

function objvalues(obj) {
    var data = [];
    for(var key in obj)
        data.push(obj[key]);
    return data;
}

var SQLMasterProvider = function (obj) {
    this.query = "";
    this.tableName = "";
    this.wValues = null;
    var prepareType = obj.prepareType || '$';

    var clear = function () {
        this.query = "";
        this.tableName = "";
        this.wValues = null;
    }.bind(this)

    /**
     * Sorgunun yapılacağı tablo ismini belirler
     * @param array table
    */
    this.from = function (table = null) {
        this.query = "";
        this.tableName = table;
        return this;
    }

    /**
     * Seçilecek sütunları belirler
     * @param array cols
    */
    this.select = function (cols = null) {
        var name = this.tableName;
        if (!cols) {
            this.query = "SELECT * FROM " + name + this.query;
            return this;
        }

        var select = "SELECT ";
        var i = 0;
        for (var key in cols) {
            if (typeof cols[key] === "string")
                select += cols[key];
            else
                select += cols[key][1] + " AS " + cols[key][0] + "";

            if (++i != cols.length)
                select += ", ";
        }

        select += " FROM " + name;
        this.query = select + this.query;
        return this;
    }
    /**
     * Tablo ismine ve değerlerine göre join çeker
     * @param array table
     * @param string equals
    */
    this.join =  function(table, equals) {
        if (!table || !equals) {
            throw new Error("table or equals exists");
        }
        var name = this.tableName;
        this.query += " LEFT JOIN " + table + " ON";
        var i = 0;
        for (var key in equals) {
            if (equals[key] instanceof Object) {
                if (typeof equals[key][0] === "string" && typeof equals[key][0] === "string") {
                    this.query += " " + equals[key][0] + " = " + equals[key][1];
                } else {
                    this.query += " " + name + "." + objkeys(equals[key])[0] + " = " + table + "." + objvalues(equals[key]);
                }
            }
            if (++i != objkeys(equals).length)
                this.query += " AND";
        }
        return this;
    }

    /**
     * Sorgunun Koşulu
     * @param string where
    */
    this.where = function (where, wValues = null) {
        if (!where) {
            throw new Error("where exists");
        }

        if (wValues != null) {
            if (this.wValues != null && typeof this.wValues === 'object')
                this.wValues = Object.assign(this.wValues, wValues);
            else
                this.wValues = wValues;
        }

        var values = objkeys(this.wValues);
        var prLen = values.length;

        if (wValues != null) {
            prLen = prLen - objkeys(wValues).length + 1;
        }

        for(var i = 0; i < values.length; i++) {
            if (where.match(values[i]) !== null) {
                where = where.replace(new RegExp(values[i], 'g'), prepareType + (prLen++));
            }
        }

        this.query += " WHERE " + where;
        return this;
    }

    /**
     * Sorguya group parametreleri ekler
     * @param string values
    */
    this.groupBy = function (values) {
        if (!values) {
            throw new Error("value exists");
        }

        this.query += " GROUP BY " + values;
        return this;
    }

    /**
     * Sorguya sıra parametreleri ekler
     * @param string values
    */
    this.orderBy = function (values) {
        if (!values) {
            throw new Error("value exists");
        }
        this.query += " ORDER BY " + values;
        return this;
    }

    /**
     * Sorgu sıralaması tipini desc yapar
    */
    this.desc = function() {
        this.query += " DESC";
        return this;
    }

    /**
     * Sorgu sıralaması tipini asc yapar
    */
    this.asc = function() {
        this.query += " ASC";
        return this;
    }

    /**
     * Sorgunun limitini belirler default olarak 10'dur.
     * @param integer start
     * @param integer end
    */
    this.limit = function (start = 10, end = '') {
        var limit = " LIMIT " + start;
        if (end) {
            limit += ", " + end;
        }

        this.query += limit;
        return this;
    }

    /**
     * Sorgunun offset değerini belirler
     * @param integer offset
    */
    this.offset = function (offset = 10) {
        this.query += " OFFSET " + offset;
        return this;
    }

    /**
     * Sorgunun limitini belirler default olarak 10'dur.
     * @param integer limit
    */
    this.returning = function (text) {
        this.query += " RETURNING " + text;
        return this;
    }

    /**
     * data içindeki keylere göre insert işlemi yapar
     * @param integer limit
    */
    this.insert = function (data) {
        // çoklu insert
        if (data instanceof Array && data[0] instanceof Object) {
            this.query = "INSERT INTO " + this.tableName + " (" + objkeys(data[0]).join(', ') + ") VALUES ";

            var values = {};
            var prLen = this.wValues ? this.wValues.length : 0;
            for (var i = 0; i < data.length; i++) {
                var row = [];
                for (var key in data[i]) {
                    values[':' + key + i] = data[i][key];

                    if (prepareType === 'tag')
                        row.push(':' + key + i);
                    else
                        row.push(prepareType + (++prLen));
                }

                this.query += "(" + row.join(',') + ")";

                if (i != data.length - 1)
                    this.query += ", ";
            }

            if (this.wValues && typeof this.wValues === 'object')
                this.wValues = Object.assign(this.wValues, values);
            else
                this.wValues = values;
        }

        // tekli insert
        else {
            this.query = "INSERT INTO " + this.tableName + " (" + objkeys(data).join(', ') + ") VALUES(";

            var values = {};
            var i = 0, prLen = this.wValues ? this.wValues.length : 0;
            for (var key in data) {
                values[':' + key] = data[key];

                if (prepareType === 'tag')
                    this.query += ":" + key;
                else
                    this.query += prepareType + (++prLen);

                if (i++ != objvalues(data).length - 1)
                    this.query += ", ";
            }

            this.query += ")"

            if (this.wValues && typeof this.wValues === 'object')
                this.wValues = Object.assign(this.wValues, values);
            else
                this.wValues = values;
        }

        return this;
    }

    /**
     * data içindeki keylere göre insert işlemi yapar
     * where işlemi ilede hangi sütunların işleme tutulacağı belirlenir
     * @param integer limit
    */
    this.update = function (data) {
        this.query = "UPDATE " + this.tableName + " SET";

        var values = {};
        var i = 0, prLen = this.wValues ? this.wValues.length : 0;
        for (var key in data) {
            values[':' + key] = data[key];

            if (this.wValues && typeof this.wValues === 'object')
                this.wValues = Object.assign(this.wValues, values);

            if (prepareType === 'tag')
                this.query += " " + key + " = :" + key;
            else
                this.query += " " + key + " = " + prepareType + (++prLen);

            if (i++ != objvalues(data).length - 1)
                this.query += ",";
        }

        if (this.wValues && typeof this.wValues === 'object')
            this.wValues = Object.assign(this.wValues, values);
        else
            this.wValues = values;

        return this;
    }

    /**
     * where  ile koşullu silme yapar
     * @param integer limit
    */
    this.delete = function () {
        this.query = "DELETE FROM " + this.tableName;
        return this;
    }

    /**
     * çıktıyı verir
     * @param integer limit
    */
    this.exec = function (type) {
        type = type || '';

        switch(type) {
            default:
                var text = this.query.trim();
                var values = objvalues(this.wValues);
                var objectValues = {};

                values.forEach((x, i) => {
                    objectValues[prepareType + (i + 1)] = x;
                });

                clear();

                return {
                    text: text,
                    values: values,
                    objectValues: objectValues
                };
        }
    }
};

var SQLMaster = function () {
    var options = {};

    this.from = function (tableName) {
        return new SQLMasterProvider(options).from(tableName);
    };

    this.init = function (obj) {
        options = obj;
    };
}

module.exports = new SQLMaster();
