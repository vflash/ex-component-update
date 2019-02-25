# ex-component-update

```
sh: npm install ex-component-update
```
A convenient alternative to shouldComponentUpdate. Freezes only the component itself, without affecting children. It is enough to return a list of values that affect the render.


```js
// exComponentUpdate(selfComponent, isIgnoreChangeObject);

class {
    constructor() {
        exComponentUpdate(this, false|true);
        ...
    };

    exComponentUpdate(nextProps, nextState) {
        return [
            nextProps.model.value,
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
            nextProps.model.value,
            ...
        ];
    },

    render: function() {
        ...
    }
});
```
