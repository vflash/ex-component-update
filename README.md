# ex-component-update

миксин для оптимезации обновления компонента. Идея в подходе что принемать решение обновляться или нет принемает сам компонент, а не по принципу подготовки имутабельных данных. Работа схожа с PureRenderMixin но дополнительно проверяется список значений который формирует метод this.exComponentUpdate() . 

Также важное отличие от PureRenderMixin, что сравниваются только новые свойства. Потому желатьно в копоненте указывать все свойства в this.getDefaultProps()


```js
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
            nextProps.model.value,
            ...
        ];
    },

    render: function() {
        ...
    }
});
```
