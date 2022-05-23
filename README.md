### H5下的签字工具

##### 使用方式1

```html
<div id="sign"></div>
<script src="./dist/sign.min.js"></script>
```

##### 使用方式2

###### npm i h5_sign

##### API

```javascript
const SIGN = zx("#sign");

SIGN.color("blue").size(5).smooth().open();
// color 颜色 (可选)
// size 粗细 (可选)
// smooth 线条更平滑 (可选)
// open 打开签字
SIGN.close(clear = true)
// close 关闭签字
// clear 关闭时是否清空画布,默认true
SIGN.revoke();
// 撤销
SIGN.clearPath();
// 清除
SIGN.saveToIMG(suffix='png',name='sign');
// 保存为图片
SIGN.saveToURL();
// 保存为URL返回图片base64
```

