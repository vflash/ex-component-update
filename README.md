# ex-component-update

```
sh: npm install ex-component-update
```
A convenient alternative to shouldComponentUpdate. Freezes only the component itself, without affecting children. It is enough to return a list of values that affect the render.


```js
import modelScreen from 'src/models/modelScreen.js'

class MyCard extends React.Component {
    constructor() {
        exComponentUpdate(this, false|true|options);
        ..
    };

    exComponentUpdate(nextProps, nextState) {
        var data = nextProps.data || false;
        return [
            modelScreen.width <= 500,
            modelScreen.width <= 980,
            data.name,
            data.email,
            data.phone,
            ..
        ];
    };

    render() {
        return ...
    };
};

```
