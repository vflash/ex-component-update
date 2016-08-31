/*
// exComponentUpdate(selfComponent, isIgnoreChangeObject);

class {
    constructor() {
        exComponentUpdate(this, false|true);
        ...
    };

    exComponentUpdate(nextProps, nextState) {
        return [
            nextProps.value,
            ...
        ];
    };
};
--------------------------------
React.createClass({
    mixins: [
        exComponentUpdate(null, false|true)
    ],

    exComponentUpdate: function(nextProps, nextState) {
        return [
            nextProps.value,
            ...
        ];
    },

    render: function() {
        ...
    }
});
*/

module.exports = exComponentUpdate;

var GET_COMPONENT_UPDATE = 'exComponentUpdate';
var _IS_IGNORE_OBJECT = '__isIgnoreObject';
var _IS_IGNORE_STATE = '__isIgnoreState';
var _EXTERNAL_DATA = '__externalData';

function exComponentUpdate(self, ignoreMode) {
    var isMixin = !self;
    var obj = isMixin ? {} : self;

    for (var i in mixin) {
        obj[i] = mixin[i];
    };

    obj[_IS_IGNORE_OBJECT] = ignoreMode === true;
    obj[_IS_IGNORE_STATE] = ignoreMode === true;

    if (isMixin) {
        obj.componentDidMount = componentDidMount;
        obj[_EXTERNAL_DATA] = [];

    } else {
        obj[_EXTERNAL_DATA] = (obj[GET_COMPONENT_UPDATE]
            ? obj[GET_COMPONENT_UPDATE](obj.props, obj.state)
            : []
        );
    };

    return obj;
};


var componentDidMount = function() {
    if (this[GET_COMPONENT_UPDATE]) {
        this[_EXTERNAL_DATA] = this[GET_COMPONENT_UPDATE](this.props, this.state);
    };
};

var mixin = {
    //exComponentUpdate: null, // function(nextProps, nextState) {return []};

    shouldComponentUpdate: function(nextProps, nextState) {
        var nextData = this[GET_COMPONENT_UPDATE] ? this[GET_COMPONENT_UPDATE](nextProps, nextState) : null;
        var exData = this[_EXTERNAL_DATA];

        var props = this.props;

        if (!this[_IS_IGNORE_STATE] && nextState !== this.state) {
            if (nextData) {
                this[_EXTERNAL_DATA] = nextData;
            };
            return true;
        };

        var isIgnoreChangeObject = this[_IS_IGNORE_OBJECT] ? true : false;

        for(var name in nextProps) {
            var nextProp = nextProps[name];
            var prop = props[name];

            if (nextProp === prop) {
                continue;
            };

            if (isIgnoreChangeObject) {
                var propType = typeof prop;

                if (true
                    && (propType === 'object' || propType === 'function')
                    && (propType === typeof nextProp)
                    && (name !== 'children')
                ) {
                    continue;
                };
            };

            if (nextData) {
                this[_EXTERNAL_DATA] = nextData;
            };

            return true;
        };

        if (nextData) {
            var j = nextData.length;

            if (j !== exData.length) {
                this[_EXTERNAL_DATA] = nextData;
                return true;
            };

            while(j--) {
                if (exData[j] !== nextData[j]) {
                    this[_EXTERNAL_DATA] = nextData;
                    return true;
                };
            };
        };

        tailExData(this);
        return false;
    },

    _checkExternalData: function() {
        if (!this[GET_COMPONENT_UPDATE]) {
            tailExData(this);
            return;
        };

        var nextData = this[GET_COMPONENT_UPDATE](this.props, this.state);
        var exData = this[_EXTERNAL_DATA];
        var j = nextData.length;

        if (j !== exData.length) {
            this[_EXTERNAL_DATA] = nextData;
            this.forceUpdate();
            return;
        };

        while(j--) {
            if (exData[j] !== nextData[j]) {
                this[_EXTERNAL_DATA] = nextData;
                this.forceUpdate();
                return;
            };
        };

        tailExData(this);
    },
};


function tailExData(self) {
    var refs = self.refs;

    for (var i in refs) {
        var elem = refs[i];

        if (elem._checkExternalData) {
            elem._checkExternalData();

        } else if (elem.tagName) {
            continue;
        } else if (elem.setState) {
            elem.setState({});
        };
    };
};
