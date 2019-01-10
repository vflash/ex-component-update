'use strict';
// ----------------------------------------------------------

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

var _EX_COMPONENT_UPDATE = 'exComponentUpdate';
var _ON_CHILDS_UPDATE = 'exChildsUpdate'; // событие, есть вероятность что обновились потомки

var _IS_IGNORE_CHILDREN = '__isIgnoreChildren'; //
var _IS_IGNORE_OBJECT = '__isIgnoreObject';
var _IS_IGNORE_STATE = '__isIgnoreState';
var _EXTERNAL_DATA = '__externalData';


function exComponentUpdate(self, ignoreMode) {
    var isMixin = !self;
    var obj = isMixin ? {} : self;

    for (var i in mixin) {
        obj[i] = mixin[i];
    };

    if (typeof ignoreMode === 'object' && !!ignoreMode) {
        obj[_IS_IGNORE_CHILDREN] = !!ignoreMode.children;
        obj[_IS_IGNORE_OBJECT] = !!ignoreMode.object;
        obj[_IS_IGNORE_STATE] = !!ignoreMode.state;

    } else {
        obj[_IS_IGNORE_CHILDREN] = false;
        obj[_IS_IGNORE_OBJECT] = ignoreMode === true;
        obj[_IS_IGNORE_STATE] = ignoreMode === true;
    };

    if (isMixin) {
        obj.componentDidMount = componentDidMount;
        obj[_EXTERNAL_DATA] = [];

    } else {
        obj[_EXTERNAL_DATA] = (obj[_EX_COMPONENT_UPDATE]
            ? obj[_EX_COMPONENT_UPDATE](obj.props, obj.state)
            : []
        );
    };

    return obj;
};


var componentDidMount = function() {
    if (this[_EX_COMPONENT_UPDATE]) {
        this[_EXTERNAL_DATA] = this[_EX_COMPONENT_UPDATE](this.props, this.state);
    };
};

var mixin = {
    //exComponentUpdate: null, // function(nextProps, nextState) {return []};

    shouldComponentUpdate: function(nextProps, nextState) {
        var nextData = null;
        var exData = this[_EXTERNAL_DATA];

        if (this[_EX_COMPONENT_UPDATE]) {
            nextData = this[_EX_COMPONENT_UPDATE](nextProps, nextState);
            if (!nextData) {
                return false;
            };
        };

        if (!this[_IS_IGNORE_STATE] && nextState !== this.state) {
            if (nextData) {
                this[_EXTERNAL_DATA] = nextData;
            };
            return true;
        };

        var isIgnoreChangeChildren = this[_IS_IGNORE_CHILDREN] ? true : false;
        var isIgnoreChangeObject = this[_IS_IGNORE_OBJECT] ? true : false;
        var props = this.props;

        for(var name in nextProps) {
            var nextProp = nextProps[name];
            var prop = props[name];

            if (nextProp === prop) {
                continue;
            };

            if (isIgnoreChangeChildren && (name === 'children')) {
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

        tailExData(this, null);
        return false;
    },

    _checkExternalData: function(end) {
        if (!this[_EX_COMPONENT_UPDATE]) {
            tailExData(this, end);
            return;
        };

        var nextData = this[_EX_COMPONENT_UPDATE](this.props, this.state);
        var exData = this[_EXTERNAL_DATA];
        var j = nextData.length;

        if (j !== exData.length) {
            this[_EXTERNAL_DATA] = nextData;
            this.forceUpdate(end);
            return;
        };

        while(j--) {
            if (exData[j] !== nextData[j]) {
                this[_EXTERNAL_DATA] = nextData;
                this.forceUpdate(end);
                return;
            };
        };

        tailExData(this, end);
    },
};


function tailExData(self) {
    var refs = self.refs;

    for (var i in refs) {
        var elem = refs[i];

        if (elem._checkExternalData) {
            elem._checkExternalData();
            continue;

        };

        if (elem.tagName) {
            continue;
        };

        if (elem.setState) {
            //console.log(elem.constructor);
            elem.setState({});
        };
    };
};

/*
function tailExData(self, end) {
    var refs = self.refs;

    var hasChange = false;
    var pause = true;
    var jj = 0
    var j = 0;

    var fnn = function(x) {
        if (x) {
            hasChange = true;
        };

        fn();
    };

    var fn = function() {
        ++jj;

        if (pause || jj !== j) {
            return;
        };

        if (hasChange) {
            var fn = self[_ON_CHILDS_UPDATE];
            if (fn) {
                fn();
            };
        };

        if (end) {
            end(hasChange);
        };
    };

    for (var i in refs) {
        var elem = refs[i];

        if (!!elem._checkExternalData) {
            elem._checkExternalData((++j, fnn));

        } else if (!!elem.tagName) {
            continue;
        } else if (!!elem.setState) {
            hasChange = true;
            elem.setState({}, (++j, fn));
        };
    };


    pause = false;
    fn(++j);
};
*/
