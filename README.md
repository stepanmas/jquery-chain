# jquery.chain
Bundle of lines use HTML5 canvas

![see example](example.gif)


### Initilization:
```javascript
var chain = new $.Chain({
    line: {
        color: 'blue',
        width: 1
    },
    el  : '.Chain',
    dot : '.Chain-dot'
});

chain.render();


```