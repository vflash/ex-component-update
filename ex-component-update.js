// i mport 'react-all-elements';
export default exComponentUpdate;

/*
class Welcome extends React.Component {
    constructor() {
        exComponentUpdate(this, false|true|{children,object,state});
        ...
    };

    exComponentUpdate(nextProps, nextState) {
        // RETURN ARRAY -> value comparison
        // RETURN FALSE -> freeze the branch
        // RETURN NULL  -> freeze the self

        return [
            nextProps.value,
            ...
        ];
    };
};
*/

var _EX_COMPONENT_UPDATE = 'exComponentUpdate';
var _ON_CHILDS_UPDATE = 'exChildsUpdate'; // событие, есть вероятность что обновились потомки

var _IS_IGNORE_CHILDREN = '__isIgnoreChildren'; //
var _IS_IGNORE_OBJECT = '__isIgnoreObject';
var _IS_IGNORE_STATE = '__isIgnoreState';
var _EXTERNAL_DATA = '__externalData';


function exComponentUpdate(self, ignoreMode) {
    var obj = self;

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

    obj[_EXTERNAL_DATA] = (obj[_EX_COMPONENT_UPDATE]
        ? obj[_EX_COMPONENT_UPDATE](obj.props, obj.state) || []
        : []
    );

    return obj;
};


var mixin = {
    //exComponentUpdate: null, // function(nextProps, nextState) {return []};

    shouldComponentUpdate: function(nextProps, nextState) {
        var nextData = null;
        var exData = this[_EXTERNAL_DATA];

        if (this[_EX_COMPONENT_UPDATE]) {
            nextData = this[_EX_COMPONENT_UPDATE](nextProps, nextState);
            if (!nextData) {
                if (nextData !== false) {
                    tailExData(this, null);
                };
                return false;
            };

            this[_EXTERNAL_DATA] = nextData;

            if (checkExData(exData, nextData)) {
                return true;
            };
        };

        if (!this[_IS_IGNORE_STATE] && nextState !== this.state) {
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

            return true;
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

        if (!nextData) {
            if (nextData !== false) {
                tailExData(this, end);
            };
            return;
        };

        this[_EXTERNAL_DATA] = nextData;

        if (checkExData(exData, nextData)) {
            this.forceUpdate(end);
            return;
        };

        tailExData(this, end);
    },
};

function checkExData(exData, nextData) {
    let j = nextData.length;
    if (j !== exData.length) {
        return true;
    };

    while(j--) {
        if (exData[j] !== nextData[j]) {
            return true;
        };
    };

    return false;
};

function tailExData(self) {
    // var all = self.__all_elements;
    // if (all) {
    //     all.forEach(check);
    //     return;
    // };

    var refs = self.refs;
    for (var i in refs) {
        check(refs[i]);
    };
};

function check(elem) {
    // if (!elem || !elem.__isMounted) {
    //     return;
    // };

    if (elem._checkExternalData) {
        elem._checkExternalData();
        return;
    };

    if (elem.tagName) {
        return;
    };
    if (elem.setState) {
        //console.log(elem);
        elem.setState({});
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
